package org.example.Servidor;

import org.java_websocket.server.WebSocketServer;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;

public class WebSocketServidor extends WebSocketServer {

    private static WebSocketServidor instance;

    public WebSocketServidor(int puerto) {
        super(new InetSocketAddress(puerto));

        //Se almacena la instancia, para usarla en el metodo estatico de broadcastGlobal
        instance=this;
    }

    //Cuando un cliente se conecta, ClientHandSake es el HTTP inicial que envia el cliente al hacer la conexión.
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("WS cliente conectado: " + conn.getRemoteSocketAddress());
    }

    //Cuando se pierde la conexión con un cliente
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("WS cliente desconectado por: "+reason+" | Codigo: "+code);
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
