import React, { useEffect, useState } from "react";
import axios from "axios";
import { CardPerfil } from "./components/CardPerfil";
import { ModalPinPerfil } from "./components/ModalPinPerfil";

export const Perfiles = () => {
    const [perfiles, setPerfiles] = useState([]);
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
            .catch((err) => console.error(err));
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

    return (
        <div className="w-full h-screen flex flex-col items-center">
            <span className="inline-flex items-center gap-2 mt-4">
                <svg
                    className="h-7 w-7 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                >
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
                            onClick={() => handleCardClick(p)}
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
