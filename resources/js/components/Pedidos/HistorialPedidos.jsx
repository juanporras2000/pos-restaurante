import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ResumenDia    from './ResumenDia';
import TarjetaPedido from './TarjetaPedido';
import SeccionGastos from './SeccionGastos';
import CierreCaja    from './CierreCaja';

export default function HistorialPedidos() {
    const [pedidos, setPedidos]   = useState([]);
    const [gastos, setGastos]     = useState([]);
    const [apertura, setApertura] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError]       = useState(null);

    const cargar = useCallback(() => {
        setCargando(true);
        setError(null);
        const d = new Date();
        const fechaHoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        Promise.all([
            fetch('/api/pedidos/cerrados-hoy').then((r) => {
                if (!r.ok) throw new Error('Error al cargar el historial');
                return r.json();
            }),
            fetch('/api/gastos').then((r) => r.json()).catch(() => ({ gastos: [], total: 0 })),
            fetch(`/api/caja-apertura/${fechaHoy}`).then((r) => r.json()).catch(() => null),
        ])
            .then(([pedidosData, gastosData, aperturaData]) => {
                setPedidos(pedidosData);
                setGastos(gastosData.gastos ?? []);
                setApertura(aperturaData ?? null);
            })
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    // useMemo: hoy es constante por sesión — no recalcular en cada render
    const hoy = useMemo(() => new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }), []);

    // Actualiza el pago de un pedido en el estado local sin recargar todo
    const handlePagoActualizado = useCallback((pedidoId, pagoActualizado) => {
        setPedidos((prev) =>
            prev.map((p) => p.id === pedidoId ? { ...p, pago: pagoActualizado } : p)
        );
    }, []);

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
                    <ArrowPathIcon className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Estado de carga / error */}
            {cargando && (
                <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
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

            {!cargando && !error && pedidos.length === 0 && gastos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="h-16 w-16 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                        <path d="M9 8h6M9 12h6M9 16h4"></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-500">No hay pedidos cerrados hoy</p>
                    <p className="text-sm mt-1">Los pedidos pagados aparecerán aquí.</p>
                </div>
            )}

            {!cargando && !error && (pedidos.length > 0 || gastos.length > 0 || apertura) && (
                <>
                    <ResumenDia pedidos={pedidos} gastos={gastos} apertura={apertura} />
                    {pedidos.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {pedidos.map((pedido) => (
                                <TarjetaPedido
                                    key={pedido.id}
                                    pedido={pedido}
                                    onPagoActualizado={handlePagoActualizado}
                                />
                            ))}
                        </div>
                    )}
                    {gastos.length > 0 && <SeccionGastos gastos={gastos} />}
                    <CierreCaja pedidos={pedidos} gastos={gastos} apertura={apertura} />
                </>
            )}
        </div>
    );
}
