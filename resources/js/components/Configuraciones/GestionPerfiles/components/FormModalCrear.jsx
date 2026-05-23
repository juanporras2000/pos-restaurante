export const FormModalCrear = ({
    handleCrearPerfil,
    setShowModalAvatarCrear,
    createAvatar,
    createNombre,
    setCreateNombre,
    createPin,
    setCreatePin,
    createRol,
    setCreateRol,
    roles
}) => {


    return (
        <form onSubmit={handleCrearPerfil} className="p-6 space-y-4">
            {/* Selector Visual de Avatar */}
            <div className="flex flex-col items-center justify-center pb-2">
                <button
                    type="button"
                    onClick={() => setShowModalAvatarCrear(true)}
                    className="relative group rounded-full overflow-hidden border-4 border-gray-100 hover:border-green-500 transition-all"
                >
                    {createAvatar ? (
                        <img
                            src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${createAvatar.path}.jpeg`}
                            alt="Previsualizar"
                            className="w-20 h-20 object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400">
                            <span className="text-xs">Elegir</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold uppercase">Cambiar</span>
                    </div>
                </button>
                <span className="text-[10px] font-black text-gray-400 uppercase mt-2">Avatar del Perfil</span>
            </div>

            {/* Input Nombre */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Nombre</label>
                <input
                    type="text"
                    required
                    autoComplete="off"
                    value={createNombre}
                    onChange={(e) => setCreateNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700"
                />
            </div>

            {/* Input PIN */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">PIN de Seguridad (4 dígitos)</label>
                <input
                    type="password"
                    autoComplete="new-password"
                    maxLength="4"
                    required
                    pattern="\d{4}"
                    value={createPin}
                    onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))} // Solo números
                    placeholder="****"
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700 tracking-widest text-center"
                />
            </div>

            {/* Selector de Rol */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Rol Asignado</label>
                <select
                    value={createRol}
                    onChange={(e) => setCreateRol(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700"
                >
                    {roles.map(rol => (
                        <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Botón Guardar */}
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
                Crear Perfil
            </button>
        </form>
    )
}

