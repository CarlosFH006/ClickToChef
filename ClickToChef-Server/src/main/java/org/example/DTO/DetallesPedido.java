package org.example.DTO;

import java.sql.Timestamp;

public class DetallesPedido {
    private int id;
    private int pedidoId;
    private int productoId;
    private String nombreProducto;
    private int cantidad;
    private double precioUnitario;
    private String notasEspeciales;
    private EstadoDetallePedido estado;
    private Timestamp horaPedido;

    public DetallesPedido(int id, int pedidoId, int productoId, String nombreProducto, int cantidad, double precioUnitario, String notasEspeciales, EstadoDetallePedido estado, Timestamp horaPedido) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.notasEspeciales = notasEspeciales;
        this.estado = estado;
        this.horaPedido = horaPedido;
    }

    public DetallesPedido(int pedidoId, int productoId, int cantidad, double precioUnitario, String notasEspeciales, EstadoDetallePedido estado, Timestamp horaPedido) {
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.notasEspeciales = notasEspeciales;
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

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public String getNotasEspeciales() {
        return notasEspeciales;
    }

    public void setNotasEspeciales(String notasEspeciales) {
        this.notasEspeciales = notasEspeciales;
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
                ", precioUnitario=" + precioUnitario +
                ", notasEspeciales='" + notasEspeciales + '\'' +
                ", estado='" + estado + '\'' +
                ", horaPedido=" + horaPedido +
                '}';
    }
}