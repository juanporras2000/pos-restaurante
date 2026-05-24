import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export const PrimerPerfilForm = () => {
    const [nombre, setNombre] = useState("");
    const [pin, setPin] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [pinVisible, setPinVisible] = useState(false);
    const [shakingPin, setShakingPin] = useState(false);

    const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const nombreRef = useRef(null);

    useEffect(() => {
        nombreRef.current?.focus();
    }, []);

    const triggerShake = () => {
        setShakingPin(true);
        setTimeout(() => setShakingPin(false), 400);
    };

    const handlePinChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);
        setError("");
        if (value && index < 3) {
            pinRefs[index + 1].current?.focus();
        }
    };

    const handlePinKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs[index - 1].current?.focus();
        }
    };

    const handlePinPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (!pasted) return;
        const newPin = ["", "", "", ""];
        for (let i = 0; i < pasted.length; i++) newPin[i] = pasted[i];
        setPin(newPin);
        pinRefs[Math.min(pasted.length, 3)].current?.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim()) {
            setError("El nombre del perfil es obligatorio.");
            nombreRef.current?.focus();
            return;
        }

        const pinCompleto = pin.join("");
        if (pinCompleto.length < 4) {
            setError("El PIN debe tener 4 dígitos.");
            triggerShake();
            const firstEmpty = pin.findIndex((d) => d === "");
            if (firstEmpty >= 0) pinRefs[firstEmpty].current?.focus();
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
                    err.response?.data?.error || "Ocurrió un error. Intenta de nuevo.";
                setError(mensaje);
                triggerShake();
                setCargando(false);
            });
    };

    const pinFilled = pin.filter((d) => d !== "").length;

    return (
        <div className="w-full min-h-screen relative flex flex-col items-center justify-center bg-slate-50 overflow-hidden px-4 py-10">

            {/* Decorative blobs — mismo estilo que guest.blade.php */}
            <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

                {/* Logo */}
                <div className="mb-6 transform transition-transform hover:scale-110 duration-500">
                    <img
                        src="/assets/logo-postaurante.webp"
                        alt="Logo Postaurante"
                        className="w-20 h-20 object-contain"
                    />
                </div>

                {/* Títulos */}
                <h1 className="text-gray-700 font-bold text-center text-3xl md:text-4xl tracking-tight mb-1">
                    Bienvenido a tu restaurante
                </h1>
                <p className="text-gray-400 text-center text-base mb-8">
                    Crea tu perfil de administrador para comenzar
                </p>

                {/* Card form */}
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="w-full bg-white shadow-2xl rounded-3xl border border-gray-100 px-8 py-8 flex flex-col gap-6"
                >
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="nombre-perfil"
                            className="text-sm font-semibold text-gray-600"
                        >
                            Nombre del perfil
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </span>
                            <input
                                id="nombre-perfil"
                                ref={nombreRef}
                                type="text"
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value);
                                    setError("");
                                }}
                                placeholder="Ej: Juan, Administrador..."
                                maxLength={255}
                                autoComplete="name"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors duration-200 hover:border-gray-400 text-base"
                            />
                        </div>
                    </div>

                    {/* PIN */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-600">
                                PIN de 4 dígitos
                            </label>
                            <button
                                type="button"
                                onClick={() => setPinVisible((v) => !v)}
                                aria-label={pinVisible ? "Ocultar PIN" : "Mostrar PIN"}
                                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                            >
                                {pinVisible ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                        Ocultar
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Mostrar
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Dots de progreso */}
                        <div className="flex gap-2 justify-center" aria-hidden="true">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`rounded-full transition-all duration-200 ${
                                        i < pinFilled
                                            ? "w-3 h-3 bg-blue-600"
                                            : "w-2 h-2 bg-gray-200 mt-0.5"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* PIN inputs */}
                        <div className={`flex gap-3 justify-center ${shakingPin ? "animate-shake" : ""}`}>
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={pinRefs[index]}
                                    type={pinVisible ? "text" : "password"}
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, index)}
                                    onKeyDown={(e) => handlePinKeyDown(e, index)}
                                    onPaste={index === 0 ? handlePinPaste : undefined}
                                    aria-label={`Dígito ${index + 1} del PIN`}
                                    className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all duration-150 ${
                                        shakingPin
                                            ? "border-red-500 bg-red-50 text-red-600"
                                            : digit
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-300 bg-gray-50 text-gray-800 focus:border-blue-500 focus:bg-white"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-500 rounded-xl px-4 py-3">
                            <svg
                                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
                    >
                        {cargando ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creando perfil...
                            </>
                        ) : (
                            <>
                                Crear perfil
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                        Este perfil tendrá acceso total como administrador
                    </p>
                </form>
            </div>
        </div>
    );
};
