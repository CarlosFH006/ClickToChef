package org.example.DTO;

public class CategoriaPlato {
    private int categoriaId;
    private String categoriaNombre;
    private int productoId;
    private String productoNombre;
    private double precio;

    public CategoriaPlato(int categoriaId, String categoriaNombre, int productoId, String productoNombre, double precio) {
        this.categoriaId = categoriaId;
        this.categoriaNombre = categoriaNombre;
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.precio = precio;
    }

    public int getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(int categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public void setCategoriaNombre(String categoriaNombre) {
        this.categoriaNombre = categoriaNombre;
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }
}
