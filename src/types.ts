export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'AI_PROCESSING'
  | 'PENDING_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLUTION_PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ESCALATED'
  | 'REJECTED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type SLAStatus = 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  avatar?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  supervisorName: string;
  supervisorEmail: string;
  activeOfficersCount: number;
  openComplaintsCount: number;
}

export interface Officer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  activeComplaints: number;
  resolvedComplaints: number;
  avgResolutionHours: number;
}

export interface AIAnalysis {
  issue: string;
  category: string;
  severity: SeverityLevel;
  duration_days: number;
  location_description: string;
  risk: RiskLevel;
  affected_population: string;
  department_category: string;
  reason: string;
  modelName: string;
  confidence: number;
  timestamp: string;
  isHumanOverridden?: boolean;
  overriddenBy?: string;
  overriddenAt?: string;
  overrideReason?: string;
}

export interface ComplaintSLA {
  durationHours: number;
  deadline: string;
  warningTime: string;
  escalationTime: string;
  status: SLAStatus;
  elapsedHours: number;
  remainingHours: number;
  isBreached: boolean;
  breachedAt?: string;
  completedAt?: string;
}

export interface Resolution {
  id: string;
  complaintId: string;
  officerId: string;
  officerName: string;
  departmentName: string;
  description: string;
  actionTaken: string;
  evidenceUrl?: string;
  submittedAt: string;
}

export interface CitizenVerification {
  id: string;
  complaintId: string;
  citizenId: string;
  isSatisfied: boolean;
  feedback?: string;
  reopenReason?: string;
  reopenEvidenceUrl?: string;
  verifiedAt: string;
}

export interface SimilarComplaint {
  id: string;
  title: string;
  category: string;
  similarity: number; // percentage e.g. 88
  status: ComplaintStatus;
  location: string;
  resolution?: string;
  actionTaken?: string;
  resolutionTimeHours?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  complaintId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  oldValue?: string;
  newValue?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  title: string;
  description: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  priorityReason: string;
  departmentId?: string;
  departmentName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  aiAnalysis?: AIAnalysis;
  sla: ComplaintSLA;
  resolution?: Resolution;
  verification?: CitizenVerification;
  similarComplaints?: SimilarComplaint[];
  historicalRecommendation?: string;
  isDuplicateFlagged?: boolean;
  duplicateOfId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriorityRule {
  id: string;
  name: string;
  condition: string;
  resultPriority: PriorityLevel;
  description: string;
  isActive: boolean;
}

export interface RoutingRule {
  id: string;
  aiCategoryKeyword: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  description: string;
  isActive: boolean;
}

export interface SLARule {
  priority: PriorityLevel;
  durationHours: number;
  warningThresholdPercent: number;
  escalationRole: string;
}

export interface RulesConfig {
  priorityRules: PriorityRule[];
  routingRules: RoutingRule[];
  slaRules: Record<PriorityLevel, number>;
  duplicateThresholdPercent: number;
}

export interface SystemRulesConfig {
  priorityRules: PriorityRule[];
  routingRules: RoutingRule[];
  slaRules: Record<PriorityLevel, SLARule>;
  duplicateThresholdPercent: number;
}

export interface AnalyticsData {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  reopenedComplaints: number;
  escalatedComplaints: number;
  criticalComplaints: number;
  slaBreaches: number;
  possibleDuplicates: number;
  verificationRatePercent: number;
  avgResolutionTimeHours: number;
  complaintsByCategory: { category: string; count: number; color: string }[];
  complaintsByDepartment: { department: string; count: number; resolved: number }[];
  priorityDistribution: { priority: PriorityLevel; count: number; color: string }[];
  statusDistribution: { status: ComplaintStatus; count: number }[];
  slaComplianceRatePercent: number;
}
