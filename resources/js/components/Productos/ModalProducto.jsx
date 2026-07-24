import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModalProductoPropTypes } from '../../propTypes';
import { getUnidadesCompatibles, convertirUnidad } from '../../utils/unidades';
import IconButton from '../shared/IconButton';
import StepWizard from '../shared/StepWizard/StepWizard';

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
    const [imagenPreviewUrl, setImagenPreviewUrl] = useState(null);

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
    const nombreWatch = watch('nombre');
    const categoriaWatch = watch('categoria_id');

    useEffect(() => {
        if (!imagenFile) {
            setImagenPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imagenFile);
        setImagenPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imagenFile]);

    const { fields, append, remove } = useFieldArray({
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

    // Configuración de los Pasos
    const wizardSteps = [
        {
            title: '¿Cómo se llama el producto?',
            subtitle: 'Escribe un nombre y selecciona su categoría.',
            isValid: Boolean(nombreWatch?.trim() && categoriaWatch),
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="form-label">Nombre del Producto</label>
                        <input
                            {...register('nombre')}
                            type="text"
                            placeholder="Ej: Hamburguesa Especial"
                            className={`form-input text-lg ${errors.nombre ? 'border-red-500 bg-red-50' : ''}`}
                            autoFocus
                        />
                        {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
                    </div>
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
                </div>
            )
        },
        {
            title: '¿Cuál es su precio?',
            subtitle: 'Ingresa el precio.',
            isValid: Boolean(precioWatch && Number(precioWatch) > 0),
            content: (
                <div className="space-y-2">
                    <label className="form-label">Precio de Venta</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                            {...register('precio')}
                            type="number"
                            step="0.001"
                            placeholder="Ej: 15 (para $15.000)"
                            className={`form-input pl-8 text-xl font-semibold ${errors.precio ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>
                    {precioWatch !== '' && !isNaN(Number(precioWatch)) && Number(precioWatch) > 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium pt-1">
                            Precio final: ${(Number(precioWatch) * 1000).toLocaleString('es-CO')} COP
                        </p>
                    )}
                    {errors.precio && <p className="form-error">{errors.precio.message}</p>}
                </div>
            )
        },
        {
            title: 'Imagen del Producto',
            subtitle: 'Sube una foto atractiva (opcional).',
            content: (
                <div className="space-y-4 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagenFile(e.target.files[0] || null)}
                        className="form-input"
                    />
                    {imagenPreviewUrl && (
                        <div className="flex justify-center mt-3">
                            <img
                                src={imagenPreviewUrl}
                                alt="Previsualización"
                                className="h-32 w-32 object-cover rounded-xl border-2 border-blue-500 shadow-sm"
                            />
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '¿Aplica para domicilios?',
            subtitle: 'Define si este producto se venderá para entregas a domicilio.',
            content: (
                <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Disponible a domicilio</p>
                        <p className="text-xs text-gray-500">Permite agregar empaques o insumos extra de domicilio</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register('es_domicilio')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            )
        },
        {
            title: 'Ingredientes / Receta Básica',
            subtitle: 'Añade los insumos requeridos para preparar este producto.',
            isValid: fields.length > 0,
            content: (
                <div className="space-y-3">
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
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">Seleccionar insumo</option>
                            {insumosSinUsar.map((ins) => (
                                <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad_medida})</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="any"
                            placeholder="Cant."
                            value={filaInsumo.cantidad}
                            onChange={(e) => setFilaInsumo((f) => ({ ...f, cantidad: e.target.value }))}
                            className="w-20 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                            type="button"
                            onClick={agregarInsumo}
                            disabled={!filaInsumo.insumo_id || !filaInsumo.cantidad}
                            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-sm"
                        >
                            +
                        </button>
                    </div>

                    <div className="max-h-[130px] overflow-y-auto border rounded-lg p-2 space-y-1">
                        {fields.map((fila, index) => (
                            <div key={fila.key} className="flex justify-between items-center text-sm p-1 border-b">
                                <span>{fila.nombre} ({fila.cantidad} {fila.unidad_medida})</span>
                                <button type="button" onClick={() => remove(index)} className="text-red-500 text-xs">Quitar</button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    // Si marcó domicilio, se añade el paso extra al final automáticamente
    if (esDomicilio) {
        wizardSteps.push({
            title: 'Empaques e Insumos de Domicilio',
            subtitle: 'Empaques, salsas o cubiertos adicionales.',
            content: (
                <div className="space-y-3">
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
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">Seleccionar insumo extra</option>
                            {insumos.map((ins) => (
                                <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad_medida})</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="any"
                            placeholder="Cant."
                            value={filaInsumoDom.cantidad}
                            onChange={(e) => setFilaInsumoDom((f) => ({ ...f, cantidad: e.target.value }))}
                            className="w-20 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                            type="button"
                            onClick={agregarInsumoDom}
                            disabled={!filaInsumoDom.insumo_id || !filaInsumoDom.cantidad}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm"
                        >
                            +
                        </button>
                    </div>

                    <div className="max-h-[130px] overflow-y-auto border rounded-lg p-2 space-y-1">
                        {fieldsDom.map((fila, index) => (
                            <div key={fila.key} className="flex justify-between items-center text-sm p-1 border-b">
                                <span>{fila.nombre} ({fila.cantidad} {fila.unidad_medida})</span>
                                <button type="button" onClick={() => removeDom(index)} className="text-red-500 text-xs">Quitar</button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        });
    }

    return (
        <div className="modal-overlay">
            <div className="modal-panel-lg max-w-lg min-h-[480px] h-full max-h-[40vh] flex flex-col p-6 relative">
                {/* Header corto con botón cerrar */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {producto.id ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <IconButton aria-label="Cerrar" variant="default" onClick={onCerrar}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </IconButton>
                </div>

                {/* Asistente genérico */}
                <StepWizard
                    steps={wizardSteps}
                    onFinish={handleSubmit(onSubmit)}
                    isSubmitting={guardando}
                    finishLabel={producto.id ? 'Guardar Cambios' : 'Crear Producto'}
                    onClose={onCerrar}
                />
            </div>
        </div>
    );
}

ModalProducto.propTypes = ModalProductoPropTypes;
