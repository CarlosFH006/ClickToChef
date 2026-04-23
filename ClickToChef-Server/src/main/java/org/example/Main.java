package org.example;

import org.example.DAO.ConexionDB;
import org.example.Servidor.ObtenerProperties;
import org.example.Servidor.Servidor;
import org.example.Servidor.WebSocketServidor;

public class Main {
    public static void main(String[] args){
        int puerto = Integer.parseInt(ObtenerProperties.obtenerParametro("webserver.port"));

        //CargaInicial.cargaInicialDatos();

        Thread servidorThread = new Thread(() -> Servidor.server());
        servidorThread.start();

        WebSocketServidor ws = new WebSocketServidor(puerto);
        ws.start();

        try {
            servidorThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("[Main] Servidor TCP finalizado. Cerrando conexión a la base de datos...");
        ConexionDB.cerrarConexion();
    }
}
