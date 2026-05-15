package org.example.DAO;

import org.example.DTO.Ingredientes;
import org.example.DTO.MetodoMedida;
import org.example.DTO.TipoIngrediente;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

public class IngredientesDAO {

    private static String convertirMetodoMedidaADB(MetodoMedida metodo) {
        switch (metodo) {
            case KG: return "kg";
            case LITROS: return "litros";
            case UNIDAD: return "unidades";
            default: return "unidades";
        }
    }

    private static String convertirTipoIngredienteADB(TipoIngrediente tipo) {
        return tipo.name().toLowerCase();
    }

    private static MetodoMedida parsearMetodoMedida(String valor) {
        if (valor == null) return MetodoMedida.UNIDAD;
        switch (valor.toLowerCase()) {
            case "kg": return MetodoMedida.KG;
            case "litros": return MetodoMedida.LITROS;
            default: return MetodoMedida.UNIDAD;
        }
    }

    private static TipoIngrediente parsearTipoIngrediente(String valor) {
        if (valor == null) return TipoIngrediente.MATERIA_PRIMA;
        switch (valor.toLowerCase()) {
            case "producto_terminado": return TipoIngrediente.PRODUCTO_TERMINADO;
            default: return TipoIngrediente.MATERIA_PRIMA;
        }
    }

    //Query que inserta un ingrediente.
    public static int insertarIngrediente(Ingredientes ingrediente) {
        String sql = "INSERT INTO ingredientes (nombre, stock_actual, stock_reservado, unidad_medida, tipo, odoo_product_id) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, ingrediente.getNombre());
            statement.setDouble(2, ingrediente.getStockActual());
            statement.setDouble(3, ingrediente.getStockReservado());
            statement.setString(4, convertirMetodoMedidaADB(ingrediente.getMetodoMedida()));
            statement.setString(5, convertirTipoIngredienteADB(ingrediente.getTipoIngrediente()));
            statement.setInt(6, ingrediente.getOdooProductId());
            if (statement.executeUpdate() == 0) return -1;
            ResultSet keys = statement.getGeneratedKeys();
            return keys.next() ? keys.getInt(1) : -1;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el ingrediente", e);
        }
    }

    //Query que devuelve todos los ingredientes.
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

    //Query que suma stock a un ingrediente.
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

    //Query que obtiene un ingrediente por su id.
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

    //Query que actualiza el odoo_product_id de un ingrediente.
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
