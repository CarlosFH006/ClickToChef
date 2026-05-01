package org.example.DAO;

import org.example.DTO.CategoriaPlato;
import org.example.DTO.Categorias;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

public class CategoriasDAO {

    public static int insertarCategoria(Categorias categoria) {
        String sql = "INSERT INTO categorias (nombre) VALUES (?)";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, categoria.getNombre());
            if (statement.executeUpdate() == 0) return -1;
            ResultSet keys = statement.getGeneratedKeys();
            return keys.next() ? keys.getInt(1) : -1;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar la categoria", e);
        }
    }

    public static ArrayList<Categorias> obtenerTodas() {
        String sql = "SELECT id, nombre FROM categorias";
        ArrayList<Categorias> categorias = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
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

    public static ArrayList<CategoriaPlato> categoriasplatos() {
        //Case sirve para crear una variable booleana en una consulta, devuelve true o false segun la condición del when.
        
        //Select 1 para no recibir la base de datos completa, porque para Exists con que haya una respuesta es suficiente
        String sql = """
                SELECT
                    c.id AS categoria_id,
                    c.nombre AS categoria_nombre,
                    p.id AS producto_id,
                    p.nombre AS producto_nombre,
                    p.precio,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM recetas r
                            JOIN ingredientes i ON r.ingrediente_id = i.id
                            WHERE r.producto_id = p.id
                            AND (i.stock_actual - i.stock_reservado) < r.cantidad_necesaria
                        ) THEN FALSE
                        ELSE TRUE
                    END AS disponible
                    FROM categorias c
                    JOIN productos p ON c.id = p.categoria_id
                    ORDER BY c.nombre, p.nombre;
                """;
        ArrayList<CategoriaPlato> categoriasPlatos = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                CategoriaPlato categoriaPlato = new CategoriaPlato(
                        resultSet.getInt("categoria_id"),
                        resultSet.getString("categoria_nombre"),
                        resultSet.getInt("producto_id"),
                        resultSet.getString("producto_nombre"),
                        resultSet.getDouble("precio"),
                        resultSet.getBoolean("disponible")
                );
                categoriasPlatos.add(categoriaPlato);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener las categorias con todos los platos", e);
        }

        return categoriasPlatos;
    }

}
