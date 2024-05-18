# Descripción del Proyecto

Este repositorio contiene el código para una innovadora red social inspirada en Twitter, diseñada para proporcionar una experiencia interactiva y conectiva para los usuarios.

## Funcionalidades Principales:

- **Home:** En la página principal, el usuario tiene acceso a un feed personalizado que muestra las publicaciones de los usuarios a los que sigue y sus propias publicaciones. Además, el usuario puede alternar entre este feed personalizado ("My Feed") y un feed global ("Explore"), que muestra las publicaciones de todos los usuarios de la plataforma, facilitando así el descubrimiento de nuevo contenido y la conexión con otros usuarios.

  En ambos feeds, los usuarios pueden interactuar con las publicaciones mediante "likes". Al hacer clic en una publicación, se despliega una vista detallada donde se pueden ver todos los likes y comentarios. En esta vista detallada, los usuarios pueden agregar y eliminar sus propios comentarios y publicaciones, así como visitar los perfiles de los autores de las publicaciones y comentarios.

- **Search:** Una funcionalidad de búsqueda para encontrar y seguir a otros usuarios dentro de la plataforma.

- **Profile:** Una página de perfil donde se muestran las publicaciones propias del usuario, así como la lista de seguidores y seguidos. Desde aquí, los usuarios pueden gestionar sus conexiones y ver sus actividades en la plataforma.

## Signup y Login:

- **Singup:** Los usuarios pueden registrarse de manera sencilla proporcionando su información básica.
- **Login:** Una vez registrados, los usuarios pueden iniciar sesión de forma segura para acceder a todas las funcionalidades de la plataforma.

## Tecnologías Utilizadas:

### Frontend:

- **React:** Utilizado para construir una interfaz de usuario dinámica y responsiva.
- **HTML y CSS:** Para la estructura y el estilo de la página web.

### Backend:

- **Flask:** Un framework de microservicio en Python utilizado para manejar las solicitudes HTTP y facilitar el desarrollo de la lógica de aplicación.
- **SQLAlchemy:** Para la gestión de la base de datos y el ORM (Object-Relational Mapping).
- **JWT (JSON Web Tokens):** Para la autenticación y autorización de usuarios.
- **Argon2:** Utilizado para el hashing de contraseñas, proporcionando una capa adicional de seguridad.

### Base de Datos:

- **PostgreSQL:** Utilizado para el almacenamiento de datos de la aplicación, gestionando las relaciones entre usuarios, publicaciones, comentarios y likes.

## Desarrollado por

[Rodrigo Barrera](https://github.com/rod-barrera)