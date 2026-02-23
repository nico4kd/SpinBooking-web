# ============================================
# SpinBooking Web - Dockerfile para EasyPanel
# ============================================
# Next.js standalone; usa PORT desde entorno para compatibilidad con EasyPanel.
#
# Límite Docker Hub (429): configurar login en Easypanel o usar espejo vía build-arg:
#   docker build --build-arg NODE_IMAGE=docker.m.daocloud.io/library/node:20-alpine ...
ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (output: standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app

# Usuario no-root (recomendado para EasyPanel/producción)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copiar salida standalone de Next.js (estructura en raíz del proyecto)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
# EasyPanel inyecta PORT; Next.js standalone lo usa por defecto
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Health check para que EasyPanel detecte cuando la app está lista
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000), (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server.js"]
