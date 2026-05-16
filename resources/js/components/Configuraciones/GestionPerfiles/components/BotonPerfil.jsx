
export const BotonPerfil = ({
    id_perfil,
    nombre,
    nombre_rol,
    imagen,
    perfilSeleccionado,
    esElActivo,
    onSelect,
    path
}) => {



    const rutaImagen = esElActivo ? perfilSeleccionado.path : path;

    return (
        <button
            onClick={onSelect}
            className={`flex-shrink-0 w-32 py-4 px-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${perfilSeleccionado?.id_perfil === id_perfil
                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
        >
            <div className={`w-[80px] h-[80px] rounded-full  border-2 border-solid border-gray-100 overflow-hidden`}>
                {
                    rutaImagen
                        ?
                        (
                            <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}imagenes-perfiles/${rutaImagen}.webp`} alt="" />
                        )
                        :
                        (
                            <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}imagenes-perfiles/${imagen}.webp`} alt="" />
                        )
                }


            </div>
            <span className="text-sm font-semibold truncate w-full text-center">{nombre}</span>
            <span className="text-xs font-bold truncate w-full text-center">{nombre_rol}</span>
        </button>
    )
}



