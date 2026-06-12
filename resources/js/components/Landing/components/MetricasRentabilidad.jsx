import React from 'react';

export default function MetricasRentabilidad() {
  const KPI = [
    { value: "100%", label: "Precisión en Costo de Recetas" },
    { value: "0%", label: "Descuadres Manuales de Caja" },
    { value: "+25%", label: "Optimización de Márgenes" },
  ];

  return (
    <section id="contabilidad" className="py-20 bg-white scroll-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* COLUMNA IZQUIERDA: GRÁFICOS SIMULADOS / ENFOQUE VISUAL (5 de 12 columnas) */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Fondo decorativo verde difuminado */}
              <div className="absolute -inset-4 bg-[#2CA043]/10 rounded-3xl blur-2xl transform -rotate-6"></div>

              {/* Tarjeta Principal de Analítica */}
              <div className="relative bg-gray-50 border border-gray-100 rounded-2xl shadow-xl p-6 space-y-6">

                {/* Encabezado de la simulación */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Reporte de Rentabilidad</p>
                    <h4 className="text-lg font-bold text-gray-800">Margen por Producto</h4>
                  </div>
                  <span className="bg-[#2CA043]/10 text-[#2CA043] text-xs font-bold px-2.5 py-1 rounded-full">
                    Aliado Contable
                  </span>
                </div>

                {/* Items de Productos Simulados */}
                <div className="space-y-4">
                  {/* Producto 1 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-700">Hamburguesa Especial</span>
                      <span className="text-[#2CA043] font-bold">64% Margen</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-[#2CA043] h-2 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Costo Insumos: $3.200</span>
                      <span>Precio Venta: $8.900</span>
                    </div>
                  </div>

                  {/* Producto 2 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-700">Pizza Familiar</span>
                      <span className="text-[#1B66FA] font-bold">52% Margen</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-[#1B66FA] h-2 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Costo Insumos: $12.000</span>
                      <span>Precio Venta: $25.000</span>
                    </div>
                  </div>
                </div>

                {/* Mini gráfico flotante decorativo */}


              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TEXTOS EXPLICATIVOS (7 de 12 columnas) */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-center lg:text-left">
            <div className="inline-block rounded-full bg-[#2CA043]/10 px-3 py-1 text-xs font-bold text-[#2CA043] uppercase tracking-wider">
              Finanzas Saludables
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Diseñado en alianza contable para cuidar tu dinero
            </h3>

            <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              A diferencia de otros sistemas que solo registran lo que entra a la caja, <span className="font-bold text-[#E97619]">Postaurante</span> calcula el costo real de cada plato. Diseñado junto a expertos que entienden el día a día de un restaurante, cruzamos automáticamente el gasto de tus ingredientes con el precio de venta. Así, conoces tu ganancia neta real y proteges tu dinero sin errores ni descuadres de inventario.
            </p>

            {/* Listado de características contables */}
            <ul className="space-y-3 max-w-md mx-auto lg:mx-0 text-left text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#2CA043] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Auditoría automática de costos fijos por ingrediente.
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#2CA043] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Cierre de caja limpio adaptado a normativas contables estándar.
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#2CA043] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                El sistema genera reportes claros y detallados de tus ventas, costos y ganancias.
              </li>
            </ul>

            {/* Fila de Pequeños Contadores (Métricas rápidos) */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 max-w-md mx-auto lg:mx-0">
              {KPI.map((kpi, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-black text-gray-800">{kpi.value}</p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-semibold leading-tight">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
