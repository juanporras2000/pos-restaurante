import React from 'react';

export default function ListaProductos({ productos, carrito, onIncrementar, onDecrementar }) {
    const getCantidad = (productoId) => {
        const item = carrito.find((i) => i.id === productoId);
        return item ? item.cantidad : 0;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Seleccionar Productos</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-64 overflow-y-auto">
                {productos.map((producto) => (
                    <div
                        key={producto.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                            <p className="text-sm text-gray-500">${parseFloat(producto.precio).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onDecrementar(producto)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                                {getCantidad(producto.id)}
                            </span>
                            <button
                                type="button"
                                onClick={() => onIncrementar(producto)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}

                {productos.length === 0 && (
                    <p className="col-span-2 text-center text-gray-500 py-4">No hay productos disponibles.</p>
                )}
            </div>
        </div>
    );
}
