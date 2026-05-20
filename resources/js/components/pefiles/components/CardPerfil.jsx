import React from "react";

export const CardPerfil = ({ imagen, nombre, rol}) => {


    return (
        <div
            className="cursor-pointer group"
        >
            <div className="w-32 h-32 rounded bg-gray-700  group-hover:border-white transition-all overflow-hidden">
                <img
                    src={`${import.meta.env.VITE_URL_IMAGEN}imagenes-perfiles/${imagen.path}.webp`}
                    alt={nombre}
                    className="w-full h-full object-cover"
                />
            </div>
            <p className="text-center mt-2 text-gray-700">
                {nombre}
            </p>
            <p className="text-center text-blue-600 font-semibold">{rol.nombre}</p>
        </div>
    );
};

