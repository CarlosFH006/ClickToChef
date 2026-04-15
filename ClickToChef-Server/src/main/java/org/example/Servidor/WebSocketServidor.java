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

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        clientes.add(conn);
        System.out.println("WS cliente conectado: " + conn.getRemoteSocketAddress());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        clientes.remove(conn);
        System.out.println("WS cliente desconectado");
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println("WS mensaje: " + message);

        // 👉 reutilizas tu lógica
        WebSocketHandler.process(conn, message);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
    }

    @Override
    public void onStart() {

    }

    public static void broadcastGlobal(String msg) {
        if (instance != null) {
            instance.broadcast(msg);
        }
    }
}
