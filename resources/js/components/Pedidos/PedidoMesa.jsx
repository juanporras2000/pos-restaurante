import PedidoCard from "./PedidoCard"


export const PedidoMesa = ({ pedidosPendientes, cargarPendientes, productos, setEliminado, eliminado, setPagado, pagado, setActualizado, actualizado }) => {



    return (
        <div className="mb-6 md:mb-10 px-2 sm:px-4 md:px-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex flex-wrap items-center gap-2">
                <svg className="h-5 w-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                    <path d="M6 12v4m12-4v4M4 19h16"></path>
                </svg>
                <span className="truncate max-w-[200px] sm:max-w-none">Pedidos para Mesa</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0">
                    {pedidosPendientes.filter((p) => p.tipo === 'mesa').length}
                </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {pedidosPendientes.filter((p) => p.tipo === 'mesa').map((pedido) => (
                    <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        productos={productos}
                        onActualizado={cargarPendientes}
                        setEliminado={setEliminado}
                        eliminado={eliminado}
                        setPagado={setPagado}
                        pagado={pagado}
                        setActualizado={setActualizado}
                        actualizado={actualizado}
                    />
                ))}
            </div>
        </div>
    )
}



