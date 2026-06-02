import React from 'react';
import PropTypes from 'prop-types';
import { pedidoShape } from '../../propTypes';

// ── Utilidades de formato ────────────────────────────────────────────────────

const fmtMoneda = (n) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(n ?? 0);

const fmtFecha = (s) =>
    new Date(s).toLocaleString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const TIPO_LABEL = {
    mesa:      'Mesa',
    domicilio: 'Domicilio',
    recoger:   'Para recoger',
};

const METODO_LABEL = {
    efectivo:      'Efectivo',
    nequi:         'Nequi',
    tarjeta:       'Tarjeta',
    transferencia: 'Transferencia',
    mixto:         'Pago dividido',
};

// ── Sub-componentes internos (OCP: cada sección es independiente) ────────────

/** Una fila etiqueta / valor alineada a los extremos */
function FilaDetalle({ label, valor, negrita = false, pequeno = false }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            margin: '2px 0',
            fontWeight: negrita ? 'bold' : 'normal',
            fontSize: pequeno ? '11px' : '12px',
        }}>
            <span>{label}</span>
            <span>{valor}</span>
        </div>
    );
}

FilaDetalle.propTypes = {
    label: PropTypes.string.isRequired,
    valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    negrita: PropTypes.bool,
    pequeno: PropTypes.bool,
};

/** Línea divisoria punteada */
function Divisor() {
    return (
        <hr style={{
            border: 'none',
            borderTop: '1px dashed #000',
            margin: '6px 0',
        }} />
    );
}

/** Encabezado con nombre, dirección y teléfono del negocio */
function CabeceraRecibo({ nombre, direccion, telefono }) {
    return (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 3px' }}>{nombre}</p>
            {direccion && <p style={{ margin: '1px 0', fontSize: '11px' }}>{direccion}</p>}
            {telefono  && <p style={{ margin: '1px 0', fontSize: '11px' }}>Tel: {telefono}</p>}
        </div>
    );
}

CabeceraRecibo.propTypes = {
    nombre:   PropTypes.string.isRequired,
    direccion: PropTypes.string,
    telefono:  PropTypes.string,
};

/** Info del pedido: número, tipo, mesa/dirección, fecha */
function InfoPedido({ pedido, fechaPago }) {
    return (
        <div style={{ marginBottom: '6px' }}>
            <FilaDetalle
                label={`Pedido #${pedido.numero_dia || pedido.id}`}
                valor={TIPO_LABEL[pedido.tipo] ?? pedido.tipo}
                negrita
            />
            {pedido.tipo === 'mesa' && pedido.numero_mesa && (
                <FilaDetalle label="Mesa" valor={pedido.numero_mesa} />
            )}
            {pedido.tipo === 'domicilio' && pedido.direccion && (
                <div style={{
                    margin: '6px 0 4px',
                    padding: '6px 8px',
                    border: '2px solid #000',
                    borderRadius: '3px',
                    backgroundColor: '#f5f5f5',
                }}>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📍 Dirección de entrega
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', wordBreak: 'break-word', lineHeight: '1.3' }}>
                        {pedido.direccion}
                    </p>
                </div>
            )}
            {pedido.tipo === 'recoger' && pedido.nombre_cliente && (
                <FilaDetalle label="Cliente" valor={pedido.nombre_cliente} />
            )}
            <FilaDetalle label="Fecha" valor={fmtFecha(fechaPago ?? pedido.updated_at ?? pedido.created_at)} pequeno />
        </div>
    );
}

InfoPedido.propTypes = { pedido: pedidoShape.isRequired, fechaPago: PropTypes.string };

/** Lista de productos con adiciones y observaciones */
function ItemsPedido({ detalles }) {
    return (
        <div style={{ marginBottom: '4px' }}>
            {detalles?.map((d) => (
                <div key={d.id} style={{ marginBottom: '5px' }}>
                    {/* Producto principal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ flex: 1, wordBreak: 'break-word' }}>
                            {d.producto?.nombre ?? '—'}
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>×{d.cantidad}</span>
                        <span style={{ whiteSpace: 'nowrap', minWidth: '56px', textAlign: 'right' }}>
                            {fmtMoneda(d.subtotal)}
                        </span>
                    </div>

                    {/* Adiciones */}
                    {d.adiciones?.map((a) => (
                        <div key={`${d.id}-${a.nombre}`} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingLeft: '10px',
                            fontSize: '11px',
                            color: '#444',
                        }}>
                            <span>+ {a.nombre} ×{a.cantidad}</span>
                            <span>{fmtMoneda(a.subtotal)}</span>
                        </div>
                    ))}

                    {/* Observación */}
                    {d.observacion && (
                        <p style={{ margin: '1px 0 0 10px', fontSize: '10px', fontStyle: 'italic' }}>
                            Nota: {d.observacion}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

ItemsPedido.propTypes = { detalles: PropTypes.array };

/** Sección de totales: subtotal, recargo y total */
function Totales({ total, subtotalItems, tieneRecargo, recargo }) {
    return (
        <div style={{ marginBottom: '4px' }}>
            {tieneRecargo && (
                <>
                    <FilaDetalle label="Subtotal" valor={fmtMoneda(subtotalItems)} pequeno />
                    <FilaDetalle label="Recargo domicilio" valor={`+${fmtMoneda(recargo)}`} pequeno />
                </>
            )}
            <FilaDetalle label="TOTAL" valor={fmtMoneda(total)} negrita />
        </div>
    );
}

Totales.propTypes = {
    total:          PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtotalItems:  PropTypes.number.isRequired,
    tieneRecargo:   PropTypes.bool,
    recargo:        PropTypes.number,
};

/** Información de pago (solo cuando el pedido ya está pagado) */
function InfoPago({ pago }) {
    if (!pago) return null;

    const detalles = pago.detalles ?? [];
    const esMixto  = detalles.length > 1;

    return (
        <>
            <Divisor />
            <div>
                {esMixto ? (
                    <>
                        <FilaDetalle label="Método" valor="Pago dividido" />
                        {detalles.map((d) => (
                            <React.Fragment key={d.id ?? d.metodo_pago}>
                                <FilaDetalle
                                    label={`  ${METODO_LABEL[d.metodo_pago] ?? d.metodo_pago}`}
                                    valor={fmtMoneda(d.monto)}
                                    pequeno
                                />
                                {d.metodo_pago === 'efectivo' && Number.parseFloat(d.cambio) > 0 && (
                                    <FilaDetalle label="  Cambio" valor={fmtMoneda(d.cambio)} pequeno />
                                )}
                            </React.Fragment>
                        ))}
                    </>
                ) : (
                    <>
                        <FilaDetalle label="Método" valor={METODO_LABEL[pago.metodo_pago] ?? pago.metodo_pago} />
                        {pago.metodo_pago === 'efectivo' && (
                            <>
                                <FilaDetalle label="Recibido" valor={fmtMoneda(pago.recibido)} />
                                {Number.parseFloat(pago.cambio) > 0 && (
                                    <FilaDetalle label="Cambio" valor={fmtMoneda(pago.cambio)} negrita />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

InfoPago.propTypes = { pago: PropTypes.object };

// ── Componente principal (puro / presentacional) ─────────────────────────────

/**
 * ReciboImpresion
 * Responsabilidad única: renderizar el recibo en un formato apto para
 * impresoras térmicas (72 mm) y para impresión normal.
 * No tiene efectos secundarios ni lógica de red.
 *
 * Props:
 *  - pedido        : datos del pedido (detalles, pago, tipo, etc.)
 *  - configuracion : hash clave→valor con info del negocio
 */
export default function ReciboImpresion({ pedido, configuracion }) {
    const pago          = pedido.pago;
    const subtotalItems = pedido.detalles?.reduce((s, d) => s + Number.parseFloat(d.subtotal ?? 0), 0) ?? 0;
    const totalNum      = Number.parseFloat(pedido.total ?? 0);
    const tieneRecargo  = pedido.tipo === 'domicilio' && totalNum > subtotalItems;
    const recargo       = totalNum - subtotalItems;

    const nombre   = configuracion?.nombre_negocio    || 'Restaurante';
    const telefono = configuracion?.telefono_negocio  || '';
    const direccion= configuracion?.direccion_negocio || '';

    return (
        <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize:   '12px',
            width:      '72mm',
            maxWidth:   '72mm',
            margin:     '0 auto',
            padding:    '8px 4px',
            color:      '#000',
            backgroundColor: '#fff',
        }}>
            <CabeceraRecibo nombre={nombre} direccion={direccion} telefono={telefono} />

            <Divisor />

            <InfoPedido pedido={pedido} fechaPago={pago?.created_at} />

            <Divisor />

            <ItemsPedido detalles={pedido.detalles} />

            <Divisor />

            <Totales
                total={pedido.total}
                subtotalItems={subtotalItems}
                tieneRecargo={tieneRecargo}
                recargo={recargo}
            />

            <InfoPago pago={pago} />

            <Divisor />

            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px' }}>
                <p style={{ margin: '2px 0' }}>¡Gracias por su visita!</p>
                <p style={{ margin: '2px 0', fontWeight: 'bold' }}>{nombre}</p>
            </div>
        </div>
    );
}

ReciboImpresion.propTypes = {
    pedido:        pedidoShape.isRequired,
    configuracion: PropTypes.objectOf(PropTypes.string),
};

ReciboImpresion.defaultProps = {
    configuracion: {},
};
