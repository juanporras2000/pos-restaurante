import React from "react";

export const CardPerfil = ({ imagen, nombre, rol }) => {


    return (
        <div
            className="flex flex-col items-center rounded-xl"
        >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-xl overflow-hidden">
                <img
                    src={`${import.meta.env.VITE_URL_IMAGEN}assets/imagenes-perfiles/${imagen?.path}.jpeg`}
                    alt={nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <p className="text-center mt-3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors duration-300">
                {nombre}
            </p>

            {/* Rol del perfil: Un poco más pequeño y estilizado */}
            <p className="text-center text-xs md:text-sm text-blue-600 font-semibold mt-0.5 tracking-wide">
                {rol?.nombre}
            </p>
        </div>
    );
};

