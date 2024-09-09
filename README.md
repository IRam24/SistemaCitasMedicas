# Sistema de Gestión de Citas Médicas - Hospital Isidro Ayora

## Descripción
Este proyecto es un sistema de gestión de citas médicas desarrollado para el Hospital Isidro Ayora. Proporciona una plataforma integral para la administración de citas, pacientes, médicos y especialidades médicas.

## Características Principales
- Gestión de usuarios con roles (administrador, médico, paciente)
- Programación y administración de citas médicas
- Gestión de especialidades médicas
- Perfiles de médicos y pacientes
- Sistema de autenticación y autorización
- Interfaz de usuario intuitiva y responsiva

## Tecnologías Utilizadas
- Backend: Node.js con Express.js
- Base de Datos: MySQL
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Autenticación: JWT (JSON Web Tokens)

## Configuración del Proyecto
1. Clonar el repositorio
   ```
   git clone https://github.com/tu-usuario/SGA-sistemacitasmedicas-HIA.git
   cd SGA-sistemacitasmedicas-HIA
   ```

2. Instalar dependencias
   ```
   npm install
   ```

3. Configurar la base de datos
   - Crear una base de datos MySQL
   - Configurar las credenciales de la base de datos en `src/config/database.js`

4. Iniciar el servidor
   ```
   npm start
   ```

## Estructura del Proyecto
- `src/`: Código fuente del proyecto
  - `controllers/`: Lógica de negocio
  - `routes/`: Definición de rutas API
  - `models/`: Modelos de datos
  - `middleware/`: Middlewares de Express
  - `config/`: Archivos de configuración
- `funcionalidad-styles/`: Archivos estáticos (CSS)
- `views/`: Plantillas HTML

## Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios importantes antes de crear un pull request.

## Contacto
Ivan Ramirez - Ing. Informático de la Universidad Técnica Particular de Loja.
