import React, { useState, useMemo } from 'react';
import { ListaProductosPropTypes } from '../../propTypes';
import PillsCategorias from '../shared/PillsCategorias';
import { fmtCOP } from '../../utils/format';

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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Seleccionar Productos</h3>

            {/* Buscador */}
            <div className="relative mb-3">
                <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none"
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
            <div className="mb-3">
                <PillsCategorias
                    categorias={categorias}
                    activa={categoriaActiva}
                    onChange={setCategoriaActiva}
                />
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-scroll">
                {productosFiltrados.map((producto) => {
                    const cantidad = getCantidad(producto.id);
                    const enCarrito = cantidad > 0;
                    return (
                        <div
                            key={producto.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                                enCarrito
                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-medium truncate ${enCarrito ? 'text-blue-800 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {producto.nombre}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{fmtCOP(producto.precio)}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    type="button"
                                    onClick={() => onDecrementar(producto)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                        enCarrito
                                            ? 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                                    }`}
                                >
                                    −
                                </button>
                                <span className={`w-8 text-center text-sm font-bold ${enCarrito ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {cantidad}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onIncrementar(producto)}
                                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}

                {productosFiltrados.length === 0 && (
                    <p className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-6">
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

