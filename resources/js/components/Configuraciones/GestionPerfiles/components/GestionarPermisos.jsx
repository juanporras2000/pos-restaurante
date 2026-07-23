import { CheckPermiso } from "./CheckPermiso";


export const GestionarPermisos = ({ permisosDisponibles, perfilSeleccionado, onTogglePermiso }) => {



    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Permisos
            </h4>
            <div className="grid grid-cols-1 gap-2">
                {permisosDisponibles.map((permiso) => {
                    const activo = perfilSeleccionado?.permisos?.includes(permiso.id_permiso) || false;
                    return (
                        <CheckPermiso
                            key={permiso.id_permiso}
                            {...permiso}
                            activo={activo}
                            onToggle={() => onTogglePermiso(permiso.id_permiso)}
                        />
                    );
                })}
            </div>
        </div>
    )
}


