package org.example.DAO;

import org.example.DTO.Tickets;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class TicketsDAO {

    public boolean insertarTicket(Tickets ticket) {
        String sql = "INSERT INTO tickets (pedido_id, total_importe, fecha_pago, referencia_factura_odoo, metodo_pago) VALUES (?, ?, ?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setInt(1, ticket.getPedidoId());
            statement.setBigDecimal(2, ticket.getTotalImporte());
            statement.setTimestamp(3, ticket.getFechaPago());
            statement.setString(4, ticket.getReferenciaFacturaOdoo());
            statement.setString(5, ticket.getMetodoPago());
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el ticket", e);
        }
    }

    public ArrayList<Tickets> obtenerTodos() {
        String sql = "SELECT id, pedido_id, total_importe, fecha_pago, referencia_factura_odoo, metodo_pago FROM tickets";
        ArrayList<Tickets> tickets = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Tickets ticket = new Tickets(
                        resultSet.getInt("id"),
                        resultSet.getInt("pedido_id"),
                        resultSet.getBigDecimal("total_importe"),
                        resultSet.getTimestamp("fecha_pago"),
                        resultSet.getString("referencia_factura_odoo"),
                        resultSet.getString("metodo_pago")
                );
                tickets.add(ticket);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los tickets", e);
        }

        return tickets;
    }
}
