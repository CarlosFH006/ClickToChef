# 🍽️ ClickToChef: Kitchen Display System

Este proyecto consiste en una plataforma integral diseñada para digitalizar y agilizar la comunicación entre la sala y la cocina en el sector de la hostelería. El sistema elimina el uso de papel, minimiza errores humanos y optimiza los tiempos de servicio mediante una sincronización instantánea y bidireccional.

## 🎯 Objetivo del Sistema
* **Para Camareros:** Permite introducir comandas desde un dispositivo móvil que aparecen instantáneamente en la cocina.
* **Para Cocina:** Panel web para actualizar el estado de los platos (ej. "en preparación", "listo").
* **Notificaciones:** El camarero recibe alertas en tiempo real cuando un plato está terminado.

## 🛠️ Estructura Técnica y Stack
El sistema sigue una arquitectura **Cliente-Servidor** dividida en:

1.  **Backend (Java):** Aplicación central que procesa la lógica de negocio y distribuye mensajes.
2.  **App Móvil (React Native):** Interfaz nativa rápida e intuitiva para que el camarero tome pedidos a pie de mesa.
3.  **Interfaz Web (HTML/CSS/JS/Tailwind):** Pantallas responsive para el personal de cocina.
4.  **Base de Datos (MySQL):** Almacenamiento persistente para menús, mesas y registros históricos.
5.  **ERP (Odoo):** Integración automatizada para la generación de tickets (TPV) y control de inventario.
