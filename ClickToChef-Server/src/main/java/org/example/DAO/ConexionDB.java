package org.example.DAO;

import org.example.Servidor.ObtenerProperties;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {
    private static ConexionDB instancia;
    private Connection conexion;

    private ConexionDB() {
        try {
            String url = ObtenerProperties.obtenerParametro("db.url");
            String user = ObtenerProperties.obtenerParametro("db.user");
            String pass = ObtenerProperties.obtenerParametro("db.password");

            Class.forName("com.mysql.cj.jdbc.Driver");

            this.conexion = DriverManager.getConnection(url, user, pass);
            System.out.println("Conectado");

        } catch (ClassNotFoundException | SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection getConexion() throws SQLException {
        if (instancia == null || instancia.conexion.isClosed()) {
            instancia = new ConexionDB();
        }
        return instancia.conexion;
    }

    public static void cerrarConexion() {
        if (instancia != null && instancia.conexion != null) {
            try {
                instancia.conexion.close();
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
    }
}