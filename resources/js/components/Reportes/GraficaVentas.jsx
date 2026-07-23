import React from 'react';
import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend,
} from 'recharts';
import { REPORT_CONFIG, CHART_PALETTE } from '../../constants';
import { GraficaLineaPropTypes, GraficaBarraPropTypes, GraficaPiePropTypes } from '../../propTypes';
import { fmtCOP } from '../../utils/format';
import { useTheme } from '../../hooks/useTheme';

const PALETTE = CHART_PALETTE;

// Recharts pinta grid/ejes/tooltip con hex en props JS, no con clases Tailwind —
// una clase dark: no les llega. Se elige el set de colores según el tema activo.
const GRID_COLORS = {
    light: { grid: '#f1f5f9', axis: '#94a3b8', axisAlt: '#64748b' },
    dark: { grid: '#374151', axis: '#9ca3af', axisAlt: '#9ca3af' },
};

const TOOLTIP_COLORS = {
    light: { bg: '#ffffff', border: '#e5e7eb', text: '#111827' },
    dark: { bg: '#1f2937', border: '#374151', text: '#e5e7eb' },
};

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, currency = false }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {currency ? fmtCOP(p.value) : p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Label personalizado para Pie ─────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

// ─── Componente vacío ─────────────────────────────────────────────────────────
function Empty() {
    return (
        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
            Sin datos para este período
        </div>
    );
}

// ─── GraficaLinea: ventas por fecha ──────────────────────────────────────────
export function GraficaLinea({ data = [], xKey = 'fecha', yKey = 'total', label = 'Total (COP)' }) {
    const { theme } = useTheme();
    const colors = GRID_COLORS[theme];
    if (!data.length) return <Empty />;
    return (
        <>
            <p className="sr-only">
                {`Gráfico de líneas: ${label}. ${data.length} punto${data.length !== 1 ? 's' : ''} de datos, total ${fmtCOP(data.reduce((s, d) => s + (+d[yKey] || 0), 0))}.`}
            </p>
            <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 11, fill: colors.axis }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 'dataMax']}
                    tickCount={REPORT_CONFIG.VENTAS.INTERVALOS}
                    tickFormatter={(v) => fmtCOP(v)}
                    tick={{ fontSize: 11, fill: colors.axis }}
                    axisLine={false}
                    tickLine={false}
                    width={REPORT_CONFIG.VENTAS.ANCHO_EJE_Y}
                />
                <Tooltip content={<CustomTooltip currency />} />
                <Line
                    type="monotone"
                    dataKey={yKey}
                    name={label}
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </>
    );
}

// ─── GraficaBarra: productos más vendidos ─────────────────────────────────────
export function GraficaBarra({ data = [], xKey = 'nombre', yKey = 'cantidad_vendida', label = 'Unidades vendidas', color = '#10b981' }) {
    const { theme } = useTheme();
    const colors = GRID_COLORS[theme];
    if (!data.length) return <Empty />;
    return (
        <>
            <p className="sr-only">
                {`Gráfico de barras: ${label}. ${data.length} punto${data.length !== 1 ? 's' : ''} de datos.`}
            </p>
            <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: colors.axis }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    dataKey={xKey}
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: colors.axisAlt }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={yKey} name={label} fill={color} radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
            </ResponsiveContainer>
        </>
    );
}

// ─── GraficaPie: métodos de pago ──────────────────────────────────────────────
export function GraficaPie({ data = [], nameKey = 'metodo_pago', valueKey = 'total_neto' }) {
    const { theme } = useTheme();
    const tooltipColors = TOOLTIP_COLORS[theme];
    if (!data.length) return <Empty />;
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="sr-only">
                {`Gráfico circular: distribución por ${nameKey}. ${data.length} categoría${data.length !== 1 ? 's' : ''}, total ${fmtCOP(data.reduce((s, d) => s + (+d[valueKey] || 0), 0))}.`}
            </p>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        dataKey={valueKey}
                        nameKey={nameKey}
                        labelLine={false}
                        label={PieLabel}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(v, n) => [fmtCOP(v), n]}
                        contentStyle={{ borderRadius: 12, fontSize: 13 }}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={10}
                        formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

GraficaLinea.propTypes = GraficaLineaPropTypes;
GraficaBarra.propTypes = GraficaBarraPropTypes;
GraficaPie.propTypes = GraficaPiePropTypes;

