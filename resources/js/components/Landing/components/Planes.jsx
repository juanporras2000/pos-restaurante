import React from 'react';

const caracteristicasPremium = [
        "Pedidos y comandas ilimitadas con envío instantáneo a cocina",
        "Control de inventario automático y blindado por cada plato vendido",
        "Reportes financieros detallados con cálculo de ganancia real",
        "Permisos personalizados y accesos seguros para todo tu equipo",
        "Historial completo de movimientos para evitar pérdidas en bodega",
        "Soporte técnico prioritario y cercano por WhatsApp o llamada",
    ];

export default function Planes() {


    const whatsappNumber = "573007811981";
    const message = encodeURIComponent("¡Hola! Vi la promoción de Postaurante de un mes gratis y me interesa implementarlo en mi negocio. ¿Me ayudan con la activación?");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;


    return (
        <section id="planes" className="py-20 bg-white scroll-mt-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ENCABEZADO DE LA SECCIÓN */}
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <span className="inline-block rounded-full bg-[#2CA043]/10 px-3 py-1 text-xs font-bold text-[#2CA043] uppercase tracking-wider">
                        Pruébalo gratis hoy mismo
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Prueba todo el poder premium por 30 días sin pagar nada
                    </h2>
                    <p className="text-lg text-gray-500 font-normal">
                        Queremos que compruebes los resultados en tu propio negocio. Regístrate en menos de un minuto y usa <span className="font-bold text-[#E97619]">Postaurante</span> con acceso total desde el primer día.
                    </p>
                </div>

                {/* CONTENEDOR CENTRAL DEL PLAN */}
                <div className="max-w-lg mx-auto relative">
                    {/* Efecto de resplandor de fondo */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#2CA043] to-[#1B66FA] rounded-3xl blur-xl opacity-10 pointer-events-none"></div>

                    {/* TARJETA DE PRECIO PRINCIPAL */}
                    <div className="relative bg-white border-2 border-[#2CA043] rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">

                        {/* Listón de "Prueba Sin Tarjeta" */}
                        <div className="bg-[#2CA043] text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
                            Sin tarjetas de crédito ni compromisos
                        </div>

                        <div className="p-8 sm:p-10 space-y-6">

                            {/* Nombre y Precio */}
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Plan Restaurante Pro</h3>
                                <p className="text-sm text-gray-500 font-medium">Ideal para cafeterías, restaurantes, bares y reposterías.</p>

                                <div className="pt-4 flex flex-col items-center justify-center">
                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                                        Primeros 30 días: $0 totalmente gratis
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-2xl font-bold text-gray-900 align-top">$</span>
                                        <span className="text-5xl font-black text-gray-900 tracking-tight">79.900</span>
                                        <span className="text-sm font-semibold text-gray-500 align-bottom">/ mes</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        (Solo pagas si decides continuar después de tu mes de prueba)
                                    </p>
                                </div>
                            </div>

                            {/* Divisor */}
                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center sm:text-left">
                                    ¿Qué incluye este plan?
                                </p>

                                {/* Lista de características */}
                                <ul className="space-y-3.5 text-sm text-gray-600 font-medium">
                                    {caracteristicasPremium.map((feat, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-[#2CA043] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Botón de Llamada a la Acción Principal */}
                            <div className="pt-4">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-[#2CA043] hover:bg-[#238335] text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    Registrarme y empezar mis 30 días gratis
                                </a>
                                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 text-[#2CA043]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    No se requiere tarjeta ni medios de pago
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE SOPORTE ACTIVO */}
                <div className="mt-16 max-w-2xl mx-auto bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-[#E97619]/10 border border-[#E97619]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-[#E97619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-gray-800 tracking-tight">Soporte Humano, Activo y Ameno</h4>
                        <p className="text-sm text-gray-500 font-normal leading-relaxed">
                            Sabemos que la operación de un restaurante no da esperas. No hablarás con un bot genérico; cuentas con un equipo dispuesto a ayudarte a configurar tus recetas, resolver tus dudas y asistirte con amabilidad siempre que lo necesites, incluso durante tu mes de prueba.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
