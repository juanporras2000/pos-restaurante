import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useImprimir } from '../../hooks/useImprimir';
import { fmtCOP } from '../../utils/format';
import IconButton from '../shared/IconButton';
import { ModalPagoPropTypes } from '../../propTypes';

const MILES = 1000;

const METODOS = [
    {
        value: 'efectivo',
        label: 'Efectivo',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
            </svg>
        ),
    },
    {
        value: 'nequi',
        label: 'Nequi',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2"></rect>
                <circle cx="12" cy="17" r="1" fill="currentColor"></circle>
                <path d="M9 7h6M9 11h4"></path>
            </svg>
        ),
    },
    {
        value: 'tarjeta',
        label: 'Tarjeta',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
                <path d="M5 15h2m4 0h4"></path>
            </svg>
        ),
    },
    {
        value: 'transferencia',
        label: 'Transfer.',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"></path>
            </svg>
        ),
    },
];

const METODO_LABEL = {
    efectivo:      'Efectivo',
    nequi:         'Nequi',
    tarjeta:       'Tarjeta',
    transferencia: 'Transferencia',
};

const toast = (icon, title, timer = 2000) =>
    Swal.fire({ icon, title, timer, showConfirmButton: false, toast: true, position: 'top-end' });

export default function ModalPago({ abierto, pedido, onPagado, onCerrar }) {
    // Modo simple
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [recibido, setRecibido]     = useState('');

    // Modo dividido
    const [modoDividido, setModoDividido]     = useState(false);
    const [splits, setSplits]                 = useState([]);
    const [splitMetodo, setSplitMetodo]       = useState('efectivo');
    const [splitMonto, setSplitMonto]         = useState('');
    const [splitRecibido, setSplitRecibido]   = useState('');

    const [procesando, setProcesando] = useState(false);
    const { imprimir } = useImprimir();

    const total         = pedido ? Number.parseFloat(pedido.total) : 0;
    const recibidoNum   = (Number.parseFloat(recibido) || 0) * MILES;
    const cambioSimple  = recibidoNum - total;

    const totalSplits   = splits.reduce((s, sp) => s + sp.monto, 0);
    const restante      = Math.max(0, total - totalSplits);
    const splitMontoNum = (Number.parseFloat(splitMonto) || 0) * MILES;
    const splitRecNum   = (Number.parseFloat(splitRecibido) || 0) * MILES;
    const splitCambio   = splitMetodo === 'efectivo' ? splitRecNum - splitMontoNum : 0;

    const cerrar = () => {
        setMetodoPago('efectivo');
        setRecibido('');
        setModoDividido(false);
        setSplits([]);
        setSplitMetodo('efectivo');
        setSplitMonto('');
        setSplitRecibido('');
        onCerrar();
    };

    const toggleDividido = () => {
        setModoDividido((v) => !v);
        setSplits([]);
        setRecibido('');
    };

    const agregarSplit = () => {
        if (!splitMontoNum || splitMontoNum <= 0) {
            toast('error', 'Ingresa un monto válido');
            return;
        }
        if (splitMontoNum > restante + 0.01) {
            toast('error', `El monto excede el restante (${fmtCOP(restante)})`);
            return;
        }
        if (splitMetodo === 'efectivo' && splitRecNum < splitMontoNum) {
            toast('error', 'El dinero recibido es insuficiente para este split');
            return;
        }

        setSplits([...splits, {
            metodo_pago: splitMetodo,
            monto:       splitMontoNum,
            recibido:    splitMetodo === 'efectivo' ? splitRecNum : splitMontoNum,
            cambio:      Math.max(0, splitCambio),
        }]);
        setSplitMonto('');
        setSplitRecibido('');
    };

    const eliminarSplit = (idx) => setSplits(splits.filter((_, i) => i !== idx));

    const confirmar = async () => {
        if (!pedido) return;

        if (modoDividido) {
            if (splits.length === 0) { toast('error', 'Agrega al menos un split'); return; }
            if (restante > 0.01) { toast('error', `Faltan ${fmtCOP(restante)} por cubrir`); return; }
        } else if (metodoPago === 'efectivo' && recibidoNum < total) {
            toast('error', 'El dinero recibido es insuficiente');
            return;
        }

        setProcesando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        const body = modoDividido
            ? {
                pedido_id: pedido.id,
                splits: splits.map(({ metodo_pago, monto, recibido: r }) => ({
                    metodo_pago, monto, recibido: r,
                })),
            }
            : {
                pedido_id:  pedido.id,
                recibido:   metodoPago === 'efectivo' ? recibidoNum : total,
                metodo_pago: metodoPago,
            };

        try {
            const res  = await fetch('/api/pagos', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body:    JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                toast('error', data.error || 'Error al procesar el pago', 2500);
                console.log(data);
                return;
            }

            const cambioTotal = parseFloat(data.cambio ?? 0);
            toast(
                'success',
                cambioTotal > 0 ? `Pago procesado. Cambio: ${fmtCOP(cambioTotal)}` : 'Pago procesado exitosamente',
                cambioTotal > 0 ? 2500 : 1800
            );

            const pedidoPagado = { ...pedido, pago: data.pago };
            cerrar();
            onPagado();

            const { isConfirmed } = await Swal.fire({
                icon: 'question',
                title: '¿Imprimir recibo?',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Imprimir',
                cancelButtonText: 'No, gracias',
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#6b7280',
                timer: 6000,
                timerProgressBar: true,
            });

            if (isConfirmed) imprimir(pedidoPagado);
        } catch {
            toast('error', 'Error al procesar el pago');
        } finally {
            setProcesando(false);
        }
    };

    if (!abierto || !pedido) return null;

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') cerrar(); }}
            tabIndex={-1}
        >
            <div className="modal-panel">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                            </svg>
                            Cobrar Pedido #{pedido.numero_dia || pedido.id}
                        </h2>
                        <IconButton onClick={cerrar} aria-label="Cerrar" variant="default">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </IconButton>
                    </div>

                    <div className="space-y-4">
                        {/* Total */}
                        <div className="bg-gray-900 text-white p-4 rounded-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total a cobrar</p>
                                    <p className="text-3xl font-black">{fmtCOP(total)}</p>
                                </div>
                                {modoDividido && totalSplits > 0 && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Restante</p>
                                        <p className={`text-2xl font-black ${restante <= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {fmtCOP(restante)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Toggle dividir pago */}
                        <button
                            type="button"
                            onClick={toggleDividido}
                            className={`w-full py-2 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                                modoDividido
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {modoDividido ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Cancelar pago dividido
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                    </svg>
                                    Dividir pago (múltiples métodos)
                                </span>
                            )}
                        </button>

                        {/* MODO SIMPLE */}
                        {!modoDividido && (
                            <>
                                <div>
                                    <label className="form-label">Método de pago</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {METODOS.map(({ value, label, icon }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => { setMetodoPago(value); setRecibido(''); }}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                                    metodoPago === value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {icon}
                                                <span className="text-xs font-semibold">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {metodoPago === 'efectivo' && (
                                    <div>
                                        <label className="form-label">Dinero recibido</label>
                                        <input
                                            type="number"
                                            value={recibido}
                                            onChange={(e) => setRecibido(e.target.value)}
                                            placeholder="Ej: 25"
                                            step="0.001"
                                            min="0"
                                            autoFocus
                                            className="form-input"
                                        />
                                        {recibido !== '' && !Number.isNaN(Number.parseFloat(recibido)) && (
                                            <p className="mt-0.5 text-xs text-gray-400">= {fmtCOP(Number.parseFloat(recibido) * MILES)}</p>
                                        )}
                                        {recibidoNum > 0 && (
                                            <div className={`mt-2 p-3 rounded-xl border ${cambioSimple >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm font-medium ${cambioSimple >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                        {cambioSimple >= 0 ? 'Cambio' : 'Falta'}
                                                    </span>
                                                    <span className={`text-xl font-black ${cambioSimple >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                        {fmtCOP(Math.abs(cambioSimple))}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* MODO DIVIDIDO */}
                        {modoDividido && (
                            <div className="space-y-3">
                                {/* Splits agregados */}
                                {splits.length > 0 && (
                                    <div className="space-y-1.5">
                                        {splits.map((sp, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-gray-600">{METODO_LABEL[sp.metodo_pago]}</span>
                                                    {sp.metodo_pago === 'efectivo' && sp.cambio > 0 && (
                                                        <span className="text-xs text-green-600">(cambio: {fmtCOP(sp.cambio)})</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-800">{fmtCOP(sp.monto)}</span>
                                                    <IconButton
                                                        onClick={() => eliminarSplit(idx)}
                                                        aria-label="Quitar división de pago"
                                                        variant="danger"
                                                    >
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M6 18L18 6M6 6l12 12"></path>
                                                        </svg>
                                                    </IconButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Formulario agregar split */}
                                {restante > 0.01 && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 space-y-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agregar pago parcial</p>

                                        <div className="grid grid-cols-4 gap-1.5">
                                            {METODOS.map(({ value, label, icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => { setSplitMetodo(value); setSplitRecibido(''); }}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                                        splitMetodo === value
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {icon}
                                                    <span className="text-xs font-semibold">{label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div>
                                            <label htmlFor="split-monto" className="form-label">Monto ({METODO_LABEL[splitMetodo]})</label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="split-monto"
                                                    type="number"
                                                    value={splitMonto}
                                                    onChange={(e) => setSplitMonto(e.target.value)}
                                                    placeholder={`Ej: ${Math.round(restante / MILES)}`}
                                                    step="0.001"
                                                    min="0"
                                                    className="form-input flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setSplitMonto(String(restante / MILES))}
                                                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    Resto
                                                </button>
                                            </div>
                                            {splitMontoNum > 0 && (
                                                <p className="mt-0.5 text-xs text-gray-400">= {fmtCOP(splitMontoNum)}</p>
                                            )}
                                        </div>

                                        {splitMetodo === 'efectivo' && splitMontoNum > 0 && (
                                            <div>
                                                <label htmlFor="split-recibido" className="form-label">Dinero recibido</label>
                                                <input
                                                    id="split-recibido"
                                                    type="number"
                                                    value={splitRecibido}
                                                    onChange={(e) => setSplitRecibido(e.target.value)}
                                                    placeholder="Ej: 25"
                                                    step="0.001"
                                                    min="0"
                                                    className="form-input"
                                                />
                                                {splitRecNum > 0 && (
                                                    <p className="mt-0.5 text-xs text-gray-400">= {fmtCOP(splitRecNum)}</p>
                                                )}
                                                {splitRecNum > 0 && splitCambio !== 0 && (
                                                    <div className={`mt-1.5 p-2 rounded-lg border text-sm font-semibold ${
                                                        splitCambio >= 0
                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                            : 'bg-red-50 border-red-200 text-red-600'
                                                    }`}>
                                                        {splitCambio >= 0 ? 'Cambio: ' : 'Falta: '}{fmtCOP(Math.abs(splitCambio))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={agregarSplit}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                                        >
                                            + Agregar split
                                        </button>
                                    </div>
                                )}

                                {restante <= 0.01 && splits.length > 0 && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                                        <svg className="h-4 w-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <p className="text-sm font-semibold text-green-700">Total cubierto · Listo para confirmar</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={cerrar} className="btn-secondary flex-1">
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={procesando || (modoDividido && restante > 0.01)}
                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                        >
                            {procesando
                                ? 'Procesando...'
                                : modoDividido
                                    ? `Confirmar (${splits.length} split${splits.length !== 1 ? 's' : ''})`
                                    : 'Confirmar Pago'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

ModalPago.propTypes = ModalPagoPropTypes;
