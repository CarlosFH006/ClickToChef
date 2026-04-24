package org.example.DAO;

import org.example.DTO.Pedidos;
import org.example.DTO.EstadoPedido;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.Statement;

public class PedidosDAO {

    public static int insertarPedido(Pedidos pedido) {
        String sql = "INSERT INTO pedidos (mesa_id, usuario_id, fecha_creacion, estado) VALUES (?, ?, ?, ?)";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, pedido.getMesaId());
            statement.setInt(2, pedido.getUsuarioId());
            statement.setTimestamp(3, pedido.getFechaCreacion());
            statement.setString(4, convertirEstadoPedidoADB(pedido.getEstado()));

            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                return -1;
            }

            ResultSet generatedKeys = statement.getGeneratedKeys();
            if (generatedKeys.next()) {
                return generatedKeys.getInt(1);
            } else {
                return -1;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el pedido", e);
        }
    }

    public static ArrayList<Pedidos> obtenerTodos() {
        String sql = "SELECT id, mesa_id, usuario_id, fecha_creacion, estado FROM pedidos WHERE estado = 'abierta'";
        ArrayList<Pedidos> pedidos = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
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

        for (Pedidos p : pedidos) {
            p.setDetalles(DetallesPedidoDAO.obtenerPorPedido(p.getId()));
        }

        return pedidos;
    }

    public static ArrayList<Pedidos> obtenerPorUsuario(int usuarioId) {
        String sql = "SELECT id, mesa_id, usuario_id, fecha_creacion, estado FROM pedidos WHERE usuario_id = ? AND estado = 'abierta'";
        ArrayList<Pedidos> pedidos = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, usuarioId);
            ResultSet resultSet = statement.executeQuery();
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
            throw new RuntimeException("Error al obtener los pedidos del usuario", e);
        }

        for (Pedidos p : pedidos) {
            p.setDetalles(DetallesPedidoDAO.obtenerPorPedido(p.getId()));
        }

        return pedidos;
    }

    public static Pedidos obtenerPedidoPorId(int id) {
        String sql = "SELECT id, mesa_id, usuario_id, fecha_creacion, estado FROM pedidos WHERE id = ?";
        Pedidos pedido = null;

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                pedido = new Pedidos(
                        resultSet.getInt("id"),
                        resultSet.getInt("mesa_id"),
                        resultSet.getInt("usuario_id"),
                        resultSet.getTimestamp("fecha_creacion"),
                        convertirEstadoPedidoAEnum(resultSet.getString("estado"))
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener el pedido", e);
        }

        if (pedido != null) {
            pedido.setDetalles(DetallesPedidoDAO.obtenerPorPedido(pedido.getId()));
        }

        return pedido;
    }

    public static boolean cerrarPedido(int id) {
        String sql = "UPDATE pedidos SET estado = 'cerrada' WHERE id = ?";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar cerrar el pedido", e);
        }
    }

    public static boolean cancelarPedido(int id) {
        String sql = "UPDATE pedidos SET estado = 'cancelado' WHERE id = ? AND estado = 'abierta'";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al cancelar el pedido", e);
        }
    }

    private static String convertirEstadoPedidoADB(EstadoPedido estadoPedido) {
        return estadoPedido.name().toLowerCase();
    }

    private static EstadoPedido convertirEstadoPedidoAEnum(String valorBD) {
        return EstadoPedido.valueOf(valorBD.toUpperCase());
    }
}
