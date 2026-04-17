# Secrets Management (Local Kubernetes)

## Decision

For local cluster setup, runtime application secrets are managed by an in-cluster Kubernetes Secret (`backend-secret`) and bootstrapped via a standard script.

Pipeline-level credentials are managed in GitHub Secrets.

## GitHub Secrets (CI/CD)

Required:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DISCORD_WEBHOOK_URL`

## Runtime Secrets (local cluster)

Never commit real values to Git. Use this script:

```bash
export DATABASE_URL='postgresql://...'
export DIRECT_URL='postgresql://...'
export JWT_SECRET='...'
export GEMINI_API_KEY='...'
export CORS_ORIGIN='http://app.ecocheck.local'
export NODE_ENV='production'
export PORT='3000'

./scripts/bootstrap-backend-secret.sh
```

This creates/updates `backend-secret` in namespace `ecocheck` and restarts backend rollout.

## Why this satisfies the requirement

- Clear separation of CI/CD secrets vs runtime app secrets.
- No plaintext runtime secrets stored in repository manifests.
- Repeatable and auditable bootstrap process for local environments.
