import React, { useEffect, useState } from "react";
import axios from "axios";
import { CardPerfil } from "./components/CardPerfil";
import { ModalPinPerfil } from "./components/ModalPinPerfil";
import { PrimerPerfilForm } from "./components/PrimerPerfilForm";

export const Perfiles = () => {
    const [perfiles, setPerfiles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pin, setPin] = useState(["", "", "", ""]);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios
            .get("/api/perfiles", {})
            .then((res) => {
                setPerfiles(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setCargando(false));
    }, []);

    const handleCardClick = (perfil) => {
        setPerfilSeleccionado(perfil);
        setShowModal(true);
        setPin(["", "", "", ""]);
        setError(false);
    };

    const handlePinChange = (value, index) => {
        if (isNaN(value)) return;

        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);

        if (value && index < 3) {
            document.getElementById(`pin-${index + 1}`).focus();
        }

        if (index === 3 && value !== "") {
            verificarPin(newPin.join(""));
        }
    };

    const verificarPin = (pinIngresado) => {
        axios
            .post("/api/verificar-perfil-pin", {
                id_perfil: perfilSeleccionado.id_perfil,
                pin: pinIngresado,
            })
            .then((res) => {
                if (res.data.success) {

                    localStorage.setItem(
                        "perfil_activo",
                        JSON.stringify(res.data.perfil),
                    );

                    window.location.href = "/pedidos";
                }
            })
            .catch((err) => {
                setError(true);
                setPin(["", "", "", ""]);

                const firstInput = document.getElementById("pin-0");
                if (firstInput) firstInput.focus();
            });
    };

    if (cargando) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-xl">Cargando...</p>
            </div>
        );
    }

    if (perfiles.length === 0) {
        return <PrimerPerfilForm />;
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">

            <h1 className="text-gray-700 font-bold text-center text-3xl md:text-4xl lg:text-6xl my-6 md:mb-10">
                ¿Quién usará el sistema?
            </h1>

            <div className="w-full max-w-[1920px] mx-auto flex flex-col justify-center items-center mb-10 md:mb-[100px]">
                <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl px-4">
                    {perfiles.map((p) => (
                        <div
                            key={p.id_perfil}
                            onClick={() => handleCardClick(p)}
                            className="lg:hover:bg-gray-200 transition ease-in duration-300  p-4 rounded-md cursor-pointer flex justify-center items-center shadow-lg"
                        >
                            <CardPerfil {...p} />
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <ModalPinPerfil
                    perfilSeleccionado={perfilSeleccionado}
                    pin={pin}
                    handlePinChange={handlePinChange}
                    error={error}
                    setShowModal={setShowModal}
                />
            )}
        </div>
    );
};
