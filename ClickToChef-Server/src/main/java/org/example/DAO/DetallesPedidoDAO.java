package org.example.DAO;

import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DetallesPedidoDAO {

    public static boolean insertarDetallePedido(DetallesPedido detallePedido) {
        String sql = "INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, estado, hora_pedido) VALUES (?, ?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setInt(1, detallePedido.getPedidoId());
            statement.setInt(2, detallePedido.getProductoId());
            statement.setInt(3, detallePedido.getCantidad());
            statement.setString(4, convertirEstadoDetalleADB(detallePedido.getEstado()));
            statement.setTimestamp(5, detallePedido.getHoraPedido());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el detalle del pedido", e);
        }
    }

    public static ArrayList<DetallesPedido> obtenerTodos() {
        String sql = "SELECT id, pedido_id, producto_id, cantidad, estado, hora_pedido FROM detalles_pedido";
        ArrayList<DetallesPedido> detalles = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                DetallesPedido detalle = new DetallesPedido(
                        resultSet.getInt("id"),
                        resultSet.getInt("pedido_id"),
                        resultSet.getInt("producto_id"),
                        resultSet.getInt("cantidad"),
                        convertirEstadoDetalleAEnum(resultSet.getString("estado")),
                        resultSet.getTimestamp("hora_pedido")
                );
                detalles.add(detalle);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los detalles del pedido", e);
        }

        return detalles;
    }

    private static String convertirEstadoDetalleADB(EstadoDetallePedido estadoDetallePedido) {
        return estadoDetallePedido.name().toLowerCase().replace('_', ' ');
    }

    private static EstadoDetallePedido convertirEstadoDetalleAEnum(String valorBD) {
        return EstadoDetallePedido.valueOf(valorBD.toUpperCase().replace(' ', '_'));
    }
}
