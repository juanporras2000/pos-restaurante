import React, { useState, useEffect, useCallback } from 'react';

const METODO_ETIQUETA = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
};

function formatHora(dateString) {
    return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatFecha(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function ResumenDia({ pedidos }) {
    const total = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
    const porMetodo = pedidos.reduce((acc, p) => {
        const metodo = p.pago?.metodo_pago ?? 'desconocido';
        acc[metodo] = (acc[metodo] ?? 0) + parseFloat(p.total || 0);
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Pedidos cerrados</p>
                <p className="text-2xl font-bold text-gray-900">{pedidos.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Total del día</p>
                <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
            </div>
            {Object.entries(porMetodo).map(([metodo, monto]) => (
                <div key={metodo} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">
                        {METODO_ETIQUETA[metodo] ?? metodo}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">${monto.toFixed(2)}</p>
                </div>
            ))}
        </div>
    );
}

function TarjetaPedido({ pedido }) {
    const [expandido, setExpandido] = useState(false);
    const pago = pedido.pago;

    const metodoLabel = METODO_ETIQUETA[pago?.metodo_pago] ?? pago?.metodo_pago ?? '—';
    const esMesa = pedido.tipo === 'mesa';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Cabecera clicable */}
            <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="w-full text-left p-4 flex items-center justify-between gap-3"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Ícono tipo */}
                    <span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm ${
                        esMesa ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {esMesa ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                                <path d="M6 12v4m12-4v4M4 19h16"></path>
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                                <circle cx="12" cy="9" r="2.5"></circle>
                            </svg>
                        )}
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">Pedido #{pedido.id}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                esMesa ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {esMesa ? `Mesa ${pedido.numero_mesa}` : 'Domicilio'}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {metodoLabel}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {esMesa ? '' : pedido.direccion && <span>{pedido.direccion} · </span>}
                            {formatFecha(pedido.updated_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-gray-900">${parseFloat(pedido.total).toFixed(2)}</span>
                    <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <path d="M6 9l6 6 6-6"></path>
                    </svg>
                </div>
            </button>

            {/* Detalle expandible */}
            {expandido && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    {/* Items del pedido */}
                    <div className="space-y-2 mb-4">
                        {pedido.detalles?.map((detalle) => (
                            <div key={detalle.id} className="flex justify-between items-center text-sm">
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-700">{detalle.producto?.nombre ?? '—'}</span>
                                    {detalle.observacion && (
                                        <p className="text-xs text-amber-600 italic mt-0.5">📝 {detalle.observacion}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <span className="text-gray-400 text-xs">×{detalle.cantidad}</span>
                                    <span className="font-medium text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info del pago */}
                    {pago && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm border border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>Total</span>
                                <span className="font-semibold text-gray-900">${parseFloat(pago.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Recibido</span>
                                <span className="font-medium">${parseFloat(pago.recibido).toFixed(2)}</span>
                            </div>
                            {parseFloat(pago.cambio) > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Cambio</span>
                                    <span className="font-medium text-blue-600">${parseFloat(pago.cambio).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                <span className="text-gray-500">Método</span>
                                <span className="font-medium text-gray-800">{metodoLabel}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function HistorialPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(() => {
        setCargando(true);
        setError(null);
        fetch('/api/pedidos/cerrados-hoy')
            .then((r) => {
                if (!r.ok) throw new Error('Error al cargar el historial');
                return r.json();
            })
            .then(setPedidos)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const hoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div>
            {/* Subheader */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-gray-600 text-sm capitalize">{hoy}</p>
                </div>
                <button
                    type="button"
                    onClick={cargar}
                    disabled={cargando}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                    <svg className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                    </svg>
                    Actualizar
                </button>
            </div>

            {/* Estado de carga / error */}
            {cargando && (
                <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
                    <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    Cargando historial...
                </div>
            )}

            {error && !cargando && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={cargar} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && pedidos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="h-16 w-16 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                        <path d="M9 8h6M9 12h6M9 16h4"></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-500">No hay pedidos cerrados hoy</p>
                    <p className="text-sm mt-1">Los pedidos pagados aparecerán aquí.</p>
                </div>
            )}

            {!cargando && !error && pedidos.length > 0 && (
                <>
                    <ResumenDia pedidos={pedidos} />
                    <div className="space-y-3">
                        {pedidos.map((pedido) => (
                            <TarjetaPedido key={pedido.id} pedido={pedido} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
