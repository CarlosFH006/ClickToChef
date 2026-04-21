package org.example;

import org.example.Odoo.CargaInicial;
import org.example.Servidor.ObtenerProperties;
import org.example.Servidor.Servidor;
import org.example.Servidor.WebSocketServidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.http.WebSocket;
import java.util.Properties;

public class Main {
    public static void main(String[] args) {
        int puerto = Integer.parseInt(ObtenerProperties.obtenerParametro("webserver.port"));

        //CargaInicial.cargaInicialDatos();

        new Thread(() -> Servidor.server()).start();

        WebSocketServidor ws = new WebSocketServidor(puerto);
        ws.start();
    }
}
