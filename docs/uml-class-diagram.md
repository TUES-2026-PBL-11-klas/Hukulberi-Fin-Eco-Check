# UML Class Diagram

~~~mermaid
classDiagram
  class AuthController {
    +register(dto)
    +login(dto)
    +getMe(req)
  }

  class ReportsController {
    +create(req,dto)
    +findMy(req)
    +getStats(req)
    +findDispatcherQueue(req,query)
    +findOne(req,id)
    +updateStatus(req,id,dto)
    +assignUnit(req,id,dto)
  }

  class AdminController {
    +getStats()
    +getAuditLogs()
    +getAllConfigs()
    +updateConfig(key,dto)
    +getAllFeatureFlags()
    +updateFeatureFlag(key,dto)
  }

  class AuthService {
    +register(dto)
    +login(dto)
    +getMe(userId)
    -buildTokenResponse(id,email,role)
  }

  class ReportsService {
    +create(userId,dto)
    +findAllByUser(userId)
    +ensureDispatcherAccess(userId)
    +findDispatcherQueue(query)
    +findById(reportId)
    +updateStatus(reportId,newStatus,userId)
    +assignUnit(reportId,unit,userId)
    +suggestUnit(category)
    +getStats()
    -triageReport(reportId,dto)
    -createStatusHistory(reportId,from,to,changedBy)
  }

  class AiTriageService {
    +classify(input)
    -generateWithModel(apiKey,model,prompt)
    -heuristicFallback(input,errorText)
  }

  class AdminService {
    +getStats()
    +getAuditLogs()
    +getAllConfigs()
    +updateConfig(key,dto)
    +getAllFeatureFlags()
    +updateFeatureFlag(key,dto)
    -logAction(data)
  }

  class PrismaService
  class JwtService
  class RolesGuard
  class JwtAuthGuard

  AuthController --> AuthService
  ReportsController --> ReportsService
  AdminController --> AdminService

  AuthController ..> JwtAuthGuard
  ReportsController ..> JwtAuthGuard
  AdminController ..> RolesGuard

  AuthService --> PrismaService
  AuthService --> JwtService

  ReportsService --> PrismaService
  ReportsService --> AiTriageService

  AdminService --> PrismaService
~~~
