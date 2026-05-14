# Build Notes

## What was added

- Mounted the existing AI, social, CMS, advanced analytics, enhanced post/comment, and enhanced chatbot routers.
- Added `GET /health` for smoke tests, Docker health checks, and CI.
- Fixed chatbot model exports and chat session/message field mapping.
- Fixed bearer auth middleware so users are not rejected just because the model does not define `isActive`.
- Added `npm run syntax`, `npm test`, and `npm run verify`.
- Added Docker hardening with `npm ci`, non-root runtime, `.dockerignore`, and health checks.
- Added GitHub Actions CI with verify, production audit, Docker build, and CodeQL.
- Added Dependabot for npm and GitHub Actions.

## Known follow-ups

- `homeRoutes.js` is still not mounted because it is incomplete and would crash if required.
- `messagingRoutes` and `achievementRoutes` do not exist yet, while their UI pages exist.
- Some enhanced controllers expect richer post/comment/media/template models than the current Sequelize models expose. Those endpoints are mounted, but deeper feature testing should be done before treating them as production-ready.
- `npm audit` still reports vulnerable dependencies. Most can be addressed with `npm audit fix`; `cloudinary` may require a breaking upgrade to v2.
