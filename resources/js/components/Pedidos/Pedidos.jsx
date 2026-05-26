import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModalNuevoPedido from './ModalNuevoPedido';
import HistorialPedidos from './HistorialPedidos';
import { PedidoMesa } from './PedidoMesa';
import { PedidoDomicilio } from './PedidoDomicilio';
import { PedidoRecoger } from './PedidoRecoger';

export default function Pedidos() {
    const audioNotificacion = useRef(new Audio('/sounds/notificacion-pedido.mp3'));

    const [tab, setTab] = useState('pedidos');
    const [productos, setProductos] = useState([]);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [eliminado, setEliminado] = useState(false);
    const [pagado, setPagado] = useState(false);
    const [actualizado, setActualizado] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const dataPerfilActivo = JSON.parse(localStorage.getItem('perfil_activo'))
    const permisosPerfilActivo = dataPerfilActivo?.permisos ?? [];
    const permiso = permisosPerfilActivo.find(p => p.descripcion == 'Historial del día')

    const cargarProductos = useCallback(() => {
        fetch('/api/productos?todos=1')
            .then((r) => r.json())
            .then((data) => setProductos(data.map((p) => ({ ...p, precio: parseFloat(p.precio) }))))
            .catch(() => { });
    }, []);


    const cargarPendientes = useCallback(() => {
        fetch('/api/pedidos/pendientes')
            .then((r) => r.json())
            .then(setPedidosPendientes)
            .catch(() => { });
    }, []);


    useEffect(() => {
        cargarProductos();
        cargarPendientes();
    }, [cargarProductos, cargarPendientes]);


    useEffect(() => {
        if (typeof window.Echo !== 'undefined') {

            window.Echo.channel('pedidos-canal')
                .listen('.PedidoCreadoEvent', (e) => {
                    cargarPendientes();

                    if (audioNotificacion.current) {
                        audioNotificacion.current.play()
                            .catch(error => {
                                console.log("El navegador bloqueó la reproducción automática del audio hasta que haya interacción:", error);
                            });
                    }
                })
                .listen('.PedidoEliminadoEvent', (e) => {
                    cargarPendientes();
                })
                .listen('.PedidoPagadoEvent', (e) => {
                    cargarPendientes();
                })
                .listen('.PedidoActualizadoEvent', (e) => {
                    cargarPendientes();
                })
        }

        return () => {
            if (typeof window.Echo !== 'undefined') {
                window.Echo.leaveChannel('pedidos-canal');
            }
        };
    }, [cargarPendientes, eliminado, pagado, actualizado]);


    useEffect(() => {
        if (tab === 'historial') {
            setFiltroTipo('todos');
        }
    }, [tab]);

    return (
        <div className="min-h-screen bg-gray-50 lg:p-6">
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center lg:justify-normal gap-3">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"></path>
                                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                            </svg>
                            Gestión de Pedidos
                        </h1>
                        <p className="text-gray-600 lg:mt-1 text-sm lg:text-md">Administra pedidos pendientes y crea nuevos</p>
                    </div>
                    {tab === 'pedidos' && (
                        <button
                            type="button"
                            onClick={() => setModalNuevoAbierto(true)}
                            className="bg-blue-600 lg:hover:bg-blue-700 text-white font-medium mt-4 lg:mt-0 py-1 px-2  lg:py-2 lg:px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Pedido
                        </button>
                    )}
                </div>

                <div className="mt-6 flex flex-col md:flex-row justify-between items-center w-full gap-4">
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mx-auto md:mx-0">
                        <button
                            type="button"
                            onClick={() => setTab('pedidos')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'pedidos'
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
                        {permiso && (<button
                            type="button"
                            onClick={() => setTab('historial')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'historial'
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Historial del Día
                        </button>)}
                    </div>

                    {tab === 'pedidos' && (
                        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 shadow-sm w-full sm:w-auto justify-between">
                            <button
                                type="button"
                                onClick={() => setFiltroTipo('todos')}
                                className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg transition-all ${filtroTipo === 'todos'
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                type="button"
                                onClick={() => setFiltroTipo('mesa')}
                                className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg transition-all ${filtroTipo === 'mesa'
                                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Mesas
                            </button>
                            <button
                                type="button"
                                onClick={() => setFiltroTipo('domicilio')}
                                className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg transition-all ${filtroTipo === 'domicilio'
                                    ? 'bg-green-600 text-white shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Domicilios
                            </button>
                            <button
                                type="button"
                                onClick={() => setFiltroTipo('recoger')}
                                className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg transition-all ${filtroTipo === 'recoger'
                                    ? 'bg-orange-600 text-white shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Recoger
                            </button>
                        </div>
                    )}

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

            {tab === 'pedidos' &&
                (filtroTipo === 'todos' || filtroTipo === 'mesa') &&
                pedidosPendientes.some((p) => p.tipo === 'mesa') && (
                    <PedidoMesa
                        pedidosPendientes={pedidosPendientes}
                        cargarPendientes={cargarPendientes}
                        productos={productos}
                        setEliminado={setEliminado}
                        eliminado={eliminado}
                        setPagado={setPagado}
                        pagado={pagado}
                        setActualizado={setActualizado}
                        actualizado={actualizado}
                    />
                )}

            {tab === 'pedidos' &&
                (filtroTipo === 'todos' || filtroTipo === 'domicilio') &&
                pedidosPendientes.some((p) => p.tipo === 'domicilio') && (
                    <PedidoDomicilio
                        pedidosPendientes={pedidosPendientes}
                        cargarPendientes={cargarPendientes}
                        productos={productos}
                        setEliminado={setEliminado}
                        eliminado={eliminado}
                        setPagado={setPagado}
                        pagado={pagado}
                        setActualizado={setActualizado}
                        actualizado={actualizado}
                    />
                )}

            {tab === 'pedidos' &&
                (filtroTipo === 'todos' || filtroTipo === 'recoger') &&
                pedidosPendientes.some((p) => p.tipo === 'recoger') && (
                    <PedidoRecoger
                        pedidosPendientes={pedidosPendientes}
                        cargarPendientes={cargarPendientes}
                        productos={productos}
                        setEliminado={setEliminado}
                        eliminado={eliminado}
                        setPagado={setPagado}
                        pagado={pagado}
                        setActualizado={setActualizado}
                        actualizado={actualizado}
                    />
                )}

            {tab === 'pedidos' && filtroTipo !== 'todos' && !pedidosPendientes.some((p) => p.tipo === filtroTipo) && pedidosPendientes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
                    <p className="text-gray-500 font-medium">No hay pedidos pendientes el filtro seleccionado.</p>
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
