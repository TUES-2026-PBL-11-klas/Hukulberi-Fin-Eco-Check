export class AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  createdAt: Date;
}
