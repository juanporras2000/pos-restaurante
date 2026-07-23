import React, { useState } from 'react';
import GestionAdiciones from './GestionAdiciones';
import AjustesGenerales from './AjustesGenerales';
import GestionCategorias from './GestionCategorias';
import { GestionPerfiles } from './GestionPerfiles/GestionPerfiles';

const TABS = [
    {
        id: 'general',
        label: 'General',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        ),
    },
    {
        id: 'categorias',
        label: 'Categorías',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
            </svg>
        ),
    },
    {
        id: 'adiciones',
        label: 'Adiciones',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"></path>
            </svg>
        ),
    },
    {
        id: 'perfiles',
        label: 'Perfiles',
        icon: (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        ),
    },
];

export default function Configuraciones() {
    const [tab, setTab] = useState('general');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center lg:justify-normal gap-3">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Configuraciones
                </h1>
                <p className="text-gray-600 lg:mt-1 text-sm text-center lg:text-left">Ajusta los parámetros globales del sistema</p>
            </div>

            {/* Tabs — pill style matching rest of app */}
            <div className="mb-6 flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mx-auto lg:mx-0 flex-wrap sm:flex-nowrap">
                {TABS.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === id
                                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>

            <div className="w-full mx-auto lg:mx-0">
                {tab === 'general' && <AjustesGenerales />}
                {tab === 'categorias' && <GestionCategorias />}
                {tab === 'adiciones' && <GestionAdiciones />}
                {tab === 'perfiles' && <GestionPerfiles />}
            </div>
        </div>
    );
}
