# Архитектурна диаграма

~~~mermaid
graph TD
  U1[Citizen] --> FE[Frontend\nNext.js 16 + React 19]
  U2[Dispatcher] --> FE
  U3[Admin] --> FE

  FE -->|REST API / JWT| BE[Backend\nNestJS 11]
  BE -->|ORM| DB[(PostgreSQL)]
  BE -->|AI triage| AI[Google Gemini API]
  BE --> SW[Swagger\n/api/docs]

  ARGO[Argo CD] --> K8S[Kubernetes]
  K8S --> FE
  K8S --> BE
  K8S --> ING[Ingress\napp.ecocheck.local\napi.ecocheck.local]
~~~
