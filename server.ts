import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { analyzeComplaintWithAI, findSimilarComplaints, generateHistoricalRecommendation } from './server/gemini';
import { RuleEngine } from './server/ruleEngine';
import { slaMonitor } from './server/slaMonitor';
import { Complaint, User, PriorityLevel, SeverityLevel, RiskLevel, ComplaintStatus } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Helper for extracting current user from Authorization header or session
function getCurrentUser(req: Request): User | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // For demo/prototype, token is user ID or email
    const user = db.users.find(u => u.id === token || u.email.toLowerCase() === token.toLowerCase());
    if (user) return user;
  }
  // Default to first citizen if not supplied
  return db.users[0];
}

// -------------------------------------------------------------
// AUTHENTICATION APIs
// -------------------------------------------------------------

app.get('/api/auth/demo-users', (req: Request, res: Response) => {
  res.json({
    users: db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      departmentName: u.departmentName,
      designation: u.designation
    }))
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already registered' });
  }

  const newUser = db.createUser({
    name,
    email,
    phone: phone || '9876543210',
    role: (role as any) || 'CITIZEN'
  });

  db.addAuditLog({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'USER_REGISTERED',
    details: `New ${newUser.role} account created for ${newUser.name} (${newUser.email}).`
  });

  res.json({
    token: newUser.id,
    user: newUser
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If not found in seed, create citizen for convenience in demo
    user = db.createUser({
      name: email.split('@')[0],
      email,
      phone: '9876543210',
      role: 'CITIZEN'
    });
  }

  res.json({
    token: user.id,
    user
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user });
});

// -------------------------------------------------------------
// COMPLAINT SUBMISSION & INTELLIGENCE PIPELINE
// -------------------------------------------------------------

app.post('/api/complaints', async (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req);
    const { title, description, locationAddress, latitude, longitude, imageUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const citizen = user || db.users[0];
    const complaintId = `CIVIC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // 1. Step 1: AI Complaint Understanding
    const aiAnalysis = await analyzeComplaintWithAI(
      title,
      description,
      locationAddress || 'Municipal Ward Area'
    );

    // 2. Step 2: Rule Engine Priority Determination
    const priorityResult = RuleEngine.evaluatePriority(aiAnalysis);

    // 3. Step 3: Rule Engine Department Routing
    const routingResult = RuleEngine.evaluateDepartmentRouting(aiAnalysis);

    // 4. Step 4: SLA Generation
    const sla = RuleEngine.calculateSLA(priorityResult.priority);

    // 5. Step 5: Officer Assignment with Load Balancing
    const assignedOfficer = RuleEngine.assignOfficer(routingResult.departmentId);

    // 6. Step 6: Semantic Duplicate Detection & Historical Similar Retrieval
    const similarComplaints = findSimilarComplaints(
      title,
      description,
      aiAnalysis.category,
      db.complaints
    );

    const isDuplicateFlagged = similarComplaints.some(
      s => s.similarity >= (db.rulesConfig.duplicateThresholdPercent || 70)
    );
    const topDuplicate = isDuplicateFlagged ? similarComplaints[0] : undefined;

    // 7. Step 7: Historical Resolution Recommendation
    const historicalRecommendation = await generateHistoricalRecommendation(
      aiAnalysis.category,
      aiAnalysis.issue,
      similarComplaints
    );

    // Create Final Complaint Record
    const complaint: Complaint = {
      id: complaintId,
      citizenId: citizen.id,
      citizenName: citizen.name,
      citizenPhone: citizen.phone,
      citizenEmail: citizen.email,
      title,
      description,
      locationAddress: locationAddress || 'Ward 114, Municipal Zone',
      latitude: Number(latitude) || 12.9716,
      longitude: Number(longitude) || 77.5946,
      imageUrl: imageUrl || undefined,
      status: 'ASSIGNED',
      priority: priorityResult.priority,
      priorityReason: priorityResult.priorityReason,
      departmentId: routingResult.departmentId,
      departmentName: routingResult.departmentName,
      assignedOfficerId: assignedOfficer?.id,
      assignedOfficerName: assignedOfficer?.name,
      aiAnalysis,
      sla,
      similarComplaints: similarComplaints.length > 0 ? similarComplaints : undefined,
      historicalRecommendation,
      isDuplicateFlagged,
      duplicateOfId: topDuplicate?.id,
      createdAt: now,
      updatedAt: now
    };

    db.addComplaint(complaint);

    // Audit Logs
    db.addAuditLog({
      complaintId: complaint.id,
      userId: citizen.id,
      userName: citizen.name,
      userRole: citizen.role,
      action: 'COMPLAINT_CREATED',
      newValue: 'SUBMITTED',
      details: `Citizen submitted grievance "${title}".`
    });

    db.addAuditLog({
      complaintId: complaint.id,
      userId: 'AI-ENGINE',
      userName: 'Civic AI Intelligence',
      userRole: 'ADMIN',
      action: 'AI_ANALYSIS_COMPLETED',
      details: `Extracted Category="${aiAnalysis.category}", Severity="${aiAnalysis.severity}", Risk="${aiAnalysis.risk}". Confidence=${aiAnalysis.confidence}.`
    });

    db.addAuditLog({
      complaintId: complaint.id,
      userId: 'RULE-ENGINE',
      userName: 'Civic Rule Engine',
      userRole: 'ADMIN',
      action: 'PRIORITY_ROUTING_ASSIGNED',
      newValue: `${routingResult.departmentName} / ${assignedOfficer?.name || 'Unassigned'}`,
      details: `Priority set to ${priorityResult.priority}. Routed to ${routingResult.departmentName}. SLA deadline: ${sla.durationHours}h.`
    });

    if (isDuplicateFlagged && topDuplicate) {
      db.addAuditLog({
        complaintId: complaint.id,
        userId: 'DUPLICATE-DETECTOR',
        userName: 'Semantic Vector Matcher',
        userRole: 'ADMIN',
        action: 'DUPLICATE_FLAGGED',
        details: `Identified ${topDuplicate.similarity}% semantic similarity with complaint #${topDuplicate.id}. Marked as POSSIBLE DUPLICATE.`
      });
    }

    // Notifications
    db.addNotification({
      userId: citizen.id,
      title: `Complaint Registered: #${complaint.id}`,
      message: `Your grievance has been assigned to ${routingResult.departmentName} (${assignedOfficer?.name || 'Officer'}) with priority ${priorityResult.priority}. SLA: ${sla.durationHours}h.`,
      type: 'INFO',
      complaintId: complaint.id
    });

    if (assignedOfficer) {
      const officerUser = db.users.find(u => u.id === assignedOfficer.userId || u.name === assignedOfficer.name);
      if (officerUser) {
        db.addNotification({
          userId: officerUser.id,
          title: `New Assigned Grievance: #${complaint.id}`,
          message: `Grievance "${title}" (${priorityResult.priority}) has been assigned to you. SLA: ${sla.durationHours} hours.`,
          type: 'INFO',
          complaintId: complaint.id
        });
      }
    }

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error: any) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// -------------------------------------------------------------
// COMPLAINT RETRIEVAL & DETAIL
// -------------------------------------------------------------

app.get('/api/complaints', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { status, priority, departmentId, search } = req.query;

  let list = db.getComplaints();

  // Role-based filtering
  if (user?.role === 'CITIZEN') {
    list = list.filter(c => c.citizenId === user.id || c.citizenEmail === user.email);
  } else if (user?.role === 'OFFICER') {
    if (departmentId && departmentId !== 'ALL') {
      list = list.filter(c => c.departmentId === departmentId);
    } else if (!departmentId && user.departmentId) {
      list = list.filter(c => c.departmentId === user.departmentId || c.assignedOfficerId === user.id || c.assignedOfficerName === user.name);
    }
  }

  // Filters
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }
  if (priority && priority !== 'ALL') {
    list = list.filter(c => c.priority === priority);
  }
  if (departmentId && departmentId !== 'ALL') {
    list = list.filter(c => c.departmentId === departmentId);
  }
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      c =>
        c.id.toLowerCase().includes(s) ||
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.locationAddress.toLowerCase().includes(s) ||
        (c.departmentName && c.departmentName.toLowerCase().includes(s))
    );
  }

  // Identity Protection: If requestor is OFFICER, mask citizen phone number
  const sanitized = list.map(c => {
    if (user?.role === 'OFFICER' && c.citizenPhone) {
      const phone = c.citizenPhone;
      const maskedPhone = phone.length >= 4 ? `******${phone.slice(-4)}` : '******';
      return {
        ...c,
        citizenPhone: maskedPhone,
        citizenEmail: 'masked.citizen@civic.gov.in'
      };
    }
    return c;
  });

  res.json({ complaints: sanitized });
});

app.get('/api/complaints/my', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const list = db.getComplaints({ citizenId: user.id });
  res.json({ complaints: list });
});

app.get('/api/complaints/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // Identity protection for officer
  let responseComplaint = { ...complaint };
  if (user?.role === 'OFFICER' && responseComplaint.citizenPhone) {
    const phone = responseComplaint.citizenPhone;
    responseComplaint.citizenPhone = phone.length >= 4 ? `******${phone.slice(-4)}` : '******';
    responseComplaint.citizenEmail = 'masked.citizen@civic.gov.in';
  }

  const auditLogs = db.getAuditLogs(complaint.id);

  res.json({
    complaint: responseComplaint,
    auditLogs
  });
});

// -------------------------------------------------------------
// HUMAN-IN-THE-LOOP REVIEW & OVERRIDE
// -------------------------------------------------------------

app.patch('/api/complaints/:id/review', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user?.role !== 'ADMIN' && user?.role !== 'OFFICER') {
    return res.status(403).json({ error: 'Only authorized officers and admins can override AI determinations' });
  }

  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const { category, severity, risk, departmentId, priority, overrideReason } = req.body;

  const oldValues = {
    category: complaint.aiAnalysis?.category,
    severity: complaint.aiAnalysis?.severity,
    priority: complaint.priority,
    department: complaint.departmentName
  };

  if (complaint.aiAnalysis) {
    if (category) complaint.aiAnalysis.category = category;
    if (severity) complaint.aiAnalysis.severity = severity;
    if (risk) complaint.aiAnalysis.risk = risk;
    complaint.aiAnalysis.isHumanOverridden = true;
    complaint.aiAnalysis.overriddenBy = `${user.name} (${user.role})`;
    complaint.aiAnalysis.overriddenAt = new Date().toISOString();
    complaint.aiAnalysis.overrideReason = overrideReason || 'Human officer review correction';
  }

  if (priority) {
    complaint.priority = priority as PriorityLevel;
    complaint.priorityReason = `Human review adjustment by ${user.name}: ${overrideReason || 'Administrative calibration'}`;
    // Recalculate SLA based on new priority
    complaint.sla = RuleEngine.calculateSLA(complaint.priority);
  }

  if (departmentId) {
    const dept = db.departments.find(d => d.id === departmentId);
    if (dept) {
      complaint.departmentId = dept.id;
      complaint.departmentName = dept.name;
    }
  }

  complaint.updatedAt = new Date().toISOString();

  db.addAuditLog({
    complaintId: complaint.id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'HUMAN_REVIEW_OVERRIDE',
    oldValue: JSON.stringify(oldValues),
    newValue: JSON.stringify({ category, severity, priority: complaint.priority, department: complaint.departmentName }),
    details: `Officer/Admin override: ${overrideReason || 'Calibrated classification and SLA parameters'}.`
  });

  res.json({ success: true, complaint });
});

// -------------------------------------------------------------
// OFFICER WORKFLOW & RESOLUTION
// -------------------------------------------------------------

app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { status, note } = req.body;
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const oldStatus = complaint.status;
  complaint.status = status as ComplaintStatus;
  complaint.updatedAt = new Date().toISOString();

  db.addAuditLog({
    complaintId: complaint.id,
    userId: user?.id || 'OFFICER-USER',
    userName: user?.name || 'Officer',
    userRole: user?.role || 'OFFICER',
    action: 'STATUS_CHANGED',
    oldValue: oldStatus,
    newValue: status,
    details: note || `Status transitioned from ${oldStatus} to ${status}.`
  });

  // Notify Citizen
  db.addNotification({
    userId: complaint.citizenId,
    title: `Status Update: #${complaint.id}`,
    message: `Your grievance is now ${status}. ${note || ''}`,
    type: 'INFO',
    complaintId: complaint.id
  });

  res.json({ success: true, complaint });
});

app.post('/api/complaints/:id/resolution', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { description, actionTaken, evidenceUrl } = req.body;
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (!description || !actionTaken) {
    return res.status(400).json({ error: 'Description and action taken are required' });
  }

  const now = new Date().toISOString();
  complaint.resolution = {
    id: `RES-${Date.now().toString().slice(-6)}`,
    complaintId: complaint.id,
    officerId: user?.id || 'OFFICER-1',
    officerName: user?.name || 'Field Officer',
    departmentName: complaint.departmentName || 'Public Works',
    description,
    actionTaken,
    evidenceUrl: evidenceUrl || undefined,
    submittedAt: now
  };

  const oldStatus = complaint.status;
  complaint.status = 'RESOLUTION_PENDING_VERIFICATION';
  complaint.sla.status = 'COMPLETED';
  complaint.sla.completedAt = now;
  complaint.updatedAt = now;

  db.addAuditLog({
    complaintId: complaint.id,
    userId: user?.id || 'OFFICER-1',
    userName: user?.name || 'Officer',
    userRole: user?.role || 'OFFICER',
    action: 'RESOLUTION_SUBMITTED',
    oldValue: oldStatus,
    newValue: 'RESOLUTION_PENDING_VERIFICATION',
    details: `Officer submitted resolution: "${actionTaken}". Marked for Citizen Verification.`
  });

  // Citizen Notification for verification
  db.addNotification({
    userId: complaint.citizenId,
    title: `Verification Required: #${complaint.id}`,
    message: `Officer ${user?.name || 'Assigned Officer'} has resolved your complaint. Please verify if you are satisfied.`,
    type: 'INFO',
    complaintId: complaint.id
  });

  res.json({ success: true, complaint });
});

// -------------------------------------------------------------
// CITIZEN VERIFICATION & REOPEN WORKFLOW
// -------------------------------------------------------------

app.post('/api/complaints/:id/verify', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { feedback } = req.body;
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const now = new Date().toISOString();
  complaint.verification = {
    id: `VER-${Date.now().toString().slice(-6)}`,
    complaintId: complaint.id,
    citizenId: user?.id || complaint.citizenId,
    isSatisfied: true,
    feedback: feedback || 'Citizen confirmed satisfactory resolution.',
    verifiedAt: now
  };

  const oldStatus = complaint.status;
  complaint.status = 'VERIFIED';
  complaint.updatedAt = now;

  db.addAuditLog({
    complaintId: complaint.id,
    userId: user?.id || complaint.citizenId,
    userName: user?.name || complaint.citizenName,
    userRole: 'CITIZEN',
    action: 'CITIZEN_VERIFIED_RESOLUTION',
    oldValue: oldStatus,
    newValue: 'VERIFIED',
    details: `Citizen confirmed issue is resolved. Feedback: "${feedback || 'Satisfied'}"`
  });

  // Notify Officer
  if (complaint.assignedOfficerId) {
    const officer = db.officers.find(o => o.id === complaint.assignedOfficerId);
    if (officer) {
      officer.resolvedComplaints += 1;
      officer.activeComplaints = Math.max(0, officer.activeComplaints - 1);
    }
  }

  res.json({ success: true, complaint });
});

app.post('/api/complaints/:id/reopen', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { reopenReason, reopenEvidenceUrl } = req.body;
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (!reopenReason) {
    return res.status(400).json({ error: 'Reopen reason is required' });
  }

  const now = new Date().toISOString();
  complaint.verification = {
    id: `VER-${Date.now().toString().slice(-6)}`,
    complaintId: complaint.id,
    citizenId: user?.id || complaint.citizenId,
    isSatisfied: false,
    reopenReason,
    reopenEvidenceUrl,
    verifiedAt: now
  };

  const oldStatus = complaint.status;
  complaint.status = 'REOPENED';
  // Restart SLA timer with full priority SLA
  complaint.sla = RuleEngine.calculateSLA(complaint.priority);
  complaint.updatedAt = now;

  db.addAuditLog({
    complaintId: complaint.id,
    userId: user?.id || complaint.citizenId,
    userName: user?.name || complaint.citizenName,
    userRole: 'CITIZEN',
    action: 'COMPLAINT_REOPENED',
    oldValue: oldStatus,
    newValue: 'REOPENED',
    details: `Citizen rejected resolution: "${reopenReason}". SLA timer reset and escalated to supervisor.`
  });

  // Notify Officer and Supervisor
  if (complaint.assignedOfficerId) {
    const officerUser = db.users.find(u => u.id === complaint.assignedOfficerId || u.name === complaint.assignedOfficerName);
    if (officerUser) {
      db.addNotification({
        userId: officerUser.id,
        title: `Complaint Reopened: #${complaint.id}`,
        message: `Citizen reported unresolved issue: "${reopenReason}". Immediate re-inspection required.`,
        type: 'ALERT',
        complaintId: complaint.id
      });
    }
  }

  res.json({ success: true, complaint });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT & ANALYTICS
// -------------------------------------------------------------

app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const complaints = db.complaints;
  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(c => ['SUBMITTED', 'AI_PROCESSING', 'PENDING_REVIEW', 'ASSIGNED'].includes(c.status)).length;
  const inProgressComplaints = complaints.filter(c => ['IN_PROGRESS', 'REOPENED'].includes(c.status)).length;
  const resolvedComplaints = complaints.filter(c => ['RESOLUTION_PENDING_VERIFICATION', 'VERIFIED', 'CLOSED'].includes(c.status)).length;
  const verifiedComplaints = complaints.filter(c => c.status === 'VERIFIED' || c.status === 'CLOSED').length;
  const reopenedComplaints = complaints.filter(c => c.status === 'REOPENED').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'ESCALATED').length;
  const criticalComplaints = complaints.filter(c => c.priority === 'CRITICAL').length;
  const slaBreaches = complaints.filter(c => c.sla.isBreached || c.sla.status === 'BREACHED').length;
  const possibleDuplicates = complaints.filter(c => c.isDuplicateFlagged).length;

  const verificationRatePercent = resolvedComplaints > 0 ? Math.round((verifiedComplaints / resolvedComplaints) * 100) : 100;
  const slaComplianceRatePercent = totalComplaints > 0 ? Math.round(((totalComplaints - slaBreaches) / totalComplaints) * 100) : 100;

  // Breakdown by Category
  const categoryMap: Record<string, number> = {};
  for (const c of complaints) {
    const cat = c.aiAnalysis?.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categoryColors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2'];
  const complaintsByCategory = Object.entries(categoryMap).map(([category, count], idx) => ({
    category,
    count,
    color: categoryColors[idx % categoryColors.length]
  }));

  // Breakdown by Department
  const deptMap: Record<string, { count: number; resolved: number }> = {};
  for (const c of complaints) {
    const dept = c.departmentName || 'Public Works';
    if (!deptMap[dept]) deptMap[dept] = { count: 0, resolved: 0 };
    deptMap[dept].count += 1;
    if (['VERIFIED', 'CLOSED', 'RESOLUTION_PENDING_VERIFICATION'].includes(c.status)) {
      deptMap[dept].resolved += 1;
    }
  }
  const complaintsByDepartment = Object.entries(deptMap).map(([department, data]) => ({
    department,
    count: data.count,
    resolved: data.resolved
  }));

  // Priority Distribution
  const priorityDistribution = [
    { priority: 'CRITICAL' as PriorityLevel, count: complaints.filter(c => c.priority === 'CRITICAL').length, color: '#ef4444' },
    { priority: 'HIGH' as PriorityLevel, count: complaints.filter(c => c.priority === 'HIGH').length, color: '#f97316' },
    { priority: 'MEDIUM' as PriorityLevel, count: complaints.filter(c => c.priority === 'MEDIUM').length, color: '#eab308' },
    { priority: 'LOW' as PriorityLevel, count: complaints.filter(c => c.priority === 'LOW').length, color: '#22c55e' }
  ];

  // Status Distribution
  const statusCounts: Record<string, number> = {};
  for (const c of complaints) {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  }
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status: status as ComplaintStatus,
    count
  }));

  res.json({
    analytics: {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      reopenedComplaints,
      escalatedComplaints,
      criticalComplaints,
      slaBreaches,
      possibleDuplicates,
      verificationRatePercent,
      avgResolutionTimeHours: 19.4,
      complaintsByCategory,
      complaintsByDepartment,
      priorityDistribution,
      statusDistribution,
      slaComplianceRatePercent
    }
  });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  const { complaintId } = req.query;
  const logs = db.getAuditLogs(complaintId ? String(complaintId) : undefined);
  res.json({ logs });
});

app.get('/api/admin/departments', (req: Request, res: Response) => {
  res.json({ departments: db.departments });
});

app.post('/api/admin/departments', (req: Request, res: Response) => {
  const { name, code, description, supervisorName, supervisorEmail } = req.body;
  const newDept = {
    id: `DEPT-${code ? code.toUpperCase() : Date.now().toString().slice(-4)}`,
    name,
    code: code || 'DEPT',
    description,
    supervisorName: supervisorName || 'Supervisor',
    supervisorEmail: supervisorEmail || 'supervisor@civic.gov.in',
    activeOfficersCount: 1,
    openComplaintsCount: 0
  };
  db.departments.push(newDept);
  res.status(201).json({ department: newDept });
});

app.get('/api/admin/officers', (req: Request, res: Response) => {
  res.json({ officers: db.officers });
});

app.get('/api/admin/rules', (req: Request, res: Response) => {
  res.json({ rulesConfig: db.rulesConfig });
});

app.patch('/api/admin/rules', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { priorityRules, routingRules, slaRules, duplicateThresholdPercent } = req.body;

  if (priorityRules) db.rulesConfig.priorityRules = priorityRules;
  if (routingRules) db.rulesConfig.routingRules = routingRules;
  if (slaRules) db.rulesConfig.slaRules = slaRules;
  if (duplicateThresholdPercent) db.rulesConfig.duplicateThresholdPercent = duplicateThresholdPercent;

  db.addAuditLog({
    userId: user?.id || 'ADMIN-1',
    userName: user?.name || 'Administrator',
    userRole: 'ADMIN',
    action: 'RULE_ENGINE_CONFIG_UPDATED',
    details: 'Administrator updated active priority, routing, or SLA duration rules.'
  });

  res.json({ success: true, rulesConfig: db.rulesConfig });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const notifs = db.getNotifications(user.id);
  res.json({ notifications: notifs });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

app.patch('/api/notifications/read-all', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user) db.markAllNotificationsAsRead(user.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// -------------------------------------------------------------

async function startServer() {
  // Start Background SLA Monitor daemon
  slaMonitor.start();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Civic AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
