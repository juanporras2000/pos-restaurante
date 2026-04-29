import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';

const INSUMO_VACIO = { id: null, nombre: '', unidad_medida: '', stock_actual: '', stock_minimo: '' };
const UNIDADES = ['gr', 'kg', 'ml', 'lt', 'unidad', 'porción', 'oz', 'lb'];

// Esquema de validación con Zod
const insumoSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'Máximo 100 caracteres'),
    unidad_medida: z.string().min(1, 'Selecciona una unidad de medida'),
    stock_actual: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().min(0, 'No puede ser negativo')),
    stock_minimo: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().min(0, 'No puede ser negativo')),
});

/* ─── Modal ajuste de stock ────────────────────────────────── */
function ModalAjuste({ abierto, insumo, onCerrar, onGuardado }) {
    const [tipo, setTipo] = useState('entrada');
    const [cantidad, setCantidad] = useState('');
    const [motivo, setMotivo] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => { if (abierto) { setTipo('entrada'); setCantidad(''); setMotivo(''); } }, [abierto]);

    if (!abierto || !insumo) return null;

    const guardar = async () => {
        const cant = parseFloat(cantidad);
        if (isNaN(cant) || cant <= 0) { Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error'); return; }
        setGuardando(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch('/api/inventario/ajuste', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ insumo_id: insumo.id, tipo, cantidad: cant, motivo: motivo.trim() || null }),
            });
            if (!res.ok) { const d = await res.json(); Swal.fire('Error', d.message ?? 'Error', 'error'); return; }
            Swal.fire({ icon: 'success', title: tipo === 'entrada' ? 'Stock agregado' : 'Stock ajustado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            onCerrar();
            onGuardado();
        } catch { Swal.fire('Error', 'No se pudo guardar', 'error'); }
        finally { setGuardando(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Ajustar stock — {insumo.nombre}</h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
                        <div className="flex gap-2">
                            {['entrada', 'ajuste'].map((t) => (
                                <button key={t} type="button" onClick={() => setTipo(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${tipo === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    {t === 'entrada' ? '+ Entrada' : '– Ajuste'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {tipo === 'entrada' ? 'Suma la cantidad al stock actual' : 'Establece el stock al valor exacto indicado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {tipo === 'entrada' ? 'Cantidad a agregar' : 'Nuevo stock'} <span className="text-gray-400">({insumo.unidad_medida})</span>
                        </label>
                        <input autoFocus type="number" step="0.01" min="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && guardar()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                        <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Compra a proveedor" />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                        Stock actual: <strong>{parseFloat(insumo.stock_actual).toFixed(2)} {insumo.unidad_medida}</strong>
                    </div>
                </div>
                <div className="px-5 pb-5 flex justify-end gap-3">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                    <button type="button" onClick={guardar} disabled={guardando} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm">
                        {guardando ? 'Guardando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* Modal historial de movimientos */
function ModalHistorial({ abierto, insumo, onCerrar }) {
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!abierto || !insumo) return;
        setCargando(true);
        fetch(`/api/inventario/movimientos?insumo_id=${insumo.id}&per_page=30`)
            .then((r) => r.json())
            .then((d) => setMovimientos(d.data ?? []))
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [abierto, insumo]);

    if (!abierto || !insumo) return null;

    const TIPO_CLASE = { entrada: 'bg-green-100 text-green-700', salida: 'bg-red-100 text-red-700', ajuste: 'bg-blue-100 text-blue-700' };
    const TIPO_LABEL = { entrada: '+Entrada', salida: '-Salida', ajuste: '–Ajuste' };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-base font-semibold text-gray-900">Historial — {insumo.nombre}</h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {cargando ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Cargando historial...</div>
                    ) : movimientos.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Sin movimientos registrados</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Antes</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Después</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {movimientos.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(m.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_CLASE[m.tipo]}`}>{TIPO_LABEL[m.tipo]}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-900">{parseFloat(m.cantidad).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right text-gray-500">{parseFloat(m.stock_antes).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right text-gray-700">{parseFloat(m.stock_despues).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{m.motivo ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="px-5 py-4 border-t border-gray-200 flex justify-end shrink-0">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

function ModalInsumo({ abierto, insumo, onGuardar, onCerrar, guardando }) {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(insumoSchema),
        defaultValues: INSUMO_VACIO
    });

    useEffect(() => {
        if (abierto) {
            reset(insumo.id ? {
                nombre: insumo.nombre,
                unidad_medida: insumo.unidad_medida,
                stock_actual: insumo.stock_actual,
                stock_minimo: insumo.stock_minimo
            } : INSUMO_VACIO);
        }
    }, [abierto, insumo, reset]);

    if (!abierto) return null;

    const onSubmit = async (data) => {
        try {
            await onGuardar(data);
        } catch (err) {
            if (err.errors) {
                // Mapear errores de Laravel (422) al formulario
                Object.keys(err.errors).forEach((key) => {
                    setError(key, { type: 'manual', message: err.errors[key][0] });
                });
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                        </svg>
                        {insumo.id ? 'Editar Insumo' : 'Nuevo Insumo'}
                    </h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form id="form-insumo" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                        <input
                            {...register('nombre')}
                            autoFocus
                            type="text"
                            placeholder="Ej: Papa criolla"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida <span className="text-red-500">*</span></label>
                        <select
                            {...register('unidad_medida')}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.unidad_medida ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        >
                            <option value="">Seleccionar unidad</option>
                            {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {errors.unidad_medida && <p className="mt-1 text-xs text-red-500">{errors.unidad_medida.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                            <input
                                {...register('stock_actual')}
                                type="number"
                                step="0.01"
                                placeholder="0"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.stock_actual ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.stock_actual && <p className="mt-1 text-xs text-red-500">{errors.stock_actual.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                            <input
                                {...register('stock_minimo')}
                                type="number"
                                step="0.01"
                                placeholder="0"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.stock_minimo ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.stock_minimo && <p className="mt-1 text-xs text-red-500">{errors.stock_minimo.message}</p>}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" form="form-insumo" disabled={guardando} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm transition-colors">
                        {guardando ? 'Guardando...' : (insumo.id ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [insumoActual, setInsumoActual] = useState(INSUMO_VACIO);
    const [guardando, setGuardando] = useState(false);
    const [buscar, setBuscar] = useState('');
    const [insumoAjuste, setInsumoAjuste] = useState(null);
    const [insumoHistorial, setInsumoHistorial] = useState(null);

    const cargar = useCallback(() => {
        setCargando(true);
        fetch('/api/insumos')
            .then((r) => r.json())
            .then(setInsumos)
            .catch(() => Swal.fire('Error', 'No se pudieron cargar los insumos', 'error'))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirCrear = () => { setInsumoActual(INSUMO_VACIO); setModalAbierto(true); };
    const abrirEditar = (ins) => {
        setInsumoActual({ id: ins.id, nombre: ins.nombre, unidad_medida: ins.unidad_medida, stock_actual: ins.stock_actual, stock_minimo: ins.stock_minimo });
        setModalAbierto(true);
    };
    const cerrar = () => { setModalAbierto(false); setInsumoActual(INSUMO_VACIO); };

    const guardar = async (data) => {
        setGuardando(true);
        const esEdicion = Boolean(insumoActual.id);
        const url = esEdicion ? `/api/insumos/${insumoActual.id}` : '/api/insumos';
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch(url, {
                method: esEdicion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 422) {
                    throw errorData; // Devolver errores para que react-hook-form los maneje
                }
                throw new Error(errorData.message ?? 'Error al guardar');
            }

            cerrar();
            cargar();
            Swal.fire({ icon: 'success', title: esEdicion ? 'Insumo actualizado' : 'Insumo creado', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch (err) {
            if (err.errors) throw err; // Re-lanzar para el formulario
            Swal.fire('Error', err.message ?? 'No se pudo guardar el insumo', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (ins) => {
        const result = await Swal.fire({
            title: `Eliminar "${ins.nombre}"?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí­, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;

        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/insumos/${ins.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            });
            const data = await res.json();
            if (!res.ok) { Swal.fire('No se puede eliminar', data.error ?? 'Error', 'error'); return; }
            cargar();
            Swal.fire({ icon: 'success', title: 'Insumo eliminado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch {
            Swal.fire('Error', 'No se pudo eliminar el insumo', 'error');
        }
    };

    const filtrados = insumos.filter((i) => i.nombre.toLowerCase().includes(buscar.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                        </svg>
                        Gestión de Insumos
                    </h1>
                    <p className="text-gray-600 mt-1">Administra la materia prima y su stock</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar insumos..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={abrirCrear}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nuevo Insumo
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {cargando ? (
                    <div className="p-12 text-center text-gray-500">Cargando insumos...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="h-14 w-14 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                        </svg>
                        <p className="text-gray-500 font-medium">{buscar ? 'Sin resultados para la busqueda' : 'No hay insumos registrados'}</p>
                        {!buscar && <p className="text-gray-400 text-sm mt-1">Crea el primero con el botón de arriba</p>}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unidad</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock actual</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock má­nimo</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.map((ins) => {
                                const bajo = parseFloat(ins.stock_actual) <= parseFloat(ins.stock_minimo) && parseFloat(ins.stock_minimo) > 0;
                                return (
                                    <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ins.nombre}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-mono">
                                                {ins.unidad_medida}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {parseFloat(ins.stock_actual).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {parseFloat(ins.stock_minimo).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {bajo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                                                    </svg>
                                                    Stock bajo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setInsumoHistorial(ins)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Ver historial">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => setInsumoAjuste(ins)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Ajustar stock">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => abrirEditar(ins)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => eliminar(ins)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <ModalInsumo
                abierto={modalAbierto}
                insumo={insumoActual}
                onGuardar={guardar}
                onCerrar={cerrar}
                guardando={guardando}
            />

            <ModalAjuste
                abierto={insumoAjuste !== null}
                insumo={insumoAjuste}
                onCerrar={() => setInsumoAjuste(null)}
                onGuardado={cargar}
            />

            <ModalHistorial
                abierto={insumoHistorial !== null}
                insumo={insumoHistorial}
                onCerrar={() => setInsumoHistorial(null)}
            />
        </div>
    );
}

