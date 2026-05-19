import PedidoCard from "./PedidoCard"


export const PedidoMesa = ({pedidosPendientes, cargarPendientes, productos}) => {


    return (
        <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                    <path d="M6 12v4m12-4v4M4 19h16"></path>
                </svg>
                Pedidos para Mesa
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pedidosPendientes.filter((p) => p.tipo === 'mesa').length}
                </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidosPendientes.filter((p) => p.tipo === 'mesa').map((pedido) => (
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



