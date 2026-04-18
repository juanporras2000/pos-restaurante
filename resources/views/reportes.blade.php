@extends('layouts.pos')

@section('content')
<div id="reportes-app"></div>
@endsection

@push('scripts')
@vite('resources/js/reportes.jsx')
@endpush