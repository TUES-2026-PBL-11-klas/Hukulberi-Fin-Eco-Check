# Terraform Starter (Local Kubernetes)

This is a zero-cost Terraform starter for the EcoCheck project.

## What it manages

- One Kubernetes namespace (default: ecocheck-tf)
- One demo ConfigMap (optional)
- Optional monitoring stack via Helm (kube-prometheus-stack)
- Optional provisioned Grafana datasource and dashboard for EcoCheck backend metrics
- Optional ArgoCD stack via Helm (argo-cd)

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

Legacy Prometheus and Grafana resources were removed from Kustomize to avoid duplicate monitoring stacks.
Keep monitoring lifecycle in Terraform from now on.

## Enable ArgoCD stack

1. In terraform.tfvars set:

```hcl
enable_argocd              = true
argocd_namespace           = "argocd"
argocd_chart_version       = ""
argocd_server_service_type = "ClusterIP"
argocd_server_insecure     = true
```

2. Apply:

```powershell
terraform plan -out plan.tfplan
terraform apply plan.tfplan
```

3. Verify ArgoCD resources:

```powershell
kubectl -n argocd get pods
kubectl -n argocd get svc
```

4. Open ArgoCD UI:

```powershell
kubectl -n argocd port-forward svc/argocd-server 8085:80
```

Then open http://localhost:8085.

5. Read initial admin password:

```powershell
$b64 = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}'
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
```

Login user is admin.

## Cleanup

```powershell
terraform destroy
```

## Next migration steps

- Add Terraform-managed ArgoCD Application for EcoCheck repo sync
- Add modules for app namespace and shared resources
- Move more resources from infra/k8s manifests into Terraform
