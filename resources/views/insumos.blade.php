@extends('layouts.pos')

@section('content')
<div id="insumos-app"></div>
@endsection

@push('scripts')
@vite('resources/js/insumos.jsx')
@endpush
