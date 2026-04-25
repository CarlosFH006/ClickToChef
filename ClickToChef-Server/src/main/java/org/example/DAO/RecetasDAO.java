package org.example.DAO;

import org.example.DTO.Recetas;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RecetasDAO {

    public static boolean insertarReceta(Recetas receta) {
        String sql = "INSERT INTO recetas (producto_id, ingrediente_id, cantidad_necesaria) VALUES (?, ?, ?)";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, receta.getProductoId());
            statement.setInt(2, receta.getIngredienteId());
            statement.setDouble(3, receta.getCantidadNecesaria());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar la receta", e);
        }
    }

    public static ArrayList<Recetas> obtenerTodas() {
        String sql = "SELECT producto_id, ingrediente_id, cantidad_necesaria FROM recetas";
        ArrayList<Recetas> recetas = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                Recetas receta = new Recetas(
                        resultSet.getInt("producto_id"),
                        resultSet.getInt("ingrediente_id"),
                        resultSet.getDouble("cantidad_necesaria")
                );
                recetas.add(receta);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener las recetas", e);
        }

        return recetas;
    }
}
