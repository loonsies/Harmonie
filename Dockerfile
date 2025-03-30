FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./Harmonie/package*.json ./
RUN npm i -g npm@latest
RUN npm install

# Copy source code for development
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./Harmonie/ .

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./Harmonie/ .
COPY ./Harmonie/public/avatar ./public/avatar
COPY ./Harmonie/public/icons ./public/icons
COPY ./Harmonie/public/soundfonts ./public/soundfonts
# Copy worklet file for production build
RUN mkdir -p public/synthetizer && \
    cp node_modules/spessasynth_lib/synthetizer/worklet_processor.min.js public/synthetizer/
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create directories for mounted volumes with correct permissions
RUN mkdir -p /app/public/synthetizer /app/midi-cache \
    /app/public/avatar /app/public/icons /app/public/soundfonts && \
    chown -R nextjs:nodejs /app/public /app/midi-cache && \
    chmod -R 755 /app/public /app/midi-cache

# Copy default files to a separate location
COPY --chown=nextjs:nodejs ./Harmonie/public/avatar /app/defaults/avatar
COPY --chown=nextjs:nodejs ./Harmonie/public/icons /app/defaults/icons
COPY --chown=nextjs:nodejs ./Harmonie/public/soundfonts /app/defaults/soundfonts

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/public /app/public
COPY --from=builder --chown=nextjs:nodejs /app/.next /app/.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules /app/node_modules

# Copy and set up entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Set user and entrypoint
USER nextjs
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npx", "next", "start", "-p", "7474"] 