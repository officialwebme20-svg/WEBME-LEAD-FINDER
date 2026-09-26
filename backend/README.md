# Web Me Lead Finder

This is the first runnable implementation of the uploaded Web Me Lead Finder specification.

## Run

1. Install Node.js 20+.
2. Open a terminal in `backend/`.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add provider credentials.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Provider configuration

The app deliberately does not fabricate data.

- `GOOGLE_PLACES_API_KEY` enables real structured entity discovery.
- `GOOGLE_CUSTOM_SEARCH_API_KEY` + `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` enable deeper public-web research.
- `GROQ_API_KEY` enables Web Me AI.
- `CURRENCY_API_URL` enables live conversion. The included default uses Frankfurter's public endpoint for supported currencies.

Google Maps JavaScript is intentionally represented as an unavailable state until a restricted browser key and map loader are configured.

## Security notes

Website research only accepts HTTP/HTTPS and rejects obvious local/private network targets. Production deployment should add a complete SSRF/IP-resolution policy, authentication, PostgreSQL persistence, audit logging, stronger request validation and provider-specific quota controls.

## Current scope

The frontend shell, responsive views, country selector, real-provider search path, truthful unavailable states, entity details drawer, research pipeline skeleton, website inspection, opportunity brief, local saved leads, pricing calculator, live currency route, Web Me route, exports, themes and backend health endpoint are included.

The remaining production-hardening work is deliberately left explicit rather than hidden behind fake data.
