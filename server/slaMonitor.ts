import { db } from './db';

/**
 * Background SLA Monitoring Engine (Simulates Celery/Background Worker)
 */
export class SLAMonitor {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs = 15000; // Runs every 15s

  start() {
    if (this.timer) return;
    console.log('[SLAMonitor] Background SLA Monitoring daemon started.');
    this.checkSLAs();
    this.timer = setInterval(() => this.checkSLAs(), this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[SLAMonitor] Background SLA Monitoring daemon stopped.');
    }
  }

  checkSLAs() {
    const now = Date.now();

    for (const complaint of db.complaints) {
      // Only monitor active unfinalized complaints
      const isFinal = ['VERIFIED', 'CLOSED', 'REJECTED'].includes(complaint.status);
      if (isFinal) continue;

      const createdTime = new Date(complaint.createdAt).getTime();
      const deadlineTime = new Date(complaint.sla.deadline).getTime();
      const warningTime = new Date(complaint.sla.warningTime).getTime();

      const elapsedMs = now - createdTime;
      const elapsedHours = Math.max(0, parseFloat((elapsedMs / (1000 * 60 * 60)).toFixed(1)));
      const remainingMs = deadlineTime - now;
      const remainingHours = Math.max(0, parseFloat((remainingMs / (1000 * 60 * 60)).toFixed(1)));

      complaint.sla.elapsedHours = elapsedHours;
      complaint.sla.remainingHours = remainingHours;

      // Check for SLA Breach
      if (now >= deadlineTime && !complaint.sla.isBreached && complaint.status !== 'RESOLUTION_PENDING_VERIFICATION') {
        complaint.sla.status = 'BREACHED';
        complaint.sla.isBreached = true;
        complaint.sla.breachedAt = new Date(now).toISOString();
        const oldStatus = complaint.status;
        complaint.status = 'ESCALATED';

        // Add Audit Log
        db.addAuditLog({
          complaintId: complaint.id,
          userId: 'SLA-DAEMON',
          userName: 'Automated SLA Watchdog',
          userRole: 'ADMIN',
          action: 'SLA_BREACHED_AND_ESCALATED',
          oldValue: oldStatus,
          newValue: 'ESCALATED',
          details: `Complaint SLA deadline (${complaint.sla.durationHours}h) breached. Ticket auto-escalated to Zonal Supervisor / Commissioner.`
        });

        // Add Notification for Admin & Officer
        const adminUser = db.users.find(u => u.role === 'ADMIN');
        if (adminUser) {
          db.addNotification({
            userId: adminUser.id,
            title: `SLA Breached: #${complaint.id}`,
            message: `Grievance "${complaint.title}" has exceeded SLA deadline and was escalated for commissioner intervention.`,
            type: 'ALERT',
            complaintId: complaint.id
          });
        }

        if (complaint.assignedOfficerId) {
          const officerUser = db.users.find(u => u.id === complaint.assignedOfficerId || u.name === complaint.assignedOfficerName);
          if (officerUser) {
            db.addNotification({
              userId: officerUser.id,
              title: `SLA Escalation Alert: #${complaint.id}`,
              message: `Your assigned grievance #${complaint.id} breached the SLA limit and is now in ESCALATED state.`,
              type: 'ALERT',
              complaintId: complaint.id
            });
          }
        }
      }
      // Check for SLA Warning
      else if (now >= warningTime && now < deadlineTime && complaint.sla.status === 'ON_TRACK' && complaint.status !== 'RESOLUTION_PENDING_VERIFICATION') {
        complaint.sla.status = 'WARNING';

        db.addAuditLog({
          complaintId: complaint.id,
          userId: 'SLA-DAEMON',
          userName: 'Automated SLA Watchdog',
          userRole: 'ADMIN',
          action: 'SLA_WARNING_TRIGGERED',
          oldValue: 'ON_TRACK',
          newValue: 'WARNING',
          details: `75% of SLA duration elapsed (${remainingHours} hours remaining). Priority=${complaint.priority}.`
        });

        if (complaint.assignedOfficerId) {
          const officerUser = db.users.find(u => u.id === complaint.assignedOfficerId || u.name === complaint.assignedOfficerName);
          if (officerUser) {
            db.addNotification({
              userId: officerUser.id,
              title: `SLA Warning: #${complaint.id}`,
              message: `Grievance #${complaint.id} is approaching its deadline. ${remainingHours}h remaining.`,
              type: 'WARNING',
              complaintId: complaint.id
            });
          }
        }
      }
    }
  }
}

export const slaMonitor = new SLAMonitor();
