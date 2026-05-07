export const TIPOS = [
    { value: 'insumos',   label: 'Insumos',   color: 'bg-blue-100 text-blue-700' },
    { value: 'gasolina',  label: 'Gasolina',  color: 'bg-yellow-100 text-yellow-700' },
    { value: 'servicios', label: 'Servicios', color: 'bg-purple-100 text-purple-700' },
    { value: 'otro',      label: 'Otro',      color: 'bg-gray-100 text-gray-600' },
];

export function tipoInfo(valor) {
    return TIPOS.find((t) => t.value === valor) ?? TIPOS[3];
}

export function fmt(monto) {
    const val = Number.parseFloat(monto);
    return `$${(Number.isNaN(val) ? 0 : val).toLocaleString('es-CO')}`;
}

export function fechaLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
