{{-- Anti-FOUC: aplica la clase `dark` antes del primer paint, sin esperar al bundle JS. --}}
<script>
    (function () {
        var stored = localStorage.getItem('theme');
        var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) document.documentElement.classList.add('dark');
    })();
</script>
