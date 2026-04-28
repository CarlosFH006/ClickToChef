package org.example.DAO;

import org.example.DTO.Productos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class ProductosDAO {

    public static boolean insertarProducto(Productos producto) {
        String sql = "INSERT INTO productos (nombre, descripcion, precio, categoria_id, odoo_id) VALUES (?, ?, ?, ?, ?)";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setString(1, producto.getNombre());
            statement.setString(2, producto.getDescripcion());
            statement.setDouble(3, producto.getPrecio());
            statement.setInt(4, producto.getCategoriaId());
            statement.setInt(5, producto.getOdooId());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el producto", e);
        }
    }

    public static ArrayList<Productos> obtenerTodos() {
        String sql = "SELECT id, nombre, descripcion, precio, categoria_id, odoo_id FROM productos";
        ArrayList<Productos> productos = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                Productos producto = new Productos(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre"),
                        resultSet.getString("descripcion"),
                        resultSet.getDouble("precio"),
                        resultSet.getInt("categoria_id"),
                        resultSet.getInt("odoo_id")
                );
                productos.add(producto);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los productos", e);
        }

        return productos;
    }

    public static ArrayList<Integer> obtenerNoDisponibles() {
        String sql = """
                SELECT p.id FROM productos p
                WHERE EXISTS (
                    SELECT 1 FROM recetas r
                    JOIN ingredientes i ON r.ingrediente_id = i.id
                    WHERE r.producto_id = p.id
                    AND (i.stock_actual - i.stock_reservado) < r.cantidad_necesaria
                )
                """;
        ArrayList<Integer> noDisponibles = new ArrayList<>();
        try {
            Connection conn = ConexionDB.getConexion();
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                noDisponibles.add(rs.getInt("id"));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener productos no disponibles", e);
        }
        return noDisponibles;
    }

    public static synchronized boolean reservarProducto(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        String sqlUpdate = "UPDATE ingredientes SET stock_reservado = stock_reservado + ? " +
                "WHERE id = ? AND (stock_actual - stock_reservado) >= ?";

        try {
            Connection conn = ConexionDB.getConexion();
            conn.setAutoCommit(false);
            try {
                PreparedStatement psReceta = conn.prepareStatement(sqlReceta);
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();
                while (rs.next()) {
                    int ingId = rs.getInt("ingrediente_id");
                    double cantNecesaria = rs.getDouble("cantidad_necesaria") * cantidad;

                    PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate);
                    psUpdate.setDouble(1, cantNecesaria);
                    psUpdate.setInt(2, ingId);
                    psUpdate.setDouble(3, cantNecesaria);

                    int filasAfectadas = psUpdate.executeUpdate();
                    if (filasAfectadas == 0) {
                        throw new Exception("Stock insuficiente para el ingrediente ID: " + ingId);
                    }
                }
                conn.commit();
                conn.setAutoCommit(true);
                return true;
            } catch (Exception e) {
                conn.rollback();
                conn.setAutoCommit(true);
                System.err.println("Error en reserva: " + e.getMessage());
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static synchronized void liberarReserva(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        String sqlUpdate = "UPDATE ingredientes SET stock_reservado = GREATEST(0, stock_reservado - ?) WHERE id = ?";

        try {
            Connection conn = ConexionDB.getConexion();
            conn.setAutoCommit(false);
            try {
                PreparedStatement psReceta = conn.prepareStatement(sqlReceta);
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();
                while (rs.next()) {
                    double totalALiberar = rs.getDouble("cantidad_necesaria") * cantidad;
                    PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate);
                    psUpdate.setDouble(1, totalALiberar);
                    psUpdate.setInt(2, rs.getInt("ingrediente_id"));
                    psUpdate.executeUpdate();
                }
                conn.commit();
                conn.setAutoCommit(true);
            } catch (Exception e) {
                conn.rollback();
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static synchronized void restaurarStock(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        String sqlUpdate = "UPDATE ingredientes SET stock_actual = stock_actual + ? WHERE id = ?";

        try {
            Connection conn = ConexionDB.getConexion();
            conn.setAutoCommit(false);
            try {
                PreparedStatement psReceta = conn.prepareStatement(sqlReceta);
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();
                while (rs.next()) {
                    double totalARestaurar = rs.getDouble("cantidad_necesaria") * cantidad;
                    PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate);
                    psUpdate.setDouble(1, totalARestaurar);
                    psUpdate.setInt(2, rs.getInt("ingrediente_id"));
                    psUpdate.executeUpdate();
                }
                conn.commit();
                conn.setAutoCommit(true);
            } catch (Exception e) {
                conn.rollback();
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static boolean actualizarOdooId(int productoId, int odooId) {
        String sql = "UPDATE productos SET odoo_id = ? WHERE id = ?";
        try {
            Connection conn = ConexionDB.getConexion();
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, odooId);
            ps.setInt(2, productoId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar el odoo_id del producto", e);
        }
    }

    public static synchronized void finalizarReserva(int productoId, int cantidad) {
        String sqlReceta = "SELECT ingrediente_id, cantidad_necesaria FROM recetas WHERE producto_id = ?";
        String sqlUpdate = "UPDATE ingredientes SET " +
                "stock_actual = GREATEST(0, stock_actual - ?), " +
                "stock_reservado = GREATEST(0, stock_reservado - ?) " +
                "WHERE id = ?";

        try {
            Connection conn = ConexionDB.getConexion();
            conn.setAutoCommit(false);
            try {
                PreparedStatement psReceta = conn.prepareStatement(sqlReceta);
                psReceta.setInt(1, productoId);
                ResultSet rs = psReceta.executeQuery();
                while (rs.next()) {
                    double totalAGastar = rs.getDouble("cantidad_necesaria") * cantidad;
                    PreparedStatement psUpdate = conn.prepareStatement(sqlUpdate);
                    psUpdate.setDouble(1, totalAGastar);
                    psUpdate.setDouble(2, totalAGastar);
                    psUpdate.setInt(3, rs.getInt("ingrediente_id"));
                    psUpdate.executeUpdate();
                }
                conn.commit();
                conn.setAutoCommit(true);
            } catch (Exception e) {
                conn.rollback();
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
