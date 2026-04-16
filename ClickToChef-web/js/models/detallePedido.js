class Pedido {
    constructor({ id, pedido_id, producto_id, nombre_producto, cantidad, notas_especiales, estado, hora }) {
        this.id = id;
        this.pedido_id = pedido_id;
        this.producto_id = producto_id;
        this.nombre_producto = nombre_producto;
        this.cantidad = cantidad;
        this.notas_especiales = notas_especiales;
        this.estado = estado;
        this.hora = hora || new Date().toISOString();
    }
}
