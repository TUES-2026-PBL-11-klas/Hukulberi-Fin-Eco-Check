variable "kubeconfig_path" {
  type        = string
  description = "Path to kubeconfig used by Terraform providers"
  default     = "~/.kube/config"
}

variable "kube_context" {
  type        = string
  description = "Optional kubeconfig context name (example: docker-desktop)"
  default     = null
}

variable "namespace_name" {
  type        = string
  description = "Namespace managed by Terraform starter"
  default     = "ecocheck-tf"
}

variable "enable_demo_configmap" {
  type        = bool
  description = "Create a demo ConfigMap to show Terraform-managed resources"
  default     = true
}

variable "common_labels" {
  type        = map(string)
  description = "Labels applied to Terraform-managed resources"
  default = {
    project    = "ecocheck"
    managed_by = "terraform"
    env        = "local"
  }
}

variable "enable_monitoring_stack" {
  type        = bool
  description = "Install Prometheus and Grafana via kube-prometheus-stack Helm chart"
  default     = false
}

variable "monitoring_namespace" {
  type        = string
  description = "Namespace where the monitoring stack is installed"
  default     = "ecocheck-monitoring"
}

variable "kube_prometheus_stack_chart_version" {
  type        = string
  description = "Helm chart version for prometheus-community/kube-prometheus-stack"
  default     = "62.7.0"
}

variable "grafana_admin_user" {
  type        = string
  description = "Grafana admin username for the Helm-installed stack"
  default     = "admin"
}

variable "grafana_admin_password" {
  type        = string
  description = "Grafana admin password for the Helm-installed stack"
  default     = "admin"
  sensitive   = true
}

variable "backend_metrics_target" {
  type        = string
  description = "Backend target scraped by Prometheus job ecocheck-backend"
  default     = "backend.ecocheck.svc.cluster.local:3000"
}

variable "enable_argocd" {
  type        = bool
  description = "Install ArgoCD via argo-cd Helm chart"
  default     = false
}

variable "argocd_namespace" {
  type        = string
  description = "Namespace where ArgoCD is installed"
  default     = "argocd"
}

variable "argocd_chart_version" {
  type        = string
  description = "Optional ArgoCD chart version. Empty string means latest available"
  default     = ""
}

variable "argocd_server_service_type" {
  type        = string
  description = "Service type for ArgoCD server"
  default     = "ClusterIP"
}

variable "argocd_server_insecure" {
  type        = bool
  description = "Set ArgoCD server.insecure parameter for easier local HTTP port-forward usage"
  default     = true
}
