# Схема на БД (ER диаграма)

~~~mermaid
erDiagram
  User ||--o{ Report : submits
  Report ||--o{ StatusHistory : tracks

  User {
    string id PK
    string email UK
    string password
    string displayName
    enum role
    datetime createdAt
    datetime updatedAt
  }

  Report {
    string id PK
    string userId FK
    string title
    string description
    string location
    string photoUrl
    enum status
    enum triageStatus
    enum aiCategory
    enum aiUrgency
    float aiConfidence
    string aiReasoning
    string assignedUnit
    datetime assignedAt
    datetime triagedAt
    datetime createdAt
    datetime updatedAt
  }

  StatusHistory {
    string id PK
    string reportId FK
    enum fromStatus
    enum toStatus
    string changedBy
    datetime changedAt
  }

  Config {
    string id PK
    string key UK
    string value
    string description
    datetime createdAt
    datetime updatedAt
  }

  FeatureFlag {
    string id PK
    string key UK
    boolean enabled
    string description
    datetime createdAt
    datetime updatedAt
  }

  AuditLog {
    string id PK
    string action
    string entity
    string entityId
    string oldValue
    string newValue
    string userId
    datetime createdAt
  }
~~~

## Enums

- UserRole: CITIZEN, ADMIN, DISPATCHER
- ReportStatus: NEW, IN_PROGRESS, RESOLVED
- TriageStatus: PENDING, TRIAGED, FAILED
- AiUrgency: LOW, MEDIUM, HIGH, CRITICAL
- AiCategory: WASTE, GREENERY, ROAD_INFRASTRUCTURE, ILLEGAL_PARKING, WATER_SEWER, OTHER
