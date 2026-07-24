import React from 'react';
import StepWizard from '../../../shared/StepWizard/StepWizard';

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
    roles = [],
    onClose
}) => {
    // Validadores para el wizard
    const esPaso1Valido = Boolean(createAvatar && createNombre?.trim().length > 0);
    const esPaso2Valido = Boolean(createPin && createPin.length === 4);
    const esPaso3Valido = Boolean(createRol);

    // Adaptador para enviar el formulario en el submit final
    const onSubmitFinal = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        handleCrearPerfil(e);
    };

    const wizardSteps = [
        {
            title: 'Avatar y Nombre',
            subtitle: 'Elige una foto de perfil e ingresa el nombre.',
            isValid: esPaso1Valido,
            content: (
                <div className="space-y-4">
                    {/* Selector Visual de Avatar */}
                    <div className="flex flex-col items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setShowModalAvatarCrear(true)}
                            className="relative group rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 hover:border-green-500 transition-all"
                        >
                            {createAvatar ? (
                                <img
                                    src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${createAvatar.path}.jpeg`}
                                    alt="Previsualizar"
                                    className="w-20 h-20 object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <span className="text-xs">Elegir</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-white font-bold uppercase">Cambiar</span>
                            </div>
                        </button>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mt-2">
                            Avatar del Perfil <span className="text-red-500">*</span>
                        </span>
                    </div>

                    {/* Input Nombre */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            autoComplete="off"
                            value={createNombre}
                            onChange={(e) => setCreateNombre(e.target.value)}
                            placeholder="Ej. Juan Pérez"
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200"
                        />
                    </div>
                </div>
            )
        },
        {
            title: 'PIN de Seguridad',
            subtitle: 'Asigna una clave numérica para proteger este perfil.',
            isValid: esPaso2Valido,
            content: (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
                            PIN de Seguridad (4 dígitos) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            maxLength="4"
                            required
                            pattern="\d{4}"
                            value={createPin}
                            onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                            placeholder="****"
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200 tracking-widest text-center"
                        />
                    </div>
                    {createPin && createPin.length < 4 && (
                        <p className="text-xs text-amber-500 text-center">Faltan {4 - createPin.length} dígitos</p>
                    )}
                </div>
            )
        },
        {
            title: 'Rol y Confirmación',
            subtitle: 'Selecciona los permisos que tendrá el usuario.',
            isValid: esPaso3Valido,
            content: (
                <div className="space-y-4">
                    {/* Selector de Rol */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Rol Asignado</label>
                        <select
                            value={createRol}
                            onChange={(e) => setCreateRol(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 outline-none font-semibold text-gray-700 dark:text-gray-200"
                        >
                            {roles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Resumen */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-2 text-xs border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Perfil:</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{createNombre}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Rol:</span>
                            <span className="font-bold text-green-600 dark:text-green-400 capitalize">
                                {roles.find((r) => String(r.id_rol) === String(createRol))?.nombre || 'No seleccionado'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 h-[480px] flex flex-col relative w-full max-w-md mx-auto">
            <StepWizard
                steps={wizardSteps}
                onFinish={onSubmitFinal}
                finishLabel="Crear Perfil"
                onClose={onClose}
            />
        </div>
    );
};
