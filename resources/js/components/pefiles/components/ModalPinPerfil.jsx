import { useRef } from "react";
import Modal from "../../shared/Modal";

export const ModalPinPerfil = ({ perfilSeleccionado, pin, handlePinChange, error, setShowModal, mensajeError, tiempoEspera }) => {

    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        handlePinChange(value, index);

        if (value && index < pin.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    };

    return (
        <div className="pin-modal-scope">
            {/* Ajusta el overlay genérico de .modal-overlay para conservar el
                fondo oscuro con blur que tenía este modal antes de migrar
                al componente Modal compartido. */}
            <style>{`
                .pin-modal-scope .modal-overlay {
                    background-color: rgb(0 0 0 / 0.8);
                    -webkit-backdrop-filter: blur(4px);
                    backdrop-filter: blur(4px);
                    padding: 0;
                }
            `}</style>
            <Modal
                abierto={true}
                onCerrar={() => setShowModal(false)}
                className="!bg-white !p-8 !rounded-2xl !shadow-2xl !flex !flex-col !items-center !w-80 !max-w-none"
            >
                <h2 className="text-2xl font-bold mb-2">Ingresar PIN</h2>
                <p className="text-gray-500 mb-6 italic">
                    {perfilSeleccionado?.nombre}
                </p>

                <div className="flex gap-3 mb-4">
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            id={`pin-${index}`}
                            ref={(el) => (inputRefs.current[index] = el)}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="password"
                            maxLength="1"
                            value={digit}
                            disabled={tiempoEspera > 0}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-12 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-all ${error ? "border-red-500 animate-shake" : "border-gray-300"}`}
                        />
                    ))}
                </div>

                {mensajeError && (
                    <p className="text-red-500 text-sm mb-4 text-center">
                        { mensajeError }
                    </p>
                )}

                <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                    Cancelar
                </button>
            </Modal>
        </div>
    );
};
