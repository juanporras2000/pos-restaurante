<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre'        => 'required|string|max:100',
            'precio'        => 'required|numeric|min:0.01',
            'categoria_id'  => 'required|exists:categorias,id',
            'receta'        => 'required', // Se valida el string JSON o el array
            'es_domicilio'  => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'       => 'El nombre del producto es obligatorio.',
            'precio.required'       => 'El precio es obligatorio.',
            'precio.min'            => 'El precio debe ser mayor a 0.',
            'categoria_id.required' => 'Debes seleccionar una categoría.',
            'receta.required'       => 'La receta debe tener al menos 1 insumo.',
        ];
    }

    /**
     * Configuramos la validación personalizada para la receta JSON
     */
    protected function prepareForValidation()
    {
        // Si receta viene como string JSON (común con FormData)
        if (is_string($this->receta)) {
            $decoded = json_decode($this->receta, true);
            // Si el JSON es un array vacío "[]", lo ponemos como null para activar 'required'
            if (empty($decoded)) {
                $this->merge(['receta' => null]);
            }
        }
    }
}
