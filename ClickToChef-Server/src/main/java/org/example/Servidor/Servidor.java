package org.example.Servidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Properties;
import java.util.concurrent.CopyOnWriteArrayList;

public class Servidor {
    private static final String CONFIG_PATH = "config.properties";
    
    // Se debe usar un CopyOnWriteArrayList para almacenar todos los clientes. Si mientras se recorre un Arraylist se elimina un cliente del arraylist ocurrira una excepción.
    private static final CopyOnWriteArrayList<ClienteHilo> clienteHilos = new CopyOnWriteArrayList<>();

    public static void server(){
        Properties properties = cargarConfiguracion();
        int puerto = Integer.parseInt(leerPropiedadObligatoria(properties,"server.port"));

        try {
            ServerSocket serverSocket = new ServerSocket(puerto);
            int numCliente = 1;
            while (true) {
                Socket socket = serverSocket.accept();

                ClienteHilo clienteHilo = new ClienteHilo("Cliente"+numCliente,socket);
                numCliente++;
                
                // Registramos el cliente en la lista global
                clienteHilos.add(clienteHilo);
                clienteHilo.start();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Envía un mensaje JSON a todos los clientes conectados (TCP y WebSocket).
     */
    public static void broadcast(String json) {
        System.out.println(">>> BROADCAST: Enviando actualización a " + clienteHilos.size() + " clientes TCP + WebSocket.");
        
        // Broadcast a clientes TCP
        for (ClienteHilo cliente : clienteHilos) {
            cliente.sendMessage(json);
        }
        
        // Broadcast a clientes WebSocket
        WebSocketServidor.broadcastGlobal(json);
    }

    /**
     * Elimina un cliente de la lista global (enviado por el hilo al cerrarse).
     */
    public static void removeCliente(ClienteHilo cliente) {
        clienteHilos.remove(cliente);
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
