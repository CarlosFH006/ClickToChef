package org.example.DAO;

import org.example.DTO.Productos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class ProductosDAO {

    public static boolean insertarProducto(Productos producto) {
        String sql = "INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setString(1, producto.getNombre());
            statement.setString(2, producto.getDescripcion());
            statement.setDouble(3, producto.getPrecio());
            statement.setInt(4, producto.getCategoriaId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el producto", e);
        }
    }

    public static ArrayList<Productos> obtenerTodos() {
        String sql = "SELECT id, nombre, descripcion, precio, categoria_id FROM productos";
        ArrayList<Productos> productos = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Productos producto = new Productos(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre"),
                        resultSet.getString("descripcion"),
                        resultSet.getDouble("precio"),
                        resultSet.getInt("categoria_id")
                );
                productos.add(producto);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los productos", e);
        }

        return productos;
    }

    public static boolean reservarProducto(int productoId, int cantidad) {
        //Obtener los ingredientes y cantidad de ingredientes de cada producto
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";

        //Hacer la reserva si hay suficiente Stock
        String sqlUpdate = "UPDATE ingredientes SET stock_reservado = stock_reservado + ? " +
                "WHERE id = ? AND (stock_actual - stock_reservado) >= ?";

        try (Connection conn = ConexionDB.getConexion()) {
            //Que la base de datos no almacene las respuestas hasta que este todo bien
            conn.setAutoCommit(false);

            try (PreparedStatement psReceta = conn.prepareStatement(sqlReceta)) {
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();
                //Por cada ingrediente hacer la reserva
                while (rs.next()) {
                    int ingId = rs.getInt("ingrediente_id");
                    double cantNecesaria = rs.getDouble("cantidad_necesaria") * cantidad;

                    try (PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate)) {
                        psUpdate.setDouble(1, cantNecesaria);
                        psUpdate.setInt(2, ingId);
                        psUpdate.setDouble(3, cantNecesaria);

                        int filasAfectadas = psUpdate.executeUpdate();
                        if (filasAfectadas == 0) {
                            //Si falla una reserva lanzamos una excepción
                            throw new Exception("Stock insuficiente para el ingrediente ID: " + ingId);
                        }
                    }
                }
                conn.commit(); // Si todo fue bien, guardamos cambios
                return true;
            //Si falla una reserva se ejecuta este codigo
            } catch (Exception e) {
                conn.rollback(); // Si algo falló, deshacemos todo
                System.err.println("Error en reserva: " + e.getMessage());
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    //Liberar reserva, quitar la cantidad reservada
    public static void liberarReserva(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        //Elimina el stock reservado, no permite que el stock reservado sea menor que cero
        String sqlUpdate = "UPDATE ingredientes SET stock_reservado = GREATEST(0, stock_reservado - ?) WHERE id = ?";

        try (Connection conn = ConexionDB.getConexion()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psReceta = conn.prepareStatement(sqlReceta)) {
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();

                while (rs.next()) {
                    double totalALiberar = rs.getDouble("cantidad_necesaria") * cantidad;
                    try (PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate)) {
                        psUpdate.setDouble(1, totalALiberar);
                        psUpdate.setInt(2, rs.getInt("ingrediente_id"));
                        psUpdate.executeUpdate();
                    }
                }
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
    }

    //Finaliza la reserva y los descuenta del Stock
    public static void finalizarReserva(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        // Restamos del stock real y eliminamos el reservado, no permite que al eliminar el resultado sea menor que 0
        String sqlUpdate = "UPDATE ingredientes SET " +
                "stock_actual = GREATEST(0, stock_actual - ?), " +
                "stock_reservado = GREATEST(0, stock_reservado - ?) " +
                "WHERE id = ?";

        try (Connection conn = ConexionDB.getConexion()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psReceta = conn.prepareStatement(sqlReceta)) {
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();

                while (rs.next()) {
                    double totalAGastar = rs.getDouble("cantidad_necesaria") * cantidad;
                    try (PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate)) {
                        psUpdate.setDouble(1, totalAGastar);
                        psUpdate.setDouble(2, totalAGastar);
                        psUpdate.setInt(3, rs.getInt("ingrediente_id"));
                        psUpdate.executeUpdate();
                    }
                }
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
            }
        } catch (SQLException e) {
             e.printStackTrace(); 
        }
    }
}
