package org.example.DTO;

import java.sql.Timestamp;
import java.util.ArrayList;

public class Pedidos {
    private int id;
    private int mesaId;
    private int usuarioId;
    private Timestamp fechaCreacion;
    private EstadoPedido estado;
    private ArrayList<DetallesPedido> detalles = new ArrayList<>();

    public Pedidos(int id, int mesaId, int usuarioId, Timestamp fechaCreacion, EstadoPedido estado) {
        this.id = id;
        this.mesaId = mesaId;
        this.usuarioId = usuarioId;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
    }

    public Pedidos(int mesaId, int usuarioId, Timestamp fechaCreacion, EstadoPedido estado) {
        this.mesaId = mesaId;
        this.usuarioId = usuarioId;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getMesaId() {
        return mesaId;
    }

    public void setMesaId(int mesaId) {
        this.mesaId = mesaId;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public ArrayList<DetallesPedido> getDetalles() {
        return detalles;
    }

    public void setDetalles(ArrayList<DetallesPedido> detalles) {
        this.detalles = detalles;
    }

    @Override
    public String toString() {
        return "Pedidos{" +
                "id=" + id +
                ", mesaId=" + mesaId +
                ", usuarioId=" + usuarioId +
                ", fechaCreacion=" + fechaCreacion +
                ", estado='" + estado + '\'' +
                ", detalles=" + detalles +
                '}';
    }
}
