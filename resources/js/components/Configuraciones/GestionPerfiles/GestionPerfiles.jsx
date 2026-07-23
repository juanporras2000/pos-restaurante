import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BotonPerfil } from './components/BotonPerfil';
import { ActualizarEliminarPerfil } from './components/ActualizarEliminarPerfil';
import { GestionarPermisos } from './components/GestionarPermisos';
import { ModalCrear } from './components/ModalCrear';
import { ModalAvatar } from './components/ModalAvatar';
import { DANGER } from '../../../utils/colors';

export const GestionPerfiles = () => {

    const [perfiles, setPerfiles] = useState([]);
    const [recargar, setRecargar] = useState(false);
    const [permisosDisponibles, setPermisosDisponibles] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);

    const [galeriaAvatares, setGaleriaAvatares] = useState([]);
    const [showModalAvatar, setShowModalAvatar] = useState(false);
    const [editRol, setEditRol] = useState("");
    const [editAvatar, setEditAvatar] = useState(null);

    const [editNombre, setEditNombre] = useState("");
    const [editPin, setEditPin] = useState("");
    const [showModalCrear, setShowModalCrear] = useState(false);

    const [createNombre, setCreateNombre] = useState("");
    const [createPin, setCreatePin] = useState("");
    const [createRol, setCreateRol] = useState("");
    const [createAvatar, setCreateAvatar] = useState(null); // Guardará el objeto {id_imagen, path}
    const [showModalAvatarCrear, setShowModalAvatarCrear] = useState(false);


    useEffect(() => {
        const fetchDatos = async () => {
            try {
                setLoading(true);

                const [resPermisos, resPerfiles, resDataInicial] = await Promise.all([
                    axios.get('/api/permisos-lista'),
                    axios.get('/api/perfiles-admin'),
                    axios.get('/api/perfiles-data-inicial')
                ]);

                setPermisosDisponibles(resPermisos.data);
                setPerfiles(resPerfiles.data);

                const rolesFiltrados = resDataInicial.data.roles.filter( rol => rol.id_rol != 1)
                setRoles(rolesFiltrados);
                
                setGaleriaAvatares(resDataInicial.data.galeria);

            } catch (error) {
                console.error("Error cargando configuración:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [recargar]);


    const cambiarDePerfilConValidacion = async (nuevoPerfil) => {

        if (perfilSeleccionado?.id_perfil === nuevoPerfil.id_perfil) return;

        if (tieneCambiosPendientes()) {
            const resultado = await Swal.fire({
                title: '¿Descartar cambios?',
                text: `Tienes cambios sin guardar en el perfil "${perfilSeleccionado.nombre}". Si cambias de perfil, se perderán.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: DANGER,
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, descartar',
                cancelButtonText: 'Seguir editando'
            });

            // Si el usuario cancela, frenamos el cambio de perfil
            if (!resultado.isConfirmed) {
                return;
            }
        }

        // Si no hay cambios o si el usuario aceptó descartarlos, procedemos al cambio normal
        ejecutarSeleccionPerfil(nuevoPerfil);
    };

    // Dejamos esta función limpia para cuando sí se deba cambiar de perfil
    const ejecutarSeleccionPerfil = (perfil) => {
        setPerfilSeleccionado(perfil);
        setEditNombre(perfil.nombre);
        setEditRol(perfil.id_rol);
        setEditPin("");
        setEditAvatar({ id_imagen: perfil.id_imagen, path: perfil.path });
    };

    const handleTogglePermiso = (idPermiso) => {
        if (!perfilSeleccionado) return;

        const nuevosPermisos = perfilSeleccionado.permisos.includes(idPermiso)
            ? perfilSeleccionado.permisos.filter(id => id !== idPermiso)
            : [...perfilSeleccionado.permisos, idPermiso];

        setPerfilSeleccionado({ ...perfilSeleccionado, permisos: nuevosPermisos });
    };



    const handleCrearPerfil = async (e) => {
        e.preventDefault();

        if (!createNombre || !createPin || !createRol || !createAvatar) {
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios.', 'warning');
            return;
        }


        try {
            const data = {
                nombre: createNombre,
                pin: createPin,
                id_rol: parseInt(createRol),
                id_imagen: createAvatar.id_imagen
            };

            const res = await axios.post('/api/perfiles', data);

            // CORRECCIÓN 1: Cambiar 'seleccionarPerfil' por la función real 'ejecutarSeleccionPerfil'
            // Pasamos el objeto combinado para asegurar que contenga '.path' y evitar el undefined.webp
            const nuevoPerfilFormateado = {
                ...res.data,
                id_perfil: res.data.id_perfil || res.data.id, // Asegura consistencia si el backend retorna id
                path: res.data.path || createAvatar.path,     // Salvaguarda el path del avatar actual
                nombre_rol: roles.find(r => r.id_rol === parseInt(createRol))?.nombre || 'Personal'
            };

            // Cerramos el modal de creación primero
            setShowModalCrear(false);

            // Limpiamos los inputs para que la próxima vez que se abra esté en blanco de verdad
            setCreateNombre("");
            setCreatePin("");
            setCreateRol(roles[0]?.id_rol || "");
            setCreateAvatar(galeriaAvatares[0] || null);

            Swal.fire('¡Creado!', 'El perfil ha sido creado exitosamente.', 'success');

            // Activamos la recarga global para traer la lista fresca y limpia de relaciones desde el servidor
            setRecargar(prev => !prev);

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear el perfil. Verifica los datos.', 'error');
        }
    };



    const tieneCambiosPendientes = () => {
        if (!perfilSeleccionado) return false;

        if (editNombre !== perfilSeleccionado.nombre) return true;
        if (parseInt(editRol) !== parseInt(perfilSeleccionado.id_rol)) return true;
        if (editPin !== "") return true;


        if (perfilSeleccionado.id_imagen !== perfiles.find(p => p.id_perfil === perfilSeleccionado.id_perfil)?.id_imagen) {
            return true;
        }

        const permisosOriginales = perfiles.find(p => p.id_perfil === perfilSeleccionado.id_perfil)?.permisos || [];
        if (perfilSeleccionado.permisos.length !== permisosOriginales.length) return true;

        // Validar si algún ID de permiso no coincide
        const mismosPermisos = perfilSeleccionado.permisos.every(id => permisosOriginales.includes(id));
        if (!mismosPermisos) return true;

        return false;
    };


    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="font-medium">Cargando perfiles y permisos...</p>
        </div>
    );

    return (
        <div>
            <div className='bg-white p-5 rounded-2xl border border-gray-200 shadow-sm'>
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-center justify-between mb-6 sm:mb-2">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Perfiles Registrados</h3>
                        <button
                            onClick={() => {
                                setCreateNombre("");
                                setCreatePin("");
                                setCreateRol(roles[0]?.id_rol || "");
                                setCreateAvatar(galeriaAvatares[0] || null); // Primer avatar por defecto
                                setShowModalCrear(true);
                            }}
                            className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-1 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Nuevo perfil
                        </button>
                    </div>

                </div>

                <div className="gap-3 hidden md:flex overflow-x-auto pb-4 no-scrollbar">

                    {perfiles.map((p) => {
                        const esElActivo = perfilSeleccionado?.id_perfil === p.id_perfil;

                        return (
                            <BotonPerfil
                                {...p}
                                key={p.id_perfil}
                                perfilSeleccionado={perfilSeleccionado}
                                esElActivo={esElActivo}
                                onSelect={() => cambiarDePerfilConValidacion(p)}
                            />
                        );
                    })}
                </div>

                <div className='flex flex-col gap-2.5 w-full min-w-0 md:hidden'>
                    {
                        perfiles.map(p => {
                            const esElActivo = perfilSeleccionado?.id_perfil === p.id_perfil;
                            const rutaImagen = esElActivo ? perfilSeleccionado.path : p.path;

                            return (
                                <button
                                    key={p.id_perfil}
                                    type="button"
                                    onClick={() => cambiarDePerfilConValidacion(p)}
                                    className={`w-full h-14 px-4 rounded-xl border transition-all flex items-center justify-between gap-3 touch-manipulation ${esElActivo
                                        ? 'border-green-500 bg-green-50/50 text-green-700 shadow-sm font-bold'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                        }`}
                                >
                                    {/* Contenedor del Avatar, Nombre y Rol */}
                                    <div className="flex items-center gap-3 min-w-0 w-full">
                                        {/* Mini Avatar circular */}
                                        <div className="w-9 h-9 rounded-full border border-gray-100 overflow-hidden bg-gray-100 flex-shrink-0">
                                            {
                                                rutaImagen
                                                    ?
                                                    (
                                                        <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${rutaImagen}.jpeg`} alt="" />
                                                    )
                                                    :
                                                    (
                                                        <img className='object-cover w-full h-full' src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${p.imagen}.jpeg`} alt="" />
                                                    )
                                            }
                                        </div>

                                        {/* Textos: Nombre arriba y Rol abajo */}
                                        <div className="flex flex-col items-start min-w-0 w-full text-left">
                                            <span className="text-sm font-semibold text-gray-800 truncate w-full">
                                                {p.nombre}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${esElActivo ? 'text-green-600' : 'text-gray-400'
                                                }`}>
                                                {p.nombre_rol}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    }
                </div>
            </div>
            <div className="space-y-6 mt-6">
                {perfilSeleccionado ? (
                    <>
                        {/* Formulario Modularizado */}
                        <ActualizarEliminarPerfil
                            editNombre={editNombre}
                            setEditNombre={setEditNombre}
                            editPin={editPin}
                            setEditPin={setEditPin}
                            editRol={editRol}
                            setEditRol={setEditRol}
                            roles={roles}
                            onShowModalAvatar={() => setShowModalAvatar(true)}
                            perfilSeleccionado={perfilSeleccionado}
                            setPerfilSeleccionado={setPerfilSeleccionado}
                            perfiles={perfiles}
                            editAvatar={editAvatar}
                            setEditAvatar={setEditAvatar}
                            setPerfiles={setPerfiles} />

                        <GestionarPermisos
                            permisosDisponibles={permisosDisponibles}
                            perfilSeleccionado={perfilSeleccionado}
                            onTogglePermiso={handleTogglePermiso}
                        />

                    </>

                ) : (
                    /* ESTADO VACÍO: Lo que ve el usuario cuando no hay ningún perfil seleccionado */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[350px] bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-gray-700">Ningún perfil seleccionado</h3>
                        <p className="text-xs text-gray-400 max-w-xs mt-1">
                            Selecciona uno de los perfiles de la barra superior para gestionar sus credenciales, rol y permisos de acceso.
                        </p>
                    </div>
                )}
            </div>

            {showModalCrear && (
                <ModalCrear
                    setShowModalCrear={setShowModalCrear}
                    handleCrearPerfil={handleCrearPerfil}
                    setShowModalAvatarCrear={setShowModalAvatarCrear}
                    createAvatar={createAvatar}
                    createNombre={createNombre}
                    setCreateNombre={setCreateNombre}
                    createPin={createPin}
                    setCreatePin={setCreatePin}
                    createRol={createRol}
                    setCreateRol={setCreateRol}
                    roles={roles}
                />
            )}

            {showModalAvatar && (
                <ModalAvatar
                    onClose={() => setShowModalAvatar(false)}
                    galeriaAvatares={galeriaAvatares}
                    avatarActivoId={editAvatar?.id_imagen}
                    onSelectAvatar={(avatar) => {
                        setPerfilSeleccionado({
                            ...perfilSeleccionado,
                            id_imagen: avatar.id_imagen,
                            path: avatar.path
                        });
                        setEditAvatar(avatar);
                        setShowModalAvatar(false);
                    }}
                />
            )}

            {/* MODAL PARA CREAR AVATAR (Perfil Nuevo) */}
            {showModalAvatarCrear && (
                <ModalAvatar
                    onClose={() => setShowModalAvatarCrear(false)} // Corregido para cerrar el modal correcto
                    galeriaAvatares={galeriaAvatares}
                    avatarActivoId={createAvatar?.id_imagen} // Evalúa el avatar transitorio del formulario de creación
                    onSelectAvatar={(avatar) => {
                        // CORRECCIÓN: Modifica el estado transitorio de creación, NO el perfil seleccionado actual
                        setCreateAvatar(avatar);
                        setShowModalAvatarCrear(false);
                    }}
                />
            )}
        </div >
    );
}


