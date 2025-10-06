# Panel de Control MapyWorks

Una aplicación frontend React para el panel de control administrativo de MapyWorks con autenticación JWT.

## Características

- Funcionalidad de inicio de sesión solo para administradores
- Autenticación basada en tokens JWT
- Rutas protegidas
- Panel de bienvenida con información del usuario
- Verificación de rol de administrador
- **Gestión completa de usuarios** con paginación
- Búsqueda de usuarios por nombre
- Edición de perfiles de usuario con carga de imágenes
- Eliminación de usuarios

## Configuración

1. Asegúrese de que el servidor backend esté ejecutándose en `http://localhost:3001`
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Abra [http://localhost:3000](http://localhost:3000) en su navegador

## Uso

1. Navegue a la página de inicio de sesión
2. Ingrese sus credenciales de administrador
3. Acceda al panel para ver la información del usuario y características de administrador
4. Haga clic en "Gestión de Usuarios" para acceder a la lista paginada de usuarios
5. Use la búsqueda para filtrar usuarios por nombre
6. Haga clic en "Ver Más" en cualquier usuario para editar su información o eliminarlo

## Funcionalidades de Gestión de Usuarios

### Lista de Usuarios
- **Paginación**: 5 usuarios por página, máximo 30 usuarios por carga
- **Búsqueda**: Filtrado por nombre de usuario
- **Tarjetas Simplificadas**: Cada usuario se muestra con:
  - Foto de perfil (o placeholder si no tiene)
  - Solo el nombre de usuario
  - Botón "Ver Más" para detalles completos

### Navegación
- **Navbar**: Botón "Volver al Panel" para regresar al dashboard principal
- **Dashboard**: La tarjeta "Gestión de Usuarios" es clickeable con indicador visual

### Modal de Edición
- **Edición completa**: Todos los campos del usuario son editables
- **Carga de imágenes**: Subida de fotos de perfil
- **Vista previa**: Visualización inmediata de la imagen seleccionada
- **Validación**: Verificación de datos antes de guardar

### Eliminación de Usuarios
- **Confirmación**: Diálogo de confirmación antes de eliminar
- **Eliminación permanente**: Los usuarios se eliminan completamente de la base de datos

## Integración con API

El frontend se comunica con el backend Express.js en:
- URL Base: `http://localhost:3001/api`
- Endpoint de inicio de sesión: `/api/auth/login`
- Endpoints de usuarios: `/api/admin/users`
- Autenticación: Tokens JWT almacenados en localStorage

## Estructura del Proyecto

```
src/
├── components/
│   ├── Login.js          # Componente del formulario de inicio de sesión
│   ├── Login.css         # Estilos del login
│   ├── Dashboard.js      # Componente del panel principal
│   ├── Dashboard.css     # Estilos del panel
│   ├── Users.js          # Componente de lista de usuarios
│   ├── Users.css         # Estilos de la lista de usuarios
│   ├── UserCard.js       # Componente de tarjeta de usuario (simplificada)
│   ├── UserCard.css      # Estilos de la tarjeta de usuario
│   ├── UserModal.js      # Modal de edición de usuario
│   ├── UserModal.css      # Estilos del modal
│   └── ProtectedRoute.js # Componente de protección de rutas
├── contexts/
│   └── AuthContext.js    # Gestión del estado de autenticación
├── services/
│   └── api.js           # Funciones del servicio API
└── App.js               # Componente principal de la aplicación
```

## Tecnologías Utilizadas

- **React** - Framework frontend
- **React Router** - Navegación entre páginas
- **Axios** - Cliente HTTP para API calls
- **CSS3** - Estilos con colores pastel suaves
- **JWT** - Autenticación basada en tokens
