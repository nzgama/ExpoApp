# ExpoApp — Documentación para Estudiantes

## Descripción General

**ExpoApp** es una aplicación móvil desarrollada con React Native y Expo, que implementa autenticación de usuarios, navegación entre pantallas, gestión de perfiles y notas usando Firebase como backend. El objetivo es que los estudiantes aprendan buenas prácticas de desarrollo móvil, manejo de estado global, navegación y conexión con servicios externos.

---

## Estructura del Proyecto

- **App.js**  
  Punto de entrada principal. Envuelve la app con el proveedor de autenticación y el navegador de pantallas.

- **index.js**  
  Inicializa la app para Expo.

- **Pantallas/**  
  Carpeta con las pantallas principales:
  - `HomeScreen.js`: Pantalla de bienvenida.
  - `LoginScreen.js`: Pantalla de login y registro.
  - `ProfileScreen.js`: Edición y visualización del perfil del usuario.
  - `SettingsScreen.js`: Pantalla de ajustes y logout.
  - `PantallaInicio.js`: Ejemplo de pantalla de inicio.
  - `NotesScreen.js`: Gestión de notas personales (crear, listar, marcar como completadas, eliminar y elegir color).
  
- **router/**  
  - `AppNavigator.js`: Controla la navegación principal según el estado de autenticación.
  - `TabsNavigator.js`: Navegación por pestañas entre Home, Perfil, Ajustes y Notas.

- **auth/**  
  - `AuthContext.js`: Contexto global para autenticación.
  - `useAuth.js`: Hook personalizado para consumir el contexto de autenticación.

- **config/**  
  - `Firebase.js`: Configuración y conexión a Firebase (Firestore y Auth).

- **assets/**  
  Imágenes y recursos gráficos.

---

## Principales Dependencias

- **React Native**: Framework para apps móviles multiplataforma.
- **Expo**: Herramienta para desarrollo y testing rápido.
- **Firebase**: Backend para autenticación y base de datos.
- **React Navigation**: Navegación entre pantallas y tabs.
- **expo-secure-store**: Almacenamiento seguro de tokens.

---

## Flujo de Autenticación

1. El usuario se registra o inicia sesión en `LoginScreen.js`.
2. El UID del usuario se guarda en SecureStore y se actualiza el estado global de autenticación.
3. Si el usuario está autenticado, accede a las pantallas principales (Home, Perfil, Ajustes, Notas).
4. Puede cerrar sesión desde `SettingsScreen.js`, lo que borra el token y lo regresa al login.

---

## Manejo de Perfil

- En `ProfileScreen.js`, el usuario puede:
  - Ver y editar su nombre, apellido, edad y descripción.
  - Guardar cambios (se actualiza solo lo modificado en Firestore).
  - Borrar su perfil (elimina el documento en Firestore).
- El formulario muestra mensajes de éxito o error y está comentado para facilitar el aprendizaje.

---

## Gestión de Notas

- En `NotesScreen.js`, el usuario puede:
  - Crear una nota con título, contenido y color.
  - Listar todas sus notas guardadas en Firebase.
  - Marcar una nota como completada o desmarcarla.
  - Eliminar una nota.
  - Visualizar el color de cada nota y elegirlo al crearla.
- Todo el código está comentado para que los estudiantes comprendan el flujo CRUD y la integración con Firestore.

---

## Contexto y Hooks

- **AuthContext**: Permite compartir el estado de autenticación en toda la app.
- **useAuth**: Hook para acceder fácilmente a `isAuthenticated` y `setIsAuthenticated` desde cualquier componente.

---

## Navegación

- **AppNavigator**: Decide si mostrar el login o las pantallas principales según el estado de autenticación.
- **TabsNavigator**: Permite navegar entre Home, Perfil, Ajustes y Notas usando pestañas.

---

## Buenas Prácticas

- Código comentado y organizado.
- Separación de lógica de negocio y presentación.
- Uso de hooks y contexto para estado global.
- Manejo de errores y mensajes al usuario.
- Estructura de carpetas clara y escalable.

---

## ¿Cómo seguir la evolución del proyecto?

- El repositorio puede usar ramas para cada etapa o funcionalidad.
- Se recomienda usar tags para marcar versiones importantes (por ejemplo, `v1.0`, `v2.0`).
- Los alumnos pueden comparar ramas o descargar versiones específicas para ver el avance.

---

## ¿Cómo ejecutar el proyecto?

1. Clona el repositorio.
2. Instala dependencias con `npm install` o `yarn`.
3. Configura tu archivo `config/Firebase.js` con tus credenciales de Firebase.
4. Ejecuta la app con `npm start` o `expo start`.

---

¿Dudas? ¡Consulta los comentarios en el código o pregunta a tu docente!
