import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


const INSUMO_VACIO = { 
    id: null, nombre: '', unidad_medida: '', 
    stock_actual: '', stock_minimo: '', 
    costo_unitario: '', valor_producto: ''
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
    ),
    costo_unitario: z.preprocess(
        (val) => (val === '' || val === null ? 0 : Number(val)),
        z.number().min(0)
    ),
});


export default function ModalInsumo({ abierto, insumo, onGuardar, onCerrar, guardando }) {
    const { register, handleSubmit, reset, setError, setValue, control,formState: { errors } } = useForm({
        resolver: zodResolver(insumoSchema),
        defaultValues: INSUMO_VACIO,
    });

    const stockActual    = useWatch({ control, name: 'stock_actual' });
    const valorProducto  = useWatch({ control, name: 'valor_producto' });
    useEffect(() => {
    const stock = parseFloat(stockActual)  || 0;
    const valor = parseFloat(valorProducto) || 0;
    const costo = stock > 0 ? parseFloat((valor / stock).toFixed(4)) : 0;
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                        </svg>
                        {insumo.id ? 'Editar Insumo' : 'Nuevo Insumo'}
                    </h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form id="form-insumo" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                        <input
                            {...register('nombre')}
                            autoFocus type="text" placeholder="Ej: Papa criolla"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida <span className="text-red-500">*</span></label>
                        <select
                            {...register('unidad_medida')}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.unidad_medida ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        >
                            <option value="">Seleccionar unidad</option>
                            {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {errors.unidad_medida && <p className="mt-1 text-xs text-red-500">{errors.unidad_medida.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                            <input
                                {...register('stock_actual')}
                                type="number" step="0.01" placeholder="0"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.stock_actual ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.stock_actual && <p className="mt-1 text-xs text-red-500">{errors.stock_actual.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                            <input
                                {...register('stock_minimo')}
                                type="number" step="0.01" placeholder="0"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.stock_minimo ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.stock_minimo && <p className="mt-1 text-xs text-red-500">{errors.stock_minimo.message}</p>}
                        </div>
                    </div>

                                    {/* Valor total del lote */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor del lote <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">$</span>
                        <input
                            {...register('valor_producto')}
                            type="number" step="0.01" placeholder="Ej: 5000"
                            className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.valor_producto ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                    </div>
                    {errors.valor_producto && <p className="mt-1 text-xs text-red-500">{errors.valor_producto.message}</p>}
                    <p className="mt-1 text-xs text-gray-400">Lo que pagaste por todo el stock actual.</p>
                </div>

                {/* Costo unitario — bloqueado, calculado automáticamente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Costo unitario
                        <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span className="text-gray-400 font-normal text-xs">(calculado automáticamente)</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">$</span>
                        <input
                            {...register('costo_unitario')}
                            type="number" step="0.0001"
                            readOnly
                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                        valor_lote ÷ stock_actual = costo por unidad
                    </p>
                </div>
                </form>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" form="form-insumo" disabled={guardando} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm transition-colors">
                        {guardando ? 'Guardando...' : (insumo.id ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </div>
        </div>
    );
}
