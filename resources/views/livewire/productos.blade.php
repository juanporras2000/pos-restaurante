<div class="p-6 space-y-4">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
        <input 
            type="text"
            wire:model.live="buscar"
            placeholder="Buscar..."
            class="border px-4 py-2 rounded w-1/3 shadow-sm"
        >

        <button 
            wire:click="abrirModal"
            class="bg-green-500 text-white px-5 py-2 rounded shadow hover:bg-green-600"
        >
            + Producto
        </button>
    </div>

    <!-- TABLA -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">Imagen</th>
                    <th class="p-3 text-left">Nombre</th>
                    <th class="p-3">Categoría</th>
                    <th class="p-3">Precio</th>
                    <th class="p-3 text-right">Acciones</th>
                </tr>
            </thead>

            <tbody>
                @foreach($productos as $producto)
                <tr class="border-t hover:bg-gray-50">
                    <td class="p-3">
                        @if($producto->imagen)
                            <img src="{{ asset('storage/'.$producto->imagen) }}" class="w-10 h-10 rounded">
                        @endif
                    </td>

                    <td class="p-3">{{ $producto->nombre }}</td>
                    <td class="p-3">{{ $producto->categoria->nombre ?? '-' }}</td>
                    <td class="p-3">$ {{ number_format($producto->precio) }}</td>

                    <td class="p-3 text-right space-x-2">
                        <button wire:click="editar({{ $producto->id }})">✏️</button>

                        <button wire:click="confirmarEliminar({{ $producto->id }})">🗑️</button>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="p-3">
            {{ $productos->links() }}
        </div>
    </div>

    <!-- MODAL -->
    @if($modal)
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="bg-white p-6 rounded-xl w-96 space-y-3">

            <h2 class="text-lg font-bold">
                {{ $producto_id ? 'Editar' : 'Nuevo' }} producto
            </h2>

            <input wire:model="nombre" placeholder="Nombre" class="border w-full p-2 rounded">
            @error('nombre') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror

            <input wire:model="precio" type="number" placeholder="Precio" class="border w-full p-2 rounded">
            @error('precio') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror

            <select wire:model="categoria_id" class="border w-full p-2 rounded">
                <option value="">Seleccione categoría</option>
                @foreach($categorias as $cat)
                    <option value="{{ $cat->id }}">{{ $cat->nombre }}</option>
                @endforeach
            </select>

            <input type="file" wire:model="imagen">

            <div class="flex justify-end gap-2">
                <button wire:click="$set('modal', false)">Cancelar</button>

                <button wire:click="guardar" class="bg-green-500 text-white px-4 py-2 rounded">
                    Guardar
                </button>
            </div>

        </div>
    </div>
    @endif

</div>