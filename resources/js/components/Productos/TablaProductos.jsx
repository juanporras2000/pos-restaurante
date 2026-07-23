import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import { fmtCOP } from '../../utils/format';
import IconButton from '../shared/IconButton';

/**
 * Retorna el color del badge según el margen de ganancia:
 *   >= 60%  → verde intenso  (muy rentable)
 *   >= 40%  → verde          (rentable)
 *   >= 20%  → amarillo       (aceptable)
 *   >= 0%   → naranja        (bajo margen)
 *   < 0%    → rojo           (pérdida)
 */
function badgeMargen(margen) {
    if (margen >= 60) return 'bg-emerald-100 text-emerald-800';
    if (margen >= 40) return 'bg-green-100 text-green-700';
    if (margen >= 20) return 'bg-yellow-100 text-yellow-700';
    if (margen >= 0) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
}

function labelMargen(margen) {
    if (margen >= 60) return 'Muy rentable';
    if (margen >= 40) return 'Rentable';
    if (margen >= 20) return 'Aceptable';
    if (margen >= 0) return 'Bajo margen';
    return 'Con pérdida';
}


export default function TablaProductos({ productos, onEditar, onEliminar }) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => {
                const precio = Number.parseFloat(producto.precio) || 0;
                const costo = Number.parseFloat(producto.costo) || 0;
                const utilidad = Number.parseFloat(producto.utilidad) || 0;
                const margen = Number.parseFloat(producto.margen) || 0;
                const tieneCosto = costo > 0;

                // Valores reales calculados desde el API (receta base + insumos domicilio)
                const costoDom = Number.parseFloat(producto.costo_domicilio) || 0;
                const utilidadDom = Number.parseFloat(producto.utilidad_domicilio) || 0;
                const margenDom = Number.parseFloat(producto.margen_domicilio) || 0;
                const tieneCostoDom = costoDom > 0;

                return (
                    <div
                        key={producto.id}
                        className="card p-4 md:p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-full min-w-0 max-w-[350px]"
                    >
                        {/* Bloque de Contenido Superior */}
                        <div className="min-w-0">
                            {/* Imagen del Producto adaptable en altura según el dispositivo */}
                            <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden shrink-0">
                                {producto.imagen_producto ? (
                                    <img
                                        src={`${import.meta.env.VITE_URL_IMAGEN}${producto.imagen_producto}`}
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <svg className="h-12 w-12 md:h-16 md:w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <path d="M21 15l-5-5L5 21"></path>
                                    </svg>
                                )}
                            </div>

                            {/* Información del Producto */}
                            <div className="mb-3">
                                {/* truncate e inline-block evitan saltos de línea extraños si el nombre es kilométrico */}
                                <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight truncate" title={producto.nombre}>
                                    {producto.nombre}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 mt-1">
                                    <p className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-none">
                                        {producto.categoria?.nombre ?? 'Sin categoría'}
                                    </p>
                                    {producto.es_domicilio && (
                                        <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium flex items-center gap-1 shrink-0">
                                            <TruckIcon className="h-3 w-3" /> Domicilio
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg md:text-xl font-black text-gray-900">
                                    {fmtCOP(precio)}
                                </p>
                            </div>

                            {/* Costos y Rentabilidad en Canal Local */}
                            {tieneCosto ? (
                                <div className="mb-3 bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs md:text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Costo</span>
                                        <span className="font-medium text-gray-800">${fmtCOP(costo)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Utilidad</span>
                                        <span className={`font-semibold ${utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {utilidad >= 0 ? '+' : ''}${fmtCOP(utilidad)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                        <span className="text-gray-500">Margen</span>
                                        <span className={`text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ${badgeMargen(margen)} truncate max-w-[140px]`}>
                                            {margen.toFixed(1)}% · {labelMargen(margen)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-3 text-[11px] md:text-xs text-gray-400 italic text-center bg-gray-50 rounded-lg py-2.5">
                                    Sin costo asignado en receta
                                </div>
                            )}

                            {/* Costos y Rentabilidad en Canal Domicilio */}
                            {producto.es_domicilio && tieneCostoDom && (
                                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1.5 text-xs md:text-sm">
                                    <div className="text-blue-700 mb-1 flex flex-col">
                                        <span className="font-bold flex items-center gap-1 text-xs">
                                            <TruckIcon className="h-3.5 w-3.5 shrink-0" /> A domicilio
                                        </span>
                                        <span className="text-[10px] text-blue-500 leading-tight">Incluye insumos extra</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Costo</span>
                                        <span className="font-medium text-gray-800">{fmtCOP(costoDom)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Utilidad</span>
                                        <span className={`font-semibold ${utilidadDom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {utilidadDom >= 0 ? '+' : ''}{fmtCOP(utilidadDom)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                                        <span className="text-gray-500">Margen</span>
                                        <span className={`text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ${badgeMargen(margenDom)} truncate max-w-[140px]`}>
                                            {margenDom.toFixed(1)}% · {labelMargen(margenDom)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Acciones de Tarjeta empujadas siempre al fondo */}
                        <div className="flex gap-2 mt-auto">
                            <button
                                type="button"
                                onClick={() => onEditar(producto)}
                                className="btn-primary flex-1 font-semibold uppercase tracking-wide"
                            >
                                Editar
                            </button>
                            <IconButton
                                aria-label="Eliminar producto"
                                variant="danger"
                                onClick={() => onEliminar(producto.id)}
                                className="border border-red-200"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </IconButton>
                        </div>
                    </div>
                );
            })}

            {productos.length === 0 && (
                <div className="col-span-full card p-12 text-center">
                    <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                    <p className="text-gray-500 text-sm">Ajusta el filtro o crea un nuevo producto</p>
                </div>
            )}
        </div>
    );
}
