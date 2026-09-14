import { prisma } from "./prisma";

export async function logAdminAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId && userId !== "SYSTEM" ? userId : null,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function logAuditAction({
  actorId,
  action,
  details,
  ipAddress,
}: {
  actorId?: string;
  targetUserId?: string;
  action: string;
  reason?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  await logAdminAudit({
    userId: actorId,
    action,
    entity: "SYSTEM",
    details: details ? JSON.stringify(details) : undefined,
    ipAddress,
  });
}
