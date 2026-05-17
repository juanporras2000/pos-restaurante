import React, { useState, useEffect, useCallback } from 'react';
import { useImprimir } from '../../hooks/useImprimir';
import { fmtCOP } from '../../utils/format';

const TIPOS_GASTO = {
    insumos:   { label: 'Insumos',   color: 'bg-blue-100 text-blue-700' },
    gasolina:  { label: 'Gasolina',  color: 'bg-yellow-100 text-yellow-700' },
    servicios: { label: 'Servicios', color: 'bg-purple-100 text-purple-700' },
    otro:      { label: 'Otro',      color: 'bg-gray-100 text-gray-600' },
};

const METODO_ETIQUETA = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
};

function formatHora(dateString) {
    return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatFecha(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const METODO_COLOR = {
    efectivo:       { dot: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-50 border-green-200' },
    tarjeta:        { dot: 'bg-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-50 border-blue-200' },
    transferencia:  { dot: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-50 border-purple-200' },
};

function ResumenDia({ pedidos, gastos, apertura }) {
    const totalVentas   = pedidos.reduce((acc, p) => acc + Number.parseFloat(p.total || 0), 0);
    const totalGastos   = gastos.reduce((acc, g) => acc + Number.parseFloat(g.monto || 0), 0);
    const montoApertura = apertura?.monto ? (Number.parseFloat(apertura.monto) || 0) : 0;
    const resultadoNeto = totalVentas - totalGastos;

    const porMetodo = pedidos.reduce((acc, p) => {
        const metodo = p.pago?.metodo_pago ?? 'otro';
        acc[metodo] = (acc[metodo] ?? 0) + Number.parseFloat(p.total || 0);
        return acc;
    }, {});

    const ventasEfectivo   = porMetodo['efectivo'] ?? 0;
    const ventasDigitales  = totalVentas - ventasEfectivo;
    const saldoCajaFisica  = montoApertura + ventasEfectivo - totalGastos;

    return (
        <div className="space-y-4 mb-6">

            {/* ── Fila 1: métricas globales ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`bg-white rounded-xl border-2 shadow-sm p-4 ${montoApertura > 0 ? 'border-green-200' : 'border-gray-200'}`}>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Base de apertura</p>
                    <p className="text-2xl font-bold text-green-600">{fmtCOP(montoApertura)}</p>
                    <p className="text-xs text-gray-400 mt-1">Dinero inicial en caja</p>
                    {apertura?.nota && <p className="text-xs text-gray-400 mt-0.5 truncate italic">"{apertura.nota}"</p>}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Total ventas</p>
                    <p className="text-2xl font-bold text-green-600">{fmtCOP(totalVentas)}</p>
                    <p className="text-xs text-gray-400 mt-1">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} cerrado{pedidos.length !== 1 ? 's' : ''}</p>
                </div>

                <div className={`bg-white rounded-xl shadow-sm p-4 ${totalGastos > 0 ? 'border border-red-100' : 'border border-gray-200'}`}>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Total gastos</p>
                    <p className={`text-2xl font-bold ${totalGastos > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {totalGastos > 0 ? `-${fmtCOP(totalGastos)}` : fmtCOP(0)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}</p>
                </div>

                <div className={`bg-white rounded-xl border-2 shadow-sm p-4 ${resultadoNeto >= 0 ? 'border-blue-200' : 'border-red-300'}`}>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Resultado neto</p>
                    <p className={`text-2xl font-bold ${resultadoNeto >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{fmtCOP(resultadoNeto)}</p>
                    <p className="text-xs text-gray-400 mt-1">Ventas − Gastos</p>
                </div>
            </div>

            {/* ── Fila 2: desglose por método + saldo físico en caja ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Desglose por método de pago */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-3">Ingresos por método de pago</p>
                    <div className="space-y-2">
                        {Object.entries(porMetodo).map(([metodo, monto]) => {
                            const c = METODO_COLOR[metodo] ?? { dot: 'bg-gray-400', text: 'text-gray-700', badge: 'bg-gray-50 border-gray-200' };
                            const esDigital = metodo !== 'efectivo';
                            return (
                                <div key={metodo} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${c.badge}`}>
                                    <span className="flex items-center gap-2 text-sm text-gray-700">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                                        <span className="font-medium">{METODO_ETIQUETA[metodo] ?? metodo}</span>
                                        {esDigital && (
                                            <span className="text-xs text-gray-400 font-normal">— no entra a caja física</span>
                                        )}
                                    </span>
                                    <span className={`font-bold ${c.text}`}>{fmtCOP(monto)}</span>
                                </div>
                            );
                        })}
                        {Object.keys(porMetodo).length === 0 && (
                            <p className="text-sm text-gray-400 italic">Sin ventas registradas</p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm">
                            <span className="font-semibold text-gray-700">Total recaudado</span>
                            <span className="font-bold text-green-700">{fmtCOP(totalVentas)}</span>
                        </div>
                        {ventasDigitales > 0 && (
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>· Efectivo recibido</span>
                                <span>{fmtCOP(ventasEfectivo)}</span>
                            </div>
                        )}
                        {ventasDigitales > 0 && (
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>· Digital (tarjeta/transferencia)</span>
                                <span>{fmtCOP(ventasDigitales)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Saldo físico en caja */}
                <div className={`bg-white rounded-xl border-2 shadow-sm p-4 ${saldoCajaFisica >= 0 ? 'border-green-300' : 'border-red-300'}`}>
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Saldo en caja</p>
                    <p className="text-xs text-gray-400 mb-3">Solo dinero físico (efectivo)</p>
                    <p className={`text-3xl font-bold mb-4 ${saldoCajaFisica >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {fmtCOP(saldoCajaFisica)}
                    </p>
                    <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Base de apertura</span>
                            <span className="text-green-600 font-medium">+{fmtCOP(montoApertura)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ventas en efectivo</span>
                            <span className="text-green-600 font-medium">+{fmtCOP(ventasEfectivo)}</span>
                        </div>
                        {totalGastos > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Gastos pagados</span>
                                <span className="text-red-500 font-medium">−{fmtCOP(totalGastos)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 font-semibold text-gray-800">
                            <span>= Efectivo en caja</span>
                            <span className={saldoCajaFisica >= 0 ? 'text-green-700' : 'text-red-600'}>
                                {fmtCOP(saldoCajaFisica)}
                            </span>
                        </div>
                        {ventasDigitales > 0 && (
                            <p className="text-xs text-gray-400 pt-1 italic">
                                Los pagos por tarjeta/transferencia ({fmtCOP(ventasDigitales)}) no se cuentan aquí porque no entran a la caja física.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TarjetaPedido({ pedido }) {
    const [expandido, setExpandido] = useState(false);
    const { imprimir } = useImprimir();
    const pago = pedido.pago;

    const metodoLabel = METODO_ETIQUETA[pago?.metodo_pago] ?? pago?.metodo_pago ?? '—';
    const esMesa = pedido.tipo === 'mesa';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Cabecera clicable */}
            <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="w-full text-left p-4 flex items-center justify-between gap-3"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Ícono tipo */}
                    <span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm ${
                        esMesa ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {esMesa ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                                <path d="M6 12v4m12-4v4M4 19h16"></path>
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                                <circle cx="12" cy="9" r="2.5"></circle>
                            </svg>
                        )}
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">Pedido #{pedido.numero_dia || pedido.id}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                esMesa ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {esMesa ? `Mesa ${pedido.numero_mesa}` : 'Domicilio'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {metodoLabel}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {esMesa ? '' : pedido.direccion && <span>{pedido.direccion} · </span>}
                            {formatFecha(pedido.updated_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-gray-900">{fmtCOP(parseFloat(pedido.total))}</span>
                    <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <path d="M6 9l6 6 6-6"></path>
                    </svg>
                </div>
            </button>

            {/* Detalle expandible */}
            {expandido && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    {/* Items del pedido */}
                    <div className="space-y-2 mb-4">
                        {pedido.detalles?.map((detalle) => (
                            <div key={detalle.id} className="flex justify-between items-center text-sm">
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-700">{detalle.producto?.nombre ?? '—'}</span>
                                    {detalle.observacion && (
                                        <p className="text-xs text-amber-600 italic mt-0.5">📝 {detalle.observacion}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <span className="text-gray-400 text-xs">×{detalle.cantidad}</span>
                                    <span className="font-medium text-gray-900">{fmtCOP(parseFloat(detalle.subtotal))}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info del pago */}
                    {pago && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm border border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>Total</span>
                                <span className="font-semibold text-gray-900">{fmtCOP(parseFloat(pago.total))}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Recibido</span>
                                <span className="font-medium">{fmtCOP(parseFloat(pago.recibido))}</span>
                            </div>
                            {parseFloat(pago.cambio) > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Cambio</span>
                                    <span className="font-medium text-blue-600">{fmtCOP(parseFloat(pago.cambio))}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                <span className="text-gray-500">Método</span>
                                <span className="font-medium text-gray-800">{metodoLabel}</span>
                            </div>
                        </div>
                    )}

                    {/* Botón imprimir recibo */}
                    <button
                        type="button"
                        onClick={() => imprimir(pedido)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9V2h12v7"></path>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Imprimir recibo
                    </button>
                </div>
            )}
        </div>
    );
}

function SeccionGastos({ gastos }) {
    const [expandido, setExpandido] = useState(true);
    const total = gastos.reduce((s, g) => s + parseFloat(g.monto), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
            <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <span className="font-semibold text-gray-800">Gastos del día</span>
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {gastos.length}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600">-{fmtCOP(total)}</span>
                    <svg
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </button>

            {expandido && (
                <div className="border-t border-red-100 divide-y divide-gray-50">
                    {gastos.map((g) => {
                        const tipo = TIPOS_GASTO[g.tipo] ?? TIPOS_GASTO.otro;
                        const hora = new Date(g.created_at).toLocaleTimeString('es-CO', {
                            hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
                        });
                        return (
                            <div key={g.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${tipo.color}`}>
                                        {tipo.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-gray-800 font-medium truncate">{g.concepto}</p>
                                        {g.nota && <p className="text-xs text-gray-400 truncate">{g.nota}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <span className="text-xs text-gray-400">{hora}</span>
                                    <span className="font-semibold text-red-600">{fmtCOP(Number.parseFloat(g.monto))}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function HistorialPedidos() {
    const [pedidos, setPedidos]     = useState([]);
    const [gastos, setGastos]       = useState([]);
    const [apertura, setApertura]   = useState(null);
    const [cargando, setCargando]   = useState(false);
    const [error, setError]         = useState(null);

    const cargar = useCallback(() => {
        setCargando(true);
        setError(null);
        const d = new Date();
        const fechaHoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        Promise.all([
            fetch('/api/pedidos/cerrados-hoy').then((r) => {
                if (!r.ok) throw new Error('Error al cargar el historial');
                return r.json();
            }),
            fetch('/api/gastos').then((r) => r.json()).catch(() => ({ gastos: [], total: 0 })),
            fetch(`/api/caja-apertura/${fechaHoy}`).then((r) => r.json()).catch(() => null),
        ])
            .then(([pedidosData, gastosData, aperturaData]) => {
                setPedidos(pedidosData);
                setGastos(gastosData.gastos ?? []);
                setApertura(aperturaData ?? null);
            })
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const hoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div>
            {/* Subheader */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-gray-600 text-sm capitalize">{hoy}</p>
                </div>
                <button
                    type="button"
                    onClick={cargar}
                    disabled={cargando}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                    <svg className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                    </svg>
                    Actualizar
                </button>
            </div>

            {/* Estado de carga / error */}
            {cargando && (
                <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
                    <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    Cargando historial...
                </div>
            )}

            {error && !cargando && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={cargar} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && pedidos.length === 0 && gastos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="h-16 w-16 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                        <path d="M9 8h6M9 12h6M9 16h4"></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-500">No hay pedidos cerrados hoy</p>
                    <p className="text-sm mt-1">Los pedidos pagados aparecerán aquí.</p>
                </div>
            )}

            {!cargando && !error && (pedidos.length > 0 || gastos.length > 0 || apertura) && (
                <>
                    <ResumenDia pedidos={pedidos} gastos={gastos} apertura={apertura} />
                    {pedidos.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {pedidos.map((pedido) => (
                                <TarjetaPedido key={pedido.id} pedido={pedido} />
                            ))}
                        </div>
                    )}
                    {gastos.length > 0 && <SeccionGastos gastos={gastos} />}
                </>
            )}
        </div>
    );
}
