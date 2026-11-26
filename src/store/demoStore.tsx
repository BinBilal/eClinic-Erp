import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_DEMO_STATE, TODAY_ISO } from '../data/seedData';
import {
  AccountRecord,
  ApplicationRecord,
  AuditLogRecord,
  BusinessType,
  ContactMessageRecord,
  CustomerRecord,
  DemoStoreState,
  ExpenseRecord,
  LabRequestRecord,
  PatientRecord,
  PaymentMethod,
  PaymentStatus,
  ProductRecord,
  PurchaseItem,
  PurchaseRecord,
  SaleItem,
  SaleRecord,
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
  toggleTenantStatus: (tenantId: string) => void;
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
  resetAccountPassword: (accountId: string) => void;
  completeFirstLoginPasswordChange: (email: string) => void;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;

  // Pharmacy & Pharmaceutical Operations
  addProduct: (product: Omit<ProductRecord, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<ProductRecord>) => void;
  adjustStock: (payload: {
    productId: string;
    qtyChange: number;
    note: string;
    tenantScope: TenantScope;
  }) => void;
  completeSale: (payload: {
    customerId: string;
    items: SaleItem[];
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    tenantScope: TenantScope;
  }) => SaleRecord;
  recordPurchase: (payload: {
    supplierId: string;
    items: PurchaseItem[];
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    goodsReceived: boolean;
    tenantScope: TenantScope;
  }) => PurchaseRecord;
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'lastPurchaseAt'>) => void;
  updateCustomer: (id: string, updates: Partial<CustomerRecord>) => void;
  addSupplier: (supplier: Omit<SupplierRecord, 'id' | 'totalSupplied' | 'lastSupplyAt'>) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;

  // Pharmacy Laboratory Module
  registerPatient: (patient: Omit<PatientRecord, 'id' | 'patientCode' | 'registeredAt'>) => PatientRecord;
  createLabRequest: (payload: {
    patientId: string;
    testName: string;
    testCategory: string;
  }) => LabRequestRecord;
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
        return JSON.parse(saved) as DemoStoreState;
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
        description: `Approved ${target.refNumber}, provisioned ${newTenant.businessName}, and created initial admin account (${target.email}).`,
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
        }),
      };
    });
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
          description: `Changed tenant ${target.businessName} status to ${nextStatus}.`,
        }),
      };
    });
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
        description: `Manually created ${newTenant.businessType} tenant ${newTenant.businessName} and provisioned initial admin (${newAccount.email}).`,
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
        }),
      };
    });
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
      }),
    }));
  };

  const addProduct: DemoContextValue['addProduct'] = (product) => {
    const id = `prod-${Date.now()}`;
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
    }));
  };

  const updateProduct: DemoContextValue['updateProduct'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
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
      };
    });
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
      };
    });

    return newSale;
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
      };
    });

    return newPurchase;
  };

  const addCustomer: DemoContextValue['addCustomer'] = (customer) => {
    setState((prev) => ({
      ...prev,
      customers: [
        {
          ...customer,
          id: `cust-${Date.now()}`,
          totalPurchases: 0,
          lastPurchaseAt: '—',
        },
        ...prev.customers,
      ],
    }));
  };

  const updateCustomer: DemoContextValue['updateCustomer'] = (id, updates) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
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
    }));
  };

  const addExpense: DemoContextValue['addExpense'] = (expense) => {
    setState((prev) => ({
      ...prev,
      expenses: [{ ...expense, id: `exp-${Date.now()}` }, ...prev.expenses],
    }));
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
    }));
    return newReq;
  };

  const submitLabResult: DemoContextValue['submitLabResult'] = ({
    requestId,
    resultSummary,
    resultValues,
    clinicalNotes,
  }) => {
    setState((prev) => ({
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
    }));
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
        toggleTenantStatus,
        createTenantWithAccount,
        createAccount,
        resetAccountPassword,
        completeFirstLoginPasswordChange,
        updateSystemConfig,
        addProduct,
        updateProduct,
        adjustStock,
        completeSale,
        recordPurchase,
        addCustomer,
        updateCustomer,
        addSupplier,
        addExpense,
        registerPatient,
        createLabRequest,
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
