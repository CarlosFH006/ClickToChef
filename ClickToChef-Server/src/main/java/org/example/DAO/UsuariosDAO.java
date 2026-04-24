package org.example.DAO;

import org.example.DTO.Usuarios;
import org.example.DTO.RolUsuario;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UsuariosDAO {

    public static boolean insertarUsuario(Usuarios usuario) {
        String sql = "INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES (?, ?, ?, ?)";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setString(1, usuario.getUsername());
            statement.setString(2, usuario.getPasswordHash());
            statement.setString(3, usuario.getNombreCompleto());
            statement.setString(4, convertirRolUsuarioADB(usuario.getRol()));
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al insertar el usuario", e);
        }
    }

    public static ArrayList<Usuarios> obtenerTodos() {
        String sql = "SELECT id, username, password_hash, nombre_completo, rol FROM usuarios";
        ArrayList<Usuarios> usuarios = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                Usuarios usuario = new Usuarios(
                        resultSet.getInt("id"),
                        resultSet.getString("username"),
                        resultSet.getString("password_hash"),
                        resultSet.getString("nombre_completo"),
                        convertirRolUsuarioAEnum(resultSet.getString("rol"))
                );
                usuarios.add(usuario);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los usuarios", e);
        }

        return usuarios;
    }

    public static ArrayList<Usuarios> obtenerTodosSinPassword() {
        String sql = "SELECT id, username, nombre_completo, rol FROM usuarios";
        ArrayList<Usuarios> usuarios = new ArrayList<>();

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                Usuarios usuario = new Usuarios(
                        resultSet.getInt("id"),
                        resultSet.getString("username"),
                        null,
                        resultSet.getString("nombre_completo"),
                        convertirRolUsuarioAEnum(resultSet.getString("rol"))
                );
                usuarios.add(usuario);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener los usuarios", e);
        }

        return usuarios;
    }

    private static String convertirRolUsuarioADB(RolUsuario rolUsuario) {
        return rolUsuario.name().toLowerCase();
    }

    private static RolUsuario convertirRolUsuarioAEnum(String valorBD) {
        return RolUsuario.valueOf(valorBD.toUpperCase());
    }

    public static Usuarios login(String username, String password) {
        String sql = "SELECT id, username, password_hash, nombre_completo, rol FROM usuarios WHERE username = ? AND password_hash = ?";

        try {
            Connection conexion = ConexionDB.getConexion();
            PreparedStatement statement = conexion.prepareStatement(sql);
            statement.setString(1, username);
            statement.setString(2, password);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new Usuarios(
                        resultSet.getInt("id"),
                        resultSet.getString("username"),
                        resultSet.getString("password_hash"),
                        resultSet.getString("nombre_completo"),
                        convertirRolUsuarioAEnum(resultSet.getString("rol"))
                );
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error en el proceso de login", e);
        }

        return null;
    }
}
