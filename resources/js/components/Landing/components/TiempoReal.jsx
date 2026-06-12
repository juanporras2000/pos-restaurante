import React from 'react';

const pasosFlujo = [
    {
      num: "01",
      rol: "Mesero / Tablet",
      desc: "El mesero toma el pedido directamente en la mesa. Al presionar 'Enviar', la orden se despacha al instante de forma digital, sin necesidad de papeles ni caminatas a la cocina.",
      icon: (
        <svg className="w-5 h-5 text-[#1B66FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      num: "02",
      rol: "Sistema / Conexión Segura",
      desc: "Nuestra red interna procesa la orden de inmediato y de forma 100% segura, distribuyéndola únicamente a las pantallas autorizadas de tu restaurante.",
      icon: (
        <svg className="w-5 h-5 text-[#2CA043]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      )
    },
    {
      num: "03",
      rol: "Cocina y Caja / Al Instante",
      desc: "La pantalla de la cocina y el monitor de la caja reciben el pedido en un abrir y cerrar de ojos, activando alertas visuales y sonidos para que el chef empiece a cocinar de inmediato.",
      icon: (
        <svg className="w-5 h-5 text-[#E97619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ];


export default function TiempoReal() {

  return (
    <section id="tiempo-real" className="py-20 bg-gray-50 scroll-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 bg-[#1B66FA]/10 border border-[#1B66FA]/20 rounded-full px-3 py-1 text-xs font-bold text-[#1B66FA] tracking-wide uppercase">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B66FA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B66FA]"></span>
            </span>
            Sincronización en milisegundos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            ¡Cero demoras! Comunicación instantánea entre salón y cocina.
          </h2>
          <p className="text-lg text-gray-500 font-normal max-w-2xl mx-auto">
           Tu equipo trabaja en perfecta sintonía. En el mismo instante en que el mesero toma el pedido, la comanda aparece en la pantalla de la cocina. Se acaban los gritos, los papeles perdidos y los retrasos; los platos salen a tiempo y tus clientes quedan felices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* COLUMNA IZQUIERDA: FLUJO EXPLICATIVO INTERNO PASO A PASO (6 de 12 columnas) */}
          <div className="lg:col-span-6 space-y-8">
            {pasosFlujo.map((paso, idx) => (
              <div key={idx} className="flex gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                {/* Indicador / Icono */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-sm text-gray-700">
                    {paso.icon}
                  </div>
                  {idx !== pasosFlujo.length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-grow my-2 border-dashed border-2"></div>
                  )}
                </div>

                {/* Contenido */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1B66FA]">{paso.num}</span>
                    <h4 className="text-base font-bold text-gray-800">{paso.rol}</h4>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-normal">
                    {paso.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA DERECHA: INTERFAZ GRÁFICA DE COMANDAS VIVAS (6 de 12 columnas) */}
          <div className="lg:col-span-6">
            <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800 text-white relative">

              {/* Encabezado del Monitor de Cocina */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Monitor de Cocina Live</p>
                </div>
                <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                  Canal: Pedidos
                </span>
              </div>

              {/* Grid de Tickets de Comandas Activas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Ticket 1: Mesa */}
                <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#E97619] text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    Hace 1m
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400">Pedido #402</h5>
                    <p className="text-sm font-black text-white">Mesa 4</p>
                  </div>
                  <ul className="text-xs space-y-1 text-gray-300 border-t border-gray-700/60 pt-2 font-medium">
                    <li>• 2x Hamburguesa Especial</li>
                    <li className="text-gray-400 text-[11px] pl-2 italic">* Sin cebolla</li>
                    <li>• 1x Papas Nativas</li>
                  </ul>
                </div>

                {/* Ticket 2: Domicilio (Simulando la entrada en caliente) */}
                <div className="bg-gray-800 border-2 border-[#1B66FA] rounded-xl p-4 space-y-3 relative overflow-hidden shadow-lg shadow-[#1B66FA]/10 transition-all">
                  <div className="absolute top-0 right-0 bg-[#1B66FA] text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide animate-pulse">
                    ¡Nuevo!
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1B66FA]">Pedido #403</h5>
                    <p className="text-sm font-black text-white">Domicilio - Carlos M.</p>
                  </div>
                  <ul className="text-xs space-y-1 text-gray-300 border-t border-gray-700 pt-2 font-medium">
                    <li>• 1x Pizza Familiar</li>
                    <li>• 1x Gaseosa 1.5L</li>
                  </ul>
                  <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 p-1 rounded text-center font-bold">
                    ⚡ Recargo aplicado + Stock OK
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
