package org.example.DAO;

import org.example.DTO.Mesas;
import org.example.DTO.EstadoMesa;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MesasDAO {

    public static boolean insertarMesa(Mesas mesa) {
        String sql = "INSERT INTO mesas (numero, capacidad, estado) VALUES (?, ?, ?)";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setInt(1, mesa.getNumero());
            statement.setInt(2, mesa.getCapacidad());
            statement.setString(3, convertirEstadoMesaADB(mesa.getEstado()));
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar la mesa", e);
        }
    }

    public static ArrayList<Mesas> obtenerTodas() {
        String sql = "SELECT id, numero, capacidad, estado FROM mesas";
        ArrayList<Mesas> mesas = new ArrayList<>();

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Mesas mesa = new Mesas(
                        resultSet.getInt("id"),
                        resultSet.getInt("numero"),
                        resultSet.getInt("capacidad"),
                        convertirEstadoMesaAEnum(resultSet.getString("estado"))
                );
                mesas.add(mesa);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener las mesas", e);
        }

        return mesas;
    }

    public static boolean actualizarEstadoMesa(int id, EstadoMesa nuevoEstado) {
        String sql = "UPDATE mesas SET estado = ? WHERE id = ?";

        try (Connection conexion = ConexionDB.getConexion();
             PreparedStatement statement = conexion.prepareStatement(sql)) {

            statement.setString(1, convertirEstadoMesaADB(nuevoEstado));
            statement.setInt(2, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar el estado de la mesa", e);
        }
    }

    private static String convertirEstadoMesaADB(EstadoMesa estadoMesa) {
        return estadoMesa.name().toLowerCase();
    }

    private static EstadoMesa convertirEstadoMesaAEnum(String valorBD) {
        return EstadoMesa.valueOf(valorBD.toUpperCase());
    }
}
