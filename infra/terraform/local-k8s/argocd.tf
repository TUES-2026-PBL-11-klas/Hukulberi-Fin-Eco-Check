resource "kubernetes_namespace_v1" "argocd" {
  count = var.enable_argocd ? 1 : 0

  metadata {
    name   = var.argocd_namespace
    labels = var.common_labels
  }
}

resource "helm_release" "argocd" {
  count = var.enable_argocd ? 1 : 0

  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.argocd_chart_version != "" ? var.argocd_chart_version : null
  namespace  = kubernetes_namespace_v1.argocd[0].metadata[0].name

  create_namespace = false
  timeout          = 600
  atomic           = true

  values = [
    yamlencode({
      fullnameOverride = "argocd"
      configs = {
        params = {
          "server.insecure" = tostring(var.argocd_server_insecure)
        }
      }
      server = {
        service = {
          type = var.argocd_server_service_type
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace_v1.argocd]
}
