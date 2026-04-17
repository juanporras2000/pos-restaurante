@extends('layouts.pos')

@section('content')

<div id="productos-app"></div>

@endsection

@push('scripts')
@vite('resources/js/productos.jsx')
@endpush