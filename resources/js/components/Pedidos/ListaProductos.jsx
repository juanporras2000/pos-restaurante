import React, { useState, useMemo } from 'react';
import { ListaProductosPropTypes } from '../../propTypes';

export default function ListaProductos({ productos, carrito, onIncrementar, onDecrementar }) {
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [buscar, setBuscar] = useState('');

    const getCantidad = (productoId) => {
        const item = carrito.find((i) => i.id === productoId);
        return item ? item.cantidad : 0;
    };

    const categorias = useMemo(() => {
        const seen = new Map();
        productos.forEach((p) => {
            if (p.categoria && !seen.has(p.categoria.id)) {
                seen.set(p.categoria.id, p.categoria.nombre);
            }
        });
        return Array.from(seen.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        return productos.filter((p) => {
            const coincideCategoria = categoriaActiva === null || p.categoria?.id === categoriaActiva;
            const coincideBusqueda = buscar.trim() === '' ||
                p.nombre.toLowerCase().includes(buscar.trim().toLowerCase());
            return coincideCategoria && coincideBusqueda;
        });
    }, [productos, categoriaActiva, buscar]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Seleccionar Productos</h3>

            {/* Buscador */}
            <div className="relative mb-3">
                <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Pills de categoría */}
            {categorias.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setCategoriaActiva(null)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            categoriaActiva === null
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Todos
                    </button>
                    {categorias.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoriaActiva(cat.id === categoriaActiva ? null : cat.id)}
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                categoriaActiva === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {productosFiltrados.map((producto) => (
                    <div
                        key={producto.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{producto.nombre}</h4>
                            <p className="text-sm text-gray-500">${parseFloat(producto.precio).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
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
                                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center text-sm font-medium"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}

                {productosFiltrados.length === 0 && (
                    <p className="col-span-2 text-center text-gray-500 py-6">
                        {buscar.trim() || categoriaActiva !== null
                            ? 'Sin resultados para el filtro aplicado.'
                            : 'No hay productos disponibles.'}
                    </p>
                )}
            </div>
        </div>
    );
}

ListaProductos.propTypes = ListaProductosPropTypes;

