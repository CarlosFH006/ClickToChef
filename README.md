# 🍽️ ClickToChef: Kitchen Display System

[cite_start]Este proyecto consiste en una plataforma integral diseñada para digitalizar y agilizar la comunicación entre la sala y la cocina en el sector de la hostelería[cite: 4]. [cite_start]El sistema elimina el uso de papel, minimiza errores humanos y optimiza los tiempos de servicio mediante una sincronización instantánea y bidireccional[cite: 7, 20].

## 🎯 Objetivo del Sistema
* [cite_start]**Para Camareros:** Permite introducir comandas desde un dispositivo móvil que aparecen instantáneamente en la cocina[cite: 5].
* [cite_start]**Para Cocina:** Panel web para actualizar el estado de los platos (ej. "en preparación", "listo")[cite: 6].
* [cite_start]**Notificaciones:** El camarero recibe alertas en tiempo real cuando un plato está terminado[cite: 6, 21].

## 🛠️ Estructura Técnica y Stack
[cite_start]El sistema sigue una arquitectura **Cliente-Servidor** dividida en[cite: 9]:

1.  [cite_start]**Backend (Java):** Aplicación central que procesa la lógica de negocio y distribuye mensajes[cite: 10].
2.  [cite_start]**App Móvil (React Native):** Interfaz nativa rápida e intuitiva para que el camarero tome pedidos a pie de mesa[cite: 25, 28].
3.  [cite_start]**Interfaz Web (HTML/CSS/JS/Tailwind):** Pantallas responsive para el personal de cocina[cite: 9].
4.  [cite_start]**Base de Datos (MySQL):** Almacenamiento persistente para menús, mesas y registros históricos[cite: 22, 23].
5.  [cite_start]**ERP (Odoo):** Integración automatizada para la generación de tickets (TPV) y control de inventario[cite: 15, 18].
