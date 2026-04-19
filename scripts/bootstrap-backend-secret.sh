#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-ecocheck}"

required_vars=(
  DATABASE_URL
  DIRECT_URL
  JWT_SECRET
  GEMINI_API_KEY
  CORS_ORIGIN
  NODE_ENV
  PORT
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "[error] Missing required env var: $var" >&2
    exit 1
  fi
done

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic backend-secret \
  --namespace "$NAMESPACE" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=DIRECT_URL="$DIRECT_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=GEMINI_API_KEY="$GEMINI_API_KEY" \
  --from-literal=CORS_ORIGIN="$CORS_ORIGIN" \
  --from-literal=NODE_ENV="$NODE_ENV" \
  --from-literal=PORT="$PORT" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "[ok] backend-secret applied in namespace '$NAMESPACE'"

if kubectl get deployment backend -n "$NAMESPACE" >/dev/null 2>&1; then
  kubectl rollout restart deployment/backend -n "$NAMESPACE"
  kubectl rollout status deployment/backend -n "$NAMESPACE" --timeout=180s
fi
