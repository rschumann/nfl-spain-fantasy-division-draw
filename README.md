# NFL Spain Fantasy — Sorteo de Divisiones

Aplicación web minimalista y determinista para sortear los 16 equipos de la liga NFL Spain Fantasy entre cuatro divisiones equilibradas (NORTH, EAST, WEST, SOUTH).

El sorteo se bloquea atómicamente al arrancar mediante un compromiso criptográfico SHA-256 inalterable y revela una nueva asignación cada 120 segundos basada en la hora authoritative del servidor.

## Arquitectura y Principios

- **Dominio Puro:** Algoritmo determinista Fisher–Yates con stream HMAC-SHA-256 e invariantes de balance (4 equipos por división, sin duplicados ni posiciones vacías).
- **Servidor Fastify:** API de solo lectura (`/api/draw`, `/api/health`) con cabeceras `no-store` y estricto Content Security Policy.
- **Frontend Vanilla TS/HTML/CSS:** Cero dependencias de framework en UI. Renderizado seguro con `textContent`.
- **Chat de Liga Gestionado:** Firebase Auth anónimo y Firestore con reglas security deny-by-default.
- **Auditoría e Integridad:** Verificación matemática reproducible tanto en el navegador como offline mediante terminal (`shasum -a 256`).

## Scripts Disponibles

```bash
# Desarrollo
npm run dev           # Servidor de desarrollo Vite
npm run dev:server    # Servidor Fastify con autoreload

# Construcción
npm run build         # Compila cliente (dist/) y verifica servidor

# Puerta de calidad completa
npm run verify        # format:check + lint + limits + typecheck + deps:check + path check + coverage + build

# Pruebas
npm run test:coverage # Vitest con cobertura V8 (>90% lines/funcs, >85% branch)
npm run test:rules    # Suite de reglas de seguridad Firestore en emulador local
npm run test:e2e      # Suite Playwright (Desktop, Tablet, Mobile)
```

## Verificación Offline del Sorteo

Al completarse el sorteo (posición 16), el payload canónico se verifica mediante:

```bash
echo -n '<CANONICAL_PAYLOAD>' | shasum -a 256
```

El resultado coincide exactamente con el `commitmentHash` publicado al inicio del evento.
