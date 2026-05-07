import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { fmt, fechaLocal } from './constants';
import TarjetaApertura from './TarjetaApertura';
import ModalGasto from './ModalGasto';
import ResumenTarjetas from './ResumenTarjetas';
import FiltrosGasto from './FiltrosGasto';
import TablaGastos from './TablaGastos';

export default function Gastos() {
    const [gastos, setGastos]             = useState([]);
    const [total, setTotal]               = useState(0);
    const [apertura, setApertura]         = useState(null);
    const [cargando, setCargando]         = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [gastoEditar, setGastoEditar]   = useState(null);
    const [fecha, setFecha]               = useState(fechaLocal);
    const [filtroTipo, setFiltroTipo]     = useState('todos');

    const esHoy = fecha === fechaLocal();

    const cargar = useCallback(() => {
        setCargando(true);
        Promise.all([
            fetch(`/api/gastos?fecha=${fecha}`).then((r) => r.json()),
            fetch(`/api/caja-apertura/${fecha}`).then((r) => r.json()),
        ])
            .then(([gastoData, aperturaData]) => {
                setGastos(gastoData.gastos ?? []);
                setTotal(gastoData.total ?? 0);
                setApertura(aperturaData ?? null);
            })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [fecha]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo  = () => { setGastoEditar(null); setModalAbierto(true); };
    const abrirEditar = (g) => { setGastoEditar(g);   setModalAbierto(true); };

    const handleGuardado = () => {
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
            title: '¿Eliminar gasto?',
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {esHoy && (
                            <button
                                type="button"
                                onClick={abrirNuevo}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 4v16m8-8H4" />
                                </svg>
                                Registrar gasto
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner solo lectura */}
            {!esHoy && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
                    <svg className="h-5 w-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Estás viendo un día diferente al actual — <strong>solo lectura</strong>. Para registrar gastos o apertura, vuelve al día de hoy.</span>
                </div>
            )}

            <TarjetaApertura apertura={apertura} fecha={fecha} esHoy={esHoy} onGuardado={setApertura} />

            <ResumenTarjetas gastos={gastos} total={total} apertura={apertura} />

            <FiltrosGasto gastos={gastos} filtroTipo={filtroTipo} onCambiar={setFiltroTipo} />

            <TablaGastos
                gastos={gastosFiltrados}
                filtroTipo={filtroTipo}
                cargando={cargando}
                esHoy={esHoy}
                onEditar={abrirEditar}
                onEliminar={eliminar}
            />

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
