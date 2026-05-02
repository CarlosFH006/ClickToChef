package org.example.DAO;

import org.example.DTO.Ingredientes;
import org.example.DTO.MetodoMedida;
import org.example.DTO.TipoIngrediente;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class IngredientesDAO {

    private static MetodoMedida parsearMetodoMedida(String valor) {
        if (valor == null) return MetodoMedida.UNIDAD;
        return switch (valor.toLowerCase()) {
            case "kg" -> MetodoMedida.KG;
            case "litros" -> MetodoMedida.LITROS;
            default -> MetodoMedida.UNIDAD;
        };
    }

    private static TipoIngrediente parsearTipoIngrediente(String valor) {
        if (valor == null) return TipoIngrediente.MATERIA_PRIMA;
        return switch (valor.toLowerCase()) {
            case "producto_terminado" -> TipoIngrediente.PRODUCTO_TERMINADO;
            default -> TipoIngrediente.MATERIA_PRIMA;
        };
    }

    public static int insertarIngrediente(Ingredientes ingrediente) {
        String sql = "INSERT INTO ingredientes (nombre, stock_actual, stock_reservado, unidad_medida, tipo, odoo_product_id) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, ingrediente.getNombre());
            statement.setDouble(2, ingrediente.getStockActual());
            statement.setDouble(3, ingrediente.getStockReservado());
            statement.setString(4, ingrediente.getMetodoMedida().name().toLowerCase());
            statement.setString(5, ingrediente.getTipoIngrediente().name().toLowerCase());
            statement.setInt(6, ingrediente.getOdooProductId());
            if (statement.executeUpdate() == 0) return -1;
            ResultSet keys = statement.getGeneratedKeys();
            return keys.next() ? keys.getInt(1) : -1;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el ingrediente", e);
        }
    }

    public static ArrayList<Ingredientes> obtenerTodos() {
        String sql = "SELECT id, nombre, stock_actual, stock_reservado, unidad_medida, tipo, odoo_product_id FROM ingredientes";
        ArrayList<Ingredientes> ingredientes = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                Ingredientes ingrediente = new Ingredientes(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre"),
                        resultSet.getDouble("stock_actual"),
                        resultSet.getDouble("stock_reservado"),
                        parsearMetodoMedida(resultSet.getString("unidad_medida")),
                        parsearTipoIngrediente(resultSet.getString("tipo")),
                        resultSet.getInt("odoo_product_id")
                );
                ingredientes.add(ingrediente);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los ingredientes", e);
        }

        return ingredientes;
    }

    public static boolean sumarStock(int id, double cantidad) {
        String sql = "UPDATE ingredientes SET stock_actual = stock_actual + ? WHERE id = ?";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setDouble(1, cantidad);
            statement.setInt(2, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al sumar stock al ingrediente", e);
        }
    }

    public static Ingredientes obtenerPorId(int id) {
        String sql = "SELECT id, nombre, stock_actual, stock_reservado, unidad_medida, tipo, odoo_product_id FROM ingredientes WHERE id = ?";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return new Ingredientes(
                        rs.getInt("id"), rs.getString("nombre"),
                        rs.getDouble("stock_actual"), rs.getDouble("stock_reservado"),
                        parsearMetodoMedida(rs.getString("unidad_medida")),
                        parsearTipoIngrediente(rs.getString("tipo")),
                        rs.getInt("odoo_product_id")
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener el ingrediente " + id, e);
        }
        return null;
    }

    public static boolean actualizarOdooProductId(int ingredienteId, int odooProductId) {
        String sql = "UPDATE ingredientes SET odoo_product_id = ? WHERE id = ?";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, odooProductId);
            statement.setInt(2, ingredienteId);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar el odoo_product_id del ingrediente", e);
        }
    }
}
