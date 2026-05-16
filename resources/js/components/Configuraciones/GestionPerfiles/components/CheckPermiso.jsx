

export const CheckPermiso = ({activo, descripcion, id_permiso, onToggle}) => {

    return (
        <label
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activo ? 'border-green-200 bg-green-50/30' : 'border-gray-50 hover:bg-gray-50'}`}
        >
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${activo ? 'text-green-700' : 'text-gray-700'}`}>{descripcion}</span>
            </div>
            <input
                type="checkbox"
                checked={activo}
                onChange={onToggle}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
        </label>
    )
}


