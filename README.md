# SpinBooking Web

SpinBooking Web es el frontend de la plataforma SpinBooking, construido con **Next.js** y **React**. Proporciona la interfaz de usuario para la gestión de reservas, pagos y perfiles de usuarios.

## 🚀 Tecnologías Principales

- **Meta-Framework:** Next.js (App Router)
- **Biblioteca UI:** React
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Gestión de Estado/Datos:** React Query
- **Formularios y Validación:** React Hook Form + Zod
- **Componentes Base:** Radix UI / shadcn/ui
- **Pruebas E2E:** Playwright

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:

- **Node.js:** v22 o superior
- **Gestor de paquetes:** pnpm (`corepack enable`)

## 💻 Configuración de Desarrollo

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd SpinBooking-web
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar el entorno:**
   Copia el archivo `.env.example` a `.env.local` y completa las variables de entorno necesarias (URL de la API, claves públicas de MercadoPago, etc).
   ```bash
   cp .env.example .env.local
   ```

4. **Iniciar en modo desarrollo:**
   El servidor de desarrollo correrá en el puerto `3001` de manera predeterminada.
   ```bash
   pnpm dev
   ```

## 📜 Scripts Disponibles

- `pnpm dev`: Inicia la aplicación en modo desarrollo (utiliza puerto 3001).
- `pnpm build`: Compila la aplicación para producción (optimización standalone).
- `pnpm start`: Inicia la aplicación compilada (utiliza puerto 3001).
- `pnpm lint`: Ejecuta el linter (ESLint).
- `pnpm clean`: Elimina los directorios de compilación y caché (`.next`, `out`, etc).
- `pnpm test:e2e`: Ejecuta las pruebas end-to-end con Playwright.

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` optimizado para entornos de producción como **EasyPanel**, configurado bajo el modelo **standalone** de Next.js.

### Construir la imagen
```bash
docker build -t spinbooking-web .
```

### Ejecutar el contenedor
```bash
docker run -d \
  --name spinbooking-web \
  -p 3000:3000 \
  --env-file .env.local \
  spinbooking-web
```

> [!IMPORTANT]
> El contenedor usa por defecto el puerto `3000` internamente (configurable vía `PORT`). EasyPanel inyecta esta variable de entorno de forma automática y hace proxy hacia él.

## 🔍 Salud y Monitoreo

El contenedor de Docker incluye una instrucción `HEALTHCHECK` que hace un ping HTTP al puerto interno para detectar exactamente cuándo Next.js ha arrancado en modo standalone.
Esto asegura que la plataforma (como EasyPanel) no enrute tráfico al contenedor antes de que esté verdaderamente listo, previniendo errores "Bad Gateway" (502) durante las actualizaciones (Zero-Downtime Deployments).

---

### Notas de Producción
- Esta aplicación puede requerir inyección de variables de entorno al momento de compilar (`pnpm build`) si dichas variables son utilizadas en el prefijo `NEXT_PUBLIC_`. Otras variables solo-servidor pueden inyectarse únicamente en tiempo de ejecución.
