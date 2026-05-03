import React, { useState, useEffect, useCallback } from 'react';
import ModalNuevoPedido from './ModalNuevoPedido';
import HistorialPedidos from './HistorialPedidos';
import PedidoCard from './PedidoCard';

export default function Pedidos() {
    const [tab, setTab] = useState('pedidos');
    const [productos, setProductos] = useState([]);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);

    const cargarProductos = useCallback(() => {
        fetch('/api/productos?todos=1')
            .then((r) => r.json())
            .then((data) => setProductos(data.map((p) => ({ ...p, precio: parseFloat(p.precio) }))))
            .catch(() => {});
    }, []);

    const cargarPendientes = useCallback(() => {
        fetch('/api/pedidos/pendientes')
            .then((r) => r.json())
            .then(setPedidosPendientes)
            .catch(() => {});
    }, []);

    useEffect(() => {
        cargarProductos();
        cargarPendientes();
    }, [cargarProductos, cargarPendientes]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"></path>
                                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                            </svg>
                            Gestión de Pedidos
                        </h1>
                        <p className="text-gray-600 mt-1">Administra pedidos pendientes y crea nuevos</p>
                    </div>
                    {tab === 'pedidos' && (
                        <button
                            type="button"
                            onClick={() => setModalNuevoAbierto(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Pedido
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-6 flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                    <button
                        type="button"
                        onClick={() => setTab('pedidos')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === 'pedidos'
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                            <path d="M9 8h6M9 12h6M9 16h4"></path>
                        </svg>
                        Pendientes
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('historial')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === 'historial'
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Historial del Día
                    </button>
                </div>
            </div>

            {/* Tab: Historial */}
            {tab === 'historial' && <HistorialPedidos />}

            {/* Tab: Pedidos pendientes */}
            {tab === 'pedidos' && pedidosPendientes.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-8">
                    <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos pendientes</h3>
                    <p className="text-gray-500">Crea un nuevo pedido para comenzar</p>
                </div>
            )}

            {tab === 'pedidos' && pedidosPendientes.some((p) => p.tipo === 'mesa') && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                            <path d="M6 12v4m12-4v4M4 19h16"></path>
                        </svg>
                        Pedidos para Mesa
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pedidosPendientes.filter((p) => p.tipo === 'mesa').length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.filter((p) => p.tipo === 'mesa').map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                productos={productos}
                                onActualizado={cargarPendientes}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'pedidos' && pedidosPendientes.some((p) => p.tipo === 'domicilio') && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                            <circle cx="12" cy="9" r="2.5"></circle>
                        </svg>
                        Pedidos a Domicilio
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pedidosPendientes.filter((p) => p.tipo === 'domicilio').length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.filter((p) => p.tipo === 'domicilio').map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                productos={productos}
                                onActualizado={cargarPendientes}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'pedidos' && pedidosPendientes.some((p) => p.tipo === 'recoger') && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12V22H4V12"></path>
                            <path d="M22 7H2v5h20V7z"></path>
                            <path d="M12 22V7"></path>
                            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"></path>
                            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"></path>
                        </svg>
                        Para Recoger
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pedidosPendientes.filter((p) => p.tipo === 'recoger').length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.filter((p) => p.tipo === 'recoger').map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                productos={productos}
                                onActualizado={cargarPendientes}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal nuevo pedido */}
            <ModalNuevoPedido
                abierto={modalNuevoAbierto}
                productos={productos}
                pedidoEditar={null}
                onCreado={() => { setModalNuevoAbierto(false); cargarPendientes(); }}
                onCerrar={() => setModalNuevoAbierto(false)}
            />
        </div>
    );
}
