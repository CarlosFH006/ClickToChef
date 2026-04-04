package org.example.DAO;

import org.example.DTO.Productos;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

public class ProductosDAO {

    public boolean insertarProducto(Productos producto) {
        String sql = "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setString(1, producto.getNombre());
            statement.setString(2, producto.getDescripcion());
            statement.setBigDecimal(3, producto.getPrecio());

            if (producto.getCategoriaId() != null) {
                statement.setInt(4, producto.getCategoriaId());
            } else {
                statement.setNull(4, Types.INTEGER);
            }

            statement.setString(5, producto.getImagenUrl());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el producto", e);
        }
    }

    public ArrayList<Productos> obtenerTodos() {
        String sql = "SELECT id, nombre, descripcion, precio, categoria_id, imagen_url FROM productos";
        ArrayList<Productos> productos = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Productos producto = new Productos(
                        resultSet.getInt("id"),
                        resultSet.getString("nombre"),
                        resultSet.getString("descripcion"),
                        resultSet.getBigDecimal("precio"),
                        (Integer) resultSet.getObject("categoria_id"),
                        resultSet.getString("imagen_url")
                );
                productos.add(producto);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los productos", e);
        }

        return productos;
    }
}
