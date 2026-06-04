// Factores a gramo (peso) y a mililitro (volumen)
const PESO_G = { mg: 0.001, g: 1, gr: 1, kg: 1000 };
const VOL_ML  = { ml: 1, cl: 10, dl: 100, l: 1000, lt: 1000 };

const PESO_ORDEN = ['mg', 'g', 'gr', 'kg'];
const VOL_ORDEN  = ['ml', 'cl', 'dl', 'l', 'lt'];

function norm(u) { return (u ?? '').toLowerCase().trim(); }

/**
 * Returns compatible units for a given base unit.
 * If the unit is not weight or volume, returns only the base unit (no conversion).
 */
export function getUnidadesCompatibles(baseUnit) {
    const u = norm(baseUnit);
    if (u in PESO_G) return PESO_ORDEN;
    if (u in VOL_ML) return VOL_ORDEN;
    return baseUnit ? [baseUnit] : [];
}

/**
 * Converts a quantity from unidadEntrada to unidadBase.
 * Example: convertirUnidad(10, 'gr', 'kg') → 0.01
 */
export function convertirUnidad(cantidad, unidadEntrada, unidadBase) {
    const ue = norm(unidadEntrada);
    const ub = norm(unidadBase);
    if (ue === ub) return cantidad;
    if (ue in PESO_G && ub in PESO_G) return (cantidad * PESO_G[ue]) / PESO_G[ub];
    if (ue in VOL_ML && ub in VOL_ML) return (cantidad * VOL_ML[ue]) / VOL_ML[ub];
    return cantidad;
}
