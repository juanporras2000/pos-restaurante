import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
    precio: z.preprocess((val) => Number(val), z.number().min(0.01, 'El precio debe ser mayor a 0')),
    categoria_id: z.string().min(1, 'Selecciona una categoría'),
    receta: z.array(z.object({
        insumo_id: z.number(),
        nombre: z.string(),
        unidad_medida: z.string(),
        cantidad: z.preprocess((val) => Number(val), z.number().min(0.001, 'Min 0.001')),
    })).min(1, 'La receta debe tener al menos 1 insumo'),
});

export default function ModalProducto({ abierto, producto, categorias, insumos = [], onGuardar, onCerrar, guardando }) {
    const nombreRef = useRef(null);
    const [filaInsumo, setFilaInsumo] = useState({ insumo_id: '', cantidad: '' });

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(productoSchema),
        defaultValues: { nombre: '', precio: '', categoria_id: '', receta: [] }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'receta',
        keyName: 'key' 
    });

    useEffect(() => {
        if (abierto) {
            reset({
                nombre: producto.nombre || '',
                precio: producto.precio || '',
                categoria_id: producto.categoria_id?.toString() || '',
                receta: (producto.insumos || []).map(i => ({
                    insumo_id: i.id,
                    nombre: i.nombre,
                    unidad_medida: i.unidad_medida,
                    cantidad: i.pivot?.cantidad || i.cantidad || 0
                })) || []
            });
            setTimeout(() => nombreRef.current?.focus(), 100);
        }
    }, [abierto, producto, reset]);

    if (!abierto) return null;

    const insumosSinUsar = insumos.filter((ins) => !fields.some((f) => f.insumo_id === ins.id));

    const agregarInsumo = () => {
        if (!filaInsumo.insumo_id) return;
        const cantidad = parseFloat(filaInsumo.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) return;
        const insumo = insumos.find((i) => i.id === parseInt(filaInsumo.insumo_id));
        if (!insumo) return;
        
        append({ 
            insumo_id: insumo.id, 
            cantidad, 
            nombre: insumo.nombre, 
            unidad_medida: insumo.unidad_medida 
        });
        setFilaInsumo({ insumo_id: '', cantidad: '' });
    };

    const handleFilaKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); agregarInsumo(); }
    };

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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        {producto.id ? 'Editar Producto' : 'Crear Producto'}
                    </h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form id="form-producto" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    {...register('nombre')}
                                    ref={(e) => {
                                        register('nombre').ref(e);
                                        nombreRef.current = e;
                                    }}
                                    type="text"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <input
                                    {...register('precio')}
                                    type="number"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.precio ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.precio && <p className="mt-1 text-xs text-red-500">{errors.precio.message}</p>}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    {...register('categoria_id')}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.categoria_id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoria_id && <p className="mt-1 text-xs text-red-500">{errors.categoria_id.message}</p>}
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        // Manejo manual de la imagen ya que react-hook-form no maneja File nativamente bien sin configuración extra
                                        // Pero como el onGuardar recibe los datos del form, agregaremos la imagen manualmente en el submit del padre
                                        window._tmp_img = e.target.files[0] || null;
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Sección Receta */}
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Receta / Insumos
                            </h3>

                            {/* Fila para agregar */}
                            <div className="flex gap-2 mb-3">
                                <select
                                    value={filaInsumo.insumo_id}
                                    onChange={(e) => setFilaInsumo((f) => ({ ...f, insumo_id: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                >
                                    <option value="">Seleccionar insumo</option>
                                    {insumosSinUsar.map((ins) => (
                                        <option key={ins.id} value={ins.id}>
                                            {ins.nombre} ({ins.unidad_medida})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Cantidad"
                                    value={filaInsumo.cantidad}
                                    onChange={(e) => setFilaInsumo((f) => ({ ...f, cantidad: e.target.value }))}
                                    onKeyDown={handleFilaKeyDown}
                                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                />
                                <button
                                    type="button"
                                    onClick={agregarInsumo}
                                    disabled={!filaInsumo.insumo_id || !filaInsumo.cantidad}
                                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                    title="Agregar insumo"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Lista de insumos agregados */}
                            {fields.length === 0 ? (
                                <div className={`text-xs text-center py-3 border border-dashed rounded-lg ${errors.receta ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}>
                                    {errors.receta ? errors.receta.message : 'Sin insumos agregados'}
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        <span>Insumo</span>
                                        <span className="text-right w-28">Cantidad</span>
                                        <span className="w-8"></span>
                                    </div>
                                    {fields.map((fila, index) => (
                                        <div key={fila.key} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 border-t border-gray-100 items-center">
                                            <span className="text-sm text-gray-800">
                                                {fila.nombre}
                                                <span className="text-gray-400 ml-1 text-xs">({fila.unidad_medida})</span>
                                            </span>
                                            <div className="flex flex-col">
                                                <input
                                                    {...register(`receta.${index}.cantidad`)}
                                                    type="number"
                                                    step="0.001"
                                                    className={`w-28 px-2 py-1 border rounded text-sm text-right focus:ring-1 focus:ring-orange-400 focus:border-orange-400 ${errors.receta?.[index]?.cantidad ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Quitar insumo"
                                            >
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.receta && <p className="mt-2 text-xs text-red-500">{errors.receta.message}</p>}
                        </div>
                    </form>
                </div>

                {/* Footer fijo */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-producto"
                        disabled={guardando}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                        {guardando ? 'Guardando...' : (producto.id ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </div>
        </div>
    );
}
