resource "kubernetes_namespace_v1" "monitoring" {
  count = var.enable_monitoring_stack ? 1 : 0

  metadata {
    name   = var.monitoring_namespace
    labels = var.common_labels
  }
}

resource "helm_release" "kube_prometheus_stack" {
  count = var.enable_monitoring_stack ? 1 : 0

  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = var.kube_prometheus_stack_chart_version
  namespace  = kubernetes_namespace_v1.monitoring[0].metadata[0].name

  create_namespace = false
  timeout          = 600
  atomic           = true

  values = [
    yamlencode({
      alertmanager = {
        enabled = false
      }
      defaultRules = {
        create = false
      }
      grafana = {
        adminUser                = var.grafana_admin_user
        adminPassword            = var.grafana_admin_password
        defaultDashboardsEnabled = false
        service = {
          type = "ClusterIP"
        }
        sidecar = {
          datasources = {
            enabled                  = true
            defaultDatasourceEnabled = true
            label                    = "grafana_datasource"
            labelValue               = "1"
            searchNamespace          = "ALL"
          }
          dashboards = {
            enabled         = true
            label           = "grafana_dashboard"
            labelValue      = "1"
            searchNamespace = "ALL"
            folder          = "/var/lib/grafana/dashboards/EcoCheck"
          }
        }
      }
      kubeControllerManager = {
        enabled = false
      }
      kubeEtcd = {
        enabled = false
      }
      kubeProxy = {
        enabled = false
      }
      kubeScheduler = {
        enabled = false
      }
      prometheus = {
        prometheusSpec = {
          scrapeInterval     = "15s"
          evaluationInterval = "15s"
          additionalScrapeConfigs = [
            {
              job_name     = "ecocheck-backend"
              metrics_path = "/metrics"
              static_configs = [
                {
                  targets = [var.backend_metrics_target]
                }
              ]
            }
          ]
        }
      }
    })
  ]

  depends_on = [kubernetes_namespace_v1.monitoring]
}

resource "kubernetes_config_map_v1" "grafana_datasource" {
  count = var.enable_monitoring_stack ? 1 : 0

  metadata {
    name      = "ecocheck-grafana-datasource"
    namespace = kubernetes_namespace_v1.monitoring[0].metadata[0].name
    labels = {
      grafana_datasource = "1"
    }
  }

  data = {
    "prometheus-datasource.yaml" = yamlencode({
      apiVersion = 1
      datasources = [
        {
          name      = "Prometheus"
          uid       = "prometheus"
          type      = "prometheus"
          access    = "proxy"
          url       = "http://${helm_release.kube_prometheus_stack[0].name}-prometheus.${kubernetes_namespace_v1.monitoring[0].metadata[0].name}.svc.cluster.local:9090"
          isDefault = true
          editable  = false
        }
      ]
    })
  }

  depends_on = [helm_release.kube_prometheus_stack]
}

resource "kubernetes_config_map_v1" "grafana_dashboard" {
  count = var.enable_monitoring_stack ? 1 : 0

  metadata {
    name      = "ecocheck-grafana-dashboards"
    namespace = kubernetes_namespace_v1.monitoring[0].metadata[0].name
    labels = {
      grafana_dashboard = "1"
    }
  }

  data = {
    "ecocheck-backend-overview.json" = file("${path.module}/dashboards/ecocheck-backend-overview.json")
  }

  depends_on = [helm_release.kube_prometheus_stack]
}
