import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModalProductoPropTypes } from '../../propTypes';
import { getUnidadesCompatibles, convertirUnidad } from '../../utils/unidades';
import IconButton from '../shared/IconButton';

const productoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
    precio: z.preprocess((val) => Number(val) * 1000, z.number().min(1, 'El precio debe ser mayor a 0')),
    categoria_id: z.string().min(1, 'Selecciona una categoría'),
    es_domicilio: z.boolean().optional(),
    receta: z.array(z.object({
        insumo_id: z.number(),
        nombre: z.string(),
        unidad_medida: z.string(),
        cantidad: z.preprocess((val) => Number(val), z.number().min(0.001, 'Min 0.001')),
    })).min(1, 'La receta debe tener al menos 1 insumo'),
    receta_domicilio: z.array(z.object({
        insumo_id: z.number(),
        nombre: z.string(),
        unidad_medida: z.string(),
        cantidad: z.preprocess((val) => Number(val), z.number().min(0.001, 'Min 0.001')),
    })).optional(),
});

export default function ModalProducto({ abierto, producto, categorias, insumos = [], onGuardar, onCerrar, guardando }) {
    const nombreRef = useRef(null);
    const [filaInsumo, setFilaInsumo] = useState({ insumo_id: '', cantidad: '', unidad_entrada: '' });
    const [filaInsumoDom, setFilaInsumoDom] = useState({ insumo_id: '', cantidad: '', unidad_entrada: '' });
    const [imagenFile, setImagenFile] = useState(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(productoSchema),
        defaultValues: { nombre: '', precio: '', categoria_id: '', es_domicilio: false, receta: [], receta_domicilio: [] }
    });

    const esDomicilio = watch('es_domicilio');
    const precioWatch = watch('precio');
    const [imagenPreviewUrl, setImagenPreviewUrl] = useState(null);

    useEffect(() => {
        if (!imagenFile) {
            setImagenPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imagenFile);
        setImagenPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imagenFile]);

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'receta',
        keyName: 'key' 
    });

    const { fields: fieldsDom, append: appendDom, remove: removeDom } = useFieldArray({
        control,
        name: 'receta_domicilio',
        keyName: 'key'
    });

    useEffect(() => {
        if (abierto) {
            reset({
                nombre: producto.nombre || '',
                precio: producto.precio ? producto.precio / 1000 : '',
                categoria_id: producto.categoria_id?.toString() || '',
                es_domicilio: producto.es_domicilio ?? false,
                receta: (producto.insumos || []).map(i => ({
                    insumo_id: i.id,
                    nombre: i.nombre,
                    unidad_medida: i.unidad_medida,
                    cantidad: i.pivot?.cantidad || i.cantidad || 0
                })) || [],
                receta_domicilio: (producto.insumos_domicilio || []).map(i => ({
                    insumo_id: i.id,
                    nombre: i.nombre,
                    unidad_medida: i.unidad_medida,
                    cantidad: i.pivot?.cantidad || i.cantidad || 0
                })) || []
            });
            setImagenFile(null);
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

        const unidadEntrada = filaInsumo.unidad_entrada || insumo.unidad_medida;
        const cantidadBase = parseFloat(
            convertirUnidad(cantidad, unidadEntrada, insumo.unidad_medida).toFixed(6)
        );

        append({
            insumo_id: insumo.id,
            cantidad: cantidadBase,
            nombre: insumo.nombre,
            unidad_medida: insumo.unidad_medida
        });
        setFilaInsumo({ insumo_id: '', cantidad: '', unidad_entrada: '' });
    };

    const agregarInsumoDom = () => {
        if (!filaInsumoDom.insumo_id) return;
        const cantidad = parseFloat(filaInsumoDom.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) return;
        const insumo = insumos.find((i) => i.id === parseInt(filaInsumoDom.insumo_id));
        if (!insumo) return;

        const unidadEntrada = filaInsumoDom.unidad_entrada || insumo.unidad_medida;
        const cantidadBase = parseFloat(
            convertirUnidad(cantidad, unidadEntrada, insumo.unidad_medida).toFixed(6)
        );

        appendDom({
            insumo_id: insumo.id,
            cantidad: cantidadBase,
            nombre: insumo.nombre,
            unidad_medida: insumo.unidad_medida
        });
        setFilaInsumoDom({ insumo_id: '', cantidad: '', unidad_entrada: '' });
    };

    const handleFilaKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); agregarInsumo(); }
    };

    const onSubmit = async (data) => {
        try {
            await onGuardar({ ...data, imagen: imagenFile });
        } catch (err) {
            if (err.errors) {
                Object.keys(err.errors).forEach((key) => {
                    setError(key, { type: 'manual', message: err.errors[key][0] });
                });
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-panel-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="modal-header shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        {producto.id ? 'Editar Producto' : 'Crear Producto'}
                    </h2>
                    <IconButton aria-label="Cerrar" variant="default" onClick={onCerrar}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </IconButton>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form id="form-producto" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="form-label">Nombre</label>
                                <input
                                    {...register('nombre')}
                                    ref={(e) => {
                                        register('nombre').ref(e);
                                        nombreRef.current = e;
                                    }}
                                    type="text"
                                    className={`form-input ${errors.nombre ? 'border-red-500 bg-red-50' : ''}`}
                                />
                                {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="form-label">Precio</label>
                                <input
                                    {...register('precio')}
                                    type="number"
                                    step="0.001"
                                    placeholder="Ej: 15"
                                    className={`form-input ${errors.precio ? 'border-red-500 bg-red-50' : ''}`}
                                />
                                {precioWatch !== '' && !isNaN(Number(precioWatch)) && Number(precioWatch) > 0 && (
                                    <p className="mt-0.5 text-xs text-gray-400">= ${(Number(precioWatch) * 1000).toLocaleString('es-CO')}</p>
                                )}
                                {errors.precio && <p className="form-error">{errors.precio.message}</p>}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="form-label">Categoría</label>
                                <select
                                    {...register('categoria_id')}
                                    className={`form-input ${errors.categoria_id ? 'border-red-500 bg-red-50' : ''}`}
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoria_id && <p className="form-error">{errors.categoria_id.message}</p>}
                            </div>

                            {/* Disponible a domicilio */}
                            <div className="flex items-center gap-3 col-span-full">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('es_domicilio')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-700">Disponible a domicilio</span>
                                {esDomicilio && (
                                    <span className="ml-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
                                        Agrega los insumos adicionales abajo
                                    </span>
                                )}
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="form-label">Imagen</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setImagenFile(e.target.files[0] || null);
                                    }}
                                    className="form-input"
                                />
                                {imagenPreviewUrl && (
                                    <img
                                        src={imagenPreviewUrl}
                                        alt="Previsualización"
                                        className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200"
                                    />
                                )}
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
                            {(() => {
                                const insumoActual = filaInsumo.insumo_id
                                    ? insumos.find((i) => i.id === parseInt(filaInsumo.insumo_id))
                                    : null;
                                const unidsComp = getUnidadesCompatibles(insumoActual?.unidad_medida);
                                const cantNum = parseFloat(filaInsumo.cantidad);
                                const unidadEntrada = filaInsumo.unidad_entrada || insumoActual?.unidad_medida || '';
                                const convirtiendo = insumoActual && !isNaN(cantNum) && cantNum > 0 && unidadEntrada !== insumoActual.unidad_medida;
                                const cantidadConvertida = convirtiendo
                                    ? convertirUnidad(cantNum, unidadEntrada, insumoActual.unidad_medida).toFixed(4)
                                    : null;

                                return (
                                    <div className="mb-3 space-y-1">
                                        <div className="flex gap-2">
                                            <select
                                                value={filaInsumo.insumo_id}
                                                onChange={(e) => {
                                                    const ins = insumos.find((i) => i.id === parseInt(e.target.value));
                                                    setFilaInsumo((f) => ({
                                                        ...f,
                                                        insumo_id: e.target.value,
                                                        unidad_entrada: ins?.unidad_medida ?? '',
                                                    }));
                                                }}
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
                                                step="any"
                                                placeholder="Cantidad"
                                                value={filaInsumo.cantidad}
                                                onChange={(e) => setFilaInsumo((f) => ({ ...f, cantidad: e.target.value }))}
                                                onKeyDown={handleFilaKeyDown}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                            />
                                            {insumoActual && unidsComp.length > 1 && (
                                                <select
                                                    value={unidadEntrada}
                                                    onChange={(e) => setFilaInsumo((f) => ({ ...f, unidad_entrada: e.target.value }))}
                                                    className="w-16 px-2 py-2 border border-orange-300 bg-orange-50 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-orange-700 font-medium"
                                                >
                                                    {unidsComp.map((u) => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            )}
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
                                        {convirtiendo && (
                                            <p className="text-xs text-orange-600 flex items-center gap-1 pl-1">
                                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                </svg>
                                                {cantNum} {unidadEntrada} = <strong>{cantidadConvertida} {insumoActual.unidad_medida}</strong> (se guarda en {insumoActual.unidad_medida})
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

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

                        {/* Sección Insumos Adicionales para Domicilio */}
                        {esDomicilio && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                    </svg>
                                    Insumos adicionales a domicilio
                                    <span className="text-xs font-normal text-blue-500">(empaque, bolsa, etc.)</span>
                                </h3>

                                {/* Fila para agregar insumo domicilio */}
                                {(() => {
                                    const insumoActualDom = filaInsumoDom.insumo_id
                                        ? insumos.find((i) => i.id === parseInt(filaInsumoDom.insumo_id))
                                        : null;
                                    const unidsCompDom = getUnidadesCompatibles(insumoActualDom?.unidad_medida);
                                    const cantNumDom = parseFloat(filaInsumoDom.cantidad);
                                    const unidadEntradaDom = filaInsumoDom.unidad_entrada || insumoActualDom?.unidad_medida || '';
                                    const convirtiendoDom = insumoActualDom && !isNaN(cantNumDom) && cantNumDom > 0 && unidadEntradaDom !== insumoActualDom.unidad_medida;
                                    const cantidadConvertidaDom = convirtiendoDom
                                        ? convertirUnidad(cantNumDom, unidadEntradaDom, insumoActualDom.unidad_medida).toFixed(4)
                                        : null;

                                    return (
                                        <div className="mb-3 space-y-1">
                                            <div className="flex gap-2">
                                                <select
                                                    value={filaInsumoDom.insumo_id}
                                                    onChange={(e) => {
                                                        const ins = insumos.find((i) => i.id === parseInt(e.target.value));
                                                        setFilaInsumoDom((f) => ({
                                                            ...f,
                                                            insumo_id: e.target.value,
                                                            unidad_entrada: ins?.unidad_medida ?? '',
                                                        }));
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                                >
                                                    <option value="">Seleccionar insumo</option>
                                                    {insumos.map((ins) => (
                                                        <option key={ins.id} value={ins.id}>
                                                            {ins.nombre} ({ins.unidad_medida})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Cantidad"
                                                    value={filaInsumoDom.cantidad}
                                                    onChange={(e) => setFilaInsumoDom((f) => ({ ...f, cantidad: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarInsumoDom(); } }}
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                                />
                                                {insumoActualDom && unidsCompDom.length > 1 && (
                                                    <select
                                                        value={unidadEntradaDom}
                                                        onChange={(e) => setFilaInsumoDom((f) => ({ ...f, unidad_entrada: e.target.value }))}
                                                        className="w-16 px-2 py-2 border border-blue-300 bg-blue-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-blue-700 font-medium"
                                                    >
                                                        {unidsCompDom.map((u) => (
                                                            <option key={u} value={u}>{u}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={agregarInsumoDom}
                                                    disabled={!filaInsumoDom.insumo_id || !filaInsumoDom.cantidad}
                                                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                                    title="Agregar insumo domicilio"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            {convirtiendoDom && (
                                                <p className="text-xs text-blue-600 flex items-center gap-1 pl-1">
                                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                    </svg>
                                                    {cantNumDom} {unidadEntradaDom} = <strong>{cantidadConvertidaDom} {insumoActualDom.unidad_medida}</strong> (se guarda en {insumoActualDom.unidad_medida})
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Lista insumos domicilio */}
                                {fieldsDom.length === 0 ? (
                                    <div className="text-xs text-center py-3 border border-dashed border-blue-200 bg-blue-50 text-blue-400 rounded-lg">
                                        Sin insumos adicionales para domicilio
                                    </div>
                                ) : (
                                    <div className="border border-blue-200 rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 bg-blue-50 text-xs font-medium text-blue-600 uppercase tracking-wide">
                                            <span>Insumo</span>
                                            <span className="text-right w-28">Cantidad</span>
                                            <span className="w-8"></span>
                                        </div>
                                        {fieldsDom.map((fila, index) => (
                                            <div key={fila.key} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 border-t border-blue-100 items-center">
                                                <span className="text-sm text-gray-800">
                                                    {fila.nombre}
                                                    <span className="text-gray-400 ml-1 text-xs">({fila.unidad_medida})</span>
                                                </span>
                                                <div className="flex flex-col">
                                                    <input
                                                        {...register(`receta_domicilio.${index}.cantidad`)}
                                                        type="number"
                                                        step="0.001"
                                                        className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDom(index)}
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
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer fijo */}
                <div className="modal-footer shrink-0">
                    <button type="button" onClick={onCerrar} className="btn-secondary">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-producto"
                        disabled={guardando}
                        className="btn-primary px-6"
                    >
                        {guardando ? 'Guardando...' : (producto.id ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </div>
        </div>
    );
}

ModalProducto.propTypes = ModalProductoPropTypes;

