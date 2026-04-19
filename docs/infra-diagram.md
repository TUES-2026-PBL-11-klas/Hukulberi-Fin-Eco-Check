# Инфраструктурна диаграма

### CI/CD + Runtime инфраструктура

~~~mermaid
flowchart TB
  DEV[Git Push or PR] --> CI[GitHub Actions CI\nLint Tests Build]
  CI --> CD[GitHub Actions CD\nBuild Push images and update kustomization]
  CD --> GITOPS[Git repo infra k8s]
  GITOPS --> ARGO[ArgoCD Application]
  ARGO --> K8S[Kubernetes Namespace ecocheck]

  subgraph K8S_CLUSTER[Cluster Services]
    FEDEP[Deployment frontend]
    BEDEP[Deployment backend]
    FESVC[Service frontend:3000]
    BESVC[Service backend:3000]
    ING[Ingress\napp/api/grafana/alerts hosts]

    PROM[Prometheus]
    GRAF[Grafana]
    ALERT[Alertmanager]
    SECRET[Secret backend-secret]
  end

  K8S --> FEDEP
  K8S --> BEDEP
  FEDEP --> FESVC
  BEDEP --> BESVC
  FESVC --> ING
  BESVC --> ING

  BEDEP --> PROM
  PROM --> GRAF
  PROM --> ALERT

  SECRET --> BEDEP
~~~
