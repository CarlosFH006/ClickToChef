package org.example.Servidor;

import java.io.*;
import java.net.Socket;

public class PruebaServidor {

    public static void main(String[] args) {
        String host = "localhost";
        int puerto = 5000;

        for (int i = 1; i <= 5; i++) {
            new Thread(new ConexionCliente(i, host, puerto)).start();
        }
    }

    static class ConexionCliente implements Runnable {
        private int numeroCliente;
        private String host;
        private int puerto;

        public ConexionCliente(int numeroCliente, String host, int puerto) {
            this.numeroCliente = numeroCliente;
            this.host = host;
            this.puerto = puerto;
        }

        @Override
        public void run() {
            try {
                Socket socket = new Socket(host, puerto);
                System.out.println("Cliente " + numeroCliente + " conectado al servidor");

                PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);
                BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

                writer.println("Hola desde cliente " + numeroCliente);

                String respuesta = reader.readLine();
                System.out.println("Cliente " + numeroCliente + " recibió: " + respuesta);

                socket.close();
                System.out.println("Cliente " + numeroCliente + " desconectado");

            } catch (IOException e) {
                System.err.println("Cliente " + numeroCliente + " - Error de conexión: " + e.getMessage());
            }
        }
    }
}
