package org.example.Servidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Properties;
import java.util.concurrent.CopyOnWriteArrayList;

public class Servidor {
    // Se debe usar un CopyOnWriteArrayList para almacenar todos los clientes. Si mientras se recorre un Arraylist se elimina un cliente del arraylist ocurrira una excepción.
    private static final CopyOnWriteArrayList<ClienteHilo> clienteHilos = new CopyOnWriteArrayList<>();

    public static void server(){
        int puerto = Integer.parseInt(ObtenerProperties.obtenerParametro("server.port"));

        try {
            ServerSocket serverSocket = new ServerSocket(puerto);
            System.out.println("ServerSocket iniciado en el puerto: " + puerto);
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

    //Enviar un mensaje a todos los clientes tanto WebSocket con ServerSocket
    public static void broadcast(String json) {
        System.out.println(">>> BROADCAST: Enviando actualización a " + clienteHilos.size() + " clientes TCP.");
        
        // Broadcast a clientes TCP
        for (ClienteHilo cliente : clienteHilos) {
            cliente.sendMessage(json);
        }
        
        // Broadcast a clientes WebSocket
        WebSocketServidor.broadcastGlobal(json);
    }

    //Elimina el hilo de la lista
    public static void removeCliente(ClienteHilo cliente) {
        clienteHilos.remove(cliente);
    }
}
