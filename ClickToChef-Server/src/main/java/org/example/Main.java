package org.example;

import org.example.DAO.CategoriasDAO;
import org.example.DAO.ConexionDB;
import org.example.DAO.DetallesPedidoDAO;
import org.example.DAO.IngredientesDAO;
import org.example.DAO.MesasDAO;
import org.example.DAO.PedidosDAO;
import org.example.DAO.ProductosDAO;
import org.example.DAO.RecetasDAO;
import org.example.DAO.TicketsDAO;
import org.example.DAO.UsuariosDAO;
import org.example.DTO.Categorias;
import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;
import org.example.DTO.EstadoMesa;
import org.example.DTO.EstadoPedido;
import org.example.DTO.Ingredientes;
import org.example.DTO.Mesas;
import org.example.DTO.MetodoPago;
import org.example.DTO.Pedidos;
import org.example.DTO.Productos;
import org.example.DTO.Recetas;
import org.example.DTO.RolUsuario;
import org.example.DTO.Tickets;
import org.example.DTO.Usuarios;
import org.example.Odoo.CargaInicial;
import org.example.Servidor.Servidor;

import java.sql.Timestamp;

public class Main {
    private static final boolean INSERTAR_DATOS_PRUEBA = false;

    public static void main(String[] args) {
        CargaInicial.cargaInicialDatos();

        try {
            if (INSERTAR_DATOS_PRUEBA) {
                insertarDatosPrueba();
            }

            mostrarDatos("Categorias", CategoriasDAO.obtenerTodas());
            mostrarDatos("Productos", ProductosDAO.obtenerTodos());
            mostrarDatos("Mesas", MesasDAO.obtenerTodas());
            mostrarDatos("Usuarios", UsuariosDAO.obtenerTodos());
            mostrarDatos("Pedidos", PedidosDAO.obtenerTodos());
            mostrarDatos("Detalles de pedido", DetallesPedidoDAO.obtenerTodos());
            mostrarDatos("Ingredientes", IngredientesDAO.obtenerTodos());
            mostrarDatos("Recetas", RecetasDAO.obtenerTodas());
            mostrarDatos("Tickets", TicketsDAO.obtenerTodos());
        } catch (RuntimeException e) {
            System.err.println("Error durante la prueba: " + e.getMessage());
            e.printStackTrace();
        } finally {
            ConexionDB.cerrarConexion();
        }

        Servidor.server();

    }

    private static void insertarDatosPrueba() {
        Timestamp ahora = new Timestamp(System.currentTimeMillis());

        CategoriasDAO.insertarCategoria(new Categorias("Bebidas"));
        ProductosDAO.insertarProducto(new Productos("Coca-Cola", "Refresco frio", 2.50, 1, "https://ejemplo.com/cocacola.jpg"));
        MesasDAO.insertarMesa(new Mesas(1, 4, EstadoMesa.LIBRE));
        UsuariosDAO.insertarUsuario(new Usuarios("camarero1", "hash123", "Carlos Lopez", RolUsuario.CAMARERO));
        PedidosDAO.insertarPedido(new Pedidos(1, 1, ahora, EstadoPedido.ABIERTA));
        DetallesPedidoDAO.insertarDetallePedido(new DetallesPedido(1, 1, 2, "Sin hielo", EstadoDetallePedido.PENDIENTE, ahora));
        IngredientesDAO.insertarIngrediente(new Ingredientes("Azucar", 10.0, "kg", 1001));
        RecetasDAO.insertarReceta(new Recetas(1, 1, 0.25));
        TicketsDAO.insertarTicket(new Tickets(1, 5.00, ahora, "FAC-0001", MetodoPago.TARJETA));
    }

    private static void mostrarDatos(String titulo, Iterable<?> elementos) {
        System.out.println("\n=== " + titulo + " ===");
        for (Object elemento : elementos) {
            System.out.println(elemento);
        }
    }
}
