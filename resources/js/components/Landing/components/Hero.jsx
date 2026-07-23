import React from 'react';

export default function Hero() {

    const whatsappNumber = "573007811981";
    const message = encodeURIComponent("¡Hola! Vi la promoción de Postaurante de un mes gratis y me interesa implementarlo en mi negocio. ¿Me ayudan con la activación?");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    const handleStart = () => {
        window.location.href = '/login?register=true';
    };

    const handleLearnMore = () => {
        const element = document.getElementById('caracteristicas');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative bg-white overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">

            {/* DECORACIÓN DE FONDO: Círculos difuminados basados en tu paleta de colores */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden hidden md:block">
                {/* Mancha Naranja */}
                <div className="absolute top-12 left-10 w-72 h-72 bg-[#E97619]/5 rounded-full blur-3xl"></div>
                {/* Mancha Verde */}
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#2CA043]/5 rounded-full blur-3xl"></div>
                {/* Mancha Azul */}
                <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#1B66FA]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* COLUMNA IZQUIERDA: Textos y Botones de Acción (6 de 12 columnas) */}
                    <div className="lg:col-span-6 text-center lg:text-left space-y-6">

                        {/* Badge Informativo Pequeño */}
                        <div className="inline-flex items-center gap-2 bg-[#1B66FA]/10 border border-[#1B66FA]/20 rounded-full px-3 py-1 text-xs font-semibold text-[#1B66FA] tracking-wide uppercase">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B66FA] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B66FA]"></span>
                            </span>
                            Pedidos en tiempo real
                        </div>

                        {/* Título Principal de Alto Impacto */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
                            El control total de tu restaurante, <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-[#E97619] via-[#2CA043] to-[#1B66FA] bg-clip-text text-transparent">
                                en un solo lugar.
                            </span>
                        </h1>

                        {/* Subtítulo Descriptivo centrado en tus fortalezas */}
                        <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                            Olvídate de las comandas perdidas. Tus meseros toman el pedido en la mesa y la cocina lo recibe en segundos. Además, el sistema descuenta automáticamente los ingredientes de tu inventario según cada plato vendido, permitiéndote conocer tu ganancia real del día y cuadrar la caja sin problemas.
                        </p>

                        {/* Botones de Acción Dobles */}
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-[#2CA043] hover:bg-[#238335] text-white px-8 py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-center"
                            >
                                Comenzar ahora gratis
                            </a>

                            <button
                                onClick={handleLearnMore}
                                className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium transition-all duration-200 text-center"
                            >
                                Conocer características
                            </button>
                        </div>

                        {/* Pequeño texto de confianza */}
                        <p className="text-xs text-gray-400 font-medium">
                            Activo 24/7 • Roles y permisos avanzados • Sin instalaciones
                        </p>
                    </div>

                    {/* COLUMNA DERECHA: Mockup de la Plataforma (6 de 12 columnas) */}
                    <div className="lg:col-span-6 w-full relative">
                        <div className="relative mx-auto max-w-lg lg:max-w-none">

                            {/* Marco decorativo de fondo */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#E97619]/10 to-[#1B66FA]/10 rounded-2xl transform rotate-3 scale-105 pointer-events-none"></div>

                            {/* Contenedor del Mockup con efecto de elevación */}
                            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2">

                                {/*
                  Aquí debes enlazar una captura real de tu interfaz (por ejemplo, el dashboard de métricas o la pantalla de comandas).
                  Mientras tanto, este placeholder simula la estructura de la app.
                */}
                                <img
                                    src="/assets/imagenes-landing/estadisticas.png" // Cambia esto por tu captura real
                                    alt="Vista previa de la interfaz de Postaurante"
                                    className="w-[90%] h-full object-cover rounded-xl border border-gray-100 bg-gray-50"
                                    onError={(e) => {
                                        // Fallback visual si no encuentra la imagen
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = `
                      <div class="flex flex-col items-center text-center p-6 space-y-4">
                        <img src="/assets/Recurso_3.webp" class="w-20 h-20 opacity-90 animate-pulse" alt="Logo" />
                        <div class="space-y-1">
                          <p class="text-sm font-semibold text-gray-800">Panel de Control en Tiempo Real</p>
                          <p class="text-xs text-gray-500 max-w-xs">Aquí va la captura de pantalla de la increíble interfaz de tu aplicación</p>
                        </div>
                      </div>
                    `;
                                    }}
                                />

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
