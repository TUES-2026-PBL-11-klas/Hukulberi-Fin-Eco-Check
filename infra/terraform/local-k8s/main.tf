resource "kubernetes_namespace_v1" "ecocheck" {
  metadata {
    name   = var.namespace_name
    labels = var.common_labels
  }
}

resource "kubernetes_config_map_v1" "starter" {
  count = var.enable_demo_configmap ? 1 : 0

  metadata {
    name      = "terraform-starter"
    namespace = kubernetes_namespace_v1.ecocheck.metadata[0].name
    labels    = var.common_labels
  }

  data = {
    message    = "Terraform is managing this namespace."
    next_step1 = "Add Helm releases for ArgoCD/Prometheus/Grafana."
    next_step2 = "Move more infra from manifests into Terraform modules."
  }
}
