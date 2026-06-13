# Grapholio - Portfolio Interactivo 3D

Link del proyecto: [https://sallco.github.io/grapholio/](https://sallco.github.io/grapholio/)

![Vista previa del proyecto](public/grapholio_muestra.png)

## Descripción General

Grapholio es una plataforma de visualización interactiva diseñada para presentar un perfil profesional de manera innovadora. Utilizando un entorno tridimensional basado en grafos de fuerza, el sistema organiza y conecta nodos que representan información personal, competencias técnicas y proyectos desarrollados. La arquitectura permite una exploración fluida de las relaciones entre diferentes áreas de conocimiento y la experiencia práctica del desarrollador.

## Arquitectura Técnica

El proyecto ha sido construido utilizando un stack tecnológico moderno, priorizando el rendimiento en renderizado 3D y una interfaz de usuario reactiva.

- **Frontend Core**: React 19 y Vite como entorno de desarrollo y empaquetado.
- **Visualización 3D**: Three.js para la gestión de escenas, objetos astronómicos personalizados (nodos) y efectos ambientales.
- **Motor de Grafos**: react-force-graph-3d para el cálculo de físicas y disposición de nodos en el espacio tridimensional.
- **Estilos**: Tailwind CSS 4 para la interfaz de usuario, paneles informativos y componentes de navegación.
- **Gestión de Datos**: Estructura basada en JSON para la definición declarativa de nodos y aristas del grafo.

## Características Principales

- **Navegación en Espacio 3D**: Implementación de controles de órbita que permiten rotación, zoom y desplazamiento a través de la red de información.
- **Visualización de Proyectos**: Paneles detallados que incluyen capturas de pantalla, descripción técnica, aprendizajes clave y enlaces directos a repositorios y demostraciones.
- **Entorno Espacial Dinámico**: Fondo procedimental con campos de estrellas, meteoritos, agujeros negros y estrellas de neutrones renderizados en tiempo real mediante Three.js.
- **Interfaz de Usuario Holográfica**: Componentes UI con efectos de escaneo y transparencia que mantienen la coherencia estética con el entorno astronómico.
- **Filtros y Búsqueda**: Menú lateral para acceso rápido a nodos específicos de información, tecnologías o proyectos.

## Instalación y Configuración Local

Para ejecutar el proyecto en un entorno de desarrollo local, siga los pasos a continuación:

1. Clone el repositorio:
   ```bash
   git clone https://github.com/sallco/grapholio.git
   ```

2. Acceda al directorio del proyecto:
   ```bash
   cd grapholio
   ```

3. Instale las dependencias necesarias:
   ```bash
   npm install
   ```

4. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Autor

Diego André Calderón Salazar - Estudiante de Ingeniería en Ciencias de la Computación.
Universidad del Valle de Guatemala.
