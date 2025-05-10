# Sistema de Gestión de Farmacia

## Descripción
Sistema de gestión para una farmacia que implementa autenticación JWT y operaciones CRUD para medicamentos y tipos de medicamentos. La aplicación cuenta con control de acceso basado en roles.

## Tecnologías Utilizadas
- **Backend**: Node.js, Express
- **Base de Datos**: SQLite con Sequelize ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap

## Roles de Usuario
El sistema soporta tres roles de usuario con diferentes niveles de acceso:
- **Administrador**: Acceso completo (CRUD)
- **Moderador**: Puede crear y leer registros
- **Usuario**: Solo lectura de datos

## Estructura de la Base de Datos
- **Tabla TipoMedic**: 
  - `CodTipoMed` (PK)
  - `descripcion`

- **Tabla Medicamento**:
  - `CodMedicamento` (PK)
  - `descripcionMed`
  - `fechaFabricacion`
  - `fechaVencimiento`
  - `presentacion`
  - `stock`
  - `precioVentaUni`
  - `precioVentaPres`
  - `marca`
  - `CodTipoMed` (FK → TipoMedic)

## Instalación y Ejecución

### Requisitos Previos
- Node.js (v14 o superior)
- npm (v6 o superior)

### Pasos de Instalación
1. Clonar el repositorio o descargar los archivos
2. Navegar al directorio del proyecto
3. Instalar dependencias:
```
npm install
```
4. Iniciar la aplicación:
```
npm start
```
5. Para desarrollo (con recarga automática):
```
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## API Endpoints

### Autenticación
- `POST /api/auth/signup`: Registro de usuario
- `POST /api/auth/signin`: Inicio de sesión
- `POST /api/auth/signout`: Cierre de sesión

### Tipos de Medicamentos
- `GET /api/tipo-medic`: Obtener todos los tipos de medicamentos
- `GET /api/tipo-medic/:id`: Obtener un tipo de medicamento por ID
- `POST /api/tipo-medic`: Crear un nuevo tipo de medicamento (Moderador, Admin)
- `PUT /api/tipo-medic/:id`: Actualizar un tipo de medicamento (Admin)
- `DELETE /api/tipo-medic/:id`: Eliminar un tipo de medicamento (Admin)

### Medicamentos
- `GET /api/medicamentos`: Obtener todos los medicamentos
- `GET /api/medicamentos/:id`: Obtener un medicamento por ID
- `POST /api/medicamentos`: Crear un nuevo medicamento (Moderador, Admin)
- `PUT /api/medicamentos/:id`: Actualizar un medicamento (Admin)
- `DELETE /api/medicamentos/:id`: Eliminar un medicamento (Admin)

## Credenciales por Defecto

Para facilitar las pruebas, el sistema crea automáticamente tres usuarios con diferentes roles:

- **Administrador**:
  - Usuario: admin
  - Contraseña: admin123
  
- **Moderador**:
  - Usuario: moderator
  - Contraseña: mod123
  
- **Usuario básico**:
  - Usuario: user
  - Contraseña: user123

## Licencia
ISC
