import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { TIPOS } from './constants';

export default function ModalGasto({ gasto, onGuardar, onCerrar }) {
    const [form, setForm] = useState({
        concepto: gasto?.concepto ?? '',
        tipo: gasto?.tipo ?? 'otro',
        monto: gasto?.monto != null ? String(parseFloat(gasto.monto) / 1000) : '',
        nota: gasto?.nota ?? '',
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const esEdicion = !!gasto?.id;

    const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});

        const montoNum = parseFloat(form.monto);
        if (!form.concepto.trim()) { setErrores({ concepto: 'El concepto es obligatorio.' }); return; }
        if (isNaN(montoNum) || montoNum <= 0) { setErrores({ monto: 'Ingresa un monto válido mayor a 0.' }); return; }

        setGuardando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const url = esEdicion ? `/gastos/${gasto.id}` : '/gastos';
        const method = esEdicion ? 'put' : 'post';

        try {
            const res = await axios({
                method,
                url,
                headers: { 'X-CSRF-TOKEN': csrfToken },
                data: {
                    concepto: form.concepto.trim(),
                    tipo: form.tipo,
                    monto: montoNum * 1000,
                    nota: form.nota.trim() || null,
                },
            });

            onGuardar(res.data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                const map = {};
                Object.entries(data.errors ?? {}).forEach(([k, v]) => { map[k] = v[0]; });
                setErrores(map);
                return;
            }
            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                        {esEdicion ? 'Editar gasto' : 'Registrar gasto'}
                    </h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 dark:text-gray-500 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {/* Concepto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Concepto <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.concepto}
                            onChange={(e) => set('concepto', e.target.value)}
                            placeholder="Ej: Compra de papas, Gasolina moto..."
                            maxLength={255}
                            autoFocus
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.concepto ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errores.concepto && <p className="mt-1 text-xs text-red-600">{errores.concepto}</p>}
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIPOS.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => set('tipo', t.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${form.tipo === t.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Monto <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">$</span>
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={form.monto}
                                onChange={(e) => set('monto', e.target.value)}
                                placeholder="Ej: 15"
                                className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errores.monto ? 'border-red-400' : 'border-gray-300'}`}
                            />
                        </div>
                        {form.monto !== '' && !isNaN(parseFloat(form.monto)) && (
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">= ${(parseFloat(form.monto) * 1000).toLocaleString('es-CO')}</p>
                        )}
                        {errores.monto && <p className="mt-1 text-xs text-red-600">{errores.monto}</p>}
                    </div>

                    {/* Nota */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nota <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={form.nota}
                            onChange={(e) => set('nota', e.target.value)}
                            placeholder="Detalles adicionales..."
                            rows={2}
                            maxLength={500}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar gasto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
