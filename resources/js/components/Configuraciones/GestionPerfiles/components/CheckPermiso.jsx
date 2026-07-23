

export const CheckPermiso = ({activo, descripcion, id_permiso, onToggle}) => {

    return (
        <label
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activo ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20' : 'border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${activo ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{descripcion}</span>
            </div>
            <input
                type="checkbox"
                checked={activo}
                onChange={onToggle}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-green-600 focus:ring-green-500"
            />
        </label>
    )
}


