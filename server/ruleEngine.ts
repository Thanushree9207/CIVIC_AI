import {
  AIAnalysis,
  PriorityLevel,
  Department,
  Officer,
  ComplaintSLA,
  SystemRulesConfig
} from '../src/types';
import { db } from './db';

export interface RuleEvaluationResult {
  priority: PriorityLevel;
  priorityReason: string;
  matchedRuleId: string;
}

export interface RoutingEvaluationResult {
  departmentId: string;
  departmentName: string;
  matchedRuleId?: string;
}

export class RuleEngine {
  /**
   * Evaluates priority using active rule engine configuration
   */
  static evaluatePriority(analysis: AIAnalysis, config?: SystemRulesConfig): RuleEvaluationResult {
    const rulesConfig = config || db.rulesConfig;
    const { severity, risk, affected_population } = analysis;

    // Check custom active priority rules in sequential order
    for (const rule of rulesConfig.priorityRules) {
      if (!rule.isActive) continue;

      if (rule.condition === 'severity == "CRITICAL"' && severity === 'CRITICAL') {
        return {
          priority: 'CRITICAL',
          priorityReason: `Triggered Prototype Rule [${rule.name}]: Critical severity identified requiring emergency SLA intervention.`,
          matchedRuleId: rule.id
        };
      }

      if (rule.condition === 'severity == "HIGH" && risk == "HIGH"' && severity === 'HIGH' && risk === 'HIGH') {
        return {
          priority: 'HIGH',
          priorityReason: `Triggered Prototype Rule [${rule.name}]: High severity and elevated risk impacting ${affected_population || 'public infrastructure'}.`,
          matchedRuleId: rule.id
        };
      }

      if (rule.condition === 'severity == "HIGH"' && severity === 'HIGH') {
        return {
          priority: 'HIGH',
          priorityReason: `Triggered Prototype Rule [${rule.name}]: High severity disruption requiring expedited municipal resolution.`,
          matchedRuleId: rule.id
        };
      }

      if (rule.condition === 'severity == "MEDIUM"' && severity === 'MEDIUM') {
        return {
          priority: 'MEDIUM',
          priorityReason: `Triggered Prototype Rule [${rule.name}]: Standard localized municipal grievance with medium severity.`,
          matchedRuleId: rule.id
        };
      }

      if (rule.condition === 'severity == "LOW"' && severity === 'LOW') {
        return {
          priority: 'LOW',
          priorityReason: `Triggered Prototype Rule [${rule.name}]: Low severity routine civic maintenance item.`,
          matchedRuleId: rule.id
        };
      }
    }

    // Default fallback rule
    return {
      priority: 'MEDIUM',
      priorityReason: 'Default baseline priority applied based on standard municipal SLA framework.',
      matchedRuleId: 'PR-DEFAULT'
    };
  }

  /**
   * Routes grievance to correct department using configured category routing rules
   */
  static evaluateDepartmentRouting(analysis: AIAnalysis, config?: SystemRulesConfig): RoutingEvaluationResult {
    const rulesConfig = config || db.rulesConfig;
    const category = analysis.category.toLowerCase();
    const deptCategory = (analysis.department_category || '').toLowerCase();

    for (const rule of rulesConfig.routingRules) {
      if (!rule.isActive) continue;
      const keyword = rule.aiCategoryKeyword.toLowerCase();

      if (category.includes(keyword) || deptCategory.includes(keyword) || keyword.includes(category)) {
        return {
          departmentId: rule.targetDepartmentId,
          departmentName: rule.targetDepartmentName,
          matchedRuleId: rule.id
        };
      }
    }

    // Heuristic fallbacks
    if (category.includes('light') || category.includes('electric')) {
      return { departmentId: 'DEPT-ELEC', departmentName: 'Electrical Department' };
    }
    if (category.includes('garbage') || category.includes('waste') || category.includes('sanitation')) {
      return { departmentId: 'DEPT-SANI', departmentName: 'Sanitation Department' };
    }
    if (category.includes('water') || category.includes('pipe')) {
      return { departmentId: 'DEPT-WATER', departmentName: 'Water Department' };
    }
    if (category.includes('drain') || category.includes('sewage') || category.includes('manhole')) {
      return { departmentId: 'DEPT-ENGG', departmentName: 'Municipal Engineering & Drainage' };
    }
    if (category.includes('health') || category.includes('mosquito') || category.includes('disease')) {
      return { departmentId: 'DEPT-HEALTH', departmentName: 'Public Health Department' };
    }

    // Default fallback to Public Works
    return {
      departmentId: 'DEPT-PWD',
      departmentName: 'Public Works Department',
      matchedRuleId: 'RR-DEFAULT'
    };
  }

  /**
   * Assigns to department officer using Load Balancing (fewest active complaints)
   */
  static assignOfficer(departmentId: string): Officer | undefined {
    const eligible = db.officers.filter(o => o.departmentId === departmentId);
    if (eligible.length === 0) {
      // If no officer in exact department, find any available officer
      return db.officers[0];
    }

    // Sort by fewest active complaints
    eligible.sort((a, b) => a.activeComplaints - b.activeComplaints);
    const assigned = eligible[0];
    assigned.activeComplaints += 1;
    return assigned;
  }

  /**
   * Calculates SLA deadline and milestones based on priority and rules
   */
  static calculateSLA(priority: PriorityLevel, config?: SystemRulesConfig): ComplaintSLA {
    const rulesConfig = config || db.rulesConfig;
    const slaRule = rulesConfig.slaRules[priority] || {
      priority,
      durationHours: priority === 'CRITICAL' ? 24 : priority === 'HIGH' ? 48 : priority === 'MEDIUM' ? 72 : 168,
      warningThresholdPercent: 75,
      escalationRole: 'ZONAL_SUPERVISOR'
    };

    const now = Date.now();
    const durationMs = slaRule.durationHours * 60 * 60 * 1000;
    const deadlineMs = now + durationMs;
    const warningMs = now + (durationMs * (slaRule.warningThresholdPercent / 100));

    return {
      durationHours: slaRule.durationHours,
      deadline: new Date(deadlineMs).toISOString(),
      warningTime: new Date(warningMs).toISOString(),
      escalationTime: new Date(deadlineMs).toISOString(),
      status: 'ON_TRACK',
      elapsedHours: 0,
      remainingHours: slaRule.durationHours,
      isBreached: false
    };
  }
}
