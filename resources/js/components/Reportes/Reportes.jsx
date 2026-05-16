import React, { useMemo, useState } from 'react';
import CardMetric from './CardMetric';
import { GraficaLinea, GraficaBarra, GraficaPie } from './GraficaVentas';
import TablaReportes from './TablaReportes';
import SelectorPeriodo from './SelectorPeriodo';
import SeccionTipoPedido from './SeccionTipoPedido';
import SeccionGastosIngresos from './SeccionGastosIngresos';
import { useReporte } from '../../hooks/useReporte';

const fmtQ = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

// ─── Componentes UI de apoyo ──────────────────────────────────────────────────

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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Reportes() {
    const [periodo, setPeriodo] = useState('mes');
    const [desde,   setDesde]   = useState('');
    const [hasta,   setHasta]   = useState('');

    // Construye los params según si es período rápido o rango personalizado
    const params = useMemo(() => {
        if (periodo === 'custom' && desde && hasta) {
            return { desde, hasta };
        }
        return { periodo };
    }, [periodo, desde, hasta]);

    const handlePeriodoChange = ({ periodo: p, desde: d, hasta: h }) => {
        setPeriodo(p);
        setDesde(d);
        setHasta(h);
    };

    // ── Datos ──────────────────────────────────────────────────────────────────
    const ventas    = useReporte('reportes/ventas',                params);
    const fechas    = useReporte('reportes/ventas-por-fecha',      params);
    const productos = useReporte('reportes/productos-mas-vendidos', { ...params, limit: 8 });
    const metodos   = useReporte('reportes/metodos-pago',          params);
    const ganancias = useReporte('reportes/ganancias',             params);
    const gastos    = useReporte('reportes/gastos',                params);
    const tipoPed   = useReporte('reportes/tipo-pedido',           params);

    // ── Valores derivados ──────────────────────────────────────────────────────
    const totalVentas  = ventas.data?.total_ventas   ?? 0;
    const totalPedidos = ventas.data?.total_pedidos  ?? 0;
    const ticketProm   = ventas.data?.promedio_pedido ?? 0;
    const totalNeto    = metodos.data?.metodos?.reduce((s, m) => s + (+m.total_neto || 0), 0) ?? 0;
    const comparativa  = ventas.data?.comparativa    ?? {};

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Encabezado + selector de período */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard de Reportes</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Métricas y análisis del restaurante</p>
                    </div>
                    <SelectorPeriodo
                        periodo={periodo}
                        desde={desde}
                        hasta={hasta}
                        onChange={handlePeriodoChange}
                    />
                </div>

                {/* Tarjetas de métricas principales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ventas.loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-24 animate-pulse" />
                        ))
                    ) : ventas.error ? (
                        <div className="col-span-4"><ErrorCard msg={ventas.error} onRetry={ventas.recargar} /></div>
                    ) : (
                        <>
                            <CardMetric label="Total ventas"    value={fmtQ(totalVentas)}  icon="coins"   variant="blue"   sub="Pedidos completados" trend={comparativa.total_ventas} />
                            <CardMetric label="Pedidos"         value={totalPedidos}        icon="receipt" variant="green"  sub="En el período"       trend={comparativa.total_pedidos} />
                            <CardMetric label="Ticket promedio" value={fmtQ(ticketProm)}   icon="chart"   variant="amber"  sub="Por pedido"           trend={comparativa.promedio_pedido} />
                            <CardMetric label="Ingreso neto"    value={fmtQ(totalNeto)}    icon="check"   variant="purple" sub="Efectivo recibido" />
                        </>
                    )}
                </div>

                {/* Gráfica de evolución de ventas */}
                <SectionCard title="Ventas por día" subtitle="Evolución de ingresos en el período seleccionado">
                    {fechas.loading ? <Spinner /> :
                     fechas.error   ? <ErrorCard msg={fechas.error} onRetry={fechas.recargar} /> :
                     <GraficaLinea data={fechas.data?.serie ?? []} xKey="fecha" yKey="total" label="Ventas (COP)" />}
                </SectionCard>

                {/* Productos + Métodos de pago */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard title="Productos más vendidos" subtitle="Por unidades vendidas">
                        {productos.loading ? <Spinner /> :
                         productos.error   ? <ErrorCard msg={productos.error} onRetry={productos.recargar} /> :
                         <GraficaBarra data={productos.data?.productos ?? []} xKey="nombre" yKey="cantidad_vendida" label="Unidades" color="#10b981" />}
                    </SectionCard>

                    <SectionCard title="Métodos de pago" subtitle="Distribución de pagos en el período">
                        {metodos.loading ? <Spinner /> :
                         metodos.error   ? <ErrorCard msg={metodos.error} onRetry={metodos.recargar} /> :
                         <GraficaPie data={metodos.data?.metodos ?? []} nameKey="metodo_pago" valueKey="total_neto" />}
                    </SectionCard>
                </div>

                {/* Tipo de pedido + Gastos vs Ingresos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard
                        title="Distribución por canal"
                        subtitle="Mesa · Domicilio · Para llevar"
                    >
                        <SeccionTipoPedido
                            tipos={tipoPed.data?.tipos ?? []}
                            totalPedidos={tipoPed.data?.total_pedidos ?? 0}
                            loading={tipoPed.loading}
                            error={tipoPed.error}
                            onRetry={tipoPed.recargar}
                        />
                    </SectionCard>

                    <SectionCard
                        title="Ingresos vs Gastos"
                        subtitle="Balance estimado del período"
                        action={
                            !gastos.loading && !ventas.loading && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    (totalVentas - (gastos.data?.total ?? 0)) >= 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {(totalVentas - (gastos.data?.total ?? 0)) >= 0 ? 'Positivo' : 'Negativo'}
                                </span>
                            )
                        }
                    >
                        <SeccionGastosIngresos
                            totalVentas={totalVentas}
                            gastos={gastos.data ?? {}}
                            loading={gastos.loading || ventas.loading}
                            error={gastos.error}
                            onRetry={gastos.recargar}
                        />
                    </SectionCard>
                </div>

                {/* Ganancias estimadas */}
                {!ganancias.loading && !ganancias.error && (
                    <SectionCard
                        title="Ganancia estimada"
                        subtitle="Ingreso − costo de insumos utilizado en producción"
                        action={<span className="text-xs text-gray-400 italic">Solo productos con insumos configurados</span>}
                    >
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Ingreso bruto</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">{fmtQ(ganancias.data?.ingreso ?? 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Costo insumos</p>
                                <p className="text-xl font-bold text-red-500 mt-1">{fmtQ(ganancias.data?.costo_estimado ?? 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Ganancia</p>
                                <p className={`text-xl font-bold mt-1 ${(ganancias.data?.ganancia ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {fmtQ(ganancias.data?.ganancia ?? 0)}
                                </p>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* Tabla detallada de productos */}
                <SectionCard
                    title="Detalle de productos vendidos"
                    subtitle="Ranking completo con ingresos y participación"
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
