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

const PALETTE = CHART_PALETTE;

const fmtQ = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, currency = false }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {currency ? fmtQ(p.value) : p.value}
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
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Sin datos para este período
        </div>
    );
}

// ─── GraficaLinea: ventas por fecha ──────────────────────────────────────────
export function GraficaLinea({ data = [], xKey = 'fecha', yKey = 'total', label = 'Total (COP)' }) {
    if (!data.length) return <Empty />;
    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, REPORT_CONFIG.VENTAS.LIMITE_SUPERIOR]}
                    tickCount={REPORT_CONFIG.VENTAS.INTERVALOS}
                    tickFormatter={(v) => fmtQ(v)}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
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
    );
}

// ─── GraficaBarra: productos más vendidos ─────────────────────────────────────
export function GraficaBarra({ data = [], xKey = 'nombre', yKey = 'cantidad_vendida', label = 'Unidades vendidas', color = '#10b981' }) {
    if (!data.length) return <Empty />;
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    dataKey={xKey}
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={yKey} name={label} fill={color} radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── GraficaPie: métodos de pago ──────────────────────────────────────────────
export function GraficaPie({ data = [], nameKey = 'metodo_pago', valueKey = 'total_neto' }) {
    if (!data.length) return <Empty />;
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
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
                        formatter={(v, n) => [fmtQ(v), n]}
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
