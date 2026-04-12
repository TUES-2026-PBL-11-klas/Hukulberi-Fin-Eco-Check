output "namespace_name" {
  description = "Kubernetes namespace managed by Terraform"
  value       = kubernetes_namespace_v1.ecocheck.metadata[0].name
}

output "demo_configmap_name" {
  description = "Name of demo ConfigMap when enabled"
  value       = var.enable_demo_configmap ? kubernetes_config_map_v1.starter[0].metadata[0].name : null
}

output "monitoring_namespace" {
  description = "Monitoring namespace when stack is enabled"
  value       = var.enable_monitoring_stack ? kubernetes_namespace_v1.monitoring[0].metadata[0].name : null
}

output "grafana_service_name" {
  description = "Grafana service name from kube-prometheus-stack when enabled"
  value       = var.enable_monitoring_stack ? "kube-prometheus-stack-grafana" : null
}

output "prometheus_service_name" {
  description = "Prometheus service name from kube-prometheus-stack when enabled"
  value       = var.enable_monitoring_stack ? "kube-prometheus-stack-prometheus" : null
}

output "argocd_namespace" {
  description = "ArgoCD namespace when enabled"
  value       = var.enable_argocd ? kubernetes_namespace_v1.argocd[0].metadata[0].name : null
}

output "argocd_server_service_name" {
  description = "ArgoCD server service name when enabled"
  value       = var.enable_argocd ? "argocd-server" : null
}

output "argocd_initial_admin_secret_name" {
  description = "Initial ArgoCD admin password secret name when enabled"
  value       = var.enable_argocd ? "argocd-initial-admin-secret" : null
}
