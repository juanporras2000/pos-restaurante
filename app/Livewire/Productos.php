<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Validation\ValidationException;

class Productos extends Component
{
    use WithPagination, WithFileUploads;

    protected $paginationTheme = 'tailwind';

    public $buscar = '';

    public $producto_id, $nombre, $precio, $categoria_id, $imagen;

    public $confirmarEliminarId = null;

    protected $rules = [
        'nombre' => 'required|string|max:255',
        'precio' => 'required|numeric|min:0',
        'categoria_id' => 'required|exists:categorias,id',
        'imagen' => 'nullable|image|max:1024'
    ];

    public function updatingBuscar()
    {
        $this->resetPage();
    }

    public function render()
    {
        $productos = Producto::with('categoria')
            ->where('nombre', 'like', '%'.$this->buscar.'%')
            ->paginate(5);

        $categorias = Categoria::all();

        if ($categorias->isEmpty()) {
            Categoria::create(['nombre' => 'Comidas']);
            Categoria::create(['nombre' => 'Bebidas']);
            Categoria::create(['nombre' => 'Postres']);
            $categorias = Categoria::all();
        }

        return view('livewire.productos', compact('productos', 'categorias'));
    }

    public function editar($id)
    {
        $p = Producto::findOrFail($id);

        $this->producto_id = $p->id;
        $this->nombre = $p->nombre;
        $this->precio = $p->precio;
        $this->categoria_id = $p->categoria_id;

        $this->dispatch('open-modal');
    }

    public function guardar()
    {
        try {
            $this->validate();
        } catch (ValidationException $e) {
            $errores = collect($e->errors())->flatten()->first();
            $this->dispatch('alert', ['type' => 'error', 'message' => $errores]);
            throw $e;
        }

        $data = [
            'nombre' => $this->nombre,
            'precio' => $this->precio,
            'categoria_id' => $this->categoria_id,
        ];

        if ($this->imagen) {
            $data['imagen'] = $this->imagen->store('productos', 'public');
        }

        if ($this->producto_id) {
            Producto::findOrFail($this->producto_id)->update($data);
            $mensaje = 'Producto actualizado correctamente';
        } else {
            Producto::create($data);
            $mensaje = 'Producto creado correctamente';
        }

        $this->reset(['nombre', 'precio', 'categoria_id', 'imagen', 'producto_id']);
        $this->dispatch('close-modal');

        $this->dispatch('alert', [
            'type' => 'success',
            'message' => $mensaje,
        ]);
    }

    public function confirmarEliminar($id)
    {
        $this->confirmarEliminarId = $id;
    }

    public function cerrarModal()
    {
        $this->reset(['nombre', 'precio', 'categoria_id', 'imagen', 'producto_id']);
        $this->resetErrorBag();
    }

    public function cancelarEliminar()
    {
        $this->confirmarEliminarId = null;
    }

    public function eliminar($id)
    {
        Producto::findOrFail($id)->delete();

        $this->confirmarEliminarId = null;

        $this->dispatch('alert', [
            'type' => 'success',
            'message' => 'Producto eliminado'
        ]);
    }
}
