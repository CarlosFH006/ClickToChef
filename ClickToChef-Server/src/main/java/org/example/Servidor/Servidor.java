package org.example.Servidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Properties;

public class Servidor {
    private static final String CONFIG_PATH = "config.properties";

    public static void server(){
        Properties properties = cargarConfiguracion();
        int puerto = Integer.parseInt(leerPropiedadObligatoria(properties,"server.port"));

        ArrayList<ClienteHilo> clienteHilos = new ArrayList<>();

        try {
            ServerSocket serverSocket = new ServerSocket(puerto);
            int numCliente = 1;
            while (true) {
                Socket socket = serverSocket.accept();

                ClienteHilo clienteHilo = new ClienteHilo("Cliente"+numCliente,socket);
                numCliente++;
                clienteHilos.add(clienteHilo);
                clienteHilo.start();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

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
