package org.example.DTO;

public class Mesas {
    private int id;
    private int numero;
    private int capacidad;
    private EstadoMesa estado;

    public Mesas(int id, int numero, int capacidad, EstadoMesa estado) {
        this.id = id;
        this.numero = numero;
        this.capacidad = capacidad;
        this.estado = estado;
    }

    public Mesas(int numero, int capacidad, EstadoMesa estado) {
        this.numero = numero;
        this.capacidad = capacidad;
        this.estado = estado;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public EstadoMesa getEstado() {
        return estado;
    }

    public void setEstado(EstadoMesa estado) {
        this.estado = estado;
    }

    @Override
    public String toString() {
        return "Mesas{" +
                "id=" + id +
                ", numero=" + numero +
                ", capacidad=" + capacidad +
                ", estado='" + estado + '\'' +
                '}';
    }
}
