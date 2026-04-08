package org.example.DAO;

import java.io.FileNotFoundException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.io.FileInputStream;
import java.io.IOException;

public class ConexionDB {
    private static ConexionDB instancia;
    private Connection conexion;

    private ConexionDB() {
        Properties properties = new Properties();
        try (FileInputStream fis = new FileInputStream("config.properties")) {
            properties.load(fis);

            String url = properties.getProperty("db.url");
            String user = properties.getProperty("db.user");
            String pass = properties.getProperty("db.password");

            Class.forName("com.mysql.cj.jdbc.Driver");

            this.conexion = DriverManager.getConnection(url, user, pass);
            System.out.println("Conectado");

        } catch (IOException | ClassNotFoundException | SQLException e) {
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