# Terraform Starter (Local Kubernetes)

This is a zero-cost Terraform starter for the EcoCheck project.

## What it manages

- One Kubernetes namespace (default: ecocheck-tf)
- One demo ConfigMap (optional)
- Optional monitoring stack via Helm (kube-prometheus-stack)
- Optional provisioned Grafana datasource and dashboard for EcoCheck backend metrics

## Prerequisites

- Terraform CLI installed
- Local Kubernetes cluster running (Docker Desktop Kubernetes)
- kubectl working against your local cluster

## Quick start

1. Open terminal in this folder.
2. Copy vars file:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

3. Initialize:

```powershell
terraform init
```

4. Validate and preview:

```powershell
terraform fmt -recursive
terraform validate
terraform plan -out plan.tfplan
```

5. Apply:

```powershell
terraform apply plan.tfplan
```

6. Verify:

```powershell
kubectl get ns
kubectl -n ecocheck-tf get configmap
```

## Enable monitoring stack

1. In terraform.tfvars set:

```hcl
enable_monitoring_stack = true
monitoring_namespace    = "ecocheck-monitoring"
grafana_admin_user      = "admin"
grafana_admin_password  = "admin"
backend_metrics_target  = "backend.ecocheck.svc.cluster.local:3000"
```

2. Apply:

```powershell
terraform plan -out plan.tfplan
terraform apply plan.tfplan
```

3. Verify monitoring resources:

```powershell
kubectl -n ecocheck-monitoring get pods
kubectl -n ecocheck-monitoring get svc
kubectl -n ecocheck-monitoring get configmap ecocheck-grafana-datasource
kubectl -n ecocheck-monitoring get configmap ecocheck-grafana-dashboards
```

4. Open Grafana:

```powershell
kubectl -n ecocheck-monitoring port-forward svc/kube-prometheus-stack-grafana 3100:80
```

Then open http://localhost:3100 and login with your Grafana credentials.

## Migration note

If you keep monitoring enabled in Terraform, avoid deploying the legacy monitoring manifests from infra/k8s at the same time.
The current Kustomize file still includes Prometheus and Grafana manifests, so you can end up with duplicate stacks.

## Cleanup

```powershell
terraform destroy
```

## Next migration steps

- Add Helm releases for ArgoCD and app dependencies
- Add modules for app namespace and shared resources
- Move more resources from infra/k8s manifests into Terraform
