import PedidoCard from "./PedidoCard"

export const PedidoDomicilio = ({pedidosPendientes, productos, cargarPendientes}) => {


    return (
        <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                    <circle cx="12" cy="9" r="2.5"></circle>
                </svg>
                Pedidos a Domicilio
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pedidosPendientes.filter((p) => p.tipo === 'domicilio').length}
                </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidosPendientes.filter((p) => p.tipo === 'domicilio').map((pedido) => (
                    <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        productos={productos}
                        onActualizado={cargarPendientes}
                    />
                ))}
            </div>
        </div>
    )
}


