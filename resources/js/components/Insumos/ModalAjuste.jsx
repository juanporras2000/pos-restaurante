import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ModalAjustePropTypes } from '../../propTypes';
import Modal from '../shared/Modal';
import IconButton from '../shared/IconButton';
import StepWizard from '../shared/StepWizard/StepWizard';
import axios from '../../services/axios';

export default function ModalAjuste({ abierto, insumo, onCerrar, onGuardado }) {
    const [tipo, setTipo] = useState('entrada');
    const [cantidad, setCantidad] = useState('');
    const [motivo, setMotivo] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (abierto) {
            setTipo('entrada');
            setCantidad('');
            setMotivo('');
        }
    }, [abierto]);

    if (!abierto || !insumo) return null;

    const guardar = async () => {
        const cant = Number.parseFloat(cantidad);
        if (Number.isNaN(cant) || cant <= 0) {
            Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
            return;
        }
        setGuardando(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            await axios.post('/inventario/ajuste', {
                insumo_id: insumo.id,
                tipo,
                cantidad: cant,
                motivo: motivo.trim() || null,
            }, {
                headers: { 'X-CSRF-TOKEN': csrf },
            });

            Swal.fire({
                icon: 'success',
                title: tipo === 'entrada' ? 'Stock agregado' : 'Stock ajustado',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            onCerrar();
            onGuardado();
        } catch (error) {
            if (error.response && error.response.data) {
                Swal.fire('Error', error.response.data.message ?? 'Error', 'error');
                return;
            }
            Swal.fire('Error', 'No se pudo guardar', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const cantNum = Number.parseFloat(cantidad);
    const esCantidadValida = !Number.isNaN(cantNum) && cantNum > 0;

    const wizardSteps = [
        {
            title: 'Tipo de Movimiento',
            subtitle: `¿Qué operación deseas realizar con ${insumo.nombre}?`,
            content: (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setTipo('entrada')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all flex flex-col items-center gap-1 ${
                                tipo === 'entrada'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <span className="text-base font-bold">+ Entrada</span>
                            <span className="text-xs opacity-80">Agrega al inventario actual</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('ajuste')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium border text-sm transition-all flex flex-col items-center gap-1 ${
                                tipo === 'ajuste'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <span className="text-base font-bold">– Ajuste</span>
                            <span className="text-xs opacity-80">Reemplaza el inventario actual</span>
                        </button>
                    </div>
                    <div className="text-sm font-semibold text-green-800 dark:text-orange-800 bg-green-200 dark:bg-orange-200 rounded-lg p-3">
                        Stock actual: <span className="font-bold text-green-800 dark:text-orange-800">{Number.parseFloat(insumo.stock_actual).toFixed(2)} {insumo.unidad_medida}</span>
                    </div>
                </div>
            )
        },
        {
            title: tipo === 'entrada' ? 'Cantidad a agregar' : 'Nuevo stock total',
            subtitle: `¿Cuántos ${insumo.unidad_medida} deseas agregar?`,
            isValid: esCantidadValida,
            content: (
                <div className="space-y-3">
                    <div className="relative">
                        <input
                            autoFocus
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16 dark:bg-gray-800 dark:text-white"
                            placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                            {insumo.unidad_medida}
                        </span>
                    </div>
                    {esCantidadValida && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {tipo === 'entrada'
                                ? `Inventario final: ${(Number.parseFloat(insumo.stock_actual) + cantNum).toFixed(2)} ${insumo.unidad_medida}`
                                : `El stock pasará a ser: ${cantNum.toFixed(2)} ${insumo.unidad_medida}`}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Motivo del movimiento',
            subtitle: 'Detalla opcionalmente la razón de este ajuste.',
            content: (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Ej: Compra a proveedor, Mermas, Vencimiento..."
                    />
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong>Resumen del ajuste:</strong></p>
                        <p>• Tipo: <span className="capitalize">{tipo}</span></p>
                        <p>• Cantidad: {cantNum || 0} {insumo.unidad_medida}</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Modal abierto={abierto} onCerrar={onCerrar}>
            <div className="p-6 max-w-lg w-full min-h-[460px] h-full max-h-[60vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        Ajustar Stock — {insumo.nombre}
                    </h2>
                    <IconButton aria-label="Cerrar" variant="default" onClick={onCerrar}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </IconButton>
                </div>

                <StepWizard
                    steps={wizardSteps}
                    onFinish={guardar}
                    isSubmitting={guardando}
                    finishLabel="Confirmar Ajuste"
                    onClose={onCerrar}
                />
            </div>
        </Modal>
    );
}

ModalAjuste.propTypes = ModalAjustePropTypes;
