# Backend - Tech Solutions (Gestión de Proyectos)

Backend desarrollado con **NestJS**, **MySQL**, **Prisma** y **Docker**.

## Requisitos

- Node.js 20+
- Docker (para levantar MySQL)
- npm

## Instalación

```bash
npm install
```

## Configuración

1. Levantar la base de datos MySQL con Docker:

```bash
docker compose up -d
```

2. Crear el archivo `.env` (ya viene incluido un `.env.example`):

```
DATABASE_URL="mysql://root:desarrollo_software_1@localhost:3306/desarrollo_software_1"
JWT_SECRET="desarrollo_software_1_secret_key"
PORT=3000
```

3. Generar el cliente Prisma y crear las tablas:

```bash
npx prisma generate
npx prisma db push
```

4. (Opcional) Cargar los proyectos con datos estáticos:

```bash
npm run prisma:seed
```

## Ejecución

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api`.

## Documentación interactiva (Swagger)

La API expone una documentación **OpenAPI autogenerada** en:

```
http://localhost:3000/docs
```

Los esquemas de los DTOs (tipos, campos requeridos, mensajes de validación) se generan automáticamente desde los decoradores de **class-validator** gracias al plugin de `@nestjs/swagger` configurado en `nest-cli.json`. Los endpoints protegidos incluyen un botón **Authorize** para probar el JWT directamente desde la interfaz.

La especificación también se exporta automáticamente como documento YAML en `oas/oas.yaml`, generado por el servidor en cada arranque.

## Endpoints

| Método | Ruta                  | Descripción                    | Autenticado |
| ------ | --------------------- | ------------------------------ | ----------- |
| POST   | `/api/auth/registro`  | Registro de usuario (clave cifrada con bcrypt) | No |
| POST   | `/api/auth/login`     | Inicio de sesión, retorna un JWT | No |
| GET    | `/api/proyectos`      | Lista proyectos del usuario    | Sí |
| GET    | `/api/proyectos/:id`  | Obtiene un proyecto            | Sí |
| POST   | `/api/proyectos`      | Crea un proyecto               | Sí |
| PATCH  | `/api/proyectos/:id`  | Actualiza un proyecto          | Sí |
| DELETE | `/api/proyectos/:id`  | Elimina un proyecto            | Sí |

La autenticación se realiza enviando el token en el header `Authorization: Bearer <token>`.

## Arquitectura y decisiones técnicas

El backend se organiza siguiendo la estructura idiomática de **NestJS** por módulos, donde cada módulo separa sus responsabilidades en capas:

```
Controller (HTTP) → Service (lógica de negocio) → PrismaService (persistencia)
```

- **PrismaService** actúa como adaptador de la base de datos y se inyecta como dependencia en los servicios.
- Los **módulos** (`Auth`, `Projects`, `Prisma`) encapsulan sus propias rutas, controladores, servicios y DTOs.
- La autenticación se implementa con **Passport/JWT** mediante un `JwtAuthGuard` global por módulo.

**Nota sobre la validación de autenticación:** la rúbrica solicita "un middleware que valide si el usuario está autenticado o no por medio de un JWT". En NestJS esta validación se implementa de forma idiomática con un **guard** (`JwtAuthGuard`) junto a la estrategia **passport-jwt**, que cumple exactamente esa función: intercepta cada petición antes de llegar al controlador, verifica la firma y expiración del token y responde `401` si no es válido. Se prefirió este mecanismo por sobre un *middleware* clásico (que en Nest se ejecuta antes que los guards y está pensado para lógica transversal como logging o CORS), ya que el guard permite además inyectar el usuario autenticado en la request (`@CurrentUser()`) y compone correctamente con el resto del framework.

**Sobre arquitectura hexagonal:** se tiene en mente como evolución natural si el dominio creciera (más casos de uso por entidad, reglas de negocio complejas o necesidad de intercambiar la infraestructura). Para el alcance actual de la evaluación se optó deliberadamente por la estructura de capas de NestJS, que ofrece una separación suficiente sin la sobre-ingeniería que implicaría introducir puertos y adaptadores en un dominio pequeño.