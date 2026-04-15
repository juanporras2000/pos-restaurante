import Alpine from 'alpinejs'

window.noti = (tipo = 'info', mensaje = '', tiempo = 2000) => {
    Swal.fire({
        icon: tipo,              // success, error, warning, info, question
        title: mensaje,
        timer: tiempo,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    })
}

window.confirmar = async (mensaje = '¿Estás seguro?') => {
    return await Swal.fire({
        title: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar'
    })
}
window.Alpine = Alpine

Alpine.data('posManager', () => ({
    productos: [],
    pedidosPendientes: [],

    // Nuevo pedido form
    mostrarFormularioNuevo: false,
    nuevoPedido: {
        tipo: 'mesa',
        numero_mesa: '',
        direccion: '',
        productos: []
    },

    // Pago modal
    mostrarPago: false,
    pedidoPago: null,
    metodo_pago: 'efectivo',
    recibido: 0,

    init() {
        console.log('POS Manager cargado')

        // 🔥 CARGAR PRODUCTOS DESDE BACKEND
        fetch('/api/productos')
            .then(res => res.json())
            .then(data => {
                // Convertir precios a números
                this.productos = data.map(producto => ({
                    ...producto,
                    precio: parseFloat(producto.precio)
                }))

                // 🔥 CARGAR PEDIDOS PENDIENTES
                this.cargarPedidosPendientes()
            })
    },

    async cargarPedidosPendientes() {
        try {
            let res = await fetch('/api/pedidos/pendientes')
            this.pedidosPendientes = await res.json()
            console.log('Pedidos pendientes cargados:', this.pedidosPendientes.length)
        } catch (error) {
            console.error('Error cargando pedidos pendientes:', error)
        }
    },

    // Nuevo pedido methods
    incrementarProductoNuevo(producto) {
        let item = this.nuevoPedido.productos.find(i => i.id === producto.id)
        if (item) {
            item.cantidad++
            item.subtotal = item.cantidad * item.precio
        } else {
            this.nuevoPedido.productos.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
                subtotal: producto.precio
            })
        }
    },

    decrementarProductoNuevo(producto) {
        let item = this.nuevoPedido.productos.find(i => i.id === producto.id)
        if (item) {
            if (item.cantidad > 0) {
                item.cantidad--
                item.subtotal = item.cantidad * item.precio
                if (item.cantidad === 0) {
                    this.nuevoPedido.productos = this.nuevoPedido.productos.filter(i => i.id !== producto.id)
                }
            }
        }
    },

    getCantidadProductoNuevo(productoId) {
        let item = this.nuevoPedido.productos.find(i => i.id === productoId)
        return item ? item.cantidad : 0
    },

    calcularTotalNuevo() {
        return this.nuevoPedido.productos.reduce((sum, item) => sum + item.subtotal, 0)
    },

    puedeCrearPedido() {
        return this.nuevoPedido.productos.length > 0 &&
               ((this.nuevoPedido.tipo === 'mesa' && this.nuevoPedido.numero_mesa) ||
                (this.nuevoPedido.tipo === 'domicilio' && this.nuevoPedido.direccion))
    },

    async crearPedido() {
        if (!this.puedeCrearPedido()) {
            alert('Completa todos los campos requeridos')
            return
        }

        try {
            let res = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    tipo: this.nuevoPedido.tipo,
                    numero_mesa: this.nuevoPedido.numero_mesa || null,
                    direccion: this.nuevoPedido.direccion || null,
                    productos: this.nuevoPedido.productos.map(item => ({
                        producto_id: item.id,
                        cantidad: item.cantidad,
                        precio: item.precio
                    }))
                })
            })

            if (res.ok) {
                noti('success', 'Pedido creado exitosamente')
                this.cerrarFormularioNuevo()
                this.cargarPedidosPendientes() // Recargar la lista
            } else {
                noti('error', 'Error al crear el pedido')
            }
        } catch (error) {
            console.error('Error:', error)
            noti('error', 'Error al crear el pedido')
        }
    },

    cerrarFormularioNuevo() {
        this.mostrarFormularioNuevo = false
        this.nuevoPedido = {
            tipo: 'mesa',
            numero_mesa: '',
            direccion: '',
            productos: []
        }
    },

    // Payment methods
    procesarPago(pedido) {
        this.pedidoPago = pedido
        this.mostrarPago = true
        this.metodo_pago = 'efectivo'
        this.recibido = 0
    },

    cerrarPago() {
        this.mostrarPago = false
        this.pedidoPago = null
        this.metodo_pago = 'efectivo'
        this.recibido = 0
    },

    async confirmarPago() {
        if (this.metodo_pago === 'efectivo' && this.recibido < parseFloat(this.pedidoPago.total)) {
            alert('El dinero recibido es insuficiente')
            return
        }

        try {
            let res = await fetch('/api/pagos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pedido_id: this.pedidoPago.id,
                    recibido: this.recibido,
                    metodo_pago: this.metodo_pago
                })
            })

            let data = await res.json()

            if (this.metodo_pago === 'efectivo') {
                noti('success', `Pago procesado exitosamente. Cambio: $${data.cambio.toFixed(2)}`)
            } else {
                noti('success', 'Pago procesado exitosamente')
            }

            this.cerrarPago()
            this.cargarPedidosPendientes() // Recargar la lista
        } catch (error) {
            console.error('Error:', error)
            noti('error', 'Error al procesar el pago')
        }
    },

    async eliminarPedido(pedidoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
            return
        }

        try {
            // Nota: Necesitaríamos una ruta DELETE para pedidos, pero por ahora solo recargamos
            // En una implementación completa, aquí iría la llamada a eliminar el pedido
            alert('Funcionalidad de eliminación no implementada aún')
            this.cargarPedidosPendientes()
        } catch (error) {
            console.error('Error:', error)
        }
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}))
Alpine.start()