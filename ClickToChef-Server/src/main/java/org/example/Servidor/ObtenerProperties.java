package org.example.Servidor;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

//Leer un parametro del  fichero de configuración
public class ObtenerProperties {
    public static String obtenerParametro(String parametro){
        Properties properties = new Properties();
        try (FileInputStream fis = new FileInputStream("config.properties")) {
            properties.load(fis);

            String valor = properties.getProperty(parametro);

            return valor;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}