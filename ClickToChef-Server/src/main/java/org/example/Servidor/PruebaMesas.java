package org.example.Servidor;

import com.google.gson.JsonObject;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Random;

/**
 * Clase de prueba para simular múltiples clientes actualizando mesas en tiempo real.
 * Lanza 5 hilos que realizan actualizaciones aleatorias.
 */
public class PruebaMesas {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            new Thread(new SimuladorCliente(i)).start();
        }
    }

    static class SimuladorCliente implements Runnable {
        private final int idCliente;
        private final Random random = new Random();
        private final String[] estados = {"LIBRE"};

        public SimuladorCliente(int id) {
            this.idCliente = id;
        }

        @Override
        public void run() {
            try (Socket socket = new Socket("localhost", 5000);
                 PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

                System.out.println("Simulador " + idCliente + " conectado al servidor.");

                for (int i = 0; i < 10; i++) {
                    // Esperar tiempo aleatorio entre 2 y 5 segundos
                    Thread.sleep(2000 + random.nextInt(3000));

                    int idMesa = 1 + random.nextInt(6); // Supongamos que hay 6 mesas
                    String nuevoEstado = estados[random.nextInt(estados.length)];

                    JsonObject peticion = new JsonObject();
                    peticion.addProperty("type", "UPDATE_MESA_STATUS");
                    
                    JsonObject payload = new JsonObject();
                    payload.addProperty("id", idMesa);
                    payload.addProperty("estado", nuevoEstado);
                    
                    peticion.add("payload", payload);

                    out.println(peticion.toString());
                    System.out.println("Simulador " + idCliente + " cambió Mesa " + idMesa + " a " + nuevoEstado);
                }

            } catch (Exception e) {
                System.err.println("Error en Simulador " + idCliente + ": " + e.getMessage());
            }
        }
    }
}
