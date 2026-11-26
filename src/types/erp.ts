export type ExperienceRole =
  | 'public'
  | 'login'
  | 'super_admin'
  | 'pharmacy_admin'
  | 'pharmaceutical_admin';

export type PublicPage =
  | 'home'
  | 'about'
  | 'features'
  | 'solutions'
  | 'contact'
  | 'apply'
  | 'status'
  | 'privacy'
  | 'terms';

export type BusinessType = 'Pharmacy' | 'Pharmaceutical';

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export interface ApplicationRecord {
  id: string;
  refNumber: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  registrationNumber: string;
  licenseNumber: string;
  facilityDetail: string; // e.g. Branch count or Warehouse m2
  notes: string;
  submittedAt: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  reviewedBy?: string;
}

export type TenantStatus = 'Active' | 'Suspended' | 'Pending Setup';

export interface TenantRecord {
  id: string;
  code: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  registrationNumber: string;
  status: TenantStatus;
  createdAt: string;
  usersCount: number;
  monthlyTransactions: number;
  lastActiveAt: string;
  plan: string;
}

export type AccountStatus = 'Active' | 'Locked' | 'Pending Password Change';

export interface AccountRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Pharmacy Admin' | 'Pharmaceutical Admin';
  status: AccountStatus;
  requirePasswordChange: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  description: string;
}

export interface PlatformFileRecord {
  id: string;
  fileName: string;
  category: 'Business License' | 'Registration Certificate' | 'Tax Clearance' | 'Compliance Audit';
  tenantName: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SystemConfig {
  platformName: string;
  supportEmail: string;
  defaultCurrency: 'USD';
  expiryAlertDays: number;
  lowStockThresholdDefault: number;
  enforceFirstLoginPasswordChange: boolean;
  sessionTimeoutMinutes: number;
  autoBackupEnabled: boolean;
}

export type TenantScope = 'pharmacy' | 'pharmaceutical';

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  minStock: number;
  stockQty: number;
  description: string;
  tenantScope: TenantScope;
}

export interface BatchRecord {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  expiryDate: string;
  qty: number;
  receivedDate: string;
  supplierName: string;
  tenantScope: TenantScope;
}

export interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Return';
  qtyChange: number;
  reference: string;
  date: string;
  note: string;
  tenantScope: TenantScope;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: 'Individual' | 'Clinic' | 'Pharmacy' | 'Hospital';
  balanceReceivable: number;
  totalPurchases: number;
  lastPurchaseAt: string;
  tenantScope: TenantScope;
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balancePayable: number;
  totalSupplied: number;
  lastSupplyAt: string;
  tenantScope: TenantScope;
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'EVC Plus' | 'Zaad' | 'Bank Transfer' | 'Credit';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  tenantScope: TenantScope;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  qty: number;
  unitCost: number;
  total: number;
}

export interface PurchaseRecord {
  id: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  goodsReceived: boolean;
  tenantScope: TenantScope;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  tenantScope: TenantScope;
}

export interface PatientRecord {
  id: string;
  patientCode: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female';
  phone: string;
  address: string;
  registeredAt: string;
}

export interface LabRequestRecord {
  id: string;
  requestNo: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  testName: string;
  testCategory: string;
  requestDate: string;
  status: 'Pending' | 'Answered';
  resultSummary?: string;
  resultValues?: string;
  resultDate?: string;
  clinicalNotes?: string;
  whatsappStatus: 'Not Sent' | 'Delivered' | 'Failed';
  whatsappSentAt?: string;
}

export interface NotificationRecord {
  id: string;
  scope: 'super_admin' | 'pharmacy_admin' | 'pharmaceutical_admin';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface DemoStoreState {
  applications: ApplicationRecord[];
  tenants: TenantRecord[];
  accounts: AccountRecord[];
  auditLogs: AuditLogRecord[];
  platformFiles: PlatformFileRecord[];
  systemConfig: SystemConfig;
  products: ProductRecord[];
  batches: BatchRecord[];
  stockMovements: StockMovementRecord[];
  customers: CustomerRecord[];
  suppliers: SupplierRecord[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
  patients: PatientRecord[];
  labRequests: LabRequestRecord[];
  notifications: NotificationRecord[];
  contactMessages: ContactMessageRecord[];
}
