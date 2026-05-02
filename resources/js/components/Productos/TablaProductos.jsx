import React from 'react';

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
    if (margen >= 0)  return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
}

function labelMargen(margen) {
    if (margen >= 60) return 'Muy rentable';
    if (margen >= 40) return 'Rentable';
    if (margen >= 20) return 'Aceptable';
    if (margen >= 0)  return 'Bajo margen';
    return 'Con pérdida';
}

export default function TablaProductos({ productos, onEditar, onEliminar }) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => {
                const precio   = parseFloat(producto.precio)  || 0;
                const costo    = parseFloat(producto.costo)   || 0;
                const utilidad = parseFloat(producto.utilidad)|| 0;
                const margen   = parseFloat(producto.margen)  || 0;
                const tieneCosto = costo > 0;

                return (
                    <div
                        key={producto.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col"
                    >
                        {/* Product Image */}
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {producto.imagen_producto ? (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${producto.imagen_producto}`}
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <svg className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <path d="M21 15l-5-5L5 21"></path>
                                </svg>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="mb-3 flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{producto.nombre}</h3>
                            <p className="text-sm text-gray-500 mb-2">{producto.categoria?.nombre ?? 'Sin categoría'}</p>
                            <p className="text-xl font-bold text-gray-900">
                                ${precio.toFixed(2)}
                            </p>
                        </div>

                        {/* Cost & Profitability */}
                        {tieneCosto ? (
                            <div className="mb-4 bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Costo</span>
                                    <span className="font-medium text-gray-800">${costo.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Utilidad</span>
                                    <span className={`font-semibold ${utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {utilidad >= 0 ? '+' : ''}${utilidad.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                    <span className="text-gray-500">Margen</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeMargen(margen)}`}>
                                        {margen.toFixed(1)}% · {labelMargen(margen)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 text-xs text-gray-400 italic text-center bg-gray-50 rounded-lg py-2">
                                Sin costo asignado en receta
                            </div>
                        )}

                        {/* Product Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEditar(producto)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onEliminar(producto.id)}
                                className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}

            {productos.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No se encontraron productos.
                </div>
            )}
        </div>
    );
}
