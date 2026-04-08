package org.example.DTO;

import java.sql.Timestamp;

public class Tickets {
    private int id;
    private int pedidoId;
    private double totalImporte;
    private Timestamp fechaPago;
    private String referenciaFacturaOdoo;
    private MetodoPago metodoPago;

    public Tickets(int id, int pedidoId, double totalImporte, Timestamp fechaPago, String referenciaFacturaOdoo, MetodoPago metodoPago) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.totalImporte = totalImporte;
        this.fechaPago = fechaPago;
        this.referenciaFacturaOdoo = referenciaFacturaOdoo;
        this.metodoPago = metodoPago;
    }

    public Tickets(int pedidoId, double totalImporte, Timestamp fechaPago, String referenciaFacturaOdoo, MetodoPago metodoPago) {
        this.pedidoId = pedidoId;
        this.totalImporte = totalImporte;
        this.fechaPago = fechaPago;
        this.referenciaFacturaOdoo = referenciaFacturaOdoo;
        this.metodoPago = metodoPago;
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

    public double getTotalImporte() {
        return totalImporte;
    }

    public void setTotalImporte(double totalImporte) {
        this.totalImporte = totalImporte;
    }

    public Timestamp getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(Timestamp fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getReferenciaFacturaOdoo() {
        return referenciaFacturaOdoo;
    }

    public void setReferenciaFacturaOdoo(String referenciaFacturaOdoo) {
        this.referenciaFacturaOdoo = referenciaFacturaOdoo;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    @Override
    public String toString() {
        return "Tickets{" +
                "id=" + id +
                ", pedidoId=" + pedidoId +
                ", totalImporte=" + totalImporte +
                ", fechaPago=" + fechaPago +
                ", referenciaFacturaOdoo='" + referenciaFacturaOdoo + '\'' +
                ", metodoPago='" + metodoPago + '\'' +
                '}';
    }
}
