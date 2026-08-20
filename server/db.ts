import {
  User,
  Department,
  Officer,
  Complaint,
  AuditLog,
  Notification,
  SystemRulesConfig,
  PriorityRule,
  RoutingRule,
  SLARule
} from '../src/types';

// In-Memory Database store with rich seed data
export class Database {
  users: User[] = [];
  departments: Department[] = [];
  officers: Officer[] = [];
  complaints: Complaint[] = [];
  auditLogs: AuditLog[] = [];
  notifications: Notification[] = [];
  rulesConfig: SystemRulesConfig;

  constructor() {
    this.rulesConfig = {
      duplicateThresholdPercent: 70,
      priorityRules: [
        {
          id: 'PR-1',
          name: 'Critical Severity Override',
          condition: 'severity == "CRITICAL"',
          resultPriority: 'CRITICAL',
          description: 'Any life safety, toxic spill, open high-voltage line, or hospital road block is set to Critical.',
          isActive: true
        },
        {
          id: 'PR-2',
          name: 'High Severity & High Risk',
          condition: 'severity == "HIGH" && risk == "HIGH"',
          resultPriority: 'HIGH',
          description: 'High risk issues impacting large public zones escalate immediately to High priority.',
          isActive: true
        },
        {
          id: 'PR-3',
          name: 'High Severity General',
          condition: 'severity == "HIGH"',
          resultPriority: 'HIGH',
          description: 'Broad disruptions such as main water conduit bursts or major road sinkholes.',
          isActive: true
        },
        {
          id: 'PR-4',
          name: 'Medium Severity',
          condition: 'severity == "MEDIUM"',
          resultPriority: 'MEDIUM',
          description: 'Standard localized municipal issues like street lighting outages or garbage backlog.',
          isActive: true
        },
        {
          id: 'PR-5',
          name: 'Default Low Rule',
          condition: 'severity == "LOW"',
          resultPriority: 'LOW',
          description: 'Minor aesthetic or non-urgent maintenance issues.',
          isActive: true
        }
      ],
      routingRules: [
        {
          id: 'RR-1',
          aiCategoryKeyword: 'Street Lighting',
          targetDepartmentId: 'DEPT-ELEC',
          targetDepartmentName: 'Electrical Department',
          description: 'Streetlights, dark spots, transformer sparks, hanging electrical cables',
          isActive: true
        },
        {
          id: 'RR-2',
          aiCategoryKeyword: 'Solid Waste Management',
          targetDepartmentId: 'DEPT-SANI',
          targetDepartmentName: 'Sanitation Department',
          description: 'Garbage dumps, overflowing dustbins, dead animals, illegal dumping',
          isActive: true
        },
        {
          id: 'RR-3',
          aiCategoryKeyword: 'Roads & Infrastructure',
          targetDepartmentId: 'DEPT-PWD',
          targetDepartmentName: 'Public Works Department',
          description: 'Potholes, broken footpaths, damaged dividers, unpaved trenches',
          isActive: true
        },
        {
          id: 'RR-4',
          aiCategoryKeyword: 'Water Supply',
          targetDepartmentId: 'DEPT-WATER',
          targetDepartmentName: 'Water Department',
          description: 'Contaminated water, pipeline burst, low pressure, dirty tap water',
          isActive: true
        },
        {
          id: 'RR-5',
          aiCategoryKeyword: 'Drainage & Sewage',
          targetDepartmentId: 'DEPT-ENGG',
          targetDepartmentName: 'Municipal Engineering',
          description: 'Overflowing storm drains, clogged manholes, sewage backflow',
          isActive: true
        },
        {
          id: 'RR-6',
          aiCategoryKeyword: 'Public Health',
          targetDepartmentId: 'DEPT-HEALTH',
          targetDepartmentName: 'Public Health Department',
          description: 'Mosquito breeding spots, open medical waste, stagnant water hazards',
          isActive: true
        }
      ],
      slaRules: {
        CRITICAL: {
          priority: 'CRITICAL',
          durationHours: 24,
          warningThresholdPercent: 75,
          escalationRole: 'MUNICIPAL_COMMISSIONER'
        },
        HIGH: {
          priority: 'HIGH',
          durationHours: 48,
          warningThresholdPercent: 75,
          escalationRole: 'ZONAL_SUPERVISOR'
        },
        MEDIUM: {
          priority: 'MEDIUM',
          durationHours: 72,
          warningThresholdPercent: 75,
          escalationRole: 'ASSISTANT_ENGINEER'
        },
        LOW: {
          priority: 'LOW',
          durationHours: 168,
          warningThresholdPercent: 80,
          escalationRole: 'SECTION_OFFICER'
        }
      }
    };

    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Departments
    this.departments = [
      {
        id: 'DEPT-ELEC',
        name: 'Electrical Department',
        code: 'ELEC',
        description: 'Maintains streetlights, power lines, transformer substations, and public lighting.',
        supervisorName: 'Er. Sandeep Rao',
        supervisorEmail: 'sandeep.rao@civic.gov.in',
        activeOfficersCount: 2,
        openComplaintsCount: 4
      },
      {
        id: 'DEPT-PWD',
        name: 'Public Works Department',
        code: 'PWD',
        description: 'Responsible for arterial roads, bridges, potholes, footpaths, and flyovers.',
        supervisorName: 'Er. Meenakshi Sundaram',
        supervisorEmail: 'meenakshi.s@civic.gov.in',
        activeOfficersCount: 2,
        openComplaintsCount: 5
      },
      {
        id: 'DEPT-SANI',
        name: 'Sanitation Department',
        code: 'SANI',
        description: 'Oversees municipal solid waste collection, dump yards, and street sweeping.',
        supervisorName: 'Dr. Kavita Narang',
        supervisorEmail: 'kavita.n@civic.gov.in',
        activeOfficersCount: 2,
        openComplaintsCount: 3
      },
      {
        id: 'DEPT-WATER',
        name: 'Water Department',
        code: 'WATER',
        description: 'Potable water supply distribution, pipeline maintenance, and valve operations.',
        supervisorName: 'Er. Vinod Nair',
        supervisorEmail: 'vinod.nair@civic.gov.in',
        activeOfficersCount: 2,
        openComplaintsCount: 2
      },
      {
        id: 'DEPT-ENGG',
        name: 'Municipal Engineering & Drainage',
        code: 'ENGG',
        description: 'Stormwater drains, underground drainage networks, and culvert maintenance.',
        supervisorName: 'Er. Alok Sharma',
        supervisorEmail: 'alok.s@civic.gov.in',
        activeOfficersCount: 1,
        openComplaintsCount: 2
      },
      {
        id: 'DEPT-HEALTH',
        name: 'Public Health Department',
        code: 'HEALTH',
        description: 'Vector control, epidemic monitoring, sanitation hygiene, and food safety.',
        supervisorName: 'Dr. Sunita Deshmukh',
        supervisorEmail: 'sunita.d@civic.gov.in',
        activeOfficersCount: 1,
        openComplaintsCount: 1
      }
    ];

    // 2. Users
    this.users = [
      {
        id: 'USR-CITIZEN-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '9876543210',
        role: 'CITIZEN',
        createdAt: '2026-08-10T09:00:00.000Z'
      },
      {
        id: 'USR-CITIZEN-2',
        name: 'Pooja Reddy',
        email: 'pooja.reddy@example.com',
        phone: '9123456780',
        role: 'CITIZEN',
        createdAt: '2026-08-11T10:30:00.000Z'
      },
      {
        id: 'USR-OFFICER-1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@civic.gov.in',
        phone: '9845012345',
        role: 'OFFICER',
        departmentId: 'DEPT-ELEC',
        departmentName: 'Electrical Department',
        designation: 'Senior Electrical Engineer (Zone-4)',
        createdAt: '2026-08-01T08:00:00.000Z'
      },
      {
        id: 'USR-OFFICER-2',
        name: 'Priya Verma',
        email: 'priya.verma@civic.gov.in',
        phone: '9845098765',
        role: 'OFFICER',
        departmentId: 'DEPT-PWD',
        departmentName: 'Public Works Department',
        designation: 'Assistant Executive Engineer (Roads)',
        createdAt: '2026-08-01T08:00:00.000Z'
      },
      {
        id: 'USR-OFFICER-3',
        name: 'Imran Khan',
        email: 'imran.khan@civic.gov.in',
        phone: '9845054321',
        role: 'OFFICER',
        departmentId: 'DEPT-SANI',
        departmentName: 'Sanitation Department',
        designation: 'Zonal Sanitation Inspector',
        createdAt: '2026-08-01T08:00:00.000Z'
      },
      {
        id: 'USR-ADMIN-1',
        name: 'Dr. Ananya Iyer',
        email: 'commissioner@civic.gov.in',
        phone: '9900112233',
        role: 'ADMIN',
        designation: 'Municipal Commissioner & Chief Grievance Officer',
        createdAt: '2026-08-01T07:00:00.000Z'
      }
    ];

    // 3. Officers
    this.officers = [
      {
        id: 'OFF-1',
        userId: 'USR-OFFICER-1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@civic.gov.in',
        phone: '9845012345',
        departmentId: 'DEPT-ELEC',
        departmentName: 'Electrical Department',
        designation: 'Senior Electrical Engineer (Zone-4)',
        activeComplaints: 2,
        resolvedComplaints: 14,
        avgResolutionHours: 18.5
      },
      {
        id: 'OFF-2',
        userId: 'USR-OFFICER-2',
        name: 'Priya Verma',
        email: 'priya.verma@civic.gov.in',
        phone: '9845098765',
        departmentId: 'DEPT-PWD',
        departmentName: 'Public Works Department',
        designation: 'Assistant Executive Engineer (Roads)',
        activeComplaints: 3,
        resolvedComplaints: 28,
        avgResolutionHours: 32.0
      },
      {
        id: 'OFF-3',
        userId: 'USR-OFFICER-3',
        name: 'Imran Khan',
        email: 'imran.khan@civic.gov.in',
        phone: '9845054321',
        departmentId: 'DEPT-SANI',
        departmentName: 'Sanitation Department',
        designation: 'Zonal Sanitation Inspector',
        activeComplaints: 1,
        resolvedComplaints: 42,
        avgResolutionHours: 14.2
      }
    ];

    // 4. Seed Historical Resolved Complaints (for semantic similarity & resolution recommendations)
    const now = new Date('2026-08-19T04:10:00.000Z').getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    this.complaints = [
      // Resolved Complaint 1 (Street Lighting)
      {
        id: 'CIVIC-2026-0891',
        citizenId: 'USR-CITIZEN-1',
        citizenName: 'Aarav Sharma',
        citizenPhone: '9876543210',
        citizenEmail: 'aarav.sharma@example.com',
        title: 'Streetlights malfunctioning on 80ft Main Road near Engineering College Gate',
        description: 'There has been no street-light working near our college for the last 10 days. Students and evening commuters are facing severe darkness and safety issues.',
        locationAddress: 'Doddaballapur Main Road, Yelahanka, Bengaluru, Karnataka 560064',
        latitude: 13.1332,
        longitude: 77.5684,
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        status: 'VERIFIED',
        priority: 'MEDIUM',
        priorityReason: 'Medium severity public safety concern along educational corridor with elevated nocturnal footfall.',
        departmentId: 'DEPT-ELEC',
        departmentName: 'Electrical Department',
        assignedOfficerId: 'OFF-1',
        assignedOfficerName: 'Rajesh Kumar',
        aiAnalysis: {
          issue: 'Inoperative street lighting along college approach road',
          category: 'Street Lighting',
          severity: 'MEDIUM',
          duration_days: 10,
          location_description: '80ft Main Road near College Gate, Yelahanka',
          risk: 'MEDIUM',
          affected_population: 'Students and evening commuters (>1000 daily)',
          department_category: 'Electrical Department',
          reason: 'Non-functioning street lamps creating dark zone posing pedestrian safety and security risk.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.96,
          timestamp: new Date(now - 8 * oneDay).toISOString()
        },
        sla: {
          durationHours: 72,
          deadline: new Date(now - 5 * oneDay).toISOString(),
          warningTime: new Date(now - 6 * oneDay).toISOString(),
          escalationTime: new Date(now - 5 * oneDay).toISOString(),
          status: 'COMPLETED',
          elapsedHours: 22,
          remainingHours: 0,
          isBreached: false,
          completedAt: new Date(now - 7 * oneDay).toISOString()
        },
        resolution: {
          id: 'RES-0891',
          complaintId: 'CIVIC-2026-0891',
          officerId: 'OFF-1',
          officerName: 'Rajesh Kumar',
          departmentName: 'Electrical Department',
          description: 'Inspected line feeder panel. Replaced blown 63A contactor and 4 faulty LED luminaires with Philips 120W Smart fixtures.',
          actionTaken: 'Electrical feeder repair & luminaire replacement',
          evidenceUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
          submittedAt: new Date(now - 7 * oneDay).toISOString()
        },
        verification: {
          id: 'VER-0891',
          complaintId: 'CIVIC-2026-0891',
          citizenId: 'USR-CITIZEN-1',
          isSatisfied: true,
          feedback: 'All 6 lights are now glowing brightly. Safe for students now. Thank you for prompt resolution!',
          verifiedAt: new Date(now - 6.5 * oneDay).toISOString()
        },
        historicalRecommendation: 'Past resolved cases suggest inspecting the electrical contactor box and replacing damaged cable wiring if required.',
        createdAt: new Date(now - 8 * oneDay).toISOString(),
        updatedAt: new Date(now - 6.5 * oneDay).toISOString()
      },

      // Active Complaint 2 (CRITICAL - In Progress)
      {
        id: 'CIVIC-2026-1042',
        citizenId: 'USR-CITIZEN-2',
        citizenName: 'Pooja Reddy',
        citizenPhone: '9123456780',
        citizenEmail: 'pooja.reddy@example.com',
        title: 'Dangerous deep open trench on MG Road corner without warning barricades',
        description: 'A 6-foot deep excavation pit left open right beside the bus shelter on MG Road. Two two-wheelers nearly crashed into it in rain. Immediate hazard to school kids.',
        locationAddress: 'MG Road Junction, Ward 112, Bengaluru, Karnataka 560001',
        latitude: 12.9756,
        longitude: 77.6066,
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        priorityReason: 'High severe life hazard with immediate collapse/crash risk near public transport hub.',
        departmentId: 'DEPT-PWD',
        departmentName: 'Public Works Department',
        assignedOfficerId: 'OFF-2',
        assignedOfficerName: 'Priya Verma',
        aiAnalysis: {
          issue: 'Unbarricaded deep road trench hazardous to pedestrians and vehicles',
          category: 'Roads & Infrastructure',
          severity: 'CRITICAL',
          duration_days: 2,
          location_description: 'MG Road Bus Shelter corner',
          risk: 'HIGH',
          affected_population: 'Dense pedestrian and commuter traffic (>5000 daily)',
          department_category: 'Public Works Department',
          reason: 'Open excavation pit without retroreflective barricades presents acute risk of fatal accidents.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.98,
          timestamp: new Date(now - 14 * oneHour).toISOString()
        },
        sla: {
          durationHours: 24,
          deadline: new Date(now + 10 * oneHour).toISOString(),
          warningTime: new Date(now + 4 * oneHour).toISOString(),
          escalationTime: new Date(now + 10 * oneHour).toISOString(),
          status: 'ON_TRACK',
          elapsedHours: 14,
          remainingHours: 10,
          isBreached: false
        },
        historicalRecommendation: 'Deploy rapid steel trench covers and high-visibility perimeter water barriers prior to final concrete backfilling.',
        createdAt: new Date(now - 14 * oneHour).toISOString(),
        updatedAt: new Date(now - 4 * oneHour).toISOString()
      },

      // Active Complaint 3 (SLA WARNING - Resolution Pending Verification)
      {
        id: 'CIVIC-2026-1015',
        citizenId: 'USR-CITIZEN-1',
        citizenName: 'Aarav Sharma',
        citizenPhone: '9876543210',
        citizenEmail: 'aarav.sharma@example.com',
        title: 'Severe commercial garbage dumping opposite Community Health Center',
        description: 'Large piles of unsegregated organic and plastic waste rotting on the sidewalk opposite the health center. Foul stench and stray dogs multiplying.',
        locationAddress: 'Sector 4, HSR Layout, Bengaluru, Karnataka 560102',
        latitude: 12.9121,
        longitude: 77.6446,
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
        status: 'RESOLUTION_PENDING_VERIFICATION',
        priority: 'HIGH',
        priorityReason: 'High health and sanitation hazard directly adjacent to a medical healthcare facility.',
        departmentId: 'DEPT-SANI',
        departmentName: 'Sanitation Department',
        assignedOfficerId: 'OFF-3',
        assignedOfficerName: 'Imran Khan',
        aiAnalysis: {
          issue: 'Rotting garbage blackspot next to health clinic',
          category: 'Solid Waste Management',
          severity: 'HIGH',
          duration_days: 4,
          location_description: 'Opposite Community Health Center, Sector 4',
          risk: 'HIGH',
          affected_population: 'Patients, residents, local shopkeepers',
          department_category: 'Sanitation Department',
          reason: 'Severe vector breeding and bio-hygiene risk opposite sensitive health institution.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.94,
          timestamp: new Date(now - 38 * oneHour).toISOString()
        },
        sla: {
          durationHours: 48,
          deadline: new Date(now + 10 * oneHour).toISOString(),
          warningTime: new Date(now - 2 * oneHour).toISOString(),
          escalationTime: new Date(now + 10 * oneHour).toISOString(),
          status: 'WARNING',
          elapsedHours: 38,
          remainingHours: 10,
          isBreached: false
        },
        resolution: {
          id: 'RES-1015',
          complaintId: 'CIVIC-2026-1015',
          officerId: 'OFF-3',
          officerName: 'Imran Khan',
          departmentName: 'Sanitation Department',
          description: 'Dispatched 2 Bobcat compactor trucks. Cleared 4.5 tonnes of solid waste, applied lime powder disinfectant, and installed "No Dumping" CCTV warning signage.',
          actionTaken: 'Heavy compactor clearance & chemical sanitation',
          evidenceUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
          submittedAt: new Date(now - 2 * oneHour).toISOString()
        },
        historicalRecommendation: 'Clear waste using mechanized loader, apply bleaching powder and install municipal spot-fine board.',
        createdAt: new Date(now - 38 * oneHour).toISOString(),
        updatedAt: new Date(now - 2 * oneHour).toISOString()
      },

      // Active Complaint 4 (SLA BREACHED & ESCALATED)
      {
        id: 'CIVIC-2026-0988',
        citizenId: 'USR-CITIZEN-2',
        citizenName: 'Pooja Reddy',
        citizenPhone: '9123456780',
        citizenEmail: 'pooja.reddy@example.com',
        title: 'Contaminated muddy brown drinking water supply in Block C apartments',
        description: 'Potable tap water has been coming out dirty, yellow-brown with foul odor since Monday morning. Residents are falling sick with stomach infections.',
        locationAddress: 'Block C, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
        latitude: 12.9784,
        longitude: 77.6408,
        imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
        status: 'ESCALATED',
        priority: 'CRITICAL',
        priorityReason: 'Direct public health emergency involving contaminated municipal drinking water network.',
        departmentId: 'DEPT-WATER',
        departmentName: 'Water Department',
        assignedOfficerId: 'OFF-2',
        assignedOfficerName: 'Priya Verma',
        aiAnalysis: {
          issue: 'Severe tap water contamination causing illness',
          category: 'Water Supply',
          severity: 'CRITICAL',
          duration_days: 3,
          location_description: 'Indiranagar Block C residential cluster',
          risk: 'HIGH',
          affected_population: 'Over 450 residential flats and families',
          department_category: 'Water Department',
          reason: 'Likely cross-contamination between broken stormwater line and drinking main pipe.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.97,
          timestamp: new Date(now - 30 * oneHour).toISOString()
        },
        sla: {
          durationHours: 24,
          deadline: new Date(now - 6 * oneHour).toISOString(),
          warningTime: new Date(now - 12 * oneHour).toISOString(),
          escalationTime: new Date(now - 6 * oneHour).toISOString(),
          status: 'BREACHED',
          elapsedHours: 30,
          remainingHours: 0,
          isBreached: true,
          breachedAt: new Date(now - 6 * oneHour).toISOString()
        },
        historicalRecommendation: 'Isolate main valve, execute acoustic leak detection to locate sewage infiltration point, and dispatch emergency clean water tankers.',
        createdAt: new Date(now - 30 * oneHour).toISOString(),
        updatedAt: new Date(now - 1 * oneHour).toISOString()
      },

      // Complaint 5 (REOPENED by citizen due to incomplete fix)
      {
        id: 'CIVIC-2026-0950',
        citizenId: 'USR-CITIZEN-1',
        citizenName: 'Aarav Sharma',
        citizenPhone: '9876543210',
        citizenEmail: 'aarav.sharma@example.com',
        title: 'Massive pothole crater on Koramangala 80ft Road near Sony World Signal',
        description: 'Large vehicle-damaging pothole causing severe traffic jams. Mud was filled yesterday but washed away in 20 minutes of rain.',
        locationAddress: '80ft Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
        latitude: 12.9352,
        longitude: 77.6245,
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        status: 'REOPENED',
        priority: 'HIGH',
        priorityReason: 'Reopened complaint on high-traffic artery requiring permanent bitumen/asphalt hotmix repair.',
        departmentId: 'DEPT-PWD',
        departmentName: 'Public Works Department',
        assignedOfficerId: 'OFF-2',
        assignedOfficerName: 'Priya Verma',
        aiAnalysis: {
          issue: 'Recurring major pothole on prime commercial corridor',
          category: 'Roads & Infrastructure',
          severity: 'HIGH',
          duration_days: 5,
          location_description: 'Koramangala 80ft Road near Sony World Signal',
          risk: 'HIGH',
          affected_population: 'Dense commuter corridor (>20,000 vehicles daily)',
          department_category: 'Public Works Department',
          reason: 'Temporary loose soil filling failed during rainfall; risk of two-wheeler skids.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.95,
          timestamp: new Date(now - 48 * oneHour).toISOString()
        },
        sla: {
          durationHours: 48,
          deadline: new Date(now + 24 * oneHour).toISOString(),
          warningTime: new Date(now + 12 * oneHour).toISOString(),
          escalationTime: new Date(now + 24 * oneHour).toISOString(),
          status: 'ON_TRACK',
          elapsedHours: 4,
          remainingHours: 44,
          isBreached: false
        },
        verification: {
          id: 'VER-0950',
          complaintId: 'CIVIC-2026-0950',
          citizenId: 'USR-CITIZEN-1',
          isSatisfied: false,
          reopenReason: 'Temporary soil patch washed away completely in first rain. The pothole is even deeper now and exposed sharp stones.',
          verifiedAt: new Date(now - 4 * oneHour).toISOString()
        },
        historicalRecommendation: 'Apply stone aggregate base compaction followed by standard Grade-2 asphalt hotmix with cold emulsion seal coat.',
        createdAt: new Date(now - 48 * oneHour).toISOString(),
        updatedAt: new Date(now - 4 * oneHour).toISOString()
      },

      // Complaint 6 (Assigned / Newly Submitted with duplicate potential)
      {
        id: 'CIVIC-2026-1070',
        citizenId: 'USR-CITIZEN-2',
        citizenName: 'Pooja Reddy',
        citizenPhone: '9123456780',
        citizenEmail: 'pooja.reddy@example.com',
        title: 'Streetlights dark on Doddaballapur Road close to College intersection',
        description: 'The street lights near the engineering college and rail bridge are completely off tonight. It is pitch dark and unsafe for female students walking to hostel.',
        locationAddress: 'Doddaballapur Main Road, Avalahalli, Bengaluru, Karnataka 560064',
        latitude: 13.1345,
        longitude: 77.5692,
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        status: 'ASSIGNED',
        priority: 'MEDIUM',
        priorityReason: 'Medium severity public safety concern in suburban university corridor.',
        departmentId: 'DEPT-ELEC',
        departmentName: 'Electrical Department',
        assignedOfficerId: 'OFF-1',
        assignedOfficerName: 'Rajesh Kumar',
        aiAnalysis: {
          issue: 'Streetlights out along college stretch',
          category: 'Street Lighting',
          severity: 'MEDIUM',
          duration_days: 1,
          location_description: 'Near Engineering College & rail bridge, Doddaballapur Road',
          risk: 'MEDIUM',
          affected_population: 'Hostel students and evening pedestrians',
          department_category: 'Electrical Department',
          reason: 'Dark street conditions impacting student pedestrian safety.',
          modelName: 'gemini-3.7-flash',
          confidence: 0.93,
          timestamp: new Date(now - 2 * oneHour).toISOString()
        },
        sla: {
          durationHours: 72,
          deadline: new Date(now + 70 * oneHour).toISOString(),
          warningTime: new Date(now + 54 * oneHour).toISOString(),
          escalationTime: new Date(now + 70 * oneHour).toISOString(),
          status: 'ON_TRACK',
          elapsedHours: 2,
          remainingHours: 70,
          isBreached: false
        },
        isDuplicateFlagged: true,
        duplicateOfId: 'CIVIC-2026-0891',
        similarComplaints: [
          {
            id: 'CIVIC-2026-0891',
            title: 'Streetlights malfunctioning on 80ft Main Road near Engineering College Gate',
            category: 'Street Lighting',
            similarity: 89,
            status: 'VERIFIED',
            location: 'Doddaballapur Main Road, Yelahanka, Bengaluru',
            resolution: 'Replaced blown contactor and 4 faulty LED fixtures.',
            actionTaken: 'Electrical feeder repair & luminaire replacement',
            resolutionTimeHours: 22,
            createdAt: new Date(now - 8 * oneDay).toISOString()
          }
        ],
        historicalRecommendation: 'Inspect feeder panel near railway overbridge; recent case C0891 fixed same line contactor.',
        createdAt: new Date(now - 2 * oneHour).toISOString(),
        updatedAt: new Date(now - 2 * oneHour).toISOString()
      }
    ];

    // 5. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'LOG-001',
        complaintId: 'CIVIC-2026-0891',
        userId: 'USR-CITIZEN-1',
        userName: 'Aarav Sharma',
        userRole: 'CITIZEN',
        action: 'COMPLAINT_CREATED',
        newValue: 'SUBMITTED',
        details: 'Citizen submitted grievance via Mobile/Web portal.',
        timestamp: new Date(now - 8 * oneDay).toISOString(),
        ipAddress: '103.24.12.89'
      },
      {
        id: 'LOG-002',
        complaintId: 'CIVIC-2026-0891',
        userId: 'AI-SYSTEM',
        userName: 'Gemini Grievance Intelligence',
        userRole: 'ADMIN',
        action: 'AI_ANALYSIS_COMPLETED',
        details: 'Extracted: Category="Street Lighting", Severity="MEDIUM", Risk="MEDIUM", Model="gemini-3.7-flash".',
        timestamp: new Date(now - 8 * oneDay + 2000).toISOString()
      },
      {
        id: 'LOG-003',
        complaintId: 'CIVIC-2026-0891',
        userId: 'RULE-ENGINE',
        userName: 'Civic Rule Engine',
        userRole: 'ADMIN',
        action: 'PRIORITY_ROUTING_ASSIGNED',
        newValue: 'DEPT-ELEC / Rajesh Kumar',
        details: 'Rule "Medium Severity" scored Priority="MEDIUM". Routed to Electrical Department; load balanced to Rajesh Kumar.',
        timestamp: new Date(now - 8 * oneDay + 3500).toISOString()
      },
      {
        id: 'LOG-004',
        complaintId: 'CIVIC-2026-0891',
        userId: 'USR-OFFICER-1',
        userName: 'Rajesh Kumar',
        userRole: 'OFFICER',
        action: 'RESOLUTION_SUBMITTED',
        oldValue: 'IN_PROGRESS',
        newValue: 'RESOLUTION_PENDING_VERIFICATION',
        details: 'Replaced contactor and 4 LED luminaires. Uploaded photographic proof.',
        timestamp: new Date(now - 7 * oneDay).toISOString(),
        ipAddress: '10.0.4.12'
      },
      {
        id: 'LOG-005',
        complaintId: 'CIVIC-2026-0891',
        userId: 'USR-CITIZEN-1',
        userName: 'Aarav Sharma',
        userRole: 'CITIZEN',
        action: 'CITIZEN_VERIFIED',
        oldValue: 'RESOLUTION_PENDING_VERIFICATION',
        newValue: 'VERIFIED',
        details: 'Citizen confirmed resolution quality and closed complaint with positive rating.',
        timestamp: new Date(now - 6.5 * oneDay).toISOString(),
        ipAddress: '103.24.12.89'
      },
      {
        id: 'LOG-006',
        complaintId: 'CIVIC-2026-0988',
        userId: 'SLA-MONITOR',
        userName: 'Civic SLA Daemon',
        userRole: 'ADMIN',
        action: 'SLA_BREACHED',
        oldValue: 'WARNING',
        newValue: 'BREACHED',
        details: 'SLA deadline exceeded (24h). Automatically escalated to Municipal Commissioner.',
        timestamp: new Date(now - 6 * oneHour).toISOString()
      },
      {
        id: 'LOG-007',
        complaintId: 'CIVIC-2026-0950',
        userId: 'USR-CITIZEN-1',
        userName: 'Aarav Sharma',
        userRole: 'CITIZEN',
        action: 'COMPLAINT_REOPENED',
        oldValue: 'RESOLUTION_PENDING_VERIFICATION',
        newValue: 'REOPENED',
        details: 'Citizen marked issue unresolved: "Temporary soil patch washed away in rain."',
        timestamp: new Date(now - 4 * oneHour).toISOString(),
        ipAddress: '103.24.12.89'
      }
    ];

    // 6. Seed Notifications
    this.notifications = [
      {
        id: 'NOTIF-1',
        userId: 'USR-CITIZEN-1',
        title: 'Resolution Pending Verification',
        message: 'Officer Imran Khan submitted resolution for your garbage complaint #CIVIC-2026-1015. Please verify within 48 hours.',
        type: 'INFO',
        complaintId: 'CIVIC-2026-1015',
        isRead: false,
        createdAt: new Date(now - 2 * oneHour).toISOString()
      },
      {
        id: 'NOTIF-2',
        userId: 'USR-OFFICER-1',
        title: 'New Complaint Assigned',
        message: 'Grievance #CIVIC-2026-1070 (Street Lighting) assigned to you with 72h SLA deadline.',
        type: 'INFO',
        complaintId: 'CIVIC-2026-1070',
        isRead: false,
        createdAt: new Date(now - 2 * oneHour).toISOString()
      },
      {
        id: 'NOTIF-3',
        userId: 'USR-ADMIN-1',
        title: 'SLA Breach & Escalation Alert',
        message: 'CRITICAL complaint #CIVIC-2026-0988 (Water Contamination) has breached the 24-hour SLA deadline and requires commissioner intervention.',
        type: 'ALERT',
        complaintId: 'CIVIC-2026-0988',
        isRead: false,
        createdAt: new Date(now - 6 * oneHour).toISOString()
      }
    ];
  }

  private notifSeq = 1000;
  private logSeq = 1000;
  private userSeq = 1000;

  // Helper Methods
  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const uniqueId = `USR-${Date.now()}-${++this.userSeq}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      ...userData,
      id: uniqueId,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  getComplaints(filter?: {
    citizenId?: string;
    departmentId?: string;
    officerId?: string;
    status?: string;
    priority?: string;
  }): Complaint[] {
    return this.complaints.filter(c => {
      if (filter?.citizenId && c.citizenId !== filter.citizenId) return false;
      if (filter?.departmentId && c.departmentId !== filter.departmentId) return false;
      if (filter?.officerId && c.assignedOfficerId !== filter.officerId) return false;
      if (filter?.status && c.status !== filter.status) return false;
      if (filter?.priority && c.priority !== filter.priority) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find(c => c.id === id);
  }

  addComplaint(complaint: Complaint): Complaint {
    this.complaints.unshift(complaint);
    return complaint;
  }

  updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const index = this.complaints.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.complaints[index] = {
      ...this.complaints[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.complaints[index];
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const uniqueId = `LOG-${Date.now()}-${++this.logSeq}-${Math.random().toString(36).substring(2, 7)}`;
    const newLog: AuditLog = {
      ...log,
      id: uniqueId,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  getAuditLogs(complaintId?: string): AuditLog[] {
    if (complaintId) {
      return this.auditLogs.filter(l => l.complaintId === complaintId);
    }
    return this.auditLogs;
  }

  addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const uniqueId = `NOTIF-${Date.now()}-${++this.notifSeq}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: Notification = {
      ...notif,
      id: uniqueId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: string): void {
    this.notifications.filter(n => n.userId === userId).forEach(n => (n.isRead = true));
  }
}

export const db = new Database();
