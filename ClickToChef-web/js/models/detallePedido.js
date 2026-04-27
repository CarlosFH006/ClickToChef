class DetallePedido {
    constructor({ id, pedidoId, productoId, nombreProducto, cantidad, notasEspeciales, estado, hora }) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.productoId = productoId;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.notasEspeciales = notasEspeciales;
        this.estado = estado;
        this.hora = hora || new Date().toISOString();
    }
}