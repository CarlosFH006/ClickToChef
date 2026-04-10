package org.example;

import org.example.DAO.CategoriasDAO;
import org.example.DAO.ConexionDB;
import org.example.DAO.DetallesPedidoDAO;
import org.example.DAO.IngredientesDAO;
import org.example.DAO.MesasDAO;
import org.example.DAO.PedidosDAO;
import org.example.DAO.ProductosDAO;
import org.example.DAO.RecetasDAO;
import org.example.DAO.TicketsDAO;
import org.example.DAO.UsuariosDAO;
import org.example.DTO.Categorias;
import org.example.DTO.DetallesPedido;
import org.example.DTO.EstadoDetallePedido;
import org.example.DTO.EstadoMesa;
import org.example.DTO.EstadoPedido;
import org.example.DTO.Ingredientes;
import org.example.DTO.Mesas;
import org.example.DTO.MetodoPago;
import org.example.DTO.Pedidos;
import org.example.DTO.Productos;
import org.example.DTO.Recetas;
import org.example.DTO.RolUsuario;
import org.example.DTO.Tickets;
import org.example.DTO.Usuarios;
import org.example.Odoo.CargaInicial;
import org.example.Servidor.Servidor;

import java.sql.Timestamp;

public class Main {
    public static void main(String[] args) {
        CargaInicial.cargaInicialDatos();

        Servidor.server();

    }


}
