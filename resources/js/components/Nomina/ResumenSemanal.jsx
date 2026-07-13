import React, { useState, useEffect } from 'react';

const DIAS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function fmtCOP(pesos) {
    return `$${Number(pesos).toLocaleString('es-CO')}`;
}

function inicioSemana(ref = new Date()) {
    const d = new Date(ref);
    const dow = d.getDay(); // 0=Dom
    const diff = dow === 0 ? -6 : 1 - dow; // ajuste a lunes
    d.setDate(d.getDate() + diff);
    return d.toLocaleDateString('en-CA');
}

function diasDeSemana(inicioStr) {
    const dias = [];
    const base = new Date(inicioStr + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        dias.push(d.toLocaleDateString('en-CA'));
    }
    return dias;
}

function formatearRango(inicio, fin) {
    const opts = { day: 'numeric', month: 'short' };
    const i = new Date(inicio + 'T00:00:00').toLocaleDateString('es-CO', opts);
    const f = new Date(fin + 'T00:00:00').toLocaleDateString('es-CO', opts);
    return `${i} – ${f}`;
}

export default function ResumenSemanal() {
    const [semanaInicio, setSemanaInicio] = useState(() => inicioSemana());
    const [resumen, setResumen] = useState([]);
    const [cargando, setCargando] = useState(false);

    const dias = diasDeSemana(semanaInicio);
    const semanaFin = dias[6];

    useEffect(() => {
        setCargando(true);
        fetch(`/api/nomina/resumen?inicio=${semanaInicio}&fin=${semanaFin}`)
            .then((r) => r.json())
            .then(setResumen)
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [semanaInicio]); // eslint-disable-line

    const navSemana = (delta) => {
        const base = new Date(semanaInicio + 'T00:00:00');
        base.setDate(base.getDate() + delta * 7);
        setSemanaInicio(base.toLocaleDateString('en-CA'));
    };

    const esSemanaActual = semanaInicio === inicioSemana();

    const totalSemana = resumen.reduce((sum, r) => sum + (r.total_pagar ?? 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Resumen semanal</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{formatearRango(semanaInicio, semanaFin)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => navSemana(-1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Semana anterior">
                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    {!esSemanaActual && (
                        <button type="button" onClick={() => setSemanaInicio(inicioSemana())} className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                            Semana actual
                        </button>
                    )}
                    <button type="button" onClick={() => navSemana(1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Semana siguiente">
                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            ) : resumen.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay trabajadores registrados.</p>
                </div>
            ) : (
                <>
                    {/* Tabla — scroll horizontal en móvil */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-4 font-semibold text-gray-700 w-48">Trabajador</th>
                                    {dias.map((d, i) => {
                                        const esHoy = d === new Date().toLocaleDateString('en-CA');
                                        return (
                                            <th key={d} className={`text-center py-2 px-2 font-medium text-xs w-12 ${esHoy ? 'text-blue-600' : 'text-gray-500'}`}>
                                                <div>{DIAS_ES[i]}</div>
                                                <div className={`text-xs font-normal ${esHoy ? 'text-blue-500' : 'text-gray-400'}`}>
                                                    {new Date(d + 'T00:00:00').getDate()}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="text-center py-2 px-2 font-semibold text-gray-700 w-16">Días</th>
                                    <th className="text-right py-2 px-4 font-semibold text-gray-700 w-32">Total a pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumen.map((row) => (
                                    <tr key={row.trabajador.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 ${row.trabajador.activo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {row.trabajador.nombre.charAt(0)}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{row.trabajador.nombre}</p>
                                                    {row.trabajador.cargo && (
                                                        <p className="text-xs text-gray-400 truncate">{row.trabajador.cargo}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {dias.map((d) => {
                                            const asistio = row.dias.includes(d);
                                            return (
                                                <td key={d} className="text-center py-3 px-2">
                                                    {asistio ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                                            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <path d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block w-2 h-2 rounded-full bg-gray-200 mx-auto" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="text-center py-3 px-2">
                                            <span className={`text-sm font-semibold ${row.dias_count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {row.dias_count}
                                            </span>
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span className={`text-sm font-bold ${row.total_pagar > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                                                {fmtCOP(row.total_pagar)}
                                            </span>
                                            <p className="text-xs text-gray-400">{fmtCOP(row.trabajador.pago_por_turno)}/día</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total semana */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center px-1">
                        <div>
                            <p className="text-sm text-gray-500">Total nómina semanal</p>
                            <p className="text-xs text-gray-400">{resumen.reduce((s, r) => s + r.dias_count, 0)} turnos en la semana</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{fmtCOP(totalSemana)}</p>
                    </div>
                </>
            )}
        </div>
    );
}
