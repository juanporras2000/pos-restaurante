export const ModalPinPerfil = ({ perfilSeleccionado, pin, handlePinChange, error, setShowModal }) => {


    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center w-80">
                <h2 className="text-2xl font-bold mb-2">Ingresar PIN</h2>
                <p className="text-gray-500 mb-6 italic">
                    {perfilSeleccionado?.nombre}
                </p>

                <div className="flex gap-3 mb-4">
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            id={`pin-${index}`}
                            type="password"
                            maxLength="1"
                            value={digit}
                            onChange={(e) =>
                                handlePinChange(e.target.value, index)
                            }
                            className={`w-12 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-all ${error ? "border-red-500 animate-shake" : "border-gray-300"}`}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">
                        PIN incorrecto, intenta de nuevo.
                    </p>
                )}

                <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};
