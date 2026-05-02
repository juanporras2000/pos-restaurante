<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InsumoRequest extends FormRequest
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
            'nombre'         => 'required|string|max:100',
            'unidad_medida'  => 'required|string|in:gr,kg,ml,lt,unidad,porción,oz,lb',
            'stock_actual'   => 'nullable|numeric|min:0',
            'stock_minimo'   => 'nullable|numeric|min:0',
            // Costo por unidad de medida. Debe ser >= 0.
            // Un costo de 0 es válido (insumos propios / sin costear aún).
            'costo_unitario' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'        => 'El nombre del insumo es obligatorio.',
            'unidad_medida.required' => 'La unidad de medida es obligatoria.',
            'unidad_medida.in'       => 'La unidad seleccionada no es válida.',
            'stock_actual.numeric'   => 'El stock actual debe ser un número.',
            'stock_minimo.numeric'   => 'El stock mínimo debe ser un número.',
            'costo_unitario.numeric' => 'El costo unitario debe ser un número.',
            'costo_unitario.min'     => 'El costo unitario no puede ser negativo.',
        ];
    }
}
