@extends('layouts.pos')

@section('content')

<div id="configuraciones-app"></div>

@endsection

@push('scripts')
@vite('resources/js/configuraciones.jsx')
@endpush
