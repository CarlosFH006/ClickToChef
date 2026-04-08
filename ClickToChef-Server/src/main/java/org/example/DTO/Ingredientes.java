package org.example.DTO;

import java.math.BigDecimal;

public class Ingredientes {
    private int id;
    private String nombre;
    private double stockActual;
    private String unidadMedida;
    private int odooProductId;

    public Ingredientes(int id, String nombre, double stockActual, String unidadMedida, int odooProductId) {
        this.id = id;
        this.nombre = nombre;
        this.stockActual = stockActual;
        this.unidadMedida = unidadMedida;
        this.odooProductId = odooProductId;
    }

    public Ingredientes(String nombre, double stockActual, String unidadMedida, int odooProductId) {
        this.nombre = nombre;
        this.stockActual = stockActual;
        this.unidadMedida = unidadMedida;
        this.odooProductId = odooProductId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getStockActual() {
        return stockActual;
    }

    public void setStockActual(double stockActual) {
        this.stockActual = stockActual;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public int getOdooProductId() {
        return odooProductId;
    }

    public void setOdooProductId(int odooProductId) {
        this.odooProductId = odooProductId;
    }

    @Override
    public String toString() {
        return "Ingredientes{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", stockActual=" + stockActual +
                ", unidadMedida='" + unidadMedida + '\'' +
                ", odooProductId=" + odooProductId +
                '}';
    }
}
