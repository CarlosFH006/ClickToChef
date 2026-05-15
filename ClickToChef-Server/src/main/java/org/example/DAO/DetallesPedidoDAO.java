package org.example.DAO;

import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DetallesPedidoDAO {

    //Query que inserta un detalle de pedido.
    public static boolean insertarDetallePedido(DetallesPedido detallePedido) {
        String sql = "INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, notas_especiales, estado, hora_pedido) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, detallePedido.getPedidoId());
            statement.setInt(2, detallePedido.getProductoId());
            statement.setInt(3, detallePedido.getCantidad());
            statement.setDouble(4, detallePedido.getPrecioUnitario());
            statement.setString(5, detallePedido.getNotasEspeciales());
            statement.setString(6, convertirEstadoDetalleADB(detallePedido.getEstado()));
            statement.setTimestamp(7, detallePedido.getHoraPedido());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el detalle del pedido", e);
        }
    }

    //Query que devuelve todos los detalles de pedido que no esten servidos y que el pedido este abierto.
    public static ArrayList<DetallesPedido> obtenerTodos() {
        String sql = """
                    SELECT dp.id, dp.pedido_id, dp.producto_id, p.nombre AS nombre_producto,
                    dp.cantidad, dp.precio_unitario, dp.notas_especiales, dp.estado, dp.hora_pedido
                    FROM detalles_pedido dp
                    JOIN productos p ON dp.producto_id = p.id
                    JOIN pedidos pe ON dp.pedido_id = pe.id
                    WHERE dp.estado <> 'servido' AND pe.estado = 'abierta'
                    """;
        ArrayList<DetallesPedido> detalles = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                DetallesPedido detalle = new DetallesPedido(
                        resultSet.getInt("id"),
                        resultSet.getInt("pedido_id"),
                        resultSet.getInt("producto_id"),
                        resultSet.getString("nombre_producto"),
                        resultSet.getInt("cantidad"),
                        resultSet.getDouble("precio_unitario"),
                        resultSet.getString("notas_especiales"),
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

    //Query que devuelve un detalle de pedido por su id.
    public static DetallesPedido obtenerPorId(int id) {
        String sql = """
                SELECT dp.id, dp.pedido_id, dp.producto_id, p.nombre AS nombre_producto,
                dp.cantidad, dp.precio_unitario, dp.notas_especiales, dp.estado, dp.hora_pedido
                FROM detalles_pedido dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.id = ?
                """;

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new DetallesPedido(
                        resultSet.getInt("id"),
                        resultSet.getInt("pedido_id"),
                        resultSet.getInt("producto_id"),
                        resultSet.getString("nombre_producto"),
                        resultSet.getInt("cantidad"),
                        resultSet.getDouble("precio_unitario"),
                        resultSet.getString("notas_especiales"),
                        convertirEstadoDetalleAEnum(resultSet.getString("estado")),
                        resultSet.getTimestamp("hora_pedido")
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener el detalle del pedido " + id, e);
        }

        return null;
    }

    //Query que devuelve los detalles de pedido por su id de pedido.
    public static ArrayList<DetallesPedido> obtenerPorPedido(int pedidoId) {
        String sql = """
                SELECT dp.id, dp.pedido_id, dp.producto_id, p.nombre AS nombre_producto,
                dp.cantidad, dp.precio_unitario, dp.notas_especiales, dp.estado, dp.hora_pedido
                FROM detalles_pedido dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.pedido_id = ?
                """;
        ArrayList<DetallesPedido> detalles = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, pedidoId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                DetallesPedido detalle = new DetallesPedido(
                        resultSet.getInt("id"),
                        resultSet.getInt("pedido_id"),
                        resultSet.getInt("producto_id"),
                        resultSet.getString("nombre_producto"),
                        resultSet.getInt("cantidad"),
                        resultSet.getDouble("precio_unitario"),
                        resultSet.getString("notas_especiales"),
                        convertirEstadoDetalleAEnum(resultSet.getString("estado")),
                        resultSet.getTimestamp("hora_pedido")
                );
                detalles.add(detalle);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los detalles del pedido " + pedidoId, e);
        }

        return detalles;
    }

    //Query que actualiza el estado de un detalle de pedido.
    public static boolean updateEstado(int id, EstadoDetallePedido nuevoEstado) {
        String sql = "UPDATE detalles_pedido SET estado = ? WHERE id = ?";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setString(1, convertirEstadoDetalleADB(nuevoEstado));
            statement.setInt(2, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar el estado del detalle del pedido", e);
        }
    }
    
    //Query que elimina un detalle de pedido por su id.
    public static boolean eliminarDetalle(int id) {
        String sql = "DELETE FROM detalles_pedido WHERE id = ?";
        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al eliminar el detalle del pedido", e);
        }
    }
    
    private static String convertirEstadoDetalleADB(EstadoDetallePedido estadoDetallePedido) {
        return estadoDetallePedido.name().toLowerCase().replace('_', ' ');
    }

    private static EstadoDetallePedido convertirEstadoDetalleAEnum(String valorBD) {
        return EstadoDetallePedido.valueOf(valorBD.toUpperCase().replace(' ', '_'));
    }
}