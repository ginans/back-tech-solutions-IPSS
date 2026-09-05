# Tech Solutions — Backend API (Gestión de Proyectos)

API backend del sistema de gestión de proyectos para la empresa ficticia **Tech Solutions**, desarrollada con fines académicos para el **Instituto Profesional IPSS** como parte de la **Evaluación Sumativa de la Unidad Nº 3** de la asignatura **Desarrollo de Software Web I — Sección 51**.

| | |
| :--- | :--- |
| **Desarrolladora** | Gina Norambuena Sánchez |
| **Docente** | Boris Belmar |
| **Asignatura** | Desarrollo de Software Web I — Sección 51 |
| **Institución** | Instituto Profesional IPSS |

Este repositorio contiene el **backend**. El frontend (Next.js 15) se encuentra en `front-tech-solutions-IPSS`.

---

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura](#arquitectura)
- [Justificación de tecnologías](#justificación-de-tecnologías)
- [Documentación interactiva (Swagger)](#documentación-interactiva-swagger)
- [Endpoints](#endpoints)
- [Pruebas](#pruebas)
- [Capturas de pantalla](#capturas-de-pantalla)

---

## Características

- **Registro de usuarios** con contraseña cifrada mediante **bcrypt**.
- **Inicio de sesión** que retorna un **JWT** firmado.
- **Autenticación por JWT** en las rutas protegidas (`JwtAuthGuard` + passport-jwt).
- **CRUD de proyectos** (crear, listar, actualizar, eliminar) asociados al usuario autenticado (`created_by`).
- **Validación de datos** con class-validator (mensajes en español) y `ValidationPipe` global.
- **Prisma ORM** sobre **MySQL 8** con Docker Compose.
- **Seed** con usuario demo y proyectos de datos estáticos.
- **Swagger/OpenAPI autogenerado** desde los DTOs, con exportación automática a `oas/oas.yaml`.

## Tecnologías

| Tecnología | Uso |
| :--- | :--- |
| **NestJS 11** | Framework de Node.js modular (Controller → Service → ORM) |
| **Prisma 6** | ORM y migraciones de base de datos |
| **MySQL 8** | Motor de base de datos (Docker) |
| **Passport + passport-jwt** | Estrategia de autenticación JWT |
| **bcrypt** | Cifrado de contraseñas |
| **class-validator / class-transformer** | Validación de DTOs |
| **@nestjs/swagger** | Documentación OpenAPI autogenerada |
| **Jest** | Pruebas unitarias |

## Requisitos

- **Node.js 20+**
- **Docker** (para levantar MySQL)

## Puesta en marcha

### 1. Levantar la base de datos

```bash
docker compose up -d
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno

Crear el archivo `.env` (existe `.env.example` como referencia):

```
DATABASE_URL="mysql://root:desarrollo_software_1@localhost:3306/desarrollo_software_1"
JWT_SECRET="desarrollo_software_1_secret_key"
PORT=3000
```

### 4. Generar el cliente Prisma y las tablas

```bash
npx prisma generate
npx prisma db push
```

### 5. (Opcional) Sembrar datos estáticos

```bash
npm run prisma:seed
```

### 6. Ejecutar

```bash
npm run start:dev
```

La API queda disponible en **`http://localhost:3000/api`** y la documentación en **`http://localhost:3000/docs`**.

### Comandos útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run start:dev` | Servidor de desarrollo (watch) |
| `npm run build` | Compilación de producción |
| `npm run start:prod` | Ejecutar build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm test` | Pruebas unitarias (Jest) |
| `npm run prisma:seed` | Sembrar datos de ejemplo |
| `npm run prisma:studio` | Abrir Prisma Studio |

## Variables de entorno

| Variable | Descripción |
| :--- | :--- |
| `DATABASE_URL` | Cadena de conexión a MySQL |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |
| `PORT` | Puerto del servidor (por defecto `3000`) |

## Arquitectura

```
src/
├── auth/                        # Módulo de autenticación
│   ├── auth.controller.ts       #   Rutas /auth/registro y /auth/login
│   ├── auth.service.ts          #   Lógica: bcrypt + JWT
│   ├── auth.module.ts
│   ├── jwt.strategy.ts          #   Estrategia passport-jwt
│   ├── jwt-auth.guard.ts        #   Guard que protege rutas con JWT
│   ├── current-user.decorator.ts#   Inyecta el usuario autenticado
│   ├── dto/auth.dto.ts          #   DTOs RegisterDto / LoginDto
│   └── types/auth-user.type.ts
├── projects/                    # Módulo de proyectos (CRUD)
│   ├── projects.controller.ts   #   Rutas /api/proyectos (protegidas)
│   ├── projects.service.ts      #   Lógica de negocio
│   ├── projects.module.ts
│   └── dto/project.dto.ts       #   DTOs CreateProjectDto / UpdateProjectDto
├── prisma/                      # Módulo de persistencia (PrismaService)
│   ├── prisma.module.ts
│   └── prisma.service.ts        #   Adaptador inyectable hacia MySQL
├── config/swagger/              # Configuración de documentación
│   ├── swagger.ts               #   setupSwagger(): DocumentBuilder + UI
│   └── oas-exporter.ts          #   Exporta oas/oas.yaml en cada arranque
├── app.module.ts                # Módulo raíz
└── main.ts                      # Bootstrap: CORS, prefijo /api, ValidationPipe
prisma/
├── schema.prisma                # Modelos Usuario y Proyecto
└── seed.ts                      # Usuario demo + proyectos estáticos
oas/
└── oas.yaml                     # Documento OpenAPI generado automáticamente
postman/
├── TechSolutions_Backend.postman_collection.json
└── TechSolutions_Local.postman_environment.json
```

### Flujo de datos

```
HTTP → Controller (DTO validado) → Service (lógica) → PrismaService → MySQL
```

### Flujo de autenticación

1. El usuario se registra en `/api/auth/registro`; la clave se cifra con **bcrypt** antes de persistir.
2. En `/api/auth/login` se comparan las credenciales y, si son válidas, se firma un **JWT** (expiración 8 h).
3. Las rutas de `/api/proyectos` usan `JwtAuthGuard`, que valida la firma y expiración del token; si no es válido responde **401**.
4. El usuario autenticado se inyecta en la request mediante `@CurrentUser()`, y los proyectos se filtran por su `created_by`.

## Justificación de tecnologías

- **NestJS:** framework de Node.js con arquitectura por módulos e inyección de dependencias, que permite separar controladores (HTTP), servicios (lógica) y la capa de persistencia de forma idiomática y testeable.
- **Prisma:** ORM con tipado generado a partir del esquema, lo que da seguridad en tiempo de compilación y un flujo sencillo de `schema → migrate/push → client`.
- **MySQL 8 en Docker:** base de datos relacional requerida por la evaluación, levantada en un contenedor para un entorno reproducible e independiente del sistema operativo.
- **Passport + passport-jwt:** estándar de la industria para autenticación por JWT; integrado con NestJS mediante guards y estrategias, cumpliendo el rol del "middleware de validación JWT" solicitado (ver nota en Arquitectura).
- **bcrypt:** cifrado con sal automática de las contraseñas antes de almacenarlas, cumpliendo el requisito de cifrado de datos.
- **class-validator + ValidationPipe:** validación declarativa de los DTOs en una única capa, con mensajes en español.
- **@nestjs/swagger:** documentación OpenAPI **autogenerada** desde los DTOs (plugin de compilación), sin mantenimiento manual, y exportada automáticamente a `oas/oas.yaml`.

## Documentación interactiva (Swagger)

La API expone una documentación **OpenAPI autogenerada** en:

```
http://localhost:3000/docs
```

Los esquemas de los DTOs (tipos, campos requeridos) se generan automáticamente desde los decoradores de **class-validator** gracias al plugin de `@nestjs/swagger` configurado en `nest-cli.json`. Los endpoints protegidos incluyen un botón **Authorize** para probar el JWT directamente desde la interfaz.

La especificación también se exporta automáticamente como documento YAML en `oas/oas.yaml`, generado por el servidor en cada arranque.

## Endpoints
 
| Método | Ruta | Descripción | Código HTTP | Autenticado |
| :--- | :--- | :--- | :---: | :---: |
| POST | `/api/auth/registro` | Registro de usuario (clave cifrada con bcrypt) | 201 Created | No |
| POST | `/api/auth/login` | Inicio de sesión, retorna un JWT | 200 OK | No |
| GET | `/api/proyectos` | Lista todos los proyectos (arreglo vacío si no hay registros) | 200 OK | Sí |
| GET | `/api/proyectos/:id` | Obtiene un proyecto por su ID (404 si no existe) | 200 OK | Sí |
| POST | `/api/proyectos` | Crea un proyecto en la base de datos (campos requeridos) | 201 Created | Sí |
| PATCH | `/api/proyectos/:id` | Actualización parcial de un proyecto (404 si no existe) | 200 OK | Sí |
| PUT | `/api/proyectos/:id` | Actualización completa de un proyecto (404 si no existe) | 200 OK | Sí |
| DELETE | `/api/proyectos/:id` | Elimina un proyecto (404 si no existe, respuesta vacía) | 204 No Content | Sí |

La autenticación se realiza enviando el token en el header `Authorization: Bearer <token>`.

**Credenciales de prueba** (usuario sembrado):

```
Correo: demo@techsolutions.cl
Clave:  demo123456
```

## Pruebas

Las pruebas unitarias se ejecutan con **Jest**:

```bash
npm test
```

Cubren los servicios de `AuthService` (registro, login, cifrado) y `ProjectsService` (CRUD y permisos), junto con el controlador raíz.

## Capturas de pantalla

### 1. Documentación Swagger (OpenAPI 3.0) con todos los métodos CRUD
Muestra los endpoints de autenticación y los 6 métodos del controlador de proyectos, incluyendo `PATCH`, `PUT` y `DELETE`.

![Documentación Swagger](docs/screenshots/01-swagger.png)

### 2. Actualización de proyectos vía PUT (HTTP 200 OK)
Detalle del endpoint `PUT /api/proyectos/{id}` que permite actualizar todos los campos y responde con el código 200 OK.

![Swagger PUT 200](docs/screenshots/02-swagger-put-200.png)

### 3. Eliminación de proyectos (HTTP 204 No Content)
Detalle del endpoint `DELETE /api/proyectos/{id}` con código HTTP 204 y respuesta vacía según los requisitos de la rúbrica U3.

![Swagger DELETE 204](docs/screenshots/03-swagger-delete-204.png)

### 4. Ejecución del Plan de Pruebas en Postman Runner
Pruebas automatizadas de todos los requerimientos: creación (201), búsqueda (200), actualización (200), eliminación (204 vacío), validación de campos vacíos (400) y control de no encontrados (404).

![Plan de Pruebas Postman](docs/screenshots/04-postman-runner.png)

### 5. Pruebas unitarias automatizadas (Jest)
Ejecución en consola de `npm test -- --verbose` con el 100% de suites y pruebas pasadas (12/12).

![Pruebas Unitarias Jest](docs/screenshots/05-jest-tests.png)

---

## Nota sobre el proceso de desarrollo

Este proyecto fue desarrollado con el apoyo de herramientas de inteligencia artificial (el asistente de código `opencode` basado en el modelo DeepSeek y el asistente `Gemini` de Google) para agilizar tareas de implementación, refactorización y estructuración del código, además de la redacción de esta documentación y la exploración de buenas prácticas.

El uso de estas herramientas se justifica como un **apoyo a la productividad**, no como un reemplazo del proceso de diseño: la **arquitectura general, las decisiones técnicas y de diseño, la elección de tecnologías y la dirección del proyecto fueron definidas y supervisadas en todo momento por la desarrolladora Gina Norambuena Sánchez**, quien actuó como **arquitecta principal**, validando, corrigiendo y aprobando cada cambio antes de su incorporación al repositorio.

Este esfuerzo forma parte de la formación en desarrollo de software web, donde el dominio de los conceptos y la toma de decisiones fundamentadas son el objetivo central de la evaluación.