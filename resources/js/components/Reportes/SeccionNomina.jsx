import React from 'react';
import PropTypes from 'prop-types';
import { fmtCOP } from '../../utils/format';

function Resumen({ label, valor, colorClase }) {
    return (
        <div className="text-center px-2">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
            <p className={`text-lg sm:text-xl font-bold mt-0.5 truncate ${colorClase}`} title={valor}>{valor}</p>
        </div>
    );
}

Resumen.propTypes = {
    label: PropTypes.string.isRequired,
    valor: PropTypes.string.isRequired,
    colorClase: PropTypes.string,
};

/**
 * SeccionNomina
 * Responsabilidad única: mostrar el resumen de nómina (bruto/descuentos/neto)
 * del período y el detalle por trabajador. Recibe los datos ya cargados
 * desde el padre (Reportes.jsx) para no duplicar fetching.
 */
export default function SeccionNomina({ nomina }) {
    const detalle = nomina?.detalle ?? [];

    if (!detalle.length) {
        return <p className="text-center py-8 text-sm text-gray-400">Sin trabajadores registrados</p>;
    }

    const ordenado = [...detalle].sort((a, b) => b.total_pagar - a.total_pagar);

    return (
        <div className="space-y-5">
            <div className="flex flex-col divide-y divide-gray-100 gap-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0 sm:divide-x">
                <Resumen label="Sueldo bruto" valor={fmtCOP(nomina.total_bruto)} colorClase="text-gray-800" />
                <Resumen label="Descuentos" valor={`−${fmtCOP(nomina.total_descuentos)}`} colorClase="text-red-500" />
                <Resumen label="Neto a pagar" valor={fmtCOP(nomina.total_neto)} colorClase="text-blue-700" />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trabajador</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Días</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Bruto</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Descuento</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Neto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ordenado.map((t) => (
                            <tr key={t.trabajador_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2.5">
                                    <span className="font-medium text-gray-800">{t.nombre}</span>
                                    {t.deuda_pendiente > 0 && (
                                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                                            Debe {fmtCOP(t.deuda_pendiente)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2.5 text-center text-gray-600 tabular-nums">{t.dias_count}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 tabular-nums">{fmtCOP(t.total_pagar)}</td>
                                <td className="px-4 py-2.5 text-right tabular-nums">
                                    {t.total_descuentos > 0
                                        ? <span className="text-red-500">−{fmtCOP(t.total_descuentos)}</span>
                                        : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-blue-700 tabular-nums">{fmtCOP(t.total_neto)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

SeccionNomina.propTypes = {
    nomina: PropTypes.shape({
        total_bruto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total_descuentos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total_neto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total_deuda_pendiente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        detalle: PropTypes.arrayOf(PropTypes.shape({
            trabajador_id: PropTypes.number,
            nombre: PropTypes.string,
            dias_count: PropTypes.number,
            total_pagar: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            total_descuentos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            total_neto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            deuda_pendiente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })),
    }),
};
