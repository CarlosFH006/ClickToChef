package org.example.DAO;

import org.example.DTO.Recetas;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public static List<Map<String, Object>> obtenerPorProductoConIngrediente(int productoId) {
        String sql = """
                SELECT r.cantidad_necesaria,
                       i.id AS ingrediente_id, i.nombre, i.unidad_medida, i.tipo
                FROM recetas r
                JOIN ingredientes i ON r.ingrediente_id = i.id
                WHERE r.producto_id = ?
                """;
        List<Map<String, Object>> resultado = new ArrayList<>();
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, productoId);
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                Map<String, Object> fila = new HashMap<>();
                fila.put("ingredienteId",     rs.getInt("ingrediente_id"));
                fila.put("nombre",            rs.getString("nombre"));
                fila.put("cantidad",          rs.getDouble("cantidad_necesaria"));
                fila.put("unidadMedida",      rs.getString("unidad_medida"));
                fila.put("tipo",              rs.getString("tipo"));
                resultado.add(fila);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener la receta del producto " + productoId, e);
        }
        return resultado;
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
