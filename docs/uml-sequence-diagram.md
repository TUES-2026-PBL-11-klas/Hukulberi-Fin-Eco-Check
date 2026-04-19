# UML Sequence Diagram

## Подаване на сигнал + AI triage

~~~mermaid
sequenceDiagram
  actor Citizen
  participant FE as Frontend
  participant RC as ReportsController
  participant RS as ReportsService
  participant DB as PostgreSQL (via Prisma)
  participant AI as Gemini API

  Citizen->>FE: Попълва form за сигнал
  FE->>RC: POST /reports (JWT)
  RC->>RS: create(userId, dto)
  RS->>DB: insert Report(status=NEW, triage=PENDING)
  RS->>DB: insert StatusHistory(toStatus=NEW)

  RS->>AI: classify(title,description,location)
  alt AI success
    AI-->>RS: category, urgency, confidence, reasoning
    RS->>DB: update Report(triage=TRIAGED, ai*)
  else AI fail or quota
    AI-->>RS: error
    RS->>DB: update Report(triage=FAILED, reasoning)
  end

  RS-->>RC: report detail
  RC-->>FE: 201 Created + report payload
~~~
