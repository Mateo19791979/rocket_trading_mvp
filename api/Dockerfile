# Multi-stage build pour optimiser la taille
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S api -u 1001

WORKDIR /app

# Copie des dépendances depuis le builder
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules

# Copie du code source
COPY --chown=api:nodejs . .

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Health check pour Docker et Traefik
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) \
  }).on('error', () => { process.exit(1) })"

# Exposition du port
EXPOSE 3000

# Passage à l'utilisateur non-root
USER api

# Commande de démarrage
CMD ["node", "server/index.js"]