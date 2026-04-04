package org.example.DTO;


public class Recetas {
    private int productoId;
    private int ingredienteId;
    private double cantidadNecesaria;

    public Recetas(int productoId, int ingredienteId, double cantidadNecesaria) {
        this.productoId = productoId;
        this.ingredienteId = ingredienteId;
        this.cantidadNecesaria = cantidadNecesaria;
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public int getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(int ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public double getCantidadNecesaria() {
        return cantidadNecesaria;
    }

    public void setCantidadNecesaria(BigDecimal cantidadNecesaria) {
        this.cantidadNecesaria = cantidadNecesaria;
    }

    @Override
    public String toString() {
        return "Recetas{" +
                "productoId=" + productoId +
                ", ingredienteId=" + ingredienteId +
                ", cantidadNecesaria=" + cantidadNecesaria +
                '}';
    }
}
