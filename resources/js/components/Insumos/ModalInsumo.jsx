import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModalInsumosPropTypes } from '../../propTypes';
import Modal from '../shared/Modal';
import IconButton from '../shared/IconButton';
import StepWizard from '../shared/StepWizard/StepWizard';

const INSUMO_VACIO = {
    id: null,
    nombre: '',
    unidad_medida: '',
    stock_actual: '',
    stock_minimo: '',
    costo_unitario: '',
    valor_producto: ''
};
const UNIDADES = ['gr', 'kg', 'ml', 'lt', 'unidad', 'porción', 'oz', 'lb'];

const insumoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    unidad_medida: z.string().min(1, 'Selecciona una unidad de medida'),
    stock_actual: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0, 'No puede ser negativo')
    ),
    stock_minimo: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0, 'No puede ser negativo')
    ),
    costo_unitario: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0, 'No puede ser negativo')
    ),
    valor_producto: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0, 'No puede ser negativo')
    )
});

export default function ModalInsumo({ abierto, insumo, onGuardar, onCerrar, guardando }) {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(insumoSchema),
        defaultValues: INSUMO_VACIO,
    });

    const [valorLoteDisplay, setValorLoteDisplay] = useState('');

    const nombreWatch = useWatch({ control, name: 'nombre' });
    const unidadWatch = useWatch({ control, name: 'unidad_medida' });
    const stockActual = useWatch({ control, name: 'stock_actual' });
    const valorProducto = useWatch({ control, name: 'valor_producto' });
    const costoUnitarioWatch = useWatch({ control, name: 'costo_unitario' });

    useEffect(() => {
        if (valorProducto === '' || valorProducto === null || valorProducto === undefined) return;
        const stock = Number.parseFloat(stockActual) || 0;
        const valor = Number.parseFloat(valorProducto) || 0;
        const costo = stock > 0 ? Number.parseFloat((valor / stock).toFixed(4)) : 0;
        setValue('costo_unitario', costo);
    }, [stockActual, valorProducto, setValue]);

    useEffect(() => {
        if (abierto) {
            reset(insumo.id
                ? {
                    nombre: insumo.nombre,
                    unidad_medida: insumo.unidad_medida,
                    stock_actual: insumo.stock_actual,
                    stock_minimo: insumo.stock_minimo,
                    costo_unitario: insumo.costo_unitario ?? 0,
                    valor_producto: '',
                  }
                : INSUMO_VACIO
            );
            setValorLoteDisplay('');
        }
    }, [abierto, insumo, reset]);

    if (!abierto) return null;

    const onSubmit = async (data) => {
        try {
            await onGuardar(data);
        } catch (err) {
            if (err.errors) {
                Object.keys(err.errors).forEach((key) => {
                    setError(key, { type: 'manual', message: err.errors[key][0] });
                });
            }
        }
    };

    const wizardSteps = [
        {
            title: 'Nombre y unidad de medida',
            subtitle: 'Ingresa el nombre del ingrediente/material y su unidad.',
            isValid: Boolean(nombreWatch?.trim() && unidadWatch),
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombre')}
                            autoFocus
                            type="text"
                            placeholder="Ej: Papa criolla, Queso Mozzarella..."
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unidad de medida <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('unidad_medida')}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${errors.unidad_medida ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                            <option value="">Seleccionar unidad</option>
                            {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {errors.unidad_medida && <p className="mt-1 text-xs text-red-500">{errors.unidad_medida.message}</p>}
                    </div>
                </div>
            )
        },
        {
            title: 'Cantidades y Alertas',
            subtitle: 'Define el inventario actual y el monto mínimo para alertarte sobre posible falta de insumos.',
            content: (
                <div className="grid grid-cols-2 gap-3 h-full">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock actual</label>
                        <input
                            {...register('stock_actual')}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            readOnly={!!insumo.id}
                            className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:text-white ${
                                insumo.id
                                    ? 'border-gray-200 dark:border-gray-700 bg-gray-100 text-gray-600 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {errors.stock_actual && <p className="mt-1 text-xs text-red-500">{errors.stock_actual.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock mínimo</label>
                        <input
                            {...register('stock_minimo')}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${errors.stock_minimo ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.stock_minimo && <p className="mt-1 text-xs text-red-500">{errors.stock_minimo.message}</p>}
                    </div>
                </div>
            )
        },
        {
            title: 'Valor Total Comprado',
            subtitle: 'Ingresa el valor total que pagaste por el lote.',
            content: (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor del lote <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 text-sm">$</span>
                        <input
                            value={valorLoteDisplay}
                            onChange={(e) => {
                                const sanitized = e.target.value
                                    .replace(/[^0-9.]/g, '')
                                    .replace(/^(\d*\.?\d*).*$/, '$1');
                                setValorLoteDisplay(sanitized);
                                const num = parseFloat(sanitized);
                                setValue('valor_producto', sanitized === '' || isNaN(num) ? '' : num * 1000);
                            }}
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 3.1 (para $3.100)"
                            className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${errors.valor_producto ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                    </div>
                    {valorProducto !== '' && !isNaN(Number(valorProducto)) && Number(valorProducto) > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            = ${(Number(valorProducto)).toLocaleString('es-CO')} COP
                        </p>
                    )}
                    {errors.valor_producto && <p className="mt-1 text-xs text-red-500">{errors.valor_producto.message}</p>}
                </div>
            )
        },
        {
            title: 'Resumen y Costo Calculado',
            subtitle: 'Confirmación final.',
            content: (
                <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2 text-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Insumo:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{nombreWatch || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Cantidad inicial:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{stockActual || 0} {unidadWatch}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Costo por unidad ({unidadWatch}):</span>
                            <span className="font-bold text-green-600 dark:text-green-400 text-base">
                                ${costoUnitarioWatch ? Number(costoUnitarioWatch).toLocaleString('es-CO') : '0'} COP
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        El costo unitario se calcula automáticamente: <br />
                        <strong>Valor Lote ÷ Stock Actual</strong>
                    </p>
                </div>
            )
        }
    ];

    return (
        <Modal abierto={abierto} onCerrar={onCerrar}>
            <div className="p-6 max-w-lg w-full h-[480px] flex flex-col relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        {insumo.id ? 'Editar Insumo' : 'Nuevo Insumo'}
                    </h2>
                    <IconButton aria-label="Cerrar" variant="default" onClick={onCerrar}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </IconButton>
                </div>

                <StepWizard
                    steps={wizardSteps}
                    onFinish={handleSubmit(onSubmit)}
                    isSubmitting={guardando}
                    finishLabel={insumo.id ? 'Actualizar Insumo' : 'Crear Insumo'}
                    onClose={onCerrar}
                />
            </div>
        </Modal>
    );
}

ModalInsumo.propTypes = ModalInsumosPropTypes;
