import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

const TIPOS = [
    { value: 'insumos',   label: 'Insumos',   color: 'bg-blue-100 text-blue-700' },
    { value: 'gasolina',  label: 'Gasolina',  color: 'bg-yellow-100 text-yellow-700' },
    { value: 'servicios', label: 'Servicios', color: 'bg-purple-100 text-purple-700' },
    { value: 'otro',      label: 'Otro',      color: 'bg-gray-100 text-gray-600' },
];

const GASTO_VACIO = { concepto: '', tipo: 'otro', monto: '', nota: '' };

function tipoInfo(valor) {
    return TIPOS.find((t) => t.value === valor) ?? TIPOS[3];
}

function fmt(monto) {
    return `$${parseFloat(monto).toLocaleString('es-CO')}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ModalGasto({ gasto, onGuardar, onCerrar }) {
    const [form, setForm] = useState({
        concepto: gasto?.concepto ?? '',
        tipo:     gasto?.tipo     ?? 'otro',
        monto:    gasto?.monto    != null ? String(parseFloat(gasto.monto) / 1000) : '',
        nota:     gasto?.nota     ?? '',
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
        const url    = esEdicion ? `/api/gastos/${gasto.id}` : '/api/gastos';
        const method = esEdicion ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    concepto: form.concepto.trim(),
                    tipo:     form.tipo,
                    monto:    montoNum * 1000,
                    nota:     form.nota.trim() || null,
                }),
            });

            if (res.status === 422) {
                const data = await res.json();
                const map = {};
                Object.entries(data.errors ?? {}).forEach(([k, v]) => { map[k] = v[0]; });
                setErrores(map);
                return;
            }
            if (!res.ok) throw new Error();

            const data = await res.json();
            onGuardar(data);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                        {esEdicion ? 'Editar gasto' : 'Registrar gasto'}
                    </h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {/* Concepto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.concepto}
                            onChange={(e) => set('concepto', e.target.value)}
                            placeholder="Ej: Compra de papas, Gasolina moto..."
                            maxLength={255}
                            autoFocus
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errores.concepto ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errores.concepto && <p className="mt-1 text-xs text-red-600">{errores.concepto}</p>}
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIPOS.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => set('tipo', t.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                                        form.tipo === t.value
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
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
                            <p className="mt-0.5 text-xs text-gray-400">= ${(parseFloat(form.monto) * 1000).toLocaleString('es-CO')}</p>
                        )}
                        {errores.monto && <p className="mt-1 text-xs text-red-600">{errores.monto}</p>}
                    </div>

                    {/* Nota */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nota <span className="text-gray-400 font-normal">(opcional)</span></label>
                        <textarea
                            value={form.nota}
                            onChange={(e) => set('nota', e.target.value)}
                            placeholder="Detalles adicionales..."
                            rows={2}
                            maxLength={500}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar gasto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Gastos() {
    const [gastos, setGastos]           = useState([]);
    const [total, setTotal]             = useState(0);
    const [cargando, setCargando]       = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [gastoEditar, setGastoEditar] = useState(null);
    const [fecha, setFecha]             = useState(() => new Date().toISOString().slice(0, 10));
    const [filtroTipo, setFiltroTipo]   = useState('todos');

    const cargar = useCallback(() => {
        setCargando(true);
        fetch(`/api/gastos?fecha=${fecha}`)
            .then((r) => r.json())
            .then((data) => {
                setGastos(data.gastos ?? []);
                setTotal(data.total ?? 0);
            })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [fecha]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo = () => { setGastoEditar(null); setModalAbierto(true); };
    const abrirEditar = (g) => { setGastoEditar(g); setModalAbierto(true); };

    const handleGuardado = (gastoGuardado) => {
        setModalAbierto(false);
        Swal.fire({
            icon: 'success',
            title: gastoEditar ? 'Gasto actualizado' : 'Gasto registrado',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
        });
        cargar();
    };

    const eliminar = async (g) => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar gasto?`,
            html: `<span class="text-gray-600">${g.concepto}</span><br><strong>${fmt(g.monto)}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!isConfirmed) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/gastos/${g.id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            if (!res.ok) throw new Error();
            Swal.fire({ icon: 'success', title: 'Gasto eliminado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            cargar();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    const gastosFiltrados = filtroTipo === 'todos'
        ? gastos
        : gastos.filter((g) => g.tipo === filtroTipo);

    const totalFiltrado = gastosFiltrados.reduce((s, g) => s + parseFloat(g.monto), 0);

    // Resumen por tipo
    const resumen = TIPOS.map((t) => ({
        ...t,
        subtotal: gastos.filter((g) => g.tipo === t.value).reduce((s, g) => s + parseFloat(g.monto), 0),
    })).filter((t) => t.subtotal > 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                            Gastos de Caja
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Registra salidas de caja: insumos, gasolina, servicios y otros.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <button
                            type="button"
                            onClick={abrirNuevo}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4" />
                            </svg>
                            Registrar gasto
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen tarjetas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total del día</p>
                    <p className="text-2xl font-bold text-red-600">{fmt(total)}</p>
                    <p className="text-xs text-gray-400 mt-1">{gastos.length} gasto{gastos.length !== 1 ? 's' : ''}</p>
                </div>
                {resumen.map((t) => (
                    <div key={t.value} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.label}</p>
                        <p className="text-xl font-bold text-gray-800">{fmt(t.subtotal)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${t.color}`}>{t.label}</span>
                    </div>
                ))}
            </div>

            {/* Filtros por tipo */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    type="button"
                    onClick={() => setFiltroTipo('todos')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtroTipo === 'todos' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                    Todos ({gastos.length})
                </button>
                {TIPOS.map((t) => {
                    const count = gastos.filter((g) => g.tipo === t.value).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setFiltroTipo(t.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtroTipo === t.value ? 'bg-gray-800 text-white' : `${t.color} border border-transparent hover:opacity-80`}`}
                        >
                            {t.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {cargando ? (
                    <div className="flex items-center justify-center py-16">
                        <svg className="animate-spin h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    </div>
                ) : gastosFiltrados.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                        <p className="text-sm">No hay gastos registrados{filtroTipo !== 'todos' ? ' en esta categoría' : ' para esta fecha'}.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Concepto</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Nota</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Hora</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {gastosFiltrados.map((g) => {
                                const tipo = tipoInfo(g.tipo);
                                const hora = new Date(g.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
                                return (
                                    <tr key={g.id} className="hover:bg-gray-50 group">
                                        <td className="px-4 py-3 font-medium text-gray-900">{g.concepto}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipo.color}`}>{tipo.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-red-600">{fmt(g.monto)}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">{g.nota || '—'}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{hora}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEditar(g)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(g)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                                        <path d="M10 11v6M14 11v6" />
                                                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {gastosFiltrados.length > 1 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        {filtroTipo !== 'todos' ? `Subtotal ${tipoInfo(filtroTipo).label}` : 'Total del día'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(totalFiltrado)}</td>
                                    <td colSpan={3} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                )}
            </div>

            {modalAbierto && (
                <ModalGasto
                    gasto={gastoEditar}
                    onGuardar={handleGuardado}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}
        </div>
    );
}
