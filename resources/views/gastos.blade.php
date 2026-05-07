@extends('layouts.pos')

@section('content')

<div id="gastos-app"></div>

@endsection

@push('scripts')
@vite('resources/js/gastos.jsx')
@endpush
