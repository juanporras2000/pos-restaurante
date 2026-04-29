import React, { useState, useEffect, useCallback } from 'react';
import CardMetric from './CardMetric';
import { GraficaLinea, GraficaBarra, GraficaPie } from './GraficaVentas';
import TablaReportes from './TablaReportes';

const PERIODOS = [
    { value: 'dia',    label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes',    label: 'Este mes' },
];

const fmtQ = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

const fetchApi = async (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/${endpoint}${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
};

function Spinner() {
    return (
        <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function ErrorCard({ msg, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-sm text-red-500">
            <span className="text-3xl">warning</span>
            <p>{msg}</p>
            {onRetry && (
                <button onClick={onRetry} className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100">
                    Reintentar
                </button>
            )}
        </div>
    );
}

function SectionCard({ title, subtitle, children, action }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
                <div>
                    <h2 className="text-sm font-bold text-gray-800">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

function useReporte(endpoint, params) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const cargar = useCallback(() => {
        setLoading(true);
        setError(null);
        fetchApi(endpoint, params)
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, JSON.stringify(params)]);

    useEffect(() => { cargar(); }, [cargar]);
    return { data, loading, error, recargar: cargar };
}

export default function Reportes() {
    const [periodo, setPeriodo] = useState('mes');

    const ventas    = useReporte('reportes/ventas',                { periodo });
    const fechas    = useReporte('reportes/ventas-por-fecha',      { periodo });
    const productos = useReporte('reportes/productos-mas-vendidos', { periodo, limit: 8 });
    const metodos   = useReporte('reportes/metodos-pago',          { periodo });

    const totalVentas  = ventas.data?.total_ventas   ?? 0;
    const totalPedidos = ventas.data?.total_pedidos  ?? 0;
    const ticketProm   = ventas.data?.promedio_pedido ?? 0;
    const totalNeto    = metodos.data?.metodos?.reduce((s, m) => s + (+m.total_neto || 0), 0) ?? 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard de Reportes</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Metricas y analisis del restaurante</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        {PERIODOS.map((p) => (
                            <button key={p.value} onClick={() => setPeriodo(p.value)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${periodo === p.value ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ventas.loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-24 animate-pulse" />
                        ))
                    ) : ventas.error ? (
                        <div className="col-span-4"><ErrorCard msg={ventas.error} onRetry={ventas.recargar} /></div>
                    ) : (
                        <>
                            <CardMetric label="Total ventas"    value={fmtQ(totalVentas)}  icon="coins"  variant="blue"   sub={`Periodo: ${periodo}`} />
                            <CardMetric label="Pedidos"         value={totalPedidos}         icon="receipt" variant="green"  sub="Pedidos completados" />
                            <CardMetric label="Ticket promedio" value={fmtQ(ticketProm)}    icon="chart"  variant="amber"  sub="Por pedido" />
                            <CardMetric label="Ingreso neto"    value={fmtQ(totalNeto)}     icon="check"  variant="purple" sub="Efectivo recibido" />
                        </>
                    )}
                </div>

                <SectionCard title="Ventas por dia" subtitle="Evolucion de ingresos en el periodo seleccionado">
                    {fechas.loading ? <Spinner /> :
                     fechas.error   ? <ErrorCard msg={fechas.error} onRetry={fechas.recargar} /> :
                     <GraficaLinea data={fechas.data?.serie ?? []} xKey="fecha" yKey="total" label="Ventas (COP)" />}
                </SectionCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard title="Productos mas vendidos" subtitle="Por unidades vendidas">
                        {productos.loading ? <Spinner /> :
                         productos.error   ? <ErrorCard msg={productos.error} onRetry={productos.recargar} /> :
                         <GraficaBarra data={productos.data?.productos ?? []} xKey="nombre" yKey="cantidad_vendida" label="Unidades" color="#10b981" />}
                    </SectionCard>

                    <SectionCard title="Metodos de pago" subtitle="Distribucion de pagos en el periodo">
                        {metodos.loading ? <Spinner /> :
                         metodos.error   ? <ErrorCard msg={metodos.error} onRetry={metodos.recargar} /> :
                         <GraficaPie data={metodos.data?.metodos ?? []} nameKey="metodo_pago" valueKey="total_neto" />}
                    </SectionCard>
                </div>

                <SectionCard
                    title="Detalle de productos vendidos"
                    subtitle="Ranking completo con ingresos y participacion"
                    action={<span className="text-xs text-gray-400 font-medium">{productos.data?.productos?.length ?? 0} productos</span>}
                >
                    {productos.loading ? <Spinner /> :
                     productos.error   ? <ErrorCard msg={productos.error} onRetry={productos.recargar} /> :
                     <TablaReportes rows={productos.data?.productos ?? []} />}
                </SectionCard>

            </div>
        </div>
    );
}