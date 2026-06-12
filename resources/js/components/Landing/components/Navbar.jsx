import React, { useState } from 'react';

const enlaces = [
    {
        nombre: 'Características',
        id: 'caracteristicas',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
    },
    {
        nombre: 'Tiempo Real',
        id: 'tiempo-real',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>

    },
    {
        nombre: 'Métricas y costos',
        id: 'contabilidad',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
        </svg>

    },
    {
        nombre: 'Planes',
        id: 'planes',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>


    }
]

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);

    const whatsappNumber = "573007811981"; // 🇨🇴 Reemplaza con tu número real (código de país sin el '+')
    const message = encodeURIComponent("¡Hola! Vi la promoción de Postaurante de un mes gratis y me interesa implementarlo en mi negocio. ¿Me ayudan con la activación?");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    const handleScroll = (id) => {
        setIsOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* SECCIÓN IZQUIERDA: LOGO Y MARCA */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm p-0.5">
                                <img
                                    src="/assets/logo-postaurante.webp"
                                    alt="Postaurante Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-800">
                                Pos<span className="text-[#E97619]">taurante</span>
                            </span>
                        </div>

                        {/* ENLACES DE ESCRITORIO */}
                        <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
                            {
                                enlaces.map(enlace => (
                                    <button
                                        onClick={() => handleScroll(enlace.id)}
                                        className="text-gray-800 hover:text-gray-500 px-1 text-md font-medium transition-colors"
                                        key={enlace.id}
                                    >
                                        {enlace.nombre}
                                    </button>
                                ))
                            }

                        </div>
                    </div>

                    {/* SECCIÓN DERECHA: BOTONES DE ACCIÓN */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-4">
                        <a
                            href="/login"
                            className="text-gray-800 hover:text-gray-500 px-1 text-md font-medium transition-colors max-w-[300px]"
                        >
                            Iniciar Sesión
                        </a>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#2CA043] hover:bg-[#238335] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                        >
                            Comenzar Gratis
                        </a>
                    </div>

                    {/* BOTÓN MENÚ HAMBURGUESA (Solo visible en móviles) */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Abrir menú</span>
                            {isOpen ? (
                                // Icono X (Cerrar menú)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>

                            ) : (
                                // Icono Hamburguesa (Abrir menú)
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* MENÚ DESPLEGABLE RESPONSIVO (Móviles) */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden bg-white border-b border-gray-100`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">

                    {
                        enlaces.map(enlace => (
                            <button
                                className="flex items-center gap-2 text-gray-800 active:text-gray-500 px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                                onClick={() => handleScroll(enlace.id)}
                                key={enlace.id}
                            >
                                {enlace.icon}
                                {enlace.nombre}
                            </button>
                        ))
                    }

                    <div className="pt-4 pb-2 border-t border-gray-100 flex flex-col gap-2 px-3">
                        <a
                            href="/login"
                            className="w-full text-center py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors max-w-[300px] mx-auto"
                        >
                            Iniciar Sesión
                        </a>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#2CA043] hover:bg-[#238335] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                        >
                            Comenzar Gratis
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
