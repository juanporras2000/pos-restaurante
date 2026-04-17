globalThis.noti = (tipo = 'info', mensaje = '', tiempo = 2000) => {
    Swal.fire({
        icon: tipo,              // success, error, warning, info, question
        title: mensaje,
        timer: tiempo,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    })
}

globalThis.confirmar = async (mensaje = '¿Estás seguro?') => {
    return await Swal.fire({
        title: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar'
    })
}
document.addEventListener('alpine:init', () => {

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
    direccionError: '',

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

    eliminarProductoNuevo(productoId) {
        this.nuevoPedido.productos = this.nuevoPedido.productos.filter(i => i.id !== productoId)
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
            globalThis.noti('warning', 'Completa todos los campos requeridos')
            return
        }

        // Validaciones adicionales
        if (this.nuevoPedido.tipo === 'mesa') {
            const numeroMesa = parseInt(this.nuevoPedido.numero_mesa)
            if (isNaN(numeroMesa) || numeroMesa <= 0) {
                globalThis.noti('error', 'El número de mesa debe ser un número positivo mayor a 0')
                return
            }
        } else if (this.nuevoPedido.tipo === 'domicilio') {
            const direccionRegex = /^(carrera|calle) \d+ #\d+-\d+( .*)?$/i
            if (!direccionRegex.test(this.nuevoPedido.direccion)) {
                globalThis.noti('error', 'La dirección debe tener el formato: carrera/calle 23 #11-21 (opcional texto adicional)')
                return
            }
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
                globalThis.noti('success', 'Pedido creado exitosamente')
                this.cerrarFormularioNuevo()
                this.cargarPedidosPendientes() // Recargar la lista
            } else {
                globalThis.noti('error', 'Error al crear el pedido')
            }
        } catch (error) {
            console.error('Error:', error)
            globalThis.noti('error', 'Error al crear el pedido')
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
        this.direccionError = ''
    },

    validarDireccion() {
        if (this.nuevoPedido.tipo !== 'domicilio') {
            this.direccionError = ''
            return
        }
        const direccionRegex = /^(carrera|calle) \d+ #\d+-\d+( .*)?$/i
        if (!direccionRegex.test(this.nuevoPedido.direccion)) {
            this.direccionError = 'Formato: carrera/calle 23 #11-21 (opcional texto adicional)'
        } else {
            this.direccionError = ''
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
            globalThis.noti('error', 'El dinero recibido es insuficiente')
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
                globalThis.noti('success', `Pago procesado exitosamente. Cambio: $${data.cambio.toFixed(2)}`)
            } else {
                globalThis.noti('success', 'Pago procesado exitosamente')
            }

            this.cerrarPago()
            this.cargarPedidosPendientes() // Recargar la lista
        } catch (error) {
            console.error('Error:', error)
            globalThis.noti('error', 'Error al procesar el pago')
        }
    },

    async eliminarPedido(pedidoId) {
        const result = await globalThis.confirmar('¿Estás seguro de eliminar este pedido?')
        if (!result.isConfirmed) {
            return
        }

        try {
            let res = await fetch(`/api/pedidos/${pedidoId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                globalThis.noti('success', 'Pedido eliminado correctamente')
                this.cargarPedidosPendientes()
            } else {
                let data = await res.json()
                globalThis.noti('error', data.error || 'Error al eliminar el pedido')
            }
        } catch (error) {
            console.error('Error:', error)
            globalThis.noti('error', 'Error al eliminar el pedido')
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

}) // end alpine:init