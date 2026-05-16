import { FormModalCrear } from "./FormModalCrear"

export const ModalCrear = (props) => {

    const { setShowModalCrear } = props;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-5 flex justify-between items-center border-b">
                    <h3 className="font-bold text-gray-800 text-base">Crear Nuevo Perfil</h3>
                    <button onClick={() => setShowModalCrear(false)} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <FormModalCrear {...props}/>
            </div>
        </div>
    )
}



