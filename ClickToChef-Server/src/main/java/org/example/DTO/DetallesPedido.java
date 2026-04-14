package org.example.DTO;

import java.sql.Timestamp;

public class DetallesPedido {
    private int id;
    private int pedidoId;
    private int productoId;
    private int cantidad;
    private EstadoDetallePedido estado;
    private Timestamp horaPedido;

    public DetallesPedido(int id, int pedidoId, int productoId, int cantidad, EstadoDetallePedido estado, Timestamp horaPedido) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.cantidad = cantidad;
        this.estado = estado;
        this.horaPedido = horaPedido;
    }

    public DetallesPedido(int pedidoId, int productoId, int cantidad, EstadoDetallePedido estado, Timestamp horaPedido) {
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.cantidad = cantidad;
        this.estado = estado;
        this.horaPedido = horaPedido;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(int pedidoId) {
        this.pedidoId = pedidoId;
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public EstadoDetallePedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoDetallePedido estado) {
        this.estado = estado;
    }

    public Timestamp getHoraPedido() {
        return horaPedido;
    }

    public void setHoraPedido(Timestamp horaPedido) {
        this.horaPedido = horaPedido;
    }

    @Override
    public String toString() {
        return "DetallesPedido{" +
                "id=" + id +
                ", pedidoId=" + pedidoId +
                ", productoId=" + productoId +
                ", cantidad=" + cantidad +
                ", estado='" + estado + '\'' +
                ", horaPedido=" + horaPedido +
                '}';
    }
}
