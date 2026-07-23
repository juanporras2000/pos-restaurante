import PropTypes from 'prop-types';

// ─── Shapes reutilizables ─────────────────────────────────────────────────────

export const adicionShape = PropTypes.shape({
    adicion_id: PropTypes.number,
    nombre: PropTypes.string,
    precio: PropTypes.number,
    cantidad: PropTypes.number,
    subtotal: PropTypes.number,
});

export const detalleShape = PropTypes.shape({
    id: PropTypes.number,
    pedido_id: PropTypes.number,
    producto_id: PropTypes.number,
    cantidad: PropTypes.number,
    precio_unitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    observacion: PropTypes.string,
    adiciones: PropTypes.arrayOf(adicionShape),
    producto: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string,
    }),
});

export const pagoShape = PropTypes.shape({
    id: PropTypes.number,
    recibido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cambio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    metodo_pago: PropTypes.string,
});

export const pedidoShape = PropTypes.shape({
    id: PropTypes.number,
    tipo: PropTypes.oneOf(['mesa', 'domicilio', 'recoger']),
    numero_mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    direccion: PropTypes.string,
    nombre_cliente: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    estado: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    numero_dia: PropTypes.number,
    detalles: PropTypes.arrayOf(detalleShape),
    pago: pagoShape,
});

export const productoShape = PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categoria_id: PropTypes.number,
    descripcion: PropTypes.string,
    imagen: PropTypes.string,
    disponible: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    insumos: PropTypes.array,
    categoria: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string,
    }),
});

export const insumoShape = PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    stock_actual: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock_minimo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unidad_medida: PropTypes.string,
    costo_unitario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

export const carritoItemShape = PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string,
    precio: PropTypes.number,
    cantidad: PropTypes.number,
    subtotal: PropTypes.number,
    nota: PropTypes.string,
    adiciones: PropTypes.arrayOf(adicionShape),
});

// ─── PropTypes por componente ─────────────────────────────────────────────────

export const CarritoPropTypes = {
    carrito: PropTypes.arrayOf(carritoItemShape).isRequired,
    adicionesDisponibles: PropTypes.array,
    onEliminar: PropTypes.func.isRequired,
    onNotaChange: PropTypes.func.isRequired,
    onAdicionIncrementar: PropTypes.func.isRequired,
    onAdicionDecrementar: PropTypes.func.isRequired,
    tipoPedido: PropTypes.string,
    recargoDomicilio: PropTypes.number,
};

export const ListaProductosPropTypes = {
    productos: PropTypes.arrayOf(productoShape).isRequired,
    carrito: PropTypes.arrayOf(carritoItemShape).isRequired,
    onIncrementar: PropTypes.func.isRequired,
    onDecrementar: PropTypes.func.isRequired,
};

export const PedidoCardPropTypes = {
    pedido: pedidoShape.isRequired,
    productos: PropTypes.arrayOf(productoShape),
    onActualizado: PropTypes.func,
};

export const ModalNuevoPedidoPropTypes = {
    abierto: PropTypes.bool.isRequired,
    productos: PropTypes.arrayOf(productoShape),
    onCreado: PropTypes.func.isRequired,
    onCerrar: PropTypes.func.isRequired,
    pedidoEditar: pedidoShape,
};

export const ModalPagoPropTypes = {
    abierto: PropTypes.bool.isRequired,
    pedido: pedidoShape,
    onPagado: PropTypes.func.isRequired,
    onCerrar: PropTypes.func.isRequired,
};

export const ModalInsumosPropTypes = {
    abierto: PropTypes.bool.isRequired,
    insumo: insumoShape,
    onGuardar: PropTypes.func.isRequired,
    onCerrar: PropTypes.func.isRequired,
    guardando: PropTypes.bool,
};

export const ModalHistorialPropTypes = {
    abierto: PropTypes.bool.isRequired,
    insumo: insumoShape,
    onCerrar: PropTypes.func.isRequired,
};

export const ModalAjustePropTypes = {
    abierto: PropTypes.bool.isRequired,
    insumo: insumoShape,
    onCerrar: PropTypes.func.isRequired,
    onGuardado: PropTypes.func.isRequired,
};

export const ModalProductoPropTypes = {
    abierto: PropTypes.bool.isRequired,
    producto: productoShape,
    categorias: PropTypes.array.isRequired,
    insumos: PropTypes.array,
    onGuardar: PropTypes.func.isRequired,
    onCerrar: PropTypes.func.isRequired,
    guardando: PropTypes.bool,
};

export const CardMetricPropTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sub: PropTypes.string,
    icon: PropTypes.string,
    variant: PropTypes.string,
    trend: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export const TablaReportesPropTypes = {
    rows: PropTypes.array,
    emptyMsg: PropTypes.string,
};

export const GraficaLineaPropTypes = {
    data: PropTypes.array,
    xKey: PropTypes.string,
    yKey: PropTypes.string,
    label: PropTypes.string,
};

export const GraficaBarraPropTypes = {
    data: PropTypes.array,
    xKey: PropTypes.string,
    yKey: PropTypes.string,
    label: PropTypes.string,
    color: PropTypes.string,
};

export const GraficaPiePropTypes = {
    data: PropTypes.array,
    nameKey: PropTypes.string,
    valueKey: PropTypes.string,
};


