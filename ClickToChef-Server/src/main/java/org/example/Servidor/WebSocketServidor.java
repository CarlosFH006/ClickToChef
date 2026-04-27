package org.example.Servidor;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;
import java.util.concurrent.CopyOnWriteArrayList;

public class WebSocketServidor extends WebSocketServer {

    private static final CopyOnWriteArrayList<WebSocket> clientes = new CopyOnWriteArrayList<>();
    private static WebSocketServidor instance;

    public WebSocketServidor(int puerto) {
        super(new InetSocketAddress(puerto));
        instance=this;
    }

    //Cuando un cliente se conecta
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        clientes.add(conn);
        System.out.println("WS cliente conectado: " + conn.getRemoteSocketAddress());
    }

    //Cuando se pierde la conexión con un cliente
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        clientes.remove(conn);
        System.out.println("WS cliente desconectado");
    }

    //Recibir mensaje de un cliente
    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println("WS mensaje: " + message);

        WebSocketHandler.process(conn, message);
    }

    //Fallo en la conexión
    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
    }

    //Al iniciar el servidor
    @Override
    public void onStart() {
        System.out.println("WebSocketServer iniciado en el puerto: "+getPort());
    }

    //Enviar broadcast a todos los clientes
    public static void broadcastGlobal(String msg) {
        if (instance != null) {
            instance.broadcast(msg);
        }
    }
}
