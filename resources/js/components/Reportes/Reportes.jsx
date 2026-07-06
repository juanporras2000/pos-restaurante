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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full min-w-0">

            <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-50">

                <div className="w-full sm:min-w-0 sm:flex-1">

                    <h2 className="text-sm font-bold text-gray-800 sm:truncate" title={title}>
                        {title}
                    </h2>
                    {subtitle && (

                        <p className="text-xs text-gray-400 mt-0.5 break-words">
                            {subtitle}
                        </p>
                    )}
                </div>

                {action && (
                    <div className="w-full sm:w-auto flex-shrink-0 flex items-center justify-start sm:justify-end mt-1 sm:mt-0">
                        {action}
                    </div>
                )}
            </div>

            {/* Contenedor del contenido interno */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 w-full min-w-0">
                {children}
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Reportes() {
    const [periodo, setPeriodo] = useState('mes');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

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
    const ventas = useReporte('reportes/ventas', params);
    const fechas = useReporte('reportes/ventas-por-fecha', params);
    const productos = useReporte('reportes/productos-mas-vendidos', { ...params, limit: 8 });
    const metodos = useReporte('reportes/metodos-pago', params);
    const ganancias = useReporte('reportes/ganancias', params);
    const gastos = useReporte('reportes/gastos', params);
    const tipoPed = useReporte('reportes/tipo-pedido', params);

    // ── Valores derivados ──────────────────────────────────────────────────────
    const totalVentas = ventas.data?.total_ventas ?? 0;
    const totalPedidos = ventas.data?.total_pedidos ?? 0;
    const ticketProm = ventas.data?.promedio_pedido ?? 0;
    const totalNeto = metodos.data?.metodos?.reduce((s, m) => s + (+m.total_neto || 0), 0) ?? 0;
    const comparativa = ventas.data?.comparativa ?? {};

    return (
        <div className="min-h-screen  mx-auto bg-gray-50">
            <div className="max-w-7xl mx-auto xl:px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
                <div className="flex flex-col justify-center items-center sm:flex-row lg:items-start lg:justify-between gap-4">
                    <div className='flex-1'>
                        <h1 className="text-lg sm:text-sm md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center lg:justify-normal gap-3">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                            </svg>

                            Métrica de Reportes
                        </h1>
                        <p className="text-gray-600 text-center lg:text-start lg:mt-1 text-sm lg:text-md">Métricas y análisis del restaurante</p>
                    </div>
                    <SelectorPeriodo
                        periodo={periodo}
                        desde={desde}
                        hasta={hasta}
                        onChange={handlePeriodoChange}
                    />
                </div>

                {/* Tarjetas de métricas principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 w-full">
                    {ventas.loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm h-24 animate-pulse w-full"
                            />
                        )
                        )
                    ) : ventas.error ? (
                        <div className="col-span-full w-full">
                            <ErrorCard msg={ventas.error} onRetry={ventas.recargar} />
                        </div>
                    ) : (
                        <>
                            <CardMetric
                                label="Total ventas"
                                value={fmtQ(totalVentas)}
                                icon="coins"
                                variant="blue"
                                sub="Pedidos completados"
                                trend={comparativa.total_ventas}
                            />
                            <CardMetric
                                label="Pedidos"
                                value={totalPedidos}
                                icon="receipt"
                                variant="green"
                                sub="En el período"
                                trend={comparativa.total_pedidos}
                            />
                            <CardMetric
                                label="Ticket promedio"
                                value={fmtQ(ticketProm)}
                                icon="chart"
                                variant="amber"
                                sub="Por pedido"
                                trend={comparativa.promedio_pedido}
                            />
                            <CardMetric
                                label="Ingreso neto"
                                value={fmtQ(totalNeto)}
                                icon="check"
                                variant="purple"
                                sub="Efectivo recibido"
                            />
                        </>
                    )}
                </div>

                {/* Gráfica de evolución de ventas */}
                <SectionCard title="Ventas por día" subtitle="Evolución de ingresos en el período seleccionado">
                    {fechas.loading ? <Spinner /> :
                        fechas.error ? <ErrorCard msg={fechas.error} onRetry={fechas.recargar} /> :
                            <GraficaLinea data={fechas.data?.serie ?? []} xKey="fecha" yKey="total" label="Ventas (COP)" />}
                </SectionCard>

                {/* Productos + Métodos de pago */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <SectionCard title="Productos más vendidos" subtitle="Por unidades vendidas">
                        {productos.loading ? <Spinner /> :
                            productos.error ? <ErrorCard msg={productos.error} onRetry={productos.recargar} /> :
                                <GraficaBarra data={productos.data?.productos ?? []} xKey="nombre" yKey="cantidad_vendida" label="Unidades" color="#10b981" />}
                    </SectionCard>

                    <SectionCard title="Métodos de pago" subtitle="Distribución de pagos en el período">
                        {metodos.loading ? <Spinner /> :
                            metodos.error ? <ErrorCard msg={metodos.error} onRetry={metodos.recargar} /> :
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
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(totalVentas - (gastos.data?.total ?? 0)) >= 0
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
                        action={
                            <span className="text-[11px] sm:text-xs text-gray-400 italic block text-right sm:inline">
                                Solo productos con insumos configurados
                            </span>
                        }
                    >

                        <div className="flex flex-col divide-y divide-gray-100 gap-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0 sm:divide-x text-center">

                            {/* Bloque: Ingreso Bruto */}
                            <div className="pt-0 sm:pt-0 sm:px-2">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                    Ingreso bruto
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-gray-800 mt-0.5 sm:mt-1 truncate" title={fmtQ(ganancias.data?.ingreso ?? 0)}>
                                    {fmtQ(ganancias.data?.ingreso ?? 0)}
                                </p>
                            </div>

                            {/* Bloque: Costo Insumos */}

                            <div className="pt-3 sm:pt-0 sm:px-2">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                    Costo insumos
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-red-500 mt-0.5 sm:mt-1 truncate" title={fmtQ(ganancias.data?.costo_estimado ?? 0)}>
                                    {fmtQ(ganancias.data?.costo_estimado ?? 0)}
                                </p>
                            </div>

                            {/* Bloque: Ganancia */}
                            <div className="pt-3 sm:pt-0 sm:px-2">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                                    Ganancia
                                </p>
                                <p className={`text-lg sm:text-xl font-black mt-0.5 sm:mt-1 truncate ${(ganancias.data?.ganancia ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`} title={fmtQ(ganancias.data?.ganancia ?? 0)}>
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
                        productos.error ? <ErrorCard msg={productos.error} onRetry={productos.recargar} /> :
                            <TablaReportes rows={productos.data?.productos ?? []} />}
                </SectionCard>


            </div>
        </div>
    );
}
