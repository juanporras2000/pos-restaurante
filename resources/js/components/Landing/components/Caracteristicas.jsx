import React from 'react';

const features = [
    {
      title: "Tu operación en vivo y sin demoras",
      description: "Mira los pedidos de tus mesas, domicilios y retiros en local actualizarse al segundo en todas las pantallas de tu negocio. Si un mesero toma una comanda en el salón, la cocina y la caja lo saben al instante, sin que nadie tenga que refrescar el sistema ni perder tiempo avisando de palabra.",
      icon: (
        <svg className="w-6 h-6 text-[#1B66FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badge: "WebSockets",
      colorClass: "border-t-4 border-t-[#1B66FA] hover:shadow-[#1B66FA]/10",
      badgeClass: "bg-[#1B66FA]/10 text-[#1B66FA]"
    },
    {
      title: "Inventario Inteligente",
      description: "Cada vez que se vende un plato, el sistema descuenta automáticamente los ingredientes exactos que lleva la receta. Si te quedas sin stock de un insumo, el sistema avisa de inmediato y no permite tomar el pedido, evitando que le vendas al cliente un plato que no puedes preparar y ahorrándote malas experiencias en el servicio.",
      icon: (
        <svg className="w-6 h-6 text-[#E97619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: "Control de Stock",
      colorClass: "border-t-4 border-t-[#E97619] hover:shadow-[#E97619]/10",
      badgeClass: "bg-[#E97619]/10 text-[#E97619]"
    },
    {
      title: "Métricas y Rentabilidad Real",
      description: "Creado de la mano de expertos que entienden las finanzas de un restaurante. Conoce con precisión cuánto te cuesta cada ingrediente, cuál es la ganancia real de cada plato y recibe un reporte diario detallado de tus ingresos. Sabrás exactamente a dónde va cada peso, protegiendo el dinero de tu negocio sin enredos matemáticos.",
      icon: (
        <svg className="w-6 h-6 text-[#2CA043]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v15m-6 0h6" />
        </svg>
      ),
      badge: "Respaldado Contable",
      colorClass: "border-t-4 border-t-[#2CA043] hover:shadow-[#2CA043]/10",
      badgeClass: "bg-[#2CA043]/10 text-[#2CA043]"
    },
    {
      title: "Historial de Movimientos",
      description: "Rastrea cada ingrediente de tu inventario. Si un pedido se modifica, se cancela o se cocina, el sistema registra el conteo exacto de insumos antes y después del movimiento. Además, si alguien elimina un plato, el sistema le exigirá escribir el motivo, dejándote un historial claro para evitar pérdidas sospechosas o descuidos en el almacén.",
      icon: (
        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: "Auditoría",
      colorClass: "border-t-4 border-t-gray-700 hover:shadow-gray-700/10",
      badgeClass: "bg-gray-100 text-gray-700"
    },
    {
      title: "Perfiles, Roles y Permisos",
      description: "Tú decides quién ve qué en tu negocio. Define accesos seguros y personalizados para tus meseros, cajeros y administradores de acuerdo a sus tareas. Evita que personal no autorizado modifique precios, anule cuentas o acceda a la información privada de tus ventas y facturación diaria. Tu dinero y tus datos, siempre protegidos.",
      icon: (
        <svg className="w-6 h-6 text-[#1B66FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: "Organización Segura",
      colorClass: "border-t-4 border-t-[#1B66FA] hover:shadow-[#1B66FA]/10",
      badgeClass: "bg-[#1B66FA]/10 text-[#1B66FA]"
    },
    {
      title: "Cancelaciones Transparentes",
      description: "Si un cliente cancela un pedido o el personal comete un error al tomarlo, los ingredientes regresan automáticamente a la bodega al instante. El sistema ajusta el conteo de inmediato por ti, asegurando que tu inventario físico coincida perfectamente con el del sistema, sin que tengas que hacer recalculos manuales al final del turno.",
      icon: (
        <svg className="w-6 h-6 text-[#E97619]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      badge: "Reversión Automatizada",
      colorClass: "border-t-4 border-t-[#E97619] hover:shadow-[#E97619]/10",
      badgeClass: "bg-[#E97619]/10 text-[#E97619]"
    }
  ];

export default function Caracteristicas() {


  return (
    <section id="caracteristicas" className="py-20 bg-gray-50/50 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-base font-bold text-[#E97619] uppercase tracking-wider">
            Tecnología Gastronómica
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Todo lo que necesitas para digitalizar tu cocina y tus finanzas
          </p>
          <p className="text-lg text-gray-500 font-normal">
            Hemos integrado las herramientas operativas del día a día con la rigurosidad analítica que los restaurantes modernos exigen.
          </p>
        </div>

        {/* CUADRÍCULA DE CARACTERÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${feature.colorClass}`}
            >
              <div className="space-y-4">
                {/* Icono Redondeado */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {feature.icon}
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {feature.title}
                </h3>

                {/* Descripción */}
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              {/* Badge Técnico Inferior */}
              <div className="pt-6">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${feature.badgeClass}`}>
                  {feature.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
