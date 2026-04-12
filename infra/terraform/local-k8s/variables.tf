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
