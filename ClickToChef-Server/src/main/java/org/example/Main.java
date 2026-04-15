package org.example;

import org.example.Odoo.CargaInicial;
import org.example.Servidor.Servidor;
import org.example.Servidor.WebSocketServidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.http.WebSocket;
import java.util.Properties;

public class Main {
    private static final String CONFIG_PATH = "config.properties";

    public static void main(String[] args) {
        Properties properties = cargarConfiguracion();
        int puerto = Integer.parseInt(leerPropiedadObligatoria(properties,"webserver.port"));

        CargaInicial.cargaInicialDatos();

        new Thread(() -> Servidor.server()).start();

        WebSocketServidor ws = new WebSocketServidor(puerto);
        ws.start();
    }

    private static Properties cargarConfiguracion() {
        try {
            Properties properties = new Properties();
            try (FileInputStream fis = new FileInputStream(CONFIG_PATH)) {
                properties.load(fis);
            }
            return properties;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer el archivo config.properties.", e);
        }
    }
    private static String leerPropiedadObligatoria(Properties properties, String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Falta la propiedad obligatoria: " + key);
        }
        return value;
    }
}
