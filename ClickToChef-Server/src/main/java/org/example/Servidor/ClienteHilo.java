package org.example.Servidor;

import java.io.*;
import java.net.Socket;

public class ClienteHilo extends Thread {
    private Socket socket;

    public ClienteHilo(String name, Socket socket) {
        super(name);
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);

            System.out.println(getName() + " conectado desde " + socket.getInetAddress());

            String mensaje;
            while ((mensaje = reader.readLine()) != null) {
                System.out.println(getName() + " recibió: " + mensaje);
                writer.println("Servidor respondió a: " + mensaje);
            }

            System.out.println(getName() + " desconectado");
            socket.close();

        } catch (IOException e) {
            System.err.println(getName() + " - Error: " + e.getMessage());
        }
    }
}
