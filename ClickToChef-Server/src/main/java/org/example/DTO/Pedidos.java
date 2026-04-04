package org.example.DTO;

import java.sql.Timestamp;

public class Pedidos {
    private int id;
    private int mesaId;
    private int usuarioId;
    private Timestamp fechaCreacion;
    private String estado;

    public Pedidos(int id, int mesaId, int usuarioId, Timestamp fechaCreacion, String estado) {
        this.id = id;
        this.mesaId = mesaId;
        this.usuarioId = usuarioId;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
    }

    public Pedidos(int mesaId, int usuarioId, Timestamp fechaCreacion, String estado) {
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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    @Override
    public String toString() {
        return "Pedidos{" +
                "id=" + id +
                ", mesaId=" + mesaId +
                ", usuarioId=" + usuarioId +
                ", fechaCreacion=" + fechaCreacion +
                ", estado='" + estado + '\'' +
                '}';
    }
}
