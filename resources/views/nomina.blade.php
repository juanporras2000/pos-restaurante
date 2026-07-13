@extends('layouts.pos')

@section('content')

<div id="nomina-app"></div>

@endsection

@push('scripts')
@vite('resources/js/nomina.jsx')
@endpush
