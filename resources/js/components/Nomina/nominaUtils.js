export const TIPOS = {
    prestamo: 'Préstamo',
    compra:   'Compra',
    otro:     'Otro',
};

export function fmtCOP(pesos) {
    return `$${Number(pesos).toLocaleString('es-CO')}`;
}

export function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

export function hoy() {
    return new Date().toLocaleDateString('en-CA');
}
