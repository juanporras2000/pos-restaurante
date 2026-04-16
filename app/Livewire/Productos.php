<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use App\Models\Producto;
use App\Models\Categoria;

class Productos extends Component
{
    use WithPagination, WithFileUploads;

    protected $paginationTheme = 'tailwind';

    public $buscar = '';
    public $modal = false;

    public $producto_id, $nombre, $precio, $categoria_id, $imagen;

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

        return view('livewire.productos', compact('productos', 'categorias'));
    }

    public function abrirModal()
    {
        $this->reset(['nombre','precio','categoria_id','imagen','producto_id']);
        $this->modal = true;
    }

    public function editar($id)
    {
        $p = Producto::findOrFail($id);

        $this->producto_id = $p->id;
        $this->nombre = $p->nombre;
        $this->precio = $p->precio;
        $this->categoria_id = $p->categoria_id;

        $this->modal = true;
    }

    public function guardar()
    {
        $this->validate();

        $rutaImagen = null;

        if ($this->imagen) {
            $rutaImagen = $this->imagen->store('productos', 'public');
        }

        Producto::updateOrCreate(
            ['id' => $this->producto_id],
            [
                'nombre' => $this->nombre,
                'precio' => $this->precio,
                'categoria_id' => $this->categoria_id,
                'imagen' => $rutaImagen
            ]
        );

        $this->modal = false;

        $this->dispatch('alert', [
            'type' => 'success',
            'message' => 'Producto guardado'
        ]);
    }

    public function confirmarEliminar($id)
    {
        $this->dispatch('confirmDelete', id: $id);
    }

    public function eliminar($id)
    {
        Producto::findOrFail($id)->delete();

        $this->dispatch('alert', [
            'type' => 'success',
            'message' => 'Producto eliminado'
        ]);
    }
}