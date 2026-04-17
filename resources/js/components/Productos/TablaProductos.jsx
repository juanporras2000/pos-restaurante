import React from 'react';

export default function TablaProductos({ productos, onEditar, onEliminar }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
                <div
                    key={producto.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                    {/* Product Image */}
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {producto.imagen ? (
                            <img
                                src={`/storage/${producto.imagen}`}
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
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">{producto.nombre}</h3>
                        <p className="text-sm text-gray-500">{producto.categoria?.nombre ?? 'Sin categoría'}</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">
                            ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                    </div>

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
            ))}

            {productos.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                    No se encontraron productos.
                </div>
            )}
        </div>
    );
}
