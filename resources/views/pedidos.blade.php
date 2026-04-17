@extends('layouts.pos')

@section('content')

<div id="pedidos-app"></div>

@endsection

@push('scripts')
@vite('resources/js/pedidos.jsx')
@endpush