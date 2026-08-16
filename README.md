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