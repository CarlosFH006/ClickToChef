package org.example.DAO;

import org.example.DTO.Pedidos;
import org.example.DTO.EstadoPedido;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PedidosDAO {

    public static boolean insertarPedido(Pedidos pedido) {
        String sql = "INSERT INTO pedidos (mesa_id, usuario_id, fecha_creacion, estado) VALUES (?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setInt(1, pedido.getMesaId());
            statement.setInt(2, pedido.getUsuarioId());
            statement.setTimestamp(3, pedido.getFechaCreacion());
            statement.setString(4, convertirEstadoPedidoADB(pedido.getEstado()));
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el pedido", e);
        }
    }

    public static ArrayList<Pedidos> obtenerTodos() {
        String sql = "SELECT id, mesa_id, usuario_id, fecha_creacion, estado FROM pedidos";
        ArrayList<Pedidos> pedidos = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Pedidos pedido = new Pedidos(
                        resultSet.getInt("id"),
                        resultSet.getInt("mesa_id"),
                        resultSet.getInt("usuario_id"),
                        resultSet.getTimestamp("fecha_creacion"),
                        convertirEstadoPedidoAEnum(resultSet.getString("estado"))
                );
                pedidos.add(pedido);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los pedidos", e);
        }

        return pedidos;
    }

    private static String convertirEstadoPedidoADB(EstadoPedido estadoPedido) {
        return estadoPedido.name().toLowerCase();
    }

    private static EstadoPedido convertirEstadoPedidoAEnum(String valorBD) {
        return EstadoPedido.valueOf(valorBD.toUpperCase());
    }
}
