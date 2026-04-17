# EcoCheck Infrastructure Diagram

```mermaid
flowchart LR
  Dev[Developer Push to dev/main] --> GH[GitHub Actions CI/CD]
  GH --> DH[(Docker Hub Images)]
  GH --> Repo[(Git Repository\ninfra/k8s manifests)]

  Repo --> Argo[Argo CD\nargocd namespace]
  Argo --> K8s[Kubernetes Cluster\nlocal docker-desktop]

  subgraph NS[Namespace ecocheck]
    FE[Frontend Deployment + Service]
    BE[Backend Deployment + Service]
    PR[Prometheus]
    GF[Grafana]
    AM[Alertmanager]
    IN[Ingress Traefik]
  end

  K8s --> NS

  IN --> FE
  IN --> BE
  IN --> GF
  IN --> AM

  BE --> DB[(Supabase PostgreSQL)]
  BE --> GM[(Gemini API)]

  PR --> BE
  PR --> AM
  GF --> PR

  SE[Manual bootstrap secret\nbackend-secret] --> K8s

  GH --> WB[Discord Webhooks]
  AM --> WB
```

## Notes

- CI/CD updates image tags in GitOps manifests and pushes to the repository.
- Argo CD reconciles manifests into the active Kubernetes cluster.
- Runtime app secret `backend-secret` is intentionally bootstrapped in-cluster for local environment.
- Alerting is implemented via Prometheus rules + Alertmanager webhook receiver.
