# Terraform Starter (Local Kubernetes)

This is a zero-cost Terraform starter for the EcoCheck project.

## What it manages

- One Kubernetes namespace (default: ecocheck-tf)
- One demo ConfigMap (optional)

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

## Cleanup

```powershell
terraform destroy
```

## Next migration steps

- Add Helm releases for ArgoCD, Prometheus, Grafana
- Add modules for app namespace and shared resources
- Move more resources from infra/k8s manifests into Terraform
