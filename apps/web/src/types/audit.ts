import { User } from "./auth";

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actor: User;
  metadataJson: any;
  createdAt: string;
}
