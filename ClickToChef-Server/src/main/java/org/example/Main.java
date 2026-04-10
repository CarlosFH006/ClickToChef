package org.example;

import org.example.Odoo.CargaInicial;
import org.example.Servidor.Servidor;

public class Main {
    public static void main(String[] args) {
        CargaInicial.cargaInicialDatos();

        Servidor.server();

    }


}
