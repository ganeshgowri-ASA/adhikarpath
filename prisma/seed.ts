import { PrismaClient, UserRole, UserStatus, AccessStatus, AssignmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ─── Hash helper ───────────────────────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // ─── 1. Create Users (6-level hierarchy) ──────────────────────────────────
  // Level 1: Chairman
  const chairman = await prisma.user.upsert({
    where: { empId: "EMP001" },
    update: {},
    create: {
      empId: "EMP001",
      name: "Arjun Mehta",
      email: "arjun.mehta@adhikarpath.com",
      phone: "9900001111",
      position: "Chairman & MD",
      orgUnit: "Corporate",
      status: UserStatus.ACTIVE,
      role: UserRole.ADMIN,
      password: hash("Chairman@2024"),
    },
  });

  // Level 2: VP
  const vp = await prisma.user.upsert({
    where: { empId: "EMP002" },
    update: {},
    create: {
      empId: "EMP002",
      name: "Priya Sharma",
      email: "priya.sharma@adhikarpath.com",
      phone: "9900002222",
      position: "Vice President – IT & Operations",
      orgUnit: "IT Operations",
      status: UserStatus.ACTIVE,
      role: UserRole.L1_MANAGER,
      managerId: chairman.id,
      password: hash("VP@2024"),
    },
  });

  // Level 3: Director
  const director = await prisma.user.upsert({
    where: { empId: "EMP003" },
    update: {},
    create: {
      empId: "EMP003",
      name: "Ravi Krishnan",
      email: "ravi.krishnan@adhikarpath.com",
      phone: "9900003333",
      position: "Director – Access Management",
      orgUnit: "IAM",
      status: UserStatus.ACTIVE,
      role: UserRole.L1_MANAGER,
      managerId: vp.id,
      password: hash("Director@2024"),
    },
  });

  // Level 4: Senior Manager
  const srManager = await prisma.user.upsert({
    where: { empId: "EMP004" },
    update: {},
    create: {
      empId: "EMP004",
      name: "Sunita Patel",
      email: "sunita.patel@adhikarpath.com",
      phone: "9900004444",
      position: "Senior Manager – IAM",
      orgUnit: "IAM",
      status: UserStatus.ACTIVE,
      role: UserRole.L1_MANAGER,
      managerId: director.id,
      password: hash("SrManager@2024"),
    },
  });

  // Level 5: Team Lead
  const teamLead = await prisma.user.upsert({
    where: { empId: "EMP005" },
    update: {},
    create: {
      empId: "EMP005",
      name: "Amit Verma",
      email: "amit.verma@adhikarpath.com",
      phone: "9900005555",
      position: "Team Lead – Access Provisioning",
      orgUnit: "IAM",
      status: UserStatus.ACTIVE,
      role: UserRole.L1_MANAGER,
      managerId: srManager.id,
      password: hash("TeamLead@2024"),
    },
  });

  // Level 6: You – Gowri Ganesh (Sr Team Member)
  const gowriGanesh = await prisma.user.upsert({
    where: { empId: "EMP006" },
    update: {},
    create: {
      empId: "EMP006",
      name: "Gowri Ganesh",
      email: "gowri.ganesh@adhikarpath.com",
      phone: "9900006666",
      position: "Senior Team Member – IAM",
      orgUnit: "IAM",
      status: UserStatus.ACTIVE,
      role: UserRole.EMPLOYEE,
      managerId: teamLead.id,
      password: hash("GowriGanesh@2024"),
    },
  });

  // Additional employees for realistic data
  const extraUsers = await Promise.all([
    prisma.user.upsert({
      where: { empId: "EMP007" },
      update: {},
      create: {
        empId: "EMP007",
        name: "Kavya Reddy",
        email: "kavya.reddy@adhikarpath.com",
        phone: "9900007777",
        position: "IAM Analyst",
        orgUnit: "IAM",
        status: UserStatus.ACTIVE,
        role: UserRole.EMPLOYEE,
        managerId: teamLead.id,
        password: hash("Kavya@2024"),
      },
    }),
    prisma.user.upsert({
      where: { empId: "EMP008" },
      update: {},
      create: {
        empId: "EMP008",
        name: "Deepak Nair",
        email: "deepak.nair@adhikarpath.com",
        phone: "9900008888",
        position: "Role Owner – SAP",
        orgUnit: "Finance Systems",
        status: UserStatus.ACTIVE,
        role: UserRole.ROLE_OWNER,
        managerId: srManager.id,
        password: hash("Deepak@2024"),
      },
    }),
    prisma.user.upsert({
      where: { empId: "EMP009" },
      update: {},
      create: {
        empId: "EMP009",
        name: "Meera Iyer",
        email: "meera.iyer@adhikarpath.com",
        phone: "9900009999",
        position: "Role Owner – Oracle",
        orgUnit: "Supply Chain",
        status: UserStatus.ACTIVE,
        role: UserRole.ROLE_OWNER,
        managerId: srManager.id,
        password: hash("Meera@2024"),
      },
    }),
    prisma.user.upsert({
      where: { empId: "EMP010" },
      update: {},
      create: {
        empId: "EMP010",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@adhikarpath.com",
        phone: "9900010101",
        position: "Security Analyst",
        orgUnit: "Cybersecurity",
        status: UserStatus.ACTIVE,
        role: UserRole.EMPLOYEE,
        managerId: teamLead.id,
        password: hash("Rajesh@2024"),
      },
    }),
  ]);

  console.log("✅ Users created");

  // ─── 2. Create Businesses ──────────────────────────────────────────────────
  const businesses = await Promise.all([
    prisma.business.upsert({ where: { code: "HC" }, update: {}, create: { name: "Hydrocarbon", code: "HC" } }),
    prisma.business.upsert({ where: { code: "JIO" }, update: {}, create: { name: "Jio", code: "JIO" } }),
    prisma.business.upsert({ where: { code: "MED" }, update: {}, create: { name: "Media", code: "MED" } }),
    prisma.business.upsert({ where: { code: "FND" }, update: {}, create: { name: "Foundation", code: "FND" } }),
    prisma.business.upsert({ where: { code: "RET" }, update: {}, create: { name: "Retail", code: "RET" } }),
  ]);
  const [bizHC, bizJIO, bizMED, bizFND, bizRET] = businesses;
  console.log("✅ Businesses created");

  // ─── 3. Create Systems (10+ per business) ─────────────────────────────────
  const systemsData = [
    // Hydrocarbon
    { systemCode: "HC-SAP-ECC", systemName: "SAP ECC – HC Finance", businessId: bizHC.id, clientId: "HC100" },
    { systemCode: "HC-SAP-S4", systemName: "SAP S/4HANA – HC Core", businessId: bizHC.id, clientId: "HC200" },
    { systemCode: "HC-ORACLE-EBS", systemName: "Oracle EBS – HC Procurement", businessId: bizHC.id, clientId: "HC300" },
    { systemCode: "HC-MAXIMO", systemName: "IBM Maximo – Asset Management", businessId: bizHC.id, clientId: "HC400" },
    { systemCode: "HC-PI-SYSTEM", systemName: "OSIsoft PI System", businessId: bizHC.id, clientId: "HC500" },
    { systemCode: "HC-ARIBA", systemName: "SAP Ariba – Procurement", businessId: bizHC.id, clientId: "HC600" },
    { systemCode: "HC-DOCUMENTUM", systemName: "OpenText Documentum – DMS", businessId: bizHC.id, clientId: "HC700" },
    { systemCode: "HC-AVEVA", systemName: "AVEVA Engineering", businessId: bizHC.id, clientId: "HC800" },
    { systemCode: "HC-CONCUR", systemName: "SAP Concur – Travel & Expense", businessId: bizHC.id, clientId: "HC900" },
    { systemCode: "HC-SUCCESSFACTORS", systemName: "SAP SuccessFactors – HC HR", businessId: bizHC.id, clientId: "HC101" },
    { systemCode: "HC-FIELDOPS", systemName: "Field Operations Platform", businessId: bizHC.id, clientId: "HC102" },
    // Jio
    { systemCode: "JIO-SIEBEL", systemName: "Oracle Siebel CRM", businessId: bizJIO.id, clientId: "JIO100" },
    { systemCode: "JIO-BSS", systemName: "Business Support System", businessId: bizJIO.id, clientId: "JIO200" },
    { systemCode: "JIO-OSS", systemName: "Operations Support System", businessId: bizJIO.id, clientId: "JIO300" },
    { systemCode: "JIO-MSISDN-MGR", systemName: "MSISDN Manager", businessId: bizJIO.id, clientId: "JIO400" },
    { systemCode: "JIO-BILLING", systemName: "Convergent Billing System", businessId: bizJIO.id, clientId: "JIO500" },
    { systemCode: "JIO-NETCRACKER", systemName: "NetCracker OSS/BSS", businessId: bizJIO.id, clientId: "JIO600" },
    { systemCode: "JIO-AMDOCS", systemName: "Amdocs Billing Platform", businessId: bizJIO.id, clientId: "JIO700" },
    { systemCode: "JIO-NETWORK-MGR", systemName: "Network Management System", businessId: bizJIO.id, clientId: "JIO800" },
    { systemCode: "JIO-ANALYTICS", systemName: "Jio Analytics Platform", businessId: bizJIO.id, clientId: "JIO900" },
    { systemCode: "JIO-MYPLAN", systemName: "MyJio Plan Management", businessId: bizJIO.id, clientId: "JIO101" },
    // Media
    { systemCode: "MED-CONTENT-HUB", systemName: "Content Hub – OTT Platform", businessId: bizMED.id, clientId: "MED100" },
    { systemCode: "MED-AD-OPS", systemName: "Ad Operations System", businessId: bizMED.id, clientId: "MED200" },
    { systemCode: "MED-NEWSROOM", systemName: "Digital Newsroom System", businessId: bizMED.id, clientId: "MED300" },
    { systemCode: "MED-BROADCAST", systemName: "Broadcast Management", businessId: bizMED.id, clientId: "MED400" },
    { systemCode: "MED-RIGHTS-MGR", systemName: "Rights Management System", businessId: bizMED.id, clientId: "MED500" },
    { systemCode: "MED-SUBSCRIPTION", systemName: "Subscription Management", businessId: bizMED.id, clientId: "MED600" },
    { systemCode: "MED-ANALYTICS", systemName: "Audience Analytics Platform", businessId: bizMED.id, clientId: "MED700" },
    { systemCode: "MED-CMS", systemName: "Content Management System", businessId: bizMED.id, clientId: "MED800" },
    { systemCode: "MED-PLAYOUT", systemName: "Playout Automation System", businessId: bizMED.id, clientId: "MED900" },
    { systemCode: "MED-ARCHIVE", systemName: "Media Archive System", businessId: bizMED.id, clientId: "MED101" },
    // Foundation
    { systemCode: "FND-GRANT-MGR", systemName: "Grant Management System", businessId: bizFND.id, clientId: "FND100" },
    { systemCode: "FND-CSR-PORTAL", systemName: "CSR Project Portal", businessId: bizFND.id, clientId: "FND200" },
    { systemCode: "FND-DONOR-CRM", systemName: "Donor CRM System", businessId: bizFND.id, clientId: "FND300" },
    { systemCode: "FND-IMPACT-TRACK", systemName: "Impact Tracking System", businessId: bizFND.id, clientId: "FND400" },
    { systemCode: "FND-VOLUNTEER", systemName: "Volunteer Management", businessId: bizFND.id, clientId: "FND500" },
    { systemCode: "FND-EDU-PORTAL", systemName: "Education Portal", businessId: bizFND.id, clientId: "FND600" },
    { systemCode: "FND-HEALTH-MIS", systemName: "Health MIS", businessId: bizFND.id, clientId: "FND700" },
    { systemCode: "FND-FINANCE", systemName: "Foundation Finance System", businessId: bizFND.id, clientId: "FND800" },
    { systemCode: "FND-COMPLIANCE", systemName: "Compliance & Reporting", businessId: bizFND.id, clientId: "FND900" },
    { systemCode: "FND-KNOWLEDGE", systemName: "Knowledge Management", businessId: bizFND.id, clientId: "FND101" },
    // Retail
    { systemCode: "RET-SAP-RETAIL", systemName: "SAP IS-Retail", businessId: bizRET.id, clientId: "RET100" },
    { systemCode: "RET-POS", systemName: "Point-of-Sale System", businessId: bizRET.id, clientId: "RET200" },
    { systemCode: "RET-INVENTORY", systemName: "Inventory Management", businessId: bizRET.id, clientId: "RET300" },
    { systemCode: "RET-ECOMM", systemName: "E-Commerce Platform", businessId: bizRET.id, clientId: "RET400" },
    { systemCode: "RET-LOYALTY", systemName: "Loyalty & Rewards Platform", businessId: bizRET.id, clientId: "RET500" },
    { systemCode: "RET-WMS", systemName: "Warehouse Management System", businessId: bizRET.id, clientId: "RET600" },
    { systemCode: "RET-TMS", systemName: "Transport Management System", businessId: bizRET.id, clientId: "RET700" },
    { systemCode: "RET-PLANOGRAM", systemName: "Planogram & Space Planning", businessId: bizRET.id, clientId: "RET800" },
    { systemCode: "RET-VENDOR", systemName: "Vendor Portal", businessId: bizRET.id, clientId: "RET900" },
    { systemCode: "RET-ANALYTICS", systemName: "Retail Analytics Dashboard", businessId: bizRET.id, clientId: "RET101" },
    { systemCode: "RET-HRMS", systemName: "Retail HRMS", businessId: bizRET.id, clientId: "RET102" },
  ];

  const systemMap: Record<string, string> = {};
  for (const sys of systemsData) {
    const s = await prisma.system.upsert({
      where: { systemCode: sys.systemCode },
      update: {},
      create: sys,
    });
    systemMap[sys.systemCode] = s.id;
  }
  console.log("✅ Systems created");

  // ─── 4. Create Roles (50+ across systems) ─────────────────────────────────
  const rolesData = [
    // SAP ECC – HC Finance
    { roleName: "FI_ACCOUNTANT", systemCode: "HC-SAP-ECC", processHierarchyPath: "Finance > Accounts > Posting", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Financial Accountant – Journal posting and GL management" },
    { roleName: "FI_APPROVER", systemCode: "HC-SAP-ECC", processHierarchyPath: "Finance > Accounts > Approval", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Financial Approver – Invoice and payment approval" },
    { roleName: "FI_CONTROLLER", systemCode: "HC-SAP-ECC", processHierarchyPath: "Finance > Controlling", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Cost Center Controller – CO module access" },
    { roleName: "MM_PURCHASER", systemCode: "HC-SAP-ECC", processHierarchyPath: "Procurement > Purchase Orders", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Material Management Purchaser" },
    { roleName: "MM_GOODS_RECEIPT", systemCode: "HC-SAP-ECC", processHierarchyPath: "Procurement > Warehouse", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Goods Receipt Processor" },
    // SAP S/4HANA
    { roleName: "S4_FIORI_USER", systemCode: "HC-SAP-S4", processHierarchyPath: "Core > Fiori Launchpad", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "S/4HANA Fiori Standard User" },
    { roleName: "S4_ASSET_MANAGER", systemCode: "HC-SAP-S4", processHierarchyPath: "Finance > Asset Accounting", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Fixed Asset Manager" },
    { roleName: "S4_PLANT_MAINTENANCE", systemCode: "HC-SAP-S4", processHierarchyPath: "Operations > Plant Maintenance", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Plant Maintenance Technician" },
    // Oracle EBS
    { roleName: "ORA_AP_CLERK", systemCode: "HC-ORACLE-EBS", processHierarchyPath: "Finance > Accounts Payable", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Accounts Payable Clerk" },
    { roleName: "ORA_AP_MANAGER", systemCode: "HC-ORACLE-EBS", processHierarchyPath: "Finance > Accounts Payable > Management", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Accounts Payable Manager" },
    { roleName: "ORA_SCM_PLANNER", systemCode: "HC-ORACLE-EBS", processHierarchyPath: "Supply Chain > Planning", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Supply Chain Planner" },
    // Maximo
    { roleName: "MAX_WORK_ORDER", systemCode: "HC-MAXIMO", processHierarchyPath: "Asset Mgmt > Work Orders", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Work Order Creator and Manager" },
    { roleName: "MAX_INSPECTOR", systemCode: "HC-MAXIMO", processHierarchyPath: "Asset Mgmt > Inspections", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Asset Inspector" },
    // Jio BSS
    { roleName: "BSS_CUST_CARE", systemCode: "JIO-BSS", processHierarchyPath: "Customer > Care", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Customer Care Representative" },
    { roleName: "BSS_PROVISIONING", systemCode: "JIO-BSS", processHierarchyPath: "Network > Service Provisioning", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Service Provisioning Operator" },
    { roleName: "BSS_BILLING_ANALYST", systemCode: "JIO-BILLING", processHierarchyPath: "Billing > Analysis", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Billing Analyst" },
    { roleName: "BSS_BILLING_ADMIN", systemCode: "JIO-BILLING", processHierarchyPath: "Billing > Administration", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Billing Administrator" },
    // Jio CRM
    { roleName: "CRM_SALES_REP", systemCode: "JIO-SIEBEL", processHierarchyPath: "Sales > Field Representatives", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "CRM Sales Representative" },
    { roleName: "CRM_SALES_MGR", systemCode: "JIO-SIEBEL", processHierarchyPath: "Sales > Management", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "CRM Sales Manager" },
    { roleName: "CRM_RETENTION", systemCode: "JIO-SIEBEL", processHierarchyPath: "Sales > Retention", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Customer Retention Agent" },
    // Network
    { roleName: "NET_NOC_OPERATOR", systemCode: "JIO-NETWORK-MGR", processHierarchyPath: "Network > NOC > Operations", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Network Operations Center Operator" },
    { roleName: "NET_NOC_MANAGER", systemCode: "JIO-NETWORK-MGR", processHierarchyPath: "Network > NOC > Management", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "NOC Manager" },
    // Media
    { roleName: "MED_CONTENT_EDITOR", systemCode: "MED-CMS", processHierarchyPath: "Content > Editorial", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Content Editor" },
    { roleName: "MED_CONTENT_APPROVER", systemCode: "MED-CMS", processHierarchyPath: "Content > Editorial > Approval", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Content Approver" },
    { roleName: "MED_AD_MANAGER", systemCode: "MED-AD-OPS", processHierarchyPath: "Revenue > Advertising", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Ad Operations Manager" },
    { roleName: "MED_RIGHTS_ANALYST", systemCode: "MED-RIGHTS-MGR", processHierarchyPath: "Legal > Rights Management", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Rights Analyst" },
    { roleName: "MED_BROADCAST_OPS", systemCode: "MED-BROADCAST", processHierarchyPath: "Broadcast > Operations", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Broadcast Operations Technician" },
    { roleName: "MED_SUBSCRIPTION_MGR", systemCode: "MED-SUBSCRIPTION", processHierarchyPath: "Revenue > Subscriptions", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Subscription Manager" },
    // Foundation
    { roleName: "FND_GRANT_OFFICER", systemCode: "FND-GRANT-MGR", processHierarchyPath: "Grants > Management", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Grant Management Officer" },
    { roleName: "FND_CSR_MANAGER", systemCode: "FND-CSR-PORTAL", processHierarchyPath: "CSR > Project Management", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "CSR Project Manager" },
    { roleName: "FND_DONOR_RELATIONS", systemCode: "FND-DONOR-CRM", processHierarchyPath: "Donor > Relations", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Donor Relations Officer" },
    { roleName: "FND_IMPACT_ANALYST", systemCode: "FND-IMPACT-TRACK", processHierarchyPath: "Analytics > Impact", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Impact Measurement Analyst" },
    { roleName: "FND_VOLUNTEER_COORD", systemCode: "FND-VOLUNTEER", processHierarchyPath: "HR > Volunteer Management", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Volunteer Coordinator" },
    // Retail
    { roleName: "RET_STORE_MANAGER", systemCode: "RET-SAP-RETAIL", processHierarchyPath: "Retail > Store Operations", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Store Manager – Retail ERP" },
    { roleName: "RET_CASHIER", systemCode: "RET-POS", processHierarchyPath: "Retail > POS > Cashier", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "POS Cashier" },
    { roleName: "RET_INVENTORY_CLERK", systemCode: "RET-INVENTORY", processHierarchyPath: "Retail > Inventory", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Inventory Clerk" },
    { roleName: "RET_ECOMM_MANAGER", systemCode: "RET-ECOMM", processHierarchyPath: "Digital > E-Commerce", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "E-Commerce Manager" },
    { roleName: "RET_LOYALTY_ANALYST", systemCode: "RET-LOYALTY", processHierarchyPath: "Marketing > Loyalty", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Loyalty Programme Analyst" },
    { roleName: "RET_WAREHOUSE_OPS", systemCode: "RET-WMS", processHierarchyPath: "Supply Chain > Warehouse", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Warehouse Operations" },
    { roleName: "RET_TRANSPORT_COORD", systemCode: "RET-TMS", processHierarchyPath: "Supply Chain > Transport", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Transport Coordinator" },
    { roleName: "RET_VENDOR_MANAGER", systemCode: "RET-VENDOR", processHierarchyPath: "Procurement > Vendor Relations", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Vendor Manager" },
    { roleName: "RET_ANALYTICS_VIEWER", systemCode: "RET-ANALYTICS", processHierarchyPath: "Analytics > View", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Retail Analytics Viewer" },
    { roleName: "RET_PLANOGRAM_DESIGNER", systemCode: "RET-PLANOGRAM", processHierarchyPath: "Merchandising > Space Planning", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Planogram Designer" },
    // SuccessFactors
    { roleName: "HR_RECRUITER", systemCode: "HC-SUCCESSFACTORS", processHierarchyPath: "HR > Talent Acquisition", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Recruiter – SF Recruiting" },
    { roleName: "HR_ADMIN", systemCode: "HC-SUCCESSFACTORS", processHierarchyPath: "HR > Administration", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "HR Administrator" },
    { roleName: "HR_MANAGER", systemCode: "HC-SUCCESSFACTORS", processHierarchyPath: "HR > Manager Self Service", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "HR Manager Self-Service" },
    // Ariba
    { roleName: "ARIBA_REQUESTER", systemCode: "HC-ARIBA", processHierarchyPath: "Procurement > Requisition", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Ariba Purchase Requester" },
    { roleName: "ARIBA_APPROVER", systemCode: "HC-ARIBA", processHierarchyPath: "Procurement > Approval", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Ariba Approval Manager" },
    // Concur
    { roleName: "CONCUR_TRAVELER", systemCode: "HC-CONCUR", processHierarchyPath: "T&E > Travel", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Concur Traveler – Book and expense" },
    { roleName: "CONCUR_APPROVER", systemCode: "HC-CONCUR", processHierarchyPath: "T&E > Approval", roleOwnerEmail: "deepak.nair@adhikarpath.com", description: "Concur Expense Approver" },
    // Jio Analytics
    { roleName: "ANALYTICS_VIEWER", systemCode: "JIO-ANALYTICS", processHierarchyPath: "Analytics > View", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Analytics Platform Viewer" },
    { roleName: "ANALYTICS_ANALYST", systemCode: "JIO-ANALYTICS", processHierarchyPath: "Analytics > Analysis", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Analytics Analyst" },
    { roleName: "ANALYTICS_ADMIN", systemCode: "JIO-ANALYTICS", processHierarchyPath: "Analytics > Administration", roleOwnerEmail: "meera.iyer@adhikarpath.com", description: "Analytics Admin" },
  ];

  const roleMap: Record<string, string> = {};
  for (const roleData of rolesData) {
    const systemId = systemMap[roleData.systemCode];
    if (!systemId) continue;
    const roleOwner = await prisma.user.findUnique({ where: { email: roleData.roleOwnerEmail } });
    const existing = await prisma.role.findFirst({ where: { roleName: roleData.roleName, systemId } });
    if (!existing) {
      const r = await prisma.role.create({
        data: {
          roleName: roleData.roleName,
          systemId,
          processHierarchyPath: roleData.processHierarchyPath,
          roleOwnerId: roleOwner?.id,
          description: roleData.description,
        },
      });
      roleMap[`${roleData.systemCode}::${roleData.roleName}`] = r.id;
    } else {
      roleMap[`${roleData.systemCode}::${roleData.roleName}`] = existing.id;
    }
  }
  console.log("✅ Roles created");

  // ─── 5. User-System Access & Role Assignments ──────────────────────────────
  const allUsers = [chairman, vp, director, srManager, teamLead, gowriGanesh, ...extraUsers];

  // Give gowriGanesh access to key systems
  const gowriSystems = ["HC-SAP-ECC", "HC-SAP-S4", "RET-SAP-RETAIL", "JIO-ANALYTICS"];
  for (const sc of gowriSystems) {
    const sysId = systemMap[sc];
    if (!sysId) continue;
    await prisma.userSystemAccess.upsert({
      where: { userId_systemId: { userId: gowriGanesh.id, systemId: sysId } },
      update: {},
      create: {
        userId: gowriGanesh.id,
        systemId: sysId,
        status: AccessStatus.ACTIVE,
        validFrom: new Date("2023-01-01"),
        lastLogon: new Date("2024-12-01"),
      },
    });
  }

  // Give other users access to relevant systems
  const userSystemMap: Array<{ userId: string; codes: string[] }> = [
    { userId: chairman.id, codes: ["HC-SAP-ECC", "HC-SAP-S4", "JIO-ANALYTICS", "RET-ANALYTICS", "MED-ANALYTICS"] },
    { userId: vp.id, codes: ["HC-SAP-ECC", "HC-SAP-S4", "HC-ORACLE-EBS", "JIO-BSS", "RET-SAP-RETAIL"] },
    { userId: director.id, codes: ["HC-SAP-ECC", "HC-MAXIMO", "JIO-SIEBEL", "RET-WMS"] },
    { userId: srManager.id, codes: ["HC-SAP-ECC", "HC-SUCCESSFACTORS", "JIO-BSS", "RET-POS"] },
    { userId: teamLead.id, codes: ["HC-SAP-ECC", "HC-ARIBA", "JIO-BILLING", "RET-INVENTORY"] },
    { userId: extraUsers[0].id, codes: ["HC-SAP-ECC", "HC-CONCUR", "RET-POS"] },
    { userId: extraUsers[1].id, codes: ["HC-SAP-ECC", "HC-SAP-S4", "HC-ORACLE-EBS", "HC-ARIBA"] },
    { userId: extraUsers[2].id, codes: ["HC-ORACLE-EBS", "JIO-SIEBEL", "MED-CMS", "RET-INVENTORY"] },
    { userId: extraUsers[3].id, codes: ["JIO-NETWORK-MGR", "JIO-BSS", "HC-PI-SYSTEM"] },
  ];

  for (const { userId, codes } of userSystemMap) {
    for (const sc of codes) {
      const sysId = systemMap[sc];
      if (!sysId) continue;
      await prisma.userSystemAccess.upsert({
        where: { userId_systemId: { userId, systemId: sysId } },
        update: {},
        create: {
          userId,
          systemId: sysId,
          status: AccessStatus.ACTIVE,
          validFrom: new Date("2022-06-01"),
          lastLogon: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Role assignments for gowriGanesh
  const gowriRoles = ["HC-SAP-ECC::FI_ACCOUNTANT", "HC-SAP-S4::S4_FIORI_USER", "RET-SAP-RETAIL::RET_STORE_MANAGER"];
  for (const key of gowriRoles) {
    const roleId = roleMap[key];
    if (!roleId) continue;
    await prisma.userRoleAssignment.upsert({
      where: { userId_roleId: { userId: gowriGanesh.id, roleId } },
      update: {},
      create: { userId: gowriGanesh.id, roleId, assignedDate: new Date("2023-01-15"), status: AssignmentStatus.ACTIVE },
    });
  }

  // Role assignments for deepak (Role Owner)
  const deepakRoles = ["HC-SAP-ECC::FI_APPROVER", "HC-SAP-S4::S4_ASSET_MANAGER", "HC-ARIBA::ARIBA_APPROVER"];
  for (const key of deepakRoles) {
    const roleId = roleMap[key];
    if (!roleId) continue;
    await prisma.userRoleAssignment.upsert({
      where: { userId_roleId: { userId: extraUsers[1].id, roleId } },
      update: {},
      create: { userId: extraUsers[1].id, roleId, assignedDate: new Date("2022-09-01"), status: AssignmentStatus.ACTIVE },
    });
  }

  console.log("✅ User system access and role assignments created");

  // ─── 6. Sample Access Request ──────────────────────────────────────────────
  const sysIdSAPECC = systemMap["HC-SAP-ECC"];
  const existingRequest = await prisma.accessRequest.findFirst({ where: { requestorId: gowriGanesh.id } });
  if (!existingRequest && sysIdSAPECC) {
    const request = await prisma.accessRequest.create({
      data: {
        requestorId: gowriGanesh.id,
        targetUserId: gowriGanesh.id,
        requestType: "ADDITIONAL_AUTH",
        systemId: sysIdSAPECC,
        justification: "Need access to FI Approver role for month-end closing activities.",
        isTemporary: false,
        status: "PENDING",
      },
    });

    await prisma.approvalStep.create({
      data: {
        requestId: request.id,
        approverId: teamLead.id,
        approverRole: "L1_MANAGER",
        sequence: 1,
        status: "PENDING",
      },
    });
  }

  // ─── 7. Consultants ────────────────────────────────────────────────────────
  const consultantsData = [
    { name: "Raj Kapoor", email: "raj.kapoor@extern.com", businessId: bizHC.id, category: "IT Contractor", sponsorId: srManager.id, validUntil: new Date("2025-12-31") },
    { name: "Anna Thomas", email: "anna.thomas@extern.com", businessId: bizJIO.id, category: "Network Consultant", sponsorId: director.id, validUntil: new Date("2025-06-30") },
    { name: "Mohammed Al-Rashid", email: "m.rashid@extern.com", businessId: bizMED.id, category: "Media Specialist", sponsorId: vp.id, validUntil: new Date("2025-09-30") },
    { name: "Sarah Chen", email: "sarah.chen@extern.com", businessId: bizFND.id, category: "CSR Consultant", sponsorId: director.id, validUntil: new Date("2025-03-31") },
    { name: "Vikram Singh", email: "vikram.singh@extern.com", businessId: bizRET.id, category: "Retail Analyst", sponsorId: srManager.id, validUntil: new Date("2025-11-30") },
  ];

  for (const c of consultantsData) {
    const existing = await prisma.consultant.findUnique({ where: { email: c.email } });
    if (!existing) {
      await prisma.consultant.create({
        data: { ...c, status: "ACTIVE" },
      });
    }
  }
  console.log("✅ Consultants created");

  // ─── 8. Help Document Tree ────────────────────────────────────────────────
  // Root sections
  const helpSections: Array<{ title: string; children?: Array<{ title: string; children?: Array<{ title: string }> }> }> = [
    {
      title: "Getting Started",
      children: [
        { title: "Welcome to AdhikarPath" },
        { title: "First Login Guide" },
        { title: "System Overview" },
        { title: "User Profile Setup" },
      ],
    },
    {
      title: "FAQs",
      children: [
        { title: "Access Request FAQs" },
        { title: "Password & Login FAQs" },
        { title: "Approval Workflow FAQs" },
      ],
    },
    {
      title: "Dashboards",
      children: [
        {
          title: "My Dashboard",
          children: [
            { title: "Dashboard Widgets" },
            { title: "Customising Your View" },
          ],
        },
        {
          title: "Manager Dashboard",
          children: [
            { title: "Team Access Overview" },
            { title: "Pending Approvals Widget" },
          ],
        },
      ],
    },
    {
      title: "User Account Services",
      children: [
        { title: "New Account Request" },
        { title: "Additional Authorisation" },
        { title: "Password Reset" },
        { title: "Unlock Account" },
        { title: "Access Surrender" },
        { title: "Access Reinstatement" },
      ],
    },
    {
      title: "Authorization Services",
      children: [
        {
          title: "Role Management",
          children: [
            { title: "Requesting a New Role" },
            { title: "Role Owner Responsibilities" },
          ],
        },
        {
          title: "Approval Workflows",
          children: [
            { title: "L1 Manager Approval" },
            { title: "Role Owner Approval" },
          ],
        },
        { title: "Temporary Access" },
        { title: "Audit & Compliance" },
      ],
    },
  ];

  async function createHelpDocs(
    items: typeof helpSections,
    parentId: string | null = null,
    sortStart = 0
  ) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const existing = await prisma.helpDocument.findFirst({ where: { title: item.title, parentId } });
      let doc: { id: string };
      if (!existing) {
        doc = await prisma.helpDocument.create({
          data: {
            title: item.title,
            content: `# ${item.title}\n\nContent for ${item.title} goes here.`,
            parentId,
            sortOrder: sortStart + i,
          },
        });
      } else {
        doc = existing;
      }
      if (item.children && item.children.length > 0) {
        await createHelpDocs(item.children as typeof helpSections, doc.id, 0);
      }
    }
  }

  await createHelpDocs(helpSections);
  console.log("✅ Help documents created");

  // ─── 9. Default Quick Links ───────────────────────────────────────────────
  const quickLinksTemplate = [
    { linkType: "INTERNAL", linkName: "My Access Requests", linkUrl: "/requests", sortOrder: 1 },
    { linkType: "INTERNAL", linkName: "Pending Approvals", linkUrl: "/approvals", sortOrder: 2 },
    { linkType: "INTERNAL", linkName: "System Catalogue", linkUrl: "/systems", sortOrder: 3 },
    { linkType: "INTERNAL", linkName: "Help & Support", linkUrl: "/help", sortOrder: 4 },
    { linkType: "EXTERNAL", linkName: "IT Service Desk", linkUrl: "https://servicedesk.adhikarpath.com", sortOrder: 5 },
    { linkType: "EXTERNAL", linkName: "HR Portal", linkUrl: "https://hrms.adhikarpath.com", sortOrder: 6 },
  ];

  for (const user of allUsers) {
    for (const ql of quickLinksTemplate) {
      const exists = await prisma.quickLink.findFirst({ where: { userId: user.id, linkUrl: ql.linkUrl } });
      if (!exists) {
        await prisma.quickLink.create({ data: { userId: user.id, ...ql } });
      }
    }
  }
  console.log("✅ Quick links created");

  // ─── 10. Sample Notifications ─────────────────────────────────────────────
  const notifData = [
    {
      userId: gowriGanesh.id,
      type: "ACCESS_REQUEST",
      title: "Access Request Submitted",
      message: "Your access request ARQ-2024-001 has been submitted and is pending L1 approval.",
      read: false,
    },
    {
      userId: teamLead.id,
      type: "APPROVAL_PENDING",
      title: "Approval Required",
      message: "Gowri Ganesh has requested additional SAP ECC authorisation. Your approval is required.",
      read: false,
    },
    {
      userId: gowriGanesh.id,
      type: "SYSTEM",
      title: "Welcome to AdhikarPath",
      message: "Your AdhikarPath account is now active. Please review your current access from the dashboard.",
      read: true,
    },
    {
      userId: srManager.id,
      type: "REPORT",
      title: "Monthly Access Review",
      message: "The quarterly access review is due. Please certify your team's access by 31 March 2024.",
      read: false,
    },
  ];

  for (const n of notifData) {
    await prisma.notification.create({ data: n });
  }
  console.log("✅ Notifications created");

  // ─── 11. Audit Logs ───────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: gowriGanesh.id,
      action: "ACCESS_REQUEST_CREATED",
      entityType: "AccessRequest",
      entityId: "seed",
      detailsJson: JSON.stringify({ system: "HC-SAP-ECC", requestType: "ADDITIONAL_AUTH" }),
      ipAddress: "10.0.0.1",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: chairman.id,
      action: "USER_CREATED",
      entityType: "User",
      entityId: gowriGanesh.id,
      detailsJson: JSON.stringify({ empId: "EMP006", name: "Gowri Ganesh" }),
      ipAddress: "10.0.0.2",
    },
  });

  console.log("✅ Audit logs created");
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`  Users:        ${allUsers.length}`);
  console.log(`  Businesses:   ${businesses.length}`);
  console.log(`  Systems:      ${systemsData.length}`);
  console.log(`  Roles:        ${rolesData.length}`);
  console.log("\n🔑 Login credentials:");
  console.log("  gowri.ganesh@adhikarpath.com  →  GowriGanesh@2024  (EMPLOYEE)");
  console.log("  amit.verma@adhikarpath.com    →  TeamLead@2024     (L1_MANAGER)");
  console.log("  deepak.nair@adhikarpath.com   →  Deepak@2024       (ROLE_OWNER)");
  console.log("  arjun.mehta@adhikarpath.com   →  Chairman@2024     (ADMIN)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
