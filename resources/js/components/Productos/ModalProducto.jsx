import React, { useState, useEffect, useRef } from 'react';

export default function ModalProducto({ abierto, producto, categorias, insumos = [], receta = [], onRecetaChange, onChange, onGuardar, onCerrar, guardando }) {
    const nombreRef = useRef(null);
    const [filaInsumo, setFilaInsumo] = useState({ insumo_id: '', cantidad: '' });

    useEffect(() => {
        if (abierto && nombreRef.current) {
            nombreRef.current.focus();
        }
    }, [abierto]);

    // Resetear fila al abrir/cerrar
    useEffect(() => {
        if (!abierto) setFilaInsumo({ insumo_id: '', cantidad: '' });
    }, [abierto]);

    if (!abierto) return null;

    const insumosSinUsar = insumos.filter((ins) => !receta.some((r) => r.insumo_id === ins.id));

    const agregarInsumo = () => {
        if (!filaInsumo.insumo_id) return;
        const cantidad = parseFloat(filaInsumo.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) return;
        const insumo = insumos.find((i) => i.id === parseInt(filaInsumo.insumo_id));
        if (!insumo) return;
        onRecetaChange([
            ...receta,
            { insumo_id: insumo.id, cantidad, nombre: insumo.nombre, unidad_medida: insumo.unidad_medida },
        ]);
        setFilaInsumo({ insumo_id: '', cantidad: '' });
    };

    const quitarInsumo = (insumo_id) => {
        onRecetaChange(receta.filter((r) => r.insumo_id !== insumo_id));
    };

    const actualizarCantidad = (insumo_id, valor) => {
        onRecetaChange(receta.map((r) => r.insumo_id === insumo_id ? { ...r, cantidad: valor } : r));
    };

    const handleFilaKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); agregarInsumo(); }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
        >
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
                    <form id="form-producto" onSubmit={(e) => { e.preventDefault(); onGuardar(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    ref={nombreRef}
                                    type="text"
                                    required
                                    value={producto.nombre}
                                    onChange={(e) => onChange('nombre', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={producto.precio}
                                    onChange={(e) => onChange('precio', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    required
                                    value={producto.categoria_id}
                                    onChange={(e) => onChange('categoria_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Imagen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onChange('imagen_producto', e.target.files[0] || null)}
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
                                    min="0.01"
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
                            {receta.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
                                    Sin insumos agregados
                                </p>
                            ) : (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Encabezado */}
                                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        <span>Insumo</span>
                                        <span className="text-right w-28">Cantidad</span>
                                        <span className="w-8"></span>
                                    </div>
                                    {/* Filas */}
                                    {receta.map((fila) => (
                                        <div key={fila.insumo_id} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 border-t border-gray-100 items-center">
                                            <span className="text-sm text-gray-800">
                                                {fila.nombre}
                                                <span className="text-gray-400 ml-1 text-xs">({fila.unidad_medida})</span>
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={fila.cantidad}
                                                onChange={(e) => actualizarCantidad(fila.insumo_id, e.target.value)}
                                                className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => quitarInsumo(fila.insumo_id)}
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
