package org.example.DAO;

import org.example.DTO.Categorias;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CategoriasDAO {

    public static boolean insertarCategoria(Categorias categoria) {
        String sql = "INSERT INTO categorias (nombre) VALUES (?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setString(1, categoria.getNombre());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar la categoria", e);
        }
    }

    public static ArrayList<Categorias> obtenerTodas() {
        String sql = "SELECT id, nombre FROM categorias";
        ArrayList<Categorias> categorias = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Categorias categoria = new Categorias(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre")
                );
                categorias.add(categoria);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener las categorias", e);
        }

        return categorias;
    }
}
