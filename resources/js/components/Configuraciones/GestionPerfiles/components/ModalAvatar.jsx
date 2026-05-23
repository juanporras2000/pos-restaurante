export const ModalAvatar = ({
    onClose,                // Función para cerrar este modal
    galeriaAvatares = [],   // Inicializado como array vacío por seguridad si la API tarda
    avatarActivoId,         // ID del avatar seleccionado actualmente (borde verde)
    onSelectAvatar
}) => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-5 flex justify-between items-center border-b">
                    <h3 className="font-bold text-gray-800 text-sm uppercase">Selecciona un Avatar</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Grilla dinámica de imágenes */}
                <div className="p-6 grid grid-cols-3 gap-4 max-h-80 overflow-y-auto no-scrollbar">
                    {galeriaAvatares.map((avatar) => {
                        // CORRECCIÓN AQUÍ: Comparamos usando la propiedad genérica recibida por prop
                        const esSeleccionado = avatarActivoId === avatar.id_imagen;

                        return (
                            <button
                                key={avatar.id_imagen}
                                type="button"
                                onClick={() => onSelectAvatar(avatar)}
                                className={`relative rounded-2xl overflow-hidden aspect-square border-4 transition-all hover:scale-105 ${esSeleccionado
                                        ? 'border-green-500 shadow-md scale-105'
                                        : 'border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <img
                                    src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${avatar.path}.jpeg`}
                                    alt="Opción de Avatar"
                                    className="w-full h-full object-cover"
                                />
                                {esSeleccionado && (
                                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
