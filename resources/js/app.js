import Alpine from 'alpinejs'

window.Alpine = Alpine

Alpine.data('pos', () => ({
    productos: [],
    carrito: [],
    total: 0,
    pedido_id: null,

    mostrarPago: false,
    recibido: 0,
    metodo_pago: 'efectivo',

    init() {
        console.log('POS cargado')

        // 🔥 CARGAR PRODUCTOS DESDE BACKEND
        fetch('/api/productos')
            .then(res => res.json())
            .then(data => {
                this.productos = data
            })
    },

    agregarProducto(producto) {
        let item = this.carrito.find(i => i.id === producto.id)

        if (item) {
            item.cantidad++
            item.subtotal += producto.precio
        } else {
            this.carrito.push({
                ...producto,
                cantidad: 1,
                subtotal: producto.precio
            })
        }

        this.calcularTotal()
    },

    eliminar(item) {
        this.carrito = this.carrito.filter(i => i.id !== item.id)
        this.calcularTotal()
    },

    calcularTotal() {
        this.total = this.carrito.reduce((sum, i) => sum + i.subtotal, 0)
    },

    async crearPedido() {
        let res = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                tipo: 'mesa',
                total: this.total,
                productos: this.carrito
            })
        })

        let data = await res.json()
        this.pedido_id = data.pedido.id
        alert('Pedido creado')
    },

    abrirPago() {
        if (!this.pedido_id) {
            alert('Primero crea el pedido')
            return
        }
        this.mostrarPago = true
    },

    async pagar() {
        let res = await fetch('/api/pagos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                pedido_id: this.pedido_id,
                recibido: this.recibido,
                metodo_pago: this.metodo_pago
            })
        })

        let data = await res.json()
        alert('Cambio: ' + data.cambio)

        this.reset()
    },

    reset() {
        this.carrito = []
        this.total = 0
        this.pedido_id = null
        this.mostrarPago = false
        this.recibido = 0
    }
}))

Alpine.data('productosApp', () => ({
    productos: [],
    nombre: '',
    precio: '',

    init() {
        this.cargarProductos()
    },

    async cargarProductos() {
        let res = await fetch('/api/productos')
        this.productos = await res.json()
    },

    async crearProducto() {
        let res = await fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
                body: JSON.stringify({
            tipo: 'mesa',
            total: this.total,
            productos: this.carrito.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad,
                precio: item.precio
            }))
    })
        })

        await res.json()

        // reset
        this.nombre = ''
        this.precio = ''

        // recargar lista
        this.cargarProductos()
    }
}))
Alpine.start()