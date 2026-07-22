import React, { useState } from 'react';
import GestionTrabajadores from './GestionTrabajadores';
import RegistroAsistencia from './RegistroAsistencia';
import ResumenSemanal from './ResumenSemanal';
import Descuentos from './Descuentos';

const TABS = [
    {
        id: 'asistencia',
        label: 'Asistencia',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        ),
    },
    {
        id: 'resumen',
        label: 'Resumen Semanal',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
        ),
    },
    {
        id: 'trabajadores',
        label: 'Trabajadores',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
    },
    {
        id: 'descuentos',
        label: 'Descuentos',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2" />
            </svg>
        ),
    },
];

export default function Nomina() {
    const [tab, setTab] = useState('asistencia');

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Nómina
                </h1>
                <p className="text-sm text-gray-500 mt-1">Gestión de trabajadores, asistencia y pago semanal.</p>
            </div>

            {/* Pill tabs */}
            <div className="bg-gray-100 rounded-xl p-1 w-fit mb-6 flex gap-1">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            tab === t.id
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t.icon}
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {tab === 'asistencia'   && <RegistroAsistencia />}
            {tab === 'resumen'      && <ResumenSemanal />}
            {tab === 'trabajadores' && <GestionTrabajadores />}
            {tab === 'descuentos'   && <Descuentos />}
        </div>
    );
}
