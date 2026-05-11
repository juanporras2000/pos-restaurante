import React, { useEffect, useState } from "react";
import axios from "axios";

export const Perfiles = () => {
    const [perfiles, setPerfiles] = useState([]);

    useEffect(() => {
        axios
            .get("/api/perfiles", {
            })
            .then((res) => {setPerfiles(res.data), console.log(res.data);
            })
            .catch((err) => console.error(err));


    }, []);

    const seleccionarPerfil = (perfil) => {
        // Guardamos el perfil seleccionado
        localStorage.setItem("perfil_activo", JSON.stringify(perfil));
        // Redirigimos a pedidos (que ya tiene el Layout)
        window.location.href = "/pedidos";
    };

    return (
        <div className="w-full h-screen flex flex-col items-center">
            <span className="inline-flex items-center gap-2 mt-4">
                <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M7 8h10"></path>
                    <path d="M7 12h3"></path>
                    <path d="M14 12h3"></path>
                    <path d="M7 16h3"></path>
                    <path d="M14 16h3"></path>
                </svg>
                <span className="font-bold text-3xl">POS</span>
            </span>

            <div className="w-[90%] max-w-[1920px] mx-auto flex flex-col flex-grow justify-center items-center mb-[200px]">
                <h1 className="text-black font-semibold text-center text-6xl mb-10">
                    ¿Quién usará el sistema?
                </h1>
                <div className="flex justify-center gap-5">
                    {perfiles.map((p) => (
                        <div
                            key={p.id_perfil}
                            onClick={() => seleccionarPerfil(p)}
                            className="cursor-pointer group"
                        >
                            <div className="w-32 h-32 rounded bg-gray-700 border-2 border-transparent group-hover:border-white transition-all overflow-hidden">
                                <img
                                    src={`/images/profiles/${p.imagen_perfil}`}
                                    alt={p.nombre}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-center mt-2 text-blue-600 font-semibold">
                                {p.nombre}
                            </p>
                            <p>{p.rol.nombre}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
