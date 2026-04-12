output "namespace_name" {
  description = "Kubernetes namespace managed by Terraform"
  value       = kubernetes_namespace_v1.ecocheck.metadata[0].name
}

output "demo_configmap_name" {
  description = "Name of demo ConfigMap when enabled"
  value       = var.enable_demo_configmap ? kubernetes_config_map_v1.starter[0].metadata[0].name : null
}
