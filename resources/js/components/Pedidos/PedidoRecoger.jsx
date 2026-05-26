import PedidoCard from "./PedidoCard"

export const PedidoRecoger = ({pedidosPendientes, productos, cargarPendientes, setEliminado, eliminado, setPagado, pagado, setActualizado, actualizado}) => {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V22H4V12"></path>
                    <path d="M22 7H2v5h20V7z"></path>
                    <path d="M12 22V7"></path>
                    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"></path>
                </svg>
                Para Recoger
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pedidosPendientes.filter((p) => p.tipo === 'recoger').length}
                </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {pedidosPendientes.filter((p) => p.tipo === 'recoger').map((pedido) => (
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



