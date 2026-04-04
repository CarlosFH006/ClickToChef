package org.example.DAO;

import org.example.DTO.Ingredientes;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class IngredientesDAO {

    public boolean insertarIngrediente(Ingredientes ingrediente) {
        String sql = "INSERT INTO ingredientes (nombre, stock_actual, unidad_medida, odoo_product_id) VALUES (?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setString(1, ingrediente.getNombre());
            statement.setBigDecimal(2, ingrediente.getStockActual());
            statement.setString(3, ingrediente.getUnidadMedida());

            if (ingrediente.getOdooProductId() != null) {
                statement.setInt(4, ingrediente.getOdooProductId());
            } else {
                statement.setNull(4, java.sql.Types.INTEGER);
            }

            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el ingrediente", e);
        }
    }

    public ArrayList<Ingredientes> obtenerTodos() {
        String sql = "SELECT id, nombre, stock_actual, unidad_medida, odoo_product_id FROM ingredientes";
        ArrayList<Ingredientes> ingredientes = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Ingredientes ingrediente = new Ingredientes(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre"),
                        resultSet.getBigDecimal("stock_actual"),
                        resultSet.getString("unidad_medida"),
                        (Integer) resultSet.getObject("odoo_product_id")
                );
                ingredientes.add(ingrediente);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los ingredientes", e);
        }

        return ingredientes;
    }
}
