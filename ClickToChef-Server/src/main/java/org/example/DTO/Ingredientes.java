package org.example.DTO;

import java.math.BigDecimal;

public class Ingredientes {
    private int id;
    private String nombre;
    private BigDecimal stockActual;
    private String unidadMedida;
    private Integer odooProductId;

    public Ingredientes(int id, String nombre, BigDecimal stockActual, String unidadMedida, Integer odooProductId) {
        this.id = id;
        this.nombre = nombre;
        this.stockActual = stockActual;
        this.unidadMedida = unidadMedida;
        this.odooProductId = odooProductId;
    }

    public Ingredientes(String nombre, BigDecimal stockActual, String unidadMedida, Integer odooProductId) {
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

    public BigDecimal getStockActual() {
        return stockActual;
    }

    public void setStockActual(BigDecimal stockActual) {
        this.stockActual = stockActual;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public Integer getOdooProductId() {
        return odooProductId;
    }

    public void setOdooProductId(Integer odooProductId) {
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
