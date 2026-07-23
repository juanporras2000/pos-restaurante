import React, { useEffect, useState } from "react";
import axios from "../../services/axios.js";
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
    const [intentosRestantes, setIntentosRestantes] = useState(5);
    const [tiempoEspera, setTiempoEspera] = useState(0);
    const [mensajeError, setMensajeError] = useState("");

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

        if (tiempoEspera > 0) return;

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

                const errorResponse = err.response;

                if (errorResponse) {
                    if (errorResponse.status === 429) {
                        // CASO 429: Superó el límite de intentos
                        const segundos = errorResponse.data.retry_after;
                        setIntentosRestantes(0);
                        setMensajeError(`Demasiados intentos. Espera ${segundos} segundos.`);

                        // Iniciar un temporizador visual en el frontend
                        iniciarCuentaRegresiva(segundos);

                    } else if (errorResponse.status === 401) {
                        // CASO 401: PIN incorrecto, mostramos los intentos que le quedan
                        const restantes = errorResponse.data.intentos_restantes;
                        setIntentosRestantes(restantes);

                        if (restantes === 0) {
                            setMensajeError("Has agotado tus intentos. Perfil bloqueado temporalmente.");
                        } else {
                            setMensajeError(`PIN incorrecto. Te quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'}.`);
                        }
                    } else {
                        setMensajeError(errorResponse.data.error || "Ocurrió un error inesperado.");
                    }
                }

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

    const iniciarCuentaRegresiva = (segundosIniciales) => {
        setTiempoEspera(segundosIniciales);

        const interval = setInterval(() => {
            setTiempoEspera((tiempoActual) => {
                if (tiempoActual <= 1) {
                    clearInterval(interval);
                    setMensajeError("");
                    setIntentosRestantes(5);
                    setError(false);
                    return 0;
                }

                setMensajeError(`Demasiados intentos. Espera ${tiempoActual - 1} segundos.`);
                return tiempoActual - 1;
            });
        }, 1000)
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
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCardClick(p);
                                }
                            }}
                            aria-label={p.nombre}
                            className="group lg:hover:bg-gray-200 transition ease-in duration-300  p-4 rounded-md cursor-pointer flex justify-center items-center shadow-lg"
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
                    mensajeError={mensajeError}
                    tiempoEspera={tiempoEspera}
                />
            )}
        </div>
    );
};
