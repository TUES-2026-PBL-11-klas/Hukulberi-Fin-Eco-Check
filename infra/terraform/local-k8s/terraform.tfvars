# Copy this file to terraform.tfvars and customize values if needed.

kubeconfig_path = "~/.kube/config"
# kube_context  = "docker-desktop"

# Start with a separate namespace so you can test safely.
namespace_name = "ecocheck-tf"

enable_demo_configmap = true
