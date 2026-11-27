import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_DEMO_STATE, TODAY_ISO } from '../data/seedData';
import {
  AccountRecord,
  ApplicationRecord,
  ArchivedRecordEntry,
  AuditLogRecord,
  BatchRecord,
  BusinessType,
  ContactMessageRecord,
  CustomerRecord,
  DemoStoreState,
  ExpenseRecord,
  LabRequestRecord,
  PatientRecord,
  PaymentMethod,
  PaymentStatus,
  PlatformFileRecord,
  ProductRecord,
  PurchaseItem,
  PurchaseRecord,
  SaleItem,
  SaleRecord,
  StockMovementRecord,
  SupplierRecord,
  SystemConfig,
  TenantRecord,
  TenantScope,
} from '../types/erp';

const STORAGE_KEY = 'eclinic_erp_demo_store_v0';

function nowTimestamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${TODAY_ISO} ${hh}:${mm}`;
}

export function getBatchStatus(expiryDate: string, alertDays = 90): 'Expired' | 'Near Expiry' | 'Valid' {
  const today = new Date(TODAY_ISO).getTime();
  const exp = new Date(expiryDate).getTime();
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Expired';
  if (diffDays <= alertDays) return 'Near Expiry';
  return 'Valid';
}

interface DemoContextValue {
  state: DemoStoreState;
  // Public Website Actions
  submitApplication: (payload: {
    businessName: string;
    businessType: BusinessType;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    registrationNumber: string;
    licenseNumber: string;
    facilityDetail: string;
    notes: string;
  }) => ApplicationRecord;
  lookupApplicationByRef: (refNumber: string) => ApplicationRecord | undefined;
  submitContactMessage: (payload: Omit<ContactMessageRecord, 'id' | 'submittedAt'>) => void;

  // Super Admin Actions
  verifyApplication: (appId: string) => void;
  approveApplication: (appId: string) => { tenant: TenantRecord; account: AccountRecord } | null;
  rejectApplication: (appId: string, reason: string) => void;
  updateApplication: (appId: string, updates: Partial<ApplicationRecord>) => void;
  deleteApplication: (appId: string) => { ok: boolean; message: string };
  toggleTenantStatus: (tenantId: string) => void;
  updateTenant: (tenantId: string, updates: Partial<TenantRecord>) => void;
  deleteTenant: (tenantId: string) => { ok: boolean; message: string };
  createTenantWithAccount: (payload: {
    businessName: string;
    businessType: BusinessType;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    registrationNumber: string;
    plan?: string;
  }) => { tenant: TenantRecord; account: AccountRecord };
  createAccount: (payload: {
    tenantId: string;
    fullName: string;
    email: string;
    role: 'Pharmacy Admin' | 'Pharmaceutical Admin' | 'Super Admin';
    requirePasswordChange: boolean;
  }) => void;
  updateAccount: (accountId: string, updates: Partial<AccountRecord>) => void;
  deleteAccount: (accountId: string) => { ok: boolean; message: string };
  resetAccountPassword: (accountId: string) => void;
  completeFirstLoginPasswordChange: (email: string) => void;
  updatePlatformFile: (fileId: string, updates: Partial<PlatformFileRecord>) => void;
  deletePlatformFile: (fileId: string) => { ok: boolean; message: string };
  updateSystemConfig: (config: Partial<SystemConfig>) => void;

  // Pharmacy & Pharmaceutical Operations
  addProduct: (product: Omit<ProductRecord, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<ProductRecord>) => void;
  deleteProduct: (id: string) => { ok: boolean; message: string };
  adjustStock: (payload: {
    productId: string;
    qtyChange: number;
    note: string;
    tenantScope: TenantScope;
  }) => void;
  updateBatch: (id: string, updates: Partial<BatchRecord>) => void;
  deleteBatch: (id: string) => { ok: boolean; message: string };
  updateStockMovement: (id: string, updates: Partial<StockMovementRecord>) => void;
  deleteStockMovement: (id: string) => { ok: boolean; message: string };
  completeSale: (payload: {
    customerId: string;
    items: SaleItem[];
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    tenantScope: TenantScope;
  }) => SaleRecord;
  updateSale: (id: string, updates: Partial<SaleRecord>) => void;
  deleteSale: (id: string) => { ok: boolean; message: string };
  recordPurchase: (payload: {
    supplierId: string;
    items: PurchaseItem[];
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    goodsReceived: boolean;
    tenantScope: TenantScope;
  }) => PurchaseRecord;
  updatePurchase: (id: string, updates: Partial<PurchaseRecord>) => void;
  deletePurchase: (id: string) => { ok: boolean; message: string };
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'lastPurchaseAt'>) => CustomerRecord;
  updateCustomer: (id: string, updates: Partial<CustomerRecord>) => void;
  deleteCustomer: (id: string) => { ok: boolean; message: string };
  addSupplier: (supplier: Omit<SupplierRecord, 'id' | 'totalSupplied' | 'lastSupplyAt'>) => void;
  updateSupplier: (id: string, updates: Partial<SupplierRecord>) => void;
  deleteSupplier: (id: string) => { ok: boolean; message: string };
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => { ok: boolean; message: string };

  // Pharmacy Laboratory Module
  registerPatient: (patient: Omit<PatientRecord, 'id' | 'patientCode' | 'registeredAt'>) => PatientRecord;
  updatePatient: (id: string, updates: Partial<PatientRecord>) => void;
  deletePatient: (id: string) => { ok: boolean; message: string };
  createLabRequest: (payload: {
    patientId: string;
    testName: string;
    testCategory: string;
  }) => LabRequestRecord;
  updateLabRequest: (id: string, updates: Partial<LabRequestRecord>) => void;
  deleteLabRequest: (id: string) => { ok: boolean; message: string };
  submitLabResult: (payload: {
    requestId: string;
    resultSummary: string;
    resultValues: string;
    clinicalNotes: string;
  }) => void;
  simulateWhatsappDelivery: (requestId: string, simulateSuccess: boolean) => void;

  // Notifications & Demo Reset
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (scope: 'super_admin' | 'pharmacy_admin' | 'pharmaceutical_admin') => void;
  restoreSampleData: () => void;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DemoStoreState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoStoreState;
        const existingLogs = parsed.auditLogs || [];
        const normalizedLogs = existingLogs.map((l) =>
          l.scope
            ? l
            : {
                ...l,
                scope:
                  l.actorRole === 'Pharmacy Admin'
                    ? ('pharmacy' as const)
                    : l.actorRole === 'Pharmaceutical Admin'
                    ? ('pharmaceutical' as const)
                    : ('super_admin' as const),
              }
        );
        const hasPharmacy = normalizedLogs.some((l) => l.scope === 'pharmacy');
        const hasPharma = normalizedLogs.some((l) => l.scope === 'pharmaceutical');
        const seedExtras = INITIAL_DEMO_STATE.auditLogs.filter(
          (l) =>
            (!hasPharmacy && l.scope === 'pharmacy') ||
            (!hasPharma && l.scope === 'pharmaceutical')
        );
        return {
          ...parsed,
          auditLogs: [...normalizedLogs, ...seedExtras],
        };
      }
    } catch {
      // Fallback to initial seed state
    }
    return INITIAL_DEMO_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const tenantActor = (scope: TenantScope) =>
    scope === 'pharmacy'
      ? { actor: 'Dr. Hassan Mohamed Warsame', actorRole: 'Pharmacy Admin' }
      : { actor: 'Abdirahman Yusuf Shire', actorRole: 'Pharmaceutical Admin' };

  const appendAudit = (
    prev: DemoStoreState,
    entry: Omit<AuditLogRecord, 'id' | 'timestamp'>
  ): AuditLogRecord[] => [
    {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: nowTimestamp(),
    },
    ...prev.auditLogs,
  ];

  const appendArchive = (
    prev: DemoStoreState,
    entry: Omit<ArchivedRecordEntry, 'id' | 'archivedAt'>
  ): ArchivedRecordEntry[] => [
    {
      ...entry,
      id: `arc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      archivedAt: nowTimestamp(),
    },
    ...(prev.archivedItems || []),
  ];

  const submitApplication: DemoContextValue['submitApplication'] = (payload) => {
    const num = 1052 + state.applications.length;
    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      refNumber: `APP-2026-${num}`,
      ...payload,
      submittedAt: TODAY_ISO,
      status: 'Submitted',
    };

    setState((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
      notifications: [
        {
          id: `not-${Date.now()}`,
          scope: 'super_admin',
          title: `New ${payload.businessType} Application Received`,
          message: `${payload.businessName} (${payload.city}) submitted application ${newApp.refNumber}.`,
          type: 'info',
          date: nowTimestamp(),
          read: false,
        },
        ...prev.notifications,
      ],
      auditLogs: appendAudit(prev, {
        actor: payload.ownerName,
        actorRole: 'Public Applicant',
        action: 'SUBMIT_APPLICATION',
        resource: 'Application',
        resourceId: newApp.refNumber,
        description: `Submitted onboarding application for ${payload.businessName} (${payload.businessType}).`,
        scope: 'super_admin',
        module: 'Applications',
        status: 'info',
      }),
    }));
    return newApp;
  };

  const lookupApplicationByRef = (refNumber: string) => {
    const clean = refNumber.trim().toUpperCase();
    return state.applications.find((a) => a.refNumber.toUpperCase() === clean);
  };

  const submitContactMessage: DemoContextValue['submitContactMessage'] = (payload) => {
    setState((prev) => ({
      ...prev,
      contactMessages: [
        {
          ...payload,
          id: `msg-${Date.now()}`,
          submittedAt: nowTimestamp(),
        },
        ...prev.contactMessages,
      ],
    }));
  };

  const verifyApplication = (appId: string) => {
    setState((prev) => {
      const target = prev.applications.find((a) => a.id === appId);
      if (!target) return prev;
      return {
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Under Review',
                verifiedAt: TODAY_ISO,
                reviewedBy: 'Amina Farah Hassan (Super Admin)',
              }
            : a
        ),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'VERIFY_APPLICATION',
          resource: 'Application',
          resourceId: target.refNumber,
          description: `Verified business registration and licensing documentation for ${target.businessName}.`,
          scope: 'super_admin',
          module: 'Applications',
          status: 'info',
        }),
      };
    });
  };

  const approveApplication: DemoContextValue['approveApplication'] = (appId) => {
    const target = state.applications.find((a) => a.id === appId);
    if (!target || target.status === 'Approved') return null;

    const codePrefix = target.businessType === 'Pharmacy' ? 'TEN-PH' : 'TEN-PM';
    const nextNum = String(state.tenants.length + 1).padStart(3, '0');
    const newTenant: TenantRecord = {
      id: `ten-${Date.now()}`,
      code: `${codePrefix}-${nextNum}`,
      businessName: target.businessName,
      businessType: target.businessType,
      ownerName: target.ownerName,
      email: target.email,
      phone: target.phone,
      city: target.city,
      address: target.address,
      registrationNumber: target.registrationNumber,
      status: 'Active',
      createdAt: TODAY_ISO,
      usersCount: 1,
      monthlyTransactions: 0,
      lastActiveAt: nowTimestamp(),
      plan: target.businessType === 'Pharmacy' ? 'Pharmacy Pro + Lab' : 'Pharmaceutical Enterprise',
    };

    const newAccount: AccountRecord = {
      id: `acc-${Date.now()}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      fullName: target.ownerName,
      email: target.email,
      role: target.businessType === 'Pharmacy' ? 'Pharmacy Admin' : 'Pharmaceutical Admin',
      status: 'Pending Password Change',
      requirePasswordChange: true,
      lastLoginAt: 'Never',
      createdAt: TODAY_ISO,
    };

    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Approved',
              verifiedAt: a.verifiedAt || TODAY_ISO,
              reviewedBy: 'Amina Farah Hassan (Super Admin)',
            }
          : a
      ),
      tenants: [newTenant, ...prev.tenants],
      accounts: [newAccount, ...prev.accounts],
      notifications: [
        {
          id: `not-${Date.now()}`,
          scope: 'super_admin',
          title: 'Tenant Provisioned Successfully',
          message: `${newTenant.businessName} (${newTenant.code}) approved and initial admin account provisioned.`,
          type: 'success',
          date: nowTimestamp(),
          read: false,
        },
        ...prev.notifications,
      ],
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'APPROVE_TENANT',
        resource: 'Tenant',
        resourceId: newTenant.code,
        description: `Approved ${target.businessType} application (${target.refNumber}) and provisioned ${newTenant.businessName}.`,
        scope: 'super_admin',
        module: 'Applications',
        status: 'success',
      }),
    }));

    return { tenant: newTenant, account: newAccount };
  };

  const rejectApplication = (appId: string, reason: string) => {
    setState((prev) => {
      const target = prev.applications.find((a) => a.id === appId);
      if (!target) return prev;
      return {
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Rejected',
                rejectionReason: reason,
                reviewedBy: 'Amina Farah Hassan (Super Admin)',
              }
            : a
        ),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'REJECT_APPLICATION',
          resource: 'Application',
          resourceId: target.refNumber,
          description: `Rejected ${target.businessName} application. Reason: ${reason}`,
          scope: 'super_admin',
          module: 'Applications',
          status: 'danger',
        }),
      };
    });
  };

  const updateApplication: DemoContextValue['updateApplication'] = (appId, updates) => {
    setState((prev) => {
      const target = prev.applications.find((a) => a.id === appId);
      if (!target) return prev;
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === appId ? { ...a, ...updates } : a)),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'UPDATE_APPLICATION',
          resource: 'Application',
          resourceId: target.refNumber,
          description: `Updated onboarding application record for ${updates.businessName || target.businessName}.`,
          scope: 'super_admin',
          module: 'Applications',
          status: 'info',
        }),
      };
    });
  };

  const deleteApplication: DemoContextValue['deleteApplication'] = (appId) => {
    const target = state.applications.find((a) => a.id === appId);
    if (!target) return { ok: false, message: 'Application record not found.' };
    setState((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== appId),
      archivedItems: appendArchive(prev, {
        entity: 'Application',
        label: `${target.refNumber} — ${target.businessName}`,
        archivedBy: 'Amina Farah Hassan (Super Admin)',
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'ARCHIVE_APPLICATION',
        resource: 'Application',
        resourceId: target.refNumber,
        description: `Archived application ${target.refNumber} (${target.businessName}).`,
        scope: 'super_admin',
        module: 'Applications',
        status: 'warning',
      }),
    }));
    return { ok: true, message: `Application ${target.refNumber} (${target.businessName}) archived.` };
  };

  const toggleTenantStatus = (tenantId: string) => {
    setState((prev) => {
      const target = prev.tenants.find((t) => t.id === tenantId);
      if (!target) return prev;
      const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';
      return {
        ...prev,
        tenants: prev.tenants.map((t) => (t.id === tenantId ? { ...t, status: nextStatus } : t)),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: nextStatus === 'Active' ? 'ACTIVATE_TENANT' : 'SUSPEND_TENANT',
          resource: 'Tenant',
          resourceId: target.code,
          description: `${nextStatus === 'Suspended' ? 'Suspended' : 'Activated'} tenant ${target.businessName} (${target.code}).`,
          scope: 'super_admin',
          module: 'Tenants',
          status: nextStatus === 'Active' ? 'success' : 'warning',
        }),
      };
    });
  };

  const updateTenant: DemoContextValue['updateTenant'] = (tenantId, updates) => {
    setState((prev) => {
      const target = prev.tenants.find((t) => t.id === tenantId);
      if (!target) return prev;
      const nextName = updates.businessName ?? target.businessName;
      return {
        ...prev,
        tenants: prev.tenants.map((t) => (t.id === tenantId ? { ...t, ...updates } : t)),
        accounts: prev.accounts.map((a) =>
          a.tenantId === tenantId ? { ...a, tenantName: nextName } : a
        ),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'UPDATE_TENANT',
          resource: 'Tenant',
          resourceId: target.code,
          description: `Updated tenant information for ${nextName}.`,
          scope: 'super_admin',
          module: 'Tenants',
          status: 'info',
        }),
      };
    });
  };

  const deleteTenant: DemoContextValue['deleteTenant'] = (tenantId) => {
    const target = state.tenants.find((t) => t.id === tenantId);
    if (!target) return { ok: false, message: 'Tenant record not found.' };
    if (target.id === 'ten-1' || target.id === 'ten-2') {
      // Allow deleting secondary/new tenants or archive even primary demo tenants cleanly while preserving linked accounts check
    }
    const linkedAccounts = state.accounts.filter((a) => a.tenantId === tenantId);
    if (linkedAccounts.some((a) => a.email.toLowerCase() === 'superadmin@miahict.so')) {
      return {
        ok: false,
        message: 'Authorization Error: Cannot archive platform owner organization.',
      };
    }

    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.filter((t) => t.id !== tenantId),
      accounts: prev.accounts.filter((a) => a.tenantId !== tenantId),
      archivedItems: appendArchive(prev, {
        entity: 'Tenant',
        label: `${target.code} — ${target.businessName}`,
        archivedBy: 'Amina Farah Hassan (Super Admin)',
        snapshot: { tenant: target, accounts: linkedAccounts },
      }),
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'ARCHIVE_TENANT',
        resource: 'Tenant',
        resourceId: target.code,
        description: `Archived tenant ${target.businessName} (${target.code}) and ${linkedAccounts.length} linked account(s).`,
        scope: 'super_admin',
        module: 'Tenants',
        status: 'warning',
      }),
    }));
    return {
      ok: true,
      message: `Tenant ${target.businessName} (${target.code}) archived and removed from active list.`,
    };
  };

  const createTenantWithAccount: DemoContextValue['createTenantWithAccount'] = (payload) => {
    const codePrefix = payload.businessType === 'Pharmacy' ? 'TEN-PH' : 'TEN-PM';
    const nextNum = String(state.tenants.length + 1).padStart(3, '0');
    const newTenant: TenantRecord = {
      id: `ten-${Date.now()}`,
      code: `${codePrefix}-${nextNum}`,
      businessName: payload.businessName,
      businessType: payload.businessType,
      ownerName: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
      city: payload.city,
      address: payload.address,
      registrationNumber: payload.registrationNumber,
      status: 'Active',
      createdAt: TODAY_ISO,
      usersCount: 1,
      monthlyTransactions: 0,
      lastActiveAt: nowTimestamp(),
      plan:
        payload.plan ||
        (payload.businessType === 'Pharmacy' ? 'Pharmacy Pro + Lab' : 'Pharmaceutical Enterprise'),
    };
    const newAccount: AccountRecord = {
      id: `acc-${Date.now()}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      fullName: payload.ownerName,
      email: payload.email,
      role: payload.businessType === 'Pharmacy' ? 'Pharmacy Admin' : 'Pharmaceutical Admin',
      status: 'Pending Password Change',
      requirePasswordChange: true,
      lastLoginAt: 'Never',
      createdAt: TODAY_ISO,
    };
    setState((prev) => ({
      ...prev,
      tenants: [newTenant, ...prev.tenants],
      accounts: [newAccount, ...prev.accounts],
      notifications: [
        {
          id: `not-${Date.now()}`,
          scope: 'super_admin',
          title: 'Tenant Manually Created & Provisioned',
          message: `${newTenant.businessName} (${newTenant.code}) and admin account ${newAccount.email} created.`,
          type: 'success',
          date: nowTimestamp(),
          read: false,
        },
        ...prev.notifications,
      ],
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'CREATE_TENANT',
        resource: 'Tenant',
        resourceId: newTenant.code,
        description: `Created a ${newTenant.businessType} tenant (${newTenant.businessName}) and provisioned admin ${newAccount.email}.`,
        scope: 'super_admin',
        module: 'Tenants',
        status: 'success',
      }),
    }));
    return { tenant: newTenant, account: newAccount };
  };

  const createAccount: DemoContextValue['createAccount'] = (payload) => {
    setState((prev) => {
      const tenant = prev.tenants.find((t) => t.id === payload.tenantId);
      const tenantName = tenant ? tenant.businessName : "MI'AH ICT Solutions";
      const newAcc: AccountRecord = {
        id: `acc-${Date.now()}`,
        tenantId: payload.tenantId,
        tenantName,
        fullName: payload.fullName,
        email: payload.email,
        role: payload.role,
        status: payload.requirePasswordChange ? 'Pending Password Change' : 'Active',
        requirePasswordChange: payload.requirePasswordChange,
        lastLoginAt: 'Never',
        createdAt: TODAY_ISO,
      };
      return {
        ...prev,
        accounts: [newAcc, ...prev.accounts],
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'CREATE_ACCOUNT',
          resource: 'Account',
          resourceId: newAcc.id,
          description: `Provisioned ${payload.role} account for ${payload.fullName} (${tenantName}).`,
          scope: 'super_admin',
          module: 'Admin Accounts',
          status: 'success',
        }),
      };
    });
  };

  const updateAccount: DemoContextValue['updateAccount'] = (accountId, updates) => {
    setState((prev) => {
      const target = prev.accounts.find((a) => a.id === accountId);
      if (!target) return prev;
      const tenant = updates.tenantId
        ? prev.tenants.find((t) => t.id === updates.tenantId)
        : undefined;
      return {
        ...prev,
        accounts: prev.accounts.map((a) =>
          a.id === accountId
            ? {
                ...a,
                ...updates,
                tenantName: tenant ? tenant.businessName : updates.tenantName ?? a.tenantName,
              }
            : a
        ),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: updates.status === 'Locked' ? 'SUSPEND_ACCOUNT' : 'UPDATE_ACCOUNT',
          resource: 'Account',
          resourceId: target.id,
          description:
            updates.status === 'Locked'
              ? `Suspended administrator account ${target.fullName} (${target.email}).`
              : `Updated administrator account ${updates.email || target.email}.`,
          scope: 'super_admin',
          module: 'Admin Accounts',
          status: updates.status === 'Locked' ? 'warning' : 'info',
        }),
      };
    });
  };

  const deleteAccount: DemoContextValue['deleteAccount'] = (accountId) => {
    const target = state.accounts.find((a) => a.id === accountId);
    if (!target) return { ok: false, message: 'Account not found.' };

    // Role-based authorization check: protect currently signed-in primary Super Admin
    if (
      target.email.toLowerCase() === 'superadmin@miahict.so' ||
      (target.role === 'Super Admin' &&
        state.accounts.filter((a) => a.role === 'Super Admin').length <= 1)
    ) {
      return {
        ok: false,
        message:
          'Authorization Denied: Cannot delete the active primary Super Admin account (superadmin@miahict.so).',
      };
    }

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== accountId),
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'DELETE_ACCOUNT',
        resource: 'Account',
        resourceId: target.id,
        description: `Deleted administrator account ${target.fullName} (${target.email}).`,
        scope: 'super_admin',
        module: 'Admin Accounts',
        status: 'danger',
      }),
    }));
    return { ok: true, message: `Deleted account ${target.fullName} (${target.email}).` };
  };

  const resetAccountPassword = (accountId: string) => {
    setState((prev) => {
      const target = prev.accounts.find((a) => a.id === accountId);
      if (!target) return prev;
      return {
        ...prev,
        accounts: prev.accounts.map((a) =>
          a.id === accountId
            ? {
                ...a,
                status: 'Pending Password Change',
                requirePasswordChange: true,
              }
            : a
        ),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'RESET_PASSWORD_POLICY',
          resource: 'Account',
          resourceId: target.id,
          description: `Issued secure password reset link with mandatory first-login password change for ${target.email}.`,
          scope: 'super_admin',
          module: 'Admin Accounts',
          status: 'info',
        }),
      };
    });
  };

  const completeFirstLoginPasswordChange = (email: string) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.email.toLowerCase() === email.toLowerCase()
          ? {
              ...a,
              status: 'Active',
              requirePasswordChange: false,
              lastLoginAt: nowTimestamp(),
            }
          : a
      ),
    }));
  };

  const updatePlatformFile: DemoContextValue['updatePlatformFile'] = (fileId, updates) => {
    setState((prev) => {
      const target = prev.platformFiles.find((f) => f.id === fileId);
      if (!target) return prev;
      return {
        ...prev,
        platformFiles: prev.platformFiles.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
        auditLogs: appendAudit(prev, {
          actor: 'Amina Farah Hassan',
          actorRole: 'Super Admin',
          action: 'UPDATE_FILE_METADATA',
          resource: 'PlatformFile',
          resourceId: target.id,
          description: `Updated document metadata for ${updates.fileName || target.fileName}.`,
          scope: 'super_admin',
          module: 'Documents & Files',
          status: 'info',
        }),
      };
    });
  };

  const deletePlatformFile: DemoContextValue['deletePlatformFile'] = (fileId) => {
    const target = state.platformFiles.find((f) => f.id === fileId);
    if (!target) return { ok: false, message: 'Document not found.' };
    setState((prev) => ({
      ...prev,
      platformFiles: prev.platformFiles.filter((f) => f.id !== fileId),
      archivedItems: appendArchive(prev, {
        entity: 'PlatformFile',
        label: target.fileName,
        archivedBy: 'Amina Farah Hassan (Super Admin)',
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'ARCHIVE_FILE',
        resource: 'PlatformFile',
        resourceId: target.id,
        description: `Archived document ${target.fileName} (${target.tenantName}).`,
        scope: 'super_admin',
        module: 'Documents & Files',
        status: 'warning',
      }),
    }));
    return { ok: true, message: `Document ${target.fileName} archived and removed from active list.` };
  };

  const updateSystemConfig = (config: Partial<SystemConfig>) => {
    setState((prev) => ({
      ...prev,
      systemConfig: { ...prev.systemConfig, ...config },
      auditLogs: appendAudit(prev, {
        actor: 'Amina Farah Hassan',
        actorRole: 'Super Admin',
        action: 'UPDATE_SYSTEM_CONFIG',
        resource: 'SystemConfig',
        resourceId: 'PLATFORM_CFG',
        description: 'Updated platform configuration parameters.',
        scope: 'super_admin',
        module: 'System Config',
        status: 'info',
      }),
    }));
  };

  const addProduct: DemoContextValue['addProduct'] = (product) => {
    const id = `prod-${Date.now()}`;
    const actorInfo = tenantActor(product.tenantScope);
    setState((prev) => ({
      ...prev,
      products: [{ ...product, id }, ...prev.products],
      stockMovements:
        product.stockQty > 0
          ? [
              {
                id: `mov-${Date.now()}`,
                productId: id,
                productName: product.name,
                type: 'Adjustment',
                qtyChange: product.stockQty,
                reference: `INIT-${product.sku}`,
                date: TODAY_ISO,
                note: 'Initial opening stock balance',
                tenantScope: product.tenantScope,
              },
              ...prev.stockMovements,
            ]
          : prev.stockMovements,
      auditLogs: appendAudit(prev, {
        ...actorInfo,
        action: 'ADD_PRODUCT',
        resource: product.tenantScope === 'pharmacy' ? 'Medicine' : 'Pharmaceutical SKU',
        resourceId: product.sku,
        description:
          product.tenantScope === 'pharmacy'
            ? `Added a new medicine: ${product.name}.`
            : `Added a pharmaceutical product: ${product.name}.`,
        scope: product.tenantScope,
        module: 'Products',
        status: 'success',
      }),
    }));
  };

  const updateProduct: DemoContextValue['updateProduct'] = (id, updates) => {
    setState((prev) => {
      const target = prev.products.find((p) => p.id === id);
      if (!target) return prev;
      const nextName = updates.name ?? target.name;
      const actorInfo = tenantActor(target.tenantScope);
      return {
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        batches: prev.batches.map((b) =>
          b.productId === id ? { ...b, productName: nextName } : b
        ),
        stockMovements: prev.stockMovements.map((m) =>
          m.productId === id ? { ...m, productName: nextName } : m
        ),
        auditLogs: appendAudit(prev, {
          ...actorInfo,
          action: 'UPDATE_PRODUCT',
          resource: target.tenantScope === 'pharmacy' ? 'Medicine' : 'Pharmaceutical SKU',
          resourceId: target.sku,
          description: `Updated catalog details for ${nextName} (${target.sku}).`,
          scope: target.tenantScope,
          module: 'Products',
          status: 'info',
        }),
      };
    });
  };

  const deleteProduct: DemoContextValue['deleteProduct'] = (id) => {
    const target = state.products.find((p) => p.id === id);
    if (!target) return { ok: false, message: 'Product not found.' };
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      batches: prev.batches.filter((b) => b.productId !== id),
      archivedItems: appendArchive(prev, {
        entity: 'Product',
        label: `${target.sku} — ${target.name}`,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        ...tenantActor(target.tenantScope),
        action: 'DELETE_PRODUCT',
        resource: 'Product',
        resourceId: target.sku,
        description: `Deleted catalog product ${target.name} (${target.sku}) and cleaned linked batches.`,
        scope: target.tenantScope,
        module: 'Products',
        status: 'danger',
      }),
    }));
    return { ok: true, message: `Deleted product ${target.name} (${target.sku}).` };
  };

  const adjustStock: DemoContextValue['adjustStock'] = ({
    productId,
    qtyChange,
    note,
    tenantScope,
  }) => {
    setState((prev) => {
      const target = prev.products.find((p) => p.id === productId);
      if (!target) return prev;
      const nextQty = Math.max(0, target.stockQty + qtyChange);
      return {
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, stockQty: nextQty } : p
        ),
        stockMovements: [
          {
            id: `mov-${Date.now()}`,
            productId,
            productName: target.name,
            type: 'Adjustment',
            qtyChange,
            reference: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
            date: TODAY_ISO,
            note,
            tenantScope,
          },
          ...prev.stockMovements,
        ],
        auditLogs: appendAudit(prev, {
          ...tenantActor(tenantScope),
          action: 'ADJUST_STOCK',
          resource: tenantScope === 'pharmacy' ? 'Inventory' : 'Warehouse Inventory',
          resourceId: target.sku,
          description:
            tenantScope === 'pharmacy'
              ? `Updated inventory (${qtyChange >= 0 ? '+' : ''}${qtyChange} ${target.unit}) for ${target.name}.`
              : `Updated warehouse inventory (${qtyChange >= 0 ? '+' : ''}${qtyChange} ${target.unit}) for ${target.name}.`,
          scope: tenantScope,
          module: 'Inventory',
          status: qtyChange < 0 ? 'warning' : 'info',
        }),
      };
    });
  };

  const updateBatch: DemoContextValue['updateBatch'] = (id, updates) => {
    setState((prev) => {
      const target = prev.batches.find((b) => b.id === id);
      if (!target) return prev;
      const qtyDelta = updates.qty !== undefined ? updates.qty - target.qty : 0;
      return {
        ...prev,
        batches: prev.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        products:
          qtyDelta !== 0
            ? prev.products.map((p) =>
                p.id === target.productId
                  ? { ...p, stockQty: Math.max(0, p.stockQty + qtyDelta) }
                  : p
              )
            : prev.products,
      };
    });
  };

  const deleteBatch: DemoContextValue['deleteBatch'] = (id) => {
    const target = state.batches.find((b) => b.id === id);
    if (!target) return { ok: false, message: 'Batch record not found.' };
    setState((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== id),
      products: prev.products.map((p) =>
        p.id === target.productId
          ? { ...p, stockQty: Math.max(0, p.stockQty - target.qty) }
          : p
      ),
      stockMovements: [
        {
          id: `mov-${Date.now()}`,
          productId: target.productId,
          productName: target.productName,
          type: 'Adjustment',
          qtyChange: -target.qty,
          reference: `DEL-${target.batchNumber}`,
          date: TODAY_ISO,
          note: `Batch ${target.batchNumber} removed from inventory`,
          tenantScope: target.tenantScope,
        },
        ...prev.stockMovements,
      ],
    }));
    return {
      ok: true,
      message: `Deleted batch ${target.batchNumber} and adjusted ${target.productName} stock.`,
    };
  };

  const updateStockMovement: DemoContextValue['updateStockMovement'] = (id, updates) => {
    setState((prev) => {
      const target = prev.stockMovements.find((m) => m.id === id);
      if (!target) return prev;
      const qtyDelta = updates.qtyChange !== undefined ? updates.qtyChange - target.qtyChange : 0;
      return {
        ...prev,
        stockMovements: prev.stockMovements.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        products:
          qtyDelta !== 0
            ? prev.products.map((p) =>
                p.id === target.productId
                  ? { ...p, stockQty: Math.max(0, p.stockQty + qtyDelta) }
                  : p
              )
            : prev.products,
      };
    });
  };

  const deleteStockMovement: DemoContextValue['deleteStockMovement'] = (id) => {
    const target = state.stockMovements.find((m) => m.id === id);
    if (!target) return { ok: false, message: 'Stock movement record not found.' };
    setState((prev) => ({
      ...prev,
      stockMovements: prev.stockMovements.filter((m) => m.id !== id),
      products: prev.products.map((p) =>
        p.id === target.productId
          ? { ...p, stockQty: Math.max(0, p.stockQty - target.qtyChange) }
          : p
      ),
      archivedItems: appendArchive(prev, {
        entity: 'StockMovement',
        label: `${target.reference} — ${target.productName}`,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
    }));
    return {
      ok: true,
      message: `Removed movement ${target.reference} and synced stock for ${target.productName}.`,
    };
  };

  const completeSale: DemoContextValue['completeSale'] = ({
    customerId,
    items,
    paymentMethod,
    paymentStatus,
    tenantScope,
  }) => {
    const customer = state.customers.find((c) => c.id === customerId);
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0);
    const total = Math.max(0, subtotal - discountTotal);
    const count = state.sales.filter((s) => s.tenantScope === tenantScope).length + 1;
    const prefix = tenantScope === 'pharmacy' ? 'INV-PH-2611' : 'PM-INV-2611';

    const newSale: SaleRecord = {
      id: `sal-${Date.now()}`,
      invoiceNo: `${prefix}-${String(count).padStart(2, '0')}`,
      date: TODAY_ISO,
      customerId,
      customerName: customer ? customer.name : 'Walk-in Customer',
      items,
      subtotal,
      discountTotal,
      total,
      paymentMethod,
      paymentStatus,
      tenantScope,
    };

    setState((prev) => {
      // Deduct product stock and oldest valid batch qty
      const updatedProducts = prev.products.map((prod) => {
        const soldItem = items.find((i) => i.productId === prod.id);
        if (!soldItem) return prod;
        return { ...prod, stockQty: Math.max(0, prod.stockQty - soldItem.qty) };
      });

      const updatedBatches = prev.batches.map((bat) => {
        const soldItem = items.find((i) => i.productId === bat.productId);
        if (!soldItem) return bat;
        return { ...bat, qty: Math.max(0, bat.qty - soldItem.qty) };
      });

      const newMovements: typeof prev.stockMovements = items.map((item, idx) => ({
        id: `mov-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: item.productName,
        type: 'Sale',
        qtyChange: -item.qty,
        reference: newSale.invoiceNo,
        date: TODAY_ISO,
        note: `${tenantScope === 'pharmacy' ? 'POS sale' : 'Pharmaceutical invoice'} — ${newSale.customerName}`,
        tenantScope,
      }));

      const updatedCustomers = prev.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              totalPurchases: c.totalPurchases + total,
              lastPurchaseAt: TODAY_ISO,
              balanceReceivable:
                paymentStatus === 'Pending' || paymentMethod === 'Credit'
                  ? c.balanceReceivable + total
                  : paymentStatus === 'Partial'
                  ? c.balanceReceivable + total * 0.5
                  : c.balanceReceivable,
            }
          : c
      );

      return {
        ...prev,
        products: updatedProducts,
        batches: updatedBatches,
        sales: [newSale, ...prev.sales],
        stockMovements: [...newMovements, ...prev.stockMovements],
        customers: updatedCustomers,
        auditLogs: appendAudit(prev, {
          ...tenantActor(tenantScope),
          action: 'COMPLETE_POS_SALE',
          resource: tenantScope === 'pharmacy' ? 'Sale Invoice' : 'B2B Invoice',
          resourceId: newSale.invoiceNo,
          description: `Completed a POS sale ($${total.toFixed(2)} via ${paymentMethod}) for ${newSale.customerName}.`,
          scope: tenantScope,
          module: 'Sales & POS',
          status: paymentStatus === 'Paid' ? 'success' : 'warning',
        }),
      };
    });

    return newSale;
  };

  const getSaleReceivable = (sale: Pick<SaleRecord, 'total' | 'paymentStatus' | 'paymentMethod'>) => {
    if (sale.paymentStatus === 'Pending' || sale.paymentMethod === 'Credit') return sale.total;
    if (sale.paymentStatus === 'Partial') return sale.total * 0.5;
    return 0;
  };

  const updateSale: DemoContextValue['updateSale'] = (id, updates) => {
    setState((prev) => {
      const target = prev.sales.find((s) => s.id === id);
      if (!target) return prev;
      const nextCustomer = updates.customerId
        ? prev.customers.find((c) => c.id === updates.customerId)
        : undefined;
      const nextDiscount = updates.discountTotal ?? target.discountTotal;
      const nextTotal =
        updates.total !== undefined
          ? updates.total
          : Math.max(0, target.subtotal - nextDiscount);
      const merged: SaleRecord = {
        ...target,
        ...updates,
        customerName: nextCustomer ? nextCustomer.name : updates.customerName ?? target.customerName,
        discountTotal: nextDiscount,
        total: nextTotal,
      };

      const oldReceivable = getSaleReceivable(target);
      const newReceivable = getSaleReceivable(merged);

      const updatedCustomers = prev.customers.map((c) => {
        if (target.customerId === merged.customerId && c.id === merged.customerId) {
          return {
            ...c,
            totalPurchases: Math.max(0, c.totalPurchases - target.total + merged.total),
            balanceReceivable: Math.max(0, c.balanceReceivable - oldReceivable + newReceivable),
          };
        }
        if (c.id === target.customerId) {
          return {
            ...c,
            totalPurchases: Math.max(0, c.totalPurchases - target.total),
            balanceReceivable: Math.max(0, c.balanceReceivable - oldReceivable),
          };
        }
        if (c.id === merged.customerId) {
          return {
            ...c,
            totalPurchases: c.totalPurchases + merged.total,
            balanceReceivable: c.balanceReceivable + newReceivable,
          };
        }
        return c;
      });

      return {
        ...prev,
        sales: prev.sales.map((s) => (s.id === id ? merged : s)),
        customers: updatedCustomers,
      };
    });
  };

  const deleteSale: DemoContextValue['deleteSale'] = (id) => {
    const target = state.sales.find((s) => s.id === id);
    if (!target) return { ok: false, message: 'Invoice record not found.' };
    const receivableToReverse = getSaleReceivable(target);

    setState((prev) => ({
      ...prev,
      sales: prev.sales.filter((s) => s.id !== id),
      products: prev.products.map((p) => {
        const soldQty = target.items
          .filter((item) => item.productId === p.id)
          .reduce((sum, item) => sum + item.qty, 0);
        return soldQty > 0 ? { ...p, stockQty: p.stockQty + soldQty } : p;
      }),
      customers: prev.customers.map((c) =>
        c.id === target.customerId
          ? {
              ...c,
              totalPurchases: Math.max(0, c.totalPurchases - target.total),
              balanceReceivable: Math.max(0, c.balanceReceivable - receivableToReverse),
            }
          : c
      ),
      archivedItems: appendArchive(prev, {
        entity: 'SaleInvoice',
        label: `${target.invoiceNo} — ${target.customerName} ($${target.total.toFixed(2)})`,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        ...tenantActor(target.tenantScope),
        action: 'ARCHIVE_SALE_INVOICE',
        resource: 'Sale Invoice',
        resourceId: target.invoiceNo,
        description: `Archived invoice ${target.invoiceNo} ($${target.total.toFixed(2)}), restored stock, and updated customer balance.`,
        scope: target.tenantScope,
        module: 'Sales & POS',
        status: 'warning',
      }),
    }));
    return {
      ok: true,
      message: `Invoice ${target.invoiceNo} archived. Stock quantities and customer balances updated.`,
    };
  };

  const recordPurchase: DemoContextValue['recordPurchase'] = ({
    supplierId,
    items,
    paymentStatus,
    goodsReceived,
    tenantScope,
  }) => {
    const supplier = state.suppliers.find((s) => s.id === supplierId);
    const total = items.reduce((sum, i) => sum + i.total, 0);
    const count = state.purchases.filter((p) => p.tenantScope === tenantScope).length + 1;
    const prefix = tenantScope === 'pharmacy' ? 'PO-PH-2611' : 'PO-PM-2611';

    const newPurchase: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      poNumber: `${prefix}-${String(count).padStart(2, '0')}`,
      date: TODAY_ISO,
      supplierId,
      supplierName: supplier ? supplier.name : 'Supplier',
      items,
      total,
      paymentStatus,
      goodsReceived,
      tenantScope,
    };

    setState((prev) => {
      let updatedProducts = [...prev.products];
      let updatedBatches = [...prev.batches];
      const newMovements: typeof prev.stockMovements = [];

      if (goodsReceived) {
        items.forEach((item, idx) => {
          updatedProducts = updatedProducts.map((p) =>
            p.id === item.productId ? { ...p, stockQty: p.stockQty + item.qty } : p
          );
          updatedBatches = [
            {
              id: `bat-${Date.now()}-${idx}`,
              batchNumber: item.batchNumber,
              productId: item.productId,
              productName: item.productName,
              expiryDate: item.expiryDate,
              qty: item.qty,
              receivedDate: TODAY_ISO,
              supplierName: newPurchase.supplierName,
              tenantScope,
            },
            ...updatedBatches,
          ];
          newMovements.push({
            id: `mov-${Date.now()}-${idx}`,
            productId: item.productId,
            productName: item.productName,
            type: 'Purchase',
            qtyChange: item.qty,
            reference: newPurchase.poNumber,
            date: TODAY_ISO,
            note: `Received from ${newPurchase.supplierName}`,
            tenantScope,
          });
        });
      }

      const updatedSuppliers = prev.suppliers.map((s) =>
        s.id === supplierId
          ? {
              ...s,
              totalSupplied: s.totalSupplied + total,
              lastSupplyAt: TODAY_ISO,
              balancePayable:
                paymentStatus === 'Unpaid'
                  ? s.balancePayable + total
                  : paymentStatus === 'Partial'
                  ? s.balancePayable + total * 0.5
                  : s.balancePayable,
            }
          : s
      );

      return {
        ...prev,
        products: updatedProducts,
        batches: updatedBatches,
        purchases: [newPurchase, ...prev.purchases],
        stockMovements: [...newMovements, ...prev.stockMovements],
        suppliers: updatedSuppliers,
        auditLogs: appendAudit(prev, {
          ...tenantActor(tenantScope),
          action: 'RECORD_PURCHASE',
          resource: 'Purchase Order',
          resourceId: newPurchase.poNumber,
          description: `Recorded a purchase (${newPurchase.poNumber}, $${total.toFixed(2)}) from ${newPurchase.supplierName}.`,
          scope: tenantScope,
          module: tenantScope === 'pharmacy' ? 'Purchases' : 'Purchasing',
          status: 'success',
        }),
      };
    });

    return newPurchase;
  };

  const getPurchasePayable = (p: Pick<PurchaseRecord, 'total' | 'paymentStatus'>) => {
    if (p.paymentStatus === 'Unpaid') return p.total;
    if (p.paymentStatus === 'Partial') return p.total * 0.5;
    return 0;
  };

  const updatePurchase: DemoContextValue['updatePurchase'] = (id, updates) => {
    setState((prev) => {
      const target = prev.purchases.find((p) => p.id === id);
      if (!target) return prev;
      const nextSupplier = updates.supplierId
        ? prev.suppliers.find((s) => s.id === updates.supplierId)
        : undefined;
      const merged: PurchaseRecord = {
        ...target,
        ...updates,
        supplierName: nextSupplier ? nextSupplier.name : updates.supplierName ?? target.supplierName,
      };
      const oldPayable = getPurchasePayable(target);
      const newPayable = getPurchasePayable(merged);

      let updatedProducts = prev.products;
      if (target.goodsReceived !== merged.goodsReceived) {
        const sign = merged.goodsReceived ? 1 : -1;
        updatedProducts = prev.products.map((p) => {
          const itemQty = merged.items
            .filter((item) => item.productId === p.id)
            .reduce((sum, item) => sum + item.qty, 0);
          return itemQty > 0
            ? { ...p, stockQty: Math.max(0, p.stockQty + sign * itemQty) }
            : p;
        });
      }

      const updatedSuppliers = prev.suppliers.map((s) => {
        if (target.supplierId === merged.supplierId && s.id === merged.supplierId) {
          return {
            ...s,
            totalSupplied: Math.max(0, s.totalSupplied - target.total + merged.total),
            balancePayable: Math.max(0, s.balancePayable - oldPayable + newPayable),
          };
        }
        if (s.id === target.supplierId) {
          return {
            ...s,
            totalSupplied: Math.max(0, s.totalSupplied - target.total),
            balancePayable: Math.max(0, s.balancePayable - oldPayable),
          };
        }
        if (s.id === merged.supplierId) {
          return {
            ...s,
            totalSupplied: s.totalSupplied + merged.total,
            balancePayable: s.balancePayable + newPayable,
          };
        }
        return s;
      });

      return {
        ...prev,
        purchases: prev.purchases.map((p) => (p.id === id ? merged : p)),
        products: updatedProducts,
        suppliers: updatedSuppliers,
      };
    });
  };

  const deletePurchase: DemoContextValue['deletePurchase'] = (id) => {
    const target = state.purchases.find((p) => p.id === id);
    if (!target) return { ok: false, message: 'Purchase order not found.' };
    const payableToReverse = getPurchasePayable(target);

    setState((prev) => ({
      ...prev,
      purchases: prev.purchases.filter((p) => p.id !== id),
      products: target.goodsReceived
        ? prev.products.map((p) => {
            const qty = target.items
              .filter((item) => item.productId === p.id)
              .reduce((sum, item) => sum + item.qty, 0);
            return qty > 0 ? { ...p, stockQty: Math.max(0, p.stockQty - qty) } : p;
          })
        : prev.products,
      suppliers: prev.suppliers.map((s) =>
        s.id === target.supplierId
          ? {
              ...s,
              totalSupplied: Math.max(0, s.totalSupplied - target.total),
              balancePayable: Math.max(0, s.balancePayable - payableToReverse),
            }
          : s
      ),
      archivedItems: appendArchive(prev, {
        entity: 'PurchaseOrder',
        label: `${target.poNumber} — ${target.supplierName} ($${target.total.toFixed(2)})`,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        ...tenantActor(target.tenantScope),
        action: 'ARCHIVE_PURCHASE_ORDER',
        resource: 'Purchase Order',
        resourceId: target.poNumber,
        description: `Archived purchase order ${target.poNumber} ($${target.total.toFixed(2)}) and synced supplier payables.`,
        scope: target.tenantScope,
        module: target.tenantScope === 'pharmacy' ? 'Purchases' : 'Purchasing',
        status: 'warning',
      }),
    }));
    return {
      ok: true,
      message: `Purchase order ${target.poNumber} archived and supplier balances updated.`,
    };
  };

  const addCustomer: DemoContextValue['addCustomer'] = (customer) => {
    const newCustomer: CustomerRecord = {
      ...customer,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      lastPurchaseAt: '—',
    };
    setState((prev) => ({
      ...prev,
      customers: [newCustomer, ...prev.customers],
      auditLogs: appendAudit(prev, {
        ...tenantActor(customer.tenantScope),
        action: 'REGISTER_CUSTOMER',
        resource: 'Customer',
        resourceId: newCustomer.name,
        description: `Registered a customer: ${newCustomer.name} (${newCustomer.customerType}).`,
        scope: customer.tenantScope,
        module: 'Customers',
        status: 'success',
      }),
    }));
    return newCustomer;
  };

  const updateCustomer: DemoContextValue['updateCustomer'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      sales: updates.name
        ? prev.sales.map((s) => (s.customerId === id ? { ...s, customerName: updates.name! } : s))
        : prev.sales,
    }));
  };

  const deleteCustomer: DemoContextValue['deleteCustomer'] = (id) => {
    const target = state.customers.find((c) => c.id === id);
    if (!target) return { ok: false, message: 'Customer not found.' };
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
      archivedItems: appendArchive(prev, {
        entity: 'Customer',
        label: target.name,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        ...tenantActor(target.tenantScope),
        action: 'ARCHIVE_CUSTOMER',
        resource: 'Customer',
        resourceId: target.name,
        description: `Deleted customer record for ${target.name}.`,
        scope: target.tenantScope,
        module: 'Customers',
        status: 'danger',
      }),
    }));
    return { ok: true, message: `Deleted customer ${target.name}.` };
  };

  const addSupplier: DemoContextValue['addSupplier'] = (supplier) => {
    setState((prev) => ({
      ...prev,
      suppliers: [
        {
          ...supplier,
          id: `sup-${Date.now()}`,
          totalSupplied: 0,
          lastSupplyAt: '—',
        },
        ...prev.suppliers,
      ],
      auditLogs: appendAudit(prev, {
        ...tenantActor(supplier.tenantScope),
        action: 'ADD_SUPPLIER',
        resource: 'Supplier',
        resourceId: supplier.name,
        description: `Registered supplier ${supplier.name}.`,
        scope: supplier.tenantScope,
        module: 'Suppliers',
        status: 'info',
      }),
    }));
  };

  const updateSupplier: DemoContextValue['updateSupplier'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      purchases: updates.name
        ? prev.purchases.map((p) => (p.supplierId === id ? { ...p, supplierName: updates.name! } : p))
        : prev.purchases,
    }));
  };

  const deleteSupplier: DemoContextValue['deleteSupplier'] = (id) => {
    const target = state.suppliers.find((s) => s.id === id);
    if (!target) return { ok: false, message: 'Supplier not found.' };
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s) => s.id !== id),
      archivedItems: appendArchive(prev, {
        entity: 'Supplier',
        label: target.name,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
    }));
    return { ok: true, message: `Deleted supplier ${target.name}.` };
  };

  const addExpense: DemoContextValue['addExpense'] = (expense) => {
    setState((prev) => ({
      ...prev,
      expenses: [{ ...expense, id: `exp-${Date.now()}` }, ...prev.expenses],
      auditLogs: appendAudit(prev, {
        ...tenantActor(expense.tenantScope),
        action: 'RECORD_EXPENSE',
        resource: 'Expense',
        resourceId: expense.reference,
        description: `Recorded ${expense.category} expense ($${expense.amount.toFixed(2)}) via ${expense.paymentMethod}.`,
        scope: expense.tenantScope,
        module: 'Expenses',
        status: 'info',
      }),
    }));
  };

  const updateExpense: DemoContextValue['updateExpense'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteExpense: DemoContextValue['deleteExpense'] = (id) => {
    const target = state.expenses.find((e) => e.id === id);
    if (!target) return { ok: false, message: 'Expense record not found.' };
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
      archivedItems: appendArchive(prev, {
        entity: 'Expense',
        label: `${target.reference} — ${target.category} ($${target.amount.toFixed(2)})`,
        archivedBy: `${target.tenantScope} Admin`,
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        ...tenantActor(target.tenantScope),
        action: 'ARCHIVE_EXPENSE',
        resource: 'Expense',
        resourceId: target.reference,
        description: `Archived operating expense ${target.reference} ($${target.amount.toFixed(2)}).`,
        scope: target.tenantScope,
        module: 'Expenses',
        status: 'warning',
      }),
    }));
    return { ok: true, message: `Expense ${target.reference} ($${target.amount.toFixed(2)}) archived.` };
  };

  const registerPatient: DemoContextValue['registerPatient'] = (patient) => {
    const nextCode = `PAT-26-${String(state.patients.length + 1).padStart(3, '0')}`;
    const newPatient: PatientRecord = {
      ...patient,
      id: `pat-${Date.now()}`,
      patientCode: nextCode,
      registeredAt: TODAY_ISO,
    };
    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
    }));
    return newPatient;
  };

  const updatePatient: DemoContextValue['updatePatient'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      labRequests: prev.labRequests.map((r) =>
        r.patientId === id
          ? {
              ...r,
              patientName: updates.fullName ?? r.patientName,
              patientPhone: updates.phone ?? r.patientPhone,
            }
          : r
      ),
    }));
  };

  const deletePatient: DemoContextValue['deletePatient'] = (id) => {
    const target = state.patients.find((p) => p.id === id);
    if (!target) return { ok: false, message: 'Patient record not found.' };
    const linkedRequests = state.labRequests.filter((r) => r.patientId === id);
    setState((prev) => ({
      ...prev,
      patients: prev.patients.filter((p) => p.id !== id),
      labRequests: prev.labRequests.filter((r) => r.patientId !== id),
      archivedItems: appendArchive(prev, {
        entity: 'Patient',
        label: `${target.patientCode} — ${target.fullName}`,
        archivedBy: 'Dr. Hassan Mohamed Warsame (Pharmacy Admin)',
        snapshot: { patient: target, labRequests: linkedRequests },
      }),
      auditLogs: appendAudit(prev, {
        actor: 'Dr. Hassan Mohamed Warsame',
        actorRole: 'Pharmacy Admin',
        action: 'ARCHIVE_PATIENT',
        resource: 'Patient',
        resourceId: target.patientCode,
        description: `Archived patient ${target.fullName} (${target.patientCode}) and ${linkedRequests.length} linked lab request(s).`,
        scope: 'pharmacy',
        module: 'Laboratory Reports',
        status: 'warning',
      }),
    }));
    return {
      ok: true,
      message: `Patient ${target.fullName} (${target.patientCode}) archived.`,
    };
  };

  const createLabRequest: DemoContextValue['createLabRequest'] = ({
    patientId,
    testName,
    testCategory,
  }) => {
    const patient = state.patients.find((p) => p.id === patientId);
    const num = 405 + state.labRequests.length;
    const newReq: LabRequestRecord = {
      id: `lab-${Date.now()}`,
      requestNo: `LAB-2026-${num}`,
      patientId,
      patientName: patient ? patient.fullName : 'Patient',
      patientPhone: patient ? patient.phone : '',
      testName,
      testCategory,
      requestDate: TODAY_ISO,
      status: 'Pending',
      whatsappStatus: 'Not Sent',
    };
    setState((prev) => ({
      ...prev,
      labRequests: [newReq, ...prev.labRequests],
      auditLogs: appendAudit(prev, {
        actor: 'Dr. Hassan Mohamed Warsame',
        actorRole: 'Pharmacy Admin',
        action: 'CREATE_LAB_REQUEST',
        resource: 'Lab Request',
        resourceId: newReq.requestNo,
        description: `Created laboratory request (${testName}) for ${newReq.patientName}.`,
        scope: 'pharmacy',
        module: 'Laboratory Reports',
        status: 'info',
      }),
    }));
    return newReq;
  };

  const updateLabRequest: DemoContextValue['updateLabRequest'] = (id, updates) => {
    setState((prev) => {
      const target = prev.labRequests.find((r) => r.id === id);
      if (!target) return prev;
      const patient = updates.patientId
        ? prev.patients.find((p) => p.id === updates.patientId)
        : undefined;
      return {
        ...prev,
        labRequests: prev.labRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                ...updates,
                patientName: patient ? patient.fullName : updates.patientName ?? r.patientName,
                patientPhone: patient ? patient.phone : updates.patientPhone ?? r.patientPhone,
              }
            : r
        ),
      };
    });
  };

  const deleteLabRequest: DemoContextValue['deleteLabRequest'] = (id) => {
    const target = state.labRequests.find((r) => r.id === id);
    if (!target) return { ok: false, message: 'Laboratory request not found.' };
    setState((prev) => ({
      ...prev,
      labRequests: prev.labRequests.filter((r) => r.id !== id),
      archivedItems: appendArchive(prev, {
        entity: 'LabRequest',
        label: `${target.requestNo} — ${target.patientName}`,
        archivedBy: 'Dr. Hassan Mohamed Warsame (Pharmacy Admin)',
        snapshot: target,
      }),
      auditLogs: appendAudit(prev, {
        actor: 'Dr. Hassan Mohamed Warsame',
        actorRole: 'Pharmacy Admin',
        action: 'ARCHIVE_LAB_REQUEST',
        resource: 'Lab Request',
        resourceId: target.requestNo,
        description: `Archived laboratory request ${target.requestNo} (${target.testName} for ${target.patientName}).`,
        scope: 'pharmacy',
        module: 'Laboratory Reports',
        status: 'warning',
      }),
    }));
    return { ok: true, message: `Lab request ${target.requestNo} archived.` };
  };

  const submitLabResult: DemoContextValue['submitLabResult'] = ({
    requestId,
    resultSummary,
    resultValues,
    clinicalNotes,
  }) => {
    setState((prev) => {
      const target = prev.labRequests.find((r) => r.id === requestId);
      return {
        ...prev,
        labRequests: prev.labRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Answered',
                resultSummary,
                resultValues,
                clinicalNotes,
                resultDate: TODAY_ISO,
              }
            : r
        ),
        auditLogs: target
          ? appendAudit(prev, {
              actor: 'Dr. Hassan Mohamed Warsame',
              actorRole: 'Pharmacy Admin',
              action: 'SUBMIT_LAB_RESULT',
              resource: 'Lab Request',
              resourceId: target.requestNo,
              description: `Submitted diagnostic lab result (${target.testName}) for ${target.patientName}.`,
              scope: 'pharmacy',
              module: 'Laboratory Reports',
              status: 'success',
            })
          : prev.auditLogs,
      };
    });
  };

  const simulateWhatsappDelivery: DemoContextValue['simulateWhatsappDelivery'] = (
    requestId,
    simulateSuccess
  ) => {
    setState((prev) => ({
      ...prev,
      labRequests: prev.labRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              whatsappStatus: simulateSuccess ? 'Delivered' : 'Failed',
              whatsappSentAt: nowTimestamp(),
            }
          : r
      ),
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = (
    scope: 'super_admin' | 'pharmacy_admin' | 'pharmaceutical_admin'
  ) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.scope === scope ? { ...n, read: true } : n
      ),
    }));
  };

  const restoreSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_DEMO_STATE);
  };

  return (
    <DemoContext.Provider
      value={{
        state,
        submitApplication,
        lookupApplicationByRef,
        submitContactMessage,
        verifyApplication,
        approveApplication,
        rejectApplication,
        updateApplication,
        deleteApplication,
        toggleTenantStatus,
        updateTenant,
        deleteTenant,
        createTenantWithAccount,
        createAccount,
        updateAccount,
        deleteAccount,
        resetAccountPassword,
        completeFirstLoginPasswordChange,
        updatePlatformFile,
        deletePlatformFile,
        updateSystemConfig,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        updateBatch,
        deleteBatch,
        updateStockMovement,
        deleteStockMovement,
        completeSale,
        updateSale,
        deleteSale,
        recordPurchase,
        updatePurchase,
        deletePurchase,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addExpense,
        updateExpense,
        deleteExpense,
        registerPatient,
        updatePatient,
        deletePatient,
        createLabRequest,
        updateLabRequest,
        deleteLabRequest,
        submitLabResult,
        simulateWhatsappDelivery,
        markNotificationRead,
        markAllNotificationsRead,
        restoreSampleData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export function useDemoStore(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoStore must be used inside DemoProvider');
  return ctx;
}
