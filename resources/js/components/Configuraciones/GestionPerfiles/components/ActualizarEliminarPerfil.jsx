import axios from "axios";
import Swal from "sweetalert2";


export const ActualizarEliminarPerfil = ({
    editNombre,
    setEditNombre,
    editPin,
    setEditPin,
    editRol,
    setEditRol,
    roles,
    onShowModalAvatar,
    perfiles,
    setPerfiles,
    perfilSeleccionado,
    setPerfilSeleccionado
}) => {


    const handleGuardar = async () => {
        try {
            const data = {
                nombre: editNombre,
                pin: editPin,
                id_rol: editRol,
                id_imagen: perfilSeleccionado.id_imagen,
                permisos: perfilSeleccionado.permisos
            };

            await axios.put(`/api/perfiles/${perfilSeleccionado.id_perfil}`, data);


            const rolSeleccionadoObj = roles.find(r => r.id_rol === parseInt(editRol));

            setPerfiles(prev => prev.map(p =>
                p.id_perfil === perfilSeleccionado.id_perfil
                    ? {
                        ...p,
                        nombre: editNombre,
                        id_rol: editRol,
                        nombre_rol: rolSeleccionadoObj ? rolSeleccionadoObj.nombre : p.nombre_rol,
                        id_imagen: perfilSeleccionado.id_imagen,
                        path: perfilSeleccionado.path,// Mantener la URL local del avatar
                        permisos: perfilSeleccionado.permisos
                    }
                    : p
            ));

            setPerfilSeleccionado(null);
            setEditNombre("");
            setEditRol("");
            setEditPin("");

            Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
        }
    };

    const handleEliminar = async () => {
        if (!perfilSeleccionado) return;

        const resultado = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el perfil de ${perfilSeleccionado.nombre}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            try {
                await axios.delete(`/api/perfiles/${perfilSeleccionado.id_perfil}`);

                // Filtramos la lista para remover el perfil eliminado
                const restantes = perfiles.filter(p => p.id_perfil !== perfilSeleccionado.id_perfil);
                setPerfiles(restantes);


                setPerfilSeleccionado(null);
                setEditNombre("");
                setEditRol("");
                setEditPin("");

                Swal.fire('Eliminado', 'El perfil ha sido eliminado.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el perfil.', 'error');
            }
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Nombre Perfil</label>
                    <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">PIN (4 dígitos)</label>
                    <input
                        type="password"
                        maxLength="4"
                        placeholder="****"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Rol del Perfil</label>
                    <select
                        value={editRol}
                        onChange={(e) => setEditRol(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700"
                    >
                        {roles.map(rol => (

                            <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col justify-end">
                    <button
                        type="button"
                        onClick={onShowModalAvatar}
                        className="w-full p-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                        {/* Puedes usar tu icono de imagen o avatar aquí */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Cambiar avatar
                    </button>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    className="flex-grow bg-gray-700 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                    onClick={handleGuardar}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                    Guardar cambios
                </button>
                <button
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex flex-col items-center"
                    onClick={handleEliminar}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>

                    Eliminar
                </button>
            </div>
        </div>
    )
}
