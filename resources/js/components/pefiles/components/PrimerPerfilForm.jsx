import React, { useState, useRef } from "react";
import axios from "axios";

export const PrimerPerfilForm = () => {
    const [nombre, setNombre] = useState("");
    const [pin, setPin] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    const handlePinChange = (value, index) => {
        if (isNaN(value)) return;

        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);

        if (value && index < 3) {
            pinRefs[index + 1].current?.focus();
        }
    };

    const handlePinKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs[index - 1].current?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim()) {
            setError("El nombre del perfil es obligatorio.");
            return;
        }

        const pinCompleto = pin.join("");
        if (pinCompleto.length < 4) {
            setError("El PIN debe tener 4 dígitos.");
            return;
        }

        setCargando(true);

        axios
            .post("/api/primer-perfil", { nombre: nombre.trim(), pin: pinCompleto })
            .then(() => {
                window.location.href = "/pedidos";
            })
            .catch((err) => {
                const mensaje =
                    err.response?.data?.error ||
                    "Ocurrió un error. Intenta de nuevo.";
                setError(mensaje);
                setCargando(false);
            });
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-gray-700 font-bold text-center text-3xl md:text-4xl mb-2">
                Bienvenido a tu restaurante
            </h1>
            <p className="text-gray-400 text-center mb-10 text-lg">
                Crea tu perfil de administrador para comenzar
            </p>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-sm gap-6"
            >
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Nombre del perfil
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Juan, Administrador..."
                        maxLength={255}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg focus:border-blue-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                        PIN de 4 dígitos
                    </label>
                    <div className="flex gap-3 justify-center">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={pinRefs[index]}
                                type="password"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handlePinChange(e.target.value, index)}
                                onKeyDown={(e) => handlePinKeyDown(e, index)}
                                className={`w-14 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-all ${
                                    error ? "border-red-400" : "border-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-lg transition-colors"
                >
                    {cargando ? "Creando perfil..." : "Crear perfil"}
                </button>
            </form>
        </div>
    );
};
