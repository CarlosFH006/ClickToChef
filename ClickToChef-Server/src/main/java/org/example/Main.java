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

import java.sql.Timestamp;

public class Main {
    private static final boolean INSERTAR_DATOS_PRUEBA = false;

    public static void main(String[] args) {
        CategoriasDAO categoriasDAO = new CategoriasDAO();
        ProductosDAO productosDAO = new ProductosDAO();
        MesasDAO mesasDAO = new MesasDAO();
        UsuariosDAO usuariosDAO = new UsuariosDAO();
        PedidosDAO pedidosDAO = new PedidosDAO();
        DetallesPedidoDAO detallesPedidoDAO = new DetallesPedidoDAO();
        IngredientesDAO ingredientesDAO = new IngredientesDAO();
        RecetasDAO recetasDAO = new RecetasDAO();
        TicketsDAO ticketsDAO = new TicketsDAO();

        try {
            if (INSERTAR_DATOS_PRUEBA) {
                insertarDatosPrueba(
                        categoriasDAO,
                        productosDAO,
                        mesasDAO,
                        usuariosDAO,
                        pedidosDAO,
                        detallesPedidoDAO,
                        ingredientesDAO,
                        recetasDAO,
                        ticketsDAO
                );
            }

            mostrarDatos("Categorias", categoriasDAO.obtenerTodas());
            mostrarDatos("Productos", productosDAO.obtenerTodos());
            mostrarDatos("Mesas", mesasDAO.obtenerTodas());
            mostrarDatos("Usuarios", usuariosDAO.obtenerTodos());
            mostrarDatos("Pedidos", pedidosDAO.obtenerTodos());
            mostrarDatos("Detalles de pedido", detallesPedidoDAO.obtenerTodos());
            mostrarDatos("Ingredientes", ingredientesDAO.obtenerTodos());
            mostrarDatos("Recetas", recetasDAO.obtenerTodas());
            mostrarDatos("Tickets", ticketsDAO.obtenerTodos());
        } catch (RuntimeException e) {
            System.err.println("Error durante la prueba: " + e.getMessage());
            e.printStackTrace();
        } finally {
            ConexionDB.cerrarConexion();
        }
    }

    private static void insertarDatosPrueba(
            CategoriasDAO categoriasDAO,
            ProductosDAO productosDAO,
            MesasDAO mesasDAO,
            UsuariosDAO usuariosDAO,
            PedidosDAO pedidosDAO,
            DetallesPedidoDAO detallesPedidoDAO,
            IngredientesDAO ingredientesDAO,
            RecetasDAO recetasDAO,
            TicketsDAO ticketsDAO
    ) {
        Timestamp ahora = new Timestamp(System.currentTimeMillis());

        categoriasDAO.insertarCategoria(new Categorias("Bebidas"));
        productosDAO.insertarProducto(new Productos("Coca-Cola", "Refresco frio", 2.50, 1, "https://ejemplo.com/cocacola.jpg"));
        mesasDAO.insertarMesa(new Mesas(1, 4, EstadoMesa.LIBRE));
        usuariosDAO.insertarUsuario(new Usuarios("camarero1", "hash123", "Carlos Lopez", RolUsuario.CAMARERO));
        pedidosDAO.insertarPedido(new Pedidos(1, 1, ahora, EstadoPedido.ABIERTA));
        detallesPedidoDAO.insertarDetallePedido(new DetallesPedido(1, 1, 2, "Sin hielo", EstadoDetallePedido.PENDIENTE, ahora));
        ingredientesDAO.insertarIngrediente(new Ingredientes("Azucar", 10.0, "kg", 1001));
        recetasDAO.insertarReceta(new Recetas(1, 1, 0.25));
        ticketsDAO.insertarTicket(new Tickets(1, 5.00, ahora, "FAC-0001", MetodoPago.TARJETA));
    }

    private static void mostrarDatos(String titulo, Iterable<?> elementos) {
        System.out.println("\n=== " + titulo + " ===");
        for (Object elemento : elementos) {
            System.out.println(elemento);
        }
    }
}
