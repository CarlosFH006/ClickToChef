package org.example.DTO;

public class Ingredientes {
    private int id;
    private String nombre;
    private double stockActual;
    private double stockReservado;
    private String unidadMedida;
    private int odooProductId;

    public Ingredientes(int id, String nombre, double stockActual, double stockReservado, String unidadMedida, int odooProductId) {
        this.id = id;
        this.nombre = nombre;
        this.stockActual = stockActual;
        this.stockReservado = stockReservado;
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

    public double getStockReservado() {
        return stockReservado;
    }

    public void setStockReservado(double stockReservado) {
        this.stockReservado = stockReservado;
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
                ", stockReservado=" + stockReservado +
                ", unidadMedida='" + unidadMedida + '\'' +
                ", odooProductId=" + odooProductId +
                '}';
    }
}
