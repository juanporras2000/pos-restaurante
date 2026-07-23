
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
                ? 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm'
                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-600'
                }`}
        >
            <div className={`w-[80px] h-[80px] rounded-full  border-2 border-solid border-gray-100 dark:border-gray-700 overflow-hidden`}>
                {
                    rutaImagen
                        ?
                        (
                            <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${rutaImagen}.jpeg`} alt="" />
                        )
                        :
                        (
                            <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${imagen}.jpeg`} alt="" />
                        )
                }


            </div>
            <span className="text-sm font-semibold truncate w-full text-center">{nombre}</span>
            <span className="text-xs font-bold truncate w-full text-center">{nombre_rol}</span>
        </button>
    )
}



