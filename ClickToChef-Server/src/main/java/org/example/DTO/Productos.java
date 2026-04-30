package org.example.DTO;


public class Productos {
    private int id;
    private String nombre;
    private String descripcion;
    private double precio;
    private int categoriaId;
    private int odooId;

    public Productos(int id, String nombre, String descripcion, double precio, int categoriaId, int odooId) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoriaId = categoriaId;
        this.odooId = odooId;
    }

    public Productos(int id, String nombre, String descripcion, double precio, int categoriaId) {
        this(id, nombre, descripcion, precio, categoriaId, 0);
    }

    public Productos(String nombre, String descripcion, double precio, int categoriaId, int odooId) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoriaId = categoriaId;
        this.odooId = odooId;
    }

    public Productos(String nombre, String descripcion, double precio, int categoriaId) {
        this(nombre, descripcion, precio, categoriaId, 0);
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(int categoriaId) {
        this.categoriaId = categoriaId;
    }

    public int getOdooId() {
        return odooId;
    }

    public void setOdooId(int odooId) {
        this.odooId = odooId;
    }

    @Override
    public String toString() {
        return "Productos{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", precio=" + precio +
                ", categoriaId=" + categoriaId +
                ", odooId=" + odooId +
                '}';
    }
}
