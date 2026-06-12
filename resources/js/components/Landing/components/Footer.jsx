import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* FILA PRINCIPAL: BRANDING Y ENLACES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-800">

          {/* Columna 1: Branding (5 de 12 columnas) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center p-0.5 backdrop-blur-sm">
                <img
                  src="/assets/logo-postaurante.webp"
                  alt="Postaurante Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Pos<span className="text-[#E97619]">taurante</span>
              </span>
            </div>
            <p className="text-sm font-normal text-gray-400 max-w-sm leading-relaxed">
              La plataforma que comunica todas las áreas de tu negocio y controla tu inventario de forma automatizada. Conoce la ganancia real de tu establecimiento cada día, evita pérdidas en bodega y mantén tus cuentas claras con reportes financieros automáticos creados para el gremio gastronómico.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Plataforma</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button onClick={() => handleScroll('caracteristicas')} className="hover:text-[#E97619] transition-colors">
                  Características
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll('tiempo-real')} className="hover:text-[#1B66FA] transition-colors">
                  Tiempo Real
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll('contabilidad')} className="hover:text-[#2CA043] transition-colors">
                  Métricas y Costos
                </button>
              </li>
              <li>
                <button onClick={() => handleScroll('planes')} className="hover:text-[#E97619] transition-colors">
                  Planes y Precios
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto y Soporte (4 de 12 columnas) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Contacto y Soporte</h4>
            <ul className="space-y-2 text-sm font-normal">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#2CA043]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Soporte Inmediato:
                    <br/> +57 (300) 781-1981
                    <br />+57 (313) 562-7834
                </span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1B66FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>subetechdev@gmail.com</span>
              </li>
              <li className="text-xs text-gray-500 pt-1">
                Ubicación: Colombia • Operación Remota
              </li>
            </ul>
          </div>

        </div>

        {/* FILA INFERIOR: COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-medium text-gray-500">
          <div>
            &copy; {currentYear} Postaurante. Todos los derechos reservados.
          </div>
        </div>

      </div>
    </footer>
  );
}
