import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Lock,
  Plus,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  Sliders,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import {
  DonutOverviewChart,
  DistributionBreakdown,
  SimpleBarChart,
} from '../../components/ui/Charts';
import { DashboardShell, SidebarNavItem } from '../../components/ui/DashboardShell';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { KpiCard } from '../../components/ui/KpiCard';
import { Modal } from '../../components/ui/Modal';
import {
  GreetingHeader,
  LeaderboardCard,
  RemindersCard,
} from '../../components/ui/NexoraWidgets';
import { RecentlyActionsCard } from '../../components/ui/RecentlyActionsCard';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useDemoStore } from '../../store/demoStore';
import {
  AccountRecord,
  AccountStatus,
  ApplicationRecord,
  ApplicationStatus,
  AuditLogRecord,
  BusinessType,
  ExperienceRole,
  PlatformFileRecord,
  TenantRecord,
  TenantStatus,
} from '../../types/erp';

interface SuperAdminDashboardProps {
  onSwitchExperience: (role: ExperienceRole) => void;
}

type SuperAdminPage =
  | 'dashboard'
  | 'applications'
  | 'tenants_all'
  | 'tenants_pharmacies'
  | 'tenants_pharmaceutical'
  | 'accounts'
  | 'reports'
  | 'notifications'
  | 'audit_logs'
  | 'files'
  | 'system_config'
  | 'search'
  | 'settings';

const NAV_ITEMS: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'applications', label: 'Applications', icon: <ClipboardList className="h-4 w-4" /> },
  {
    id: 'tenants',
    label: 'Tenants',
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { id: 'tenants_all', label: 'All Tenants' },
      { id: 'tenants_pharmacies', label: 'Pharmacies' },
      { id: 'tenants_pharmaceutical', label: 'Pharmaceuticals' },
    ],
  },
  { id: 'accounts', label: 'Account Management', icon: <Users className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'audit_logs', label: 'Audit Logs', icon: <Activity className="h-4 w-4" /> },
  { id: 'files', label: 'File Management', icon: <FolderOpen className="h-4 w-4" /> },
  { id: 'system_config', label: 'System Configuration', icon: <Sliders className="h-4 w-4" /> },
  { id: 'search', label: 'Search', icon: <SearchIcon className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="h-4 w-4" /> },
];

const PAGE_TITLES: Record<SuperAdminPage, string> = {
  dashboard: 'Platform Overview',
  applications: 'Tenant Applications',
  tenants_all: 'All Tenants',
  tenants_pharmacies: 'Pharmacy Tenants',
  tenants_pharmaceutical: 'Pharmaceutical Tenants',
  accounts: 'Account Management',
  reports: 'Platform Reports',
  notifications: 'Platform Notifications',
  audit_logs: 'Audit Logs',
  files: 'File Management',
  system_config: 'System Configuration',
  search: 'Platform Global Search',
  settings: 'Platform Settings',
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onSwitchExperience,
}) => {
  const {
    state,
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
    updatePlatformFile,
    deletePlatformFile,
    updateSystemConfig,
    markNotificationRead,
    markAllNotificationsRead,
    restoreSampleData,
  } = useDemoStore();

  const [activePage, setActivePage] = useState<SuperAdminPage>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState('Nov 19 – Nov 26, 2026');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Applications filters & modals
  const [appStatusFilter, setAppStatusFilter] = useState<'All' | ApplicationStatus>('All');
  const [appTypeFilter, setAppTypeFilter] = useState<'All' | BusinessType>('All');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [editingApp, setEditingApp] = useState<ApplicationRecord | null>(null);
  const [editAppForm, setEditAppForm] = useState({
    businessName: '',
    businessType: 'Pharmacy' as BusinessType,
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    registrationNumber: '',
    licenseNumber: '',
    facilityDetail: '',
    notes: '',
  });
  const [deleteTargetApp, setDeleteTargetApp] = useState<ApplicationRecord | null>(null);
  const [rejectModalApp, setRejectModalApp] = useState<ApplicationRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Simulated provisioning modal after approval or manual tenant creation
  const [provisionSummary, setProvisionSummary] = useState<{
    tenant: TenantRecord;
    account: AccountRecord;
    source: 'Application Approval' | 'Manual Provisioning';
  } | null>(null);

  // Tenant details, edit, delete & manual creation modal
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantRecord | null>(null);
  const [editTenantForm, setEditTenantForm] = useState({
    businessName: '',
    businessType: 'Pharmacy' as BusinessType,
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    plan: '',
    status: 'Active' as TenantStatus,
  });
  const [deleteTargetTenant, setDeleteTargetTenant] = useState<TenantRecord | null>(null);
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    businessName: '',
    businessType: 'Pharmacy' as BusinessType,
    ownerName: '',
    email: '',
    phone: '+252 61 ',
    city: 'Mogadishu',
    address: '',
    registrationNumber: '',
  });

  // Account creation, view, edit & delete modals
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    tenantId: state.tenants[0]?.id || '',
    fullName: '',
    email: '',
    role: 'Pharmacy Admin' as 'Pharmacy Admin' | 'Pharmaceutical Admin' | 'Super Admin',
    requirePasswordChange: true,
  });
  const [viewingAccount, setViewingAccount] = useState<AccountRecord | null>(null);
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(null);
  const [editAccountForm, setEditAccountForm] = useState({
    tenantId: '',
    fullName: '',
    email: '',
    role: 'Pharmacy Admin' as 'Pharmacy Admin' | 'Pharmaceutical Admin' | 'Super Admin',
    status: 'Active' as AccountStatus,
    requirePasswordChange: false,
  });
  const [deleteTargetAccount, setDeleteTargetAccount] = useState<AccountRecord | null>(null);

  // Platform Files & Audit Log modals
  const [viewingFile, setViewingFile] = useState<PlatformFileRecord | null>(null);
  const [editingFile, setEditingFile] = useState<PlatformFileRecord | null>(null);
  const [editFileForm, setEditFileForm] = useState({
    fileName: '',
    category: 'License' as PlatformFileRecord['category'],
    tenantName: '',
    size: '',
  });
  const [deleteTargetFile, setDeleteTargetFile] = useState<PlatformFileRecord | null>(null);
  const [viewingAudit, setViewingAudit] = useState<AuditLogRecord | null>(null);

  // Reports tab & date filter
  const [reportTab, setReportTab] = useState<
    'tenants' | 'applications' | 'distribution' | 'growth' | 'activity'
  >('tenants');
  const [reportDateRange, setReportDateRange] = useState<'30d' | '90d' | 'ytd'>('ytd');

  // System config draft
  const [configDraft, setConfigDraft] = useState(state.systemConfig);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const superNotifications = useMemo(
    () => state.notifications.filter((n) => n.scope === 'super_admin'),
    [state.notifications]
  );

  const superAdminActivities = useMemo(
    () =>
      state.auditLogs.filter(
        (l) =>
          l.scope === 'super_admin' ||
          (!l.scope &&
            ['Super Admin', 'Platform Service', 'Public Applicant'].includes(l.actorRole))
      ),
    [state.auditLogs]
  );

  // KPI computations
  const kpis = useMemo(() => {
    const totalTenants = state.tenants.length;
    const totalPharmacies = state.tenants.filter((t) => t.businessType === 'Pharmacy').length;
    const totalPharmaceuticals = state.tenants.filter(
      (t) => t.businessType === 'Pharmaceutical'
    ).length;
    const pendingApps = state.applications.filter(
      (a) => a.status === 'Submitted' || a.status === 'Under Review'
    ).length;
    const approvedApps = state.applications.filter((a) => a.status === 'Approved').length;
    const rejectedApps = state.applications.filter((a) => a.status === 'Rejected').length;
    const activeAccounts = state.accounts.filter((a) => a.status !== 'Locked').length;
    const suspendedTenants = state.tenants.filter((t) => t.status === 'Suspended').length;
    const lockedAccounts = state.accounts.filter((a) => a.status === 'Locked').length;
    return {
      totalTenants,
      totalPharmacies,
      totalPharmaceuticals,
      pendingApps,
      approvedApps,
      rejectedApps,
      activeAccounts,
      suspendedAccounts: suspendedTenants + lockedAccounts,
    };
  }, [state.tenants, state.applications, state.accounts]);

  const filteredApplications = useMemo(() => {
    return state.applications.filter((a) => {
      const matchStatus = appStatusFilter === 'All' || a.status === appStatusFilter;
      const matchType = appTypeFilter === 'All' || a.businessType === appTypeFilter;
      return matchStatus && matchType;
    });
  }, [state.applications, appStatusFilter, appTypeFilter]);

  const tenantList = useMemo(() => {
    if (activePage === 'tenants_pharmacies') {
      return state.tenants.filter((t) => t.businessType === 'Pharmacy');
    }
    if (activePage === 'tenants_pharmaceutical') {
      return state.tenants.filter((t) => t.businessType === 'Pharmaceutical');
    }
    return state.tenants;
  }, [state.tenants, activePage]);

  const tenantGrowthData = [
    { label: 'Jun', value: 1, secondaryValue: 0 },
    { label: 'Jul', value: 2, secondaryValue: 1 },
    { label: 'Aug', value: 3, secondaryValue: 1 },
    { label: 'Sep', value: 4, secondaryValue: 1 },
    { label: 'Oct', value: 4, secondaryValue: 2 },
    {
      label: 'Nov',
      value: state.tenants.filter((t) => t.businessType === 'Pharmacy').length,
      secondaryValue: state.tenants.filter((t) => t.businessType === 'Pharmaceutical').length,
    },
  ];

  // Table columns
  const appColumns: ColumnDef<ApplicationRecord>[] = [
    {
      key: 'ref',
      header: 'Ref #',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {r.refNumber}
        </span>
      ),
    },
    {
      key: 'business',
      header: 'Business Name',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{r.businessName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{r.ownerName} · {r.city}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {r.businessType}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Submitted',
      render: (r) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
          {r.submittedAt}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusLabel label={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
          <button
            type="button"
            title="View Application"
            onClick={() => setSelectedApp(r)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Application"
            onClick={() => {
              setEditingApp(r);
              setEditAppForm({
                businessName: r.businessName,
                businessType: r.businessType,
                ownerName: r.ownerName,
                email: r.email,
                phone: r.phone,
                city: r.city,
                address: r.address,
                registrationNumber: r.registrationNumber,
                licenseNumber: r.licenseNumber,
                facilityDetail: r.facilityDetail,
                notes: r.notes,
              });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          {(r.status === 'Submitted' || r.status === 'Under Review') && (
            <>
              <button
                type="button"
                onClick={() => {
                  const res = approveApplication(r.id);
                  if (res) {
                    setProvisionSummary({
                      tenant: res.tenant,
                      account: res.account,
                      source: 'Application Approval',
                    });
                    showToast(
                      `Approved ${r.businessName}. Tenant ${res.tenant.code} & initial admin account provisioned.`
                    );
                  }
                }}
                className="px-2 py-1 rounded-md bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-medium"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectModalApp(r);
                  setRejectReason('');
                }}
                className="px-2 py-1 rounded-md bg-white dark:bg-[#0D1628] border border-red-200 dark:border-red-900/60 text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-medium"
              >
                Reject
              </button>
            </>
          )}
          <button
            type="button"
            title="Archive / Delete Application"
            onClick={() => setDeleteTargetApp(r)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const tenantColumns: ColumnDef<TenantRecord>[] = [
    {
      key: 'code',
      header: 'Tenant Code',
      render: (t) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {t.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Business Name',
      render: (t) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{t.businessName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.ownerName} · {t.city}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (t) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {t.businessType}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Subscription Plan',
      render: (t) => <span className="text-xs text-slate-600 dark:text-slate-300">{t.plan}</span>,
    },
    {
      key: 'tx',
      header: 'Monthly Tx',
      align: 'right',
      render: (t) => (
        <span className="text-xs font-medium tabular-nums dark:text-slate-200">
          {t.monthlyTransactions}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusLabel label={t.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
          <button
            type="button"
            title="View Tenant"
            onClick={() => setSelectedTenant(t)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Tenant"
            onClick={() => {
              setEditingTenant(t);
              setEditTenantForm({
                businessName: t.businessName,
                businessType: t.businessType,
                ownerName: t.ownerName,
                email: t.email,
                phone: t.phone,
                city: t.city,
                address: t.address,
                plan: t.plan,
                status: t.status,
              });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              toggleTenantStatus(t.id);
              showToast(
                `${t.businessName} status updated to ${t.status === 'Active' ? 'Suspended' : 'Active'}.`
              );
            }}
            className={`px-2 py-1 rounded-md text-xs font-medium border bg-white dark:bg-[#0D1628] ${
              t.status === 'Active'
                ? 'border-amber-200 dark:border-amber-900/60 text-[#D97706] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                : 'border-emerald-200 dark:border-emerald-900/60 text-[#16A34A] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            {t.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
          <button
            type="button"
            title="Archive / Delete Tenant"
            onClick={() => setDeleteTargetTenant(t)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const accountColumns: ColumnDef<AccountRecord>[] = [
    {
      key: 'user',
      header: 'Administrator',
      render: (a) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{a.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{a.email}</p>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Organization',
      render: (a) => (
        <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
          {a.tenantName}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (a) => <span className="text-xs text-slate-600 dark:text-slate-300">{a.role}</span>,
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (a) => <StatusLabel label={a.status} />,
    },
    {
      key: 'policy',
      header: 'Password Policy',
      render: (a) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {a.requirePasswordChange ? 'Change required on next login' : 'Compliant'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (a) => (
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {a.lastLoginAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
          <button
            type="button"
            title="View Account"
            onClick={() => setViewingAccount(a)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Account"
            onClick={() => {
              setEditingAccount(a);
              setEditAccountForm({
                tenantId: a.tenantId,
                fullName: a.fullName,
                email: a.email,
                role: a.role,
                status: a.status,
                requirePasswordChange: a.requirePasswordChange,
              });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            title="Reset Password"
            onClick={() => {
              resetAccountPassword(a.id);
              showToast(`Password reset triggered for ${a.email}. First-login change enforced.`);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            title="Delete Account"
            onClick={() => setDeleteTargetAccount(a)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const auditColumns: ColumnDef<AuditLogRecord>[] = [
    {
      key: 'ts',
      header: 'Date & Time',
      render: (l) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {l.timestamp}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Administrator / User',
      render: (l) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-white">{l.actor}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{l.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {l.action}
        </span>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (l) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {l.resource} · <span className="font-mono">{l.resourceId}</span>
        </span>
      ),
    },
    {
      key: 'desc',
      header: 'Activity Description',
      render: (l) => <span className="text-xs text-slate-600 dark:text-slate-300">{l.description}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (l) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingAudit(l)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <span
            title="Audit trail records are immutable for compliance"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
            <Lock className="h-3 w-3" />
            Immutable
          </span>
        </div>
      ),
    },
  ];

  const fileColumns: ColumnDef<PlatformFileRecord>[] = [
    {
      key: 'name',
      header: 'Document Name',
      render: (f) => (
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          <FileText className="h-4 w-4 text-[#396BA4] dark:text-sky-400" />
          {f.fileName}
        </span>
      ),
    },
    {
      key: 'cat',
      header: 'Category',
      render: (f) => <span className="text-xs text-slate-600 dark:text-slate-300">{f.category}</span>,
    },
    {
      key: 'tenant',
      header: 'Tenant / Applicant',
      render: (f) => (
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {f.tenantName}
        </span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      align: 'right',
      render: (f) => (
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{f.size}</span>
      ),
    },
    {
      key: 'date',
      header: 'Uploaded',
      render: (f) => (
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {f.uploadedAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (f) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingFile(f)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingFile(f);
              setEditFileForm({
                fileName: f.fileName,
                category: f.category,
                tenantName: f.tenantName,
                size: f.size,
              });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTargetFile(f)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const exportCsvReport = (title: string) => {
    const csv = `Report,${title}\nGenerated,2026-11-26\nTotal Tenants,${kpis.totalTenants}\nTotal Pharmacies,${kpis.totalPharmacies}\nTotal Pharmaceutical,${kpis.totalPharmaceuticals}\nPending Applications,${kpis.pendingApps}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eClinic_${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${title} CSV report.`);
  };

  return (
    <DashboardShell
      roleLabel="MI'AH ICT Platform Super Admin"
      userName="Amina Farah Hassan"
      userEmail="superadmin@miahict.so"
      pageTitle={PAGE_TITLES[activePage]}
      breadcrumb="Platform Administration"
      navItems={NAV_ITEMS}
      activeNavId={activePage}
      onSelectNav={(id) => setActivePage(id as SuperAdminPage)}
      sidebarQuickActions={[
        {
          label: 'Review Applications',
          icon: <ClipboardList className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('applications'),
        },
        {
          label: 'Create Admin Account',
          icon: <Plus className="h-3.5 w-3.5" />,
          onClick: () => setCreateAccountOpen(true),
        },
        {
          label: 'Manage All Tenants',
          icon: <Building2 className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('tenants_all'),
        },
        {
          label: 'Audit Trail',
          icon: <Activity className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('audit_logs'),
        },
        {
          label: 'System Config',
          icon: <Sliders className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('system_config'),
        },
      ]}
      onQuickPlusClick={() => setCreateAccountOpen(true)}
      notifications={superNotifications}
      onMarkNotificationRead={markNotificationRead}
      onMarkAllNotificationsRead={() => markAllNotificationsRead('super_admin')}
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      onGlobalSearchSubmit={() => setActivePage('search')}
      onSwitchExperience={onSwitchExperience}
      onRestoreDemoData={() => {
        restoreSampleData();
        showToast('Original sample data restored.');
      }}
    >
      {toast && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg border flex items-center justify-between text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900/70 text-red-900 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {toast.type === 'error' ? (
              <XCircle className="h-4 w-4 text-[#DC2626] dark:text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
            )}
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className={
              toast.type === 'error'
                ? 'text-red-700 dark:text-red-300 hover:underline'
                : 'text-emerald-700 dark:text-emerald-300 hover:underline'
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {activePage === 'dashboard' && (
        <div className="space-y-5">
          {/* Greeting & Date/Filter Header */}
          <GreetingHeader
            title="Welcome back, Amina!"
            subtitle="Here's what's happening across the eClinic ERP platform today."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filterLabel="Review Queue"
            onFilterClick={() => setActivePage('applications')}
          />

          {/* Top 4-Card KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Total Tenants"
              value={kpis.totalTenants}
              trendText="↑ 18.2% vs last month"
              trendPositive
              tone="navy"
              icon={<Building2 className="h-5 w-5" />}
              onClick={() => setActivePage('tenants_all')}
            />
            <KpiCard
              label="Total Pharmacies"
              value={kpis.totalPharmacies}
              trendText="Operational retail & lab nodes"
              trendPositive
              tone="blue"
              icon={<ShieldCheck className="h-5 w-5" />}
              onClick={() => setActivePage('tenants_pharmacies')}
            />
            <KpiCard
              label="Total Pharmaceutical"
              value={kpis.totalPharmaceuticals}
              trendText="Pharmaceutical supply hubs online"
              trendPositive
              tone="orange"
              icon={<Users className="h-5 w-5" />}
              onClick={() => setActivePage('tenants_pharmaceutical')}
            />
            <KpiCard
              label="Pending Applications"
              value={kpis.pendingApps}
              subtext={`${kpis.approvedApps} approved · ${kpis.rejectedApps} rejected`}
              tone="warning"
              icon={<ClipboardList className="h-5 w-5" />}
              ringPercent={Math.round(
                (kpis.approvedApps / Math.max(1, state.applications.length)) * 100
              )}
              onClick={() => setActivePage('applications')}
            />
          </div>

          {/* Required KPI Summary Strip: Approved, Rejected, Active & Suspended Accounts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Approved Applications"
              value={kpis.approvedApps}
              subtext="Provisioned tenant workspaces"
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setActivePage('applications')}
            />
            <KpiCard
              label="Rejected Applications"
              value={kpis.rejectedApps}
              subtext="Incomplete license verification"
              tone="error"
              icon={<XCircle className="h-4 w-4" />}
              onClick={() => setActivePage('applications')}
            />
            <KpiCard
              label="Active Accounts"
              value={kpis.activeAccounts}
              subtext="Verified tenant & admin logins"
              tone="blue"
              icon={<Users className="h-4 w-4" />}
              onClick={() => setActivePage('accounts')}
            />
            <KpiCard
              label="Suspended Accounts"
              value={kpis.suspendedAccounts}
              subtext="Suspended tenants or locked logins"
              tone="warning"
              icon={<Sliders className="h-4 w-4" />}
              onClick={() => setActivePage('tenants_all')}
            />
          </div>

          {/* 3-Column Analytical Row */}
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Tenants Overview</h2>
                <button
                  type="button"
                  onClick={() => setActivePage('tenants_all')}
                  className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <DonutOverviewChart
                centerValue={kpis.totalTenants}
                centerLabel="Total Tenants"
                items={[
                  {
                    label: 'Pharmacies',
                    value: state.tenants.filter((t) => t.businessType === 'Pharmacy').length,
                    color: '#F05D21',
                  },
                  {
                    label: 'Pharmaceutical',
                    value: state.tenants.filter((t) => t.businessType === 'Pharmaceutical').length,
                    color: '#1E396A',
                  },
                  {
                    label: 'Pending Apps',
                    value: kpis.pendingApps,
                    color: '#396BA4',
                  },
                ]}
              />
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Approval Rate</span>
                <span className="font-bold text-[#16A34A] dark:text-emerald-400 tabular-nums">
                  {Math.round((kpis.approvedApps / Math.max(1, state.applications.length)) * 100)}%
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <LeaderboardCard
                title="Top Active Tenants"
                actionLabel="View All"
                onAction={() => setActivePage('tenants_all')}
                rows={[...state.tenants]
                  .sort((a, b) => b.monthlyTransactions - a.monthlyTransactions)
                  .slice(0, 5)
                  .map((t, idx) => {
                    const maxTx = Math.max(
                      1,
                      ...state.tenants.map((x) => x.monthlyTransactions)
                    );
                    return {
                      id: t.id,
                      name: t.businessName,
                      valueText: `${t.monthlyTransactions} tx`,
                      percent: Math.round((t.monthlyTransactions / maxTx) * 100),
                      color: idx === 0 ? '#F05D21' : '#396BA4',
                    };
                  })}
              />
            </div>

            <div className="lg:col-span-4">
              <RemindersCard
                title="Applications & Alerts"
                actionLabel="View All"
                onAction={() => setActivePage('notifications')}
                items={[
                  ...state.applications.slice(0, 2).map((app) => ({
                    id: app.id,
                    timeLabel: app.submittedAt.slice(5),
                    name: app.businessName,
                    detail: `${app.businessType} · ${app.status}`,
                    icon: <Eye className="h-3.5 w-3.5" />,
                    accentBg: 'bg-orange-50 dark:bg-orange-950/60 text-[#F05D21]',
                    onClick: () => setSelectedApp(app),
                  })),
                  ...superNotifications.slice(0, 2).map((n) => ({
                    id: n.id,
                    timeLabel: n.date.slice(5),
                    name: n.title,
                    detail: n.message,
                    icon: <Bell className="h-3.5 w-3.5" />,
                    accentBg: 'bg-[#F4F6F9] dark:bg-slate-800 text-[#1E396A] dark:text-sky-300',
                    onClick: () => setActivePage('notifications'),
                  })),
                ]}
              />
            </div>
          </div>

          {/* Recently Actions (Super Admin Platform Governance) */}
          <RecentlyActionsCard
            title="Recently Actions"
            subtitle="Latest platform governance, onboarding, tenant, and account actions"
            activities={superAdminActivities}
            maxItems={6}
            viewAllLabel="View All"
            onViewAll={() => setActivePage('audit_logs')}
          />

        </div>
      )}

      {activePage === 'applications' && (
        <div className="space-y-4">
          <DataTable
            data={filteredApplications}
            columns={appColumns}
            keyExtractor={(a) => a.id}
            searchPlaceholder="Search by ref #, business name, owner, city..."
            searchFilter={(a, q) =>
              a.refNumber.toLowerCase().includes(q) ||
              a.businessName.toLowerCase().includes(q) ||
              a.ownerName.toLowerCase().includes(q) ||
              a.city.toLowerCase().includes(q)
            }
            toolbarExtra={
              <>
                <select
                  value={appTypeFilter}
                  onChange={(e) => setAppTypeFilter(e.target.value as 'All' | BusinessType)}
                  className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Business Types</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Pharmaceutical">Pharmaceutical</option>
                </select>
                <select
                  value={appStatusFilter}
                  onChange={(e) =>
                    setAppStatusFilter(e.target.value as 'All' | ApplicationStatus)
                  }
                  className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </>
            }
          />
        </div>
      )}

      {(activePage === 'tenants_all' ||
        activePage === 'tenants_pharmacies' ||
        activePage === 'tenants_pharmaceutical') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'tenants_all', label: 'All Tenants' },
                  { id: 'tenants_pharmacies', label: 'Pharmacies' },
                  { id: 'tenants_pharmaceutical', label: 'Pharmaceuticals' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePage(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activePage === tab.id
                      ? 'bg-[#1E396A] text-white'
                      : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCreateTenantOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Tenant &amp; Account
            </button>
          </div>

          <DataTable
            data={tenantList}
            columns={tenantColumns}
            keyExtractor={(t) => t.id}
            searchPlaceholder="Search tenant code, name, city..."
            searchFilter={(t, q) =>
              t.code.toLowerCase().includes(q) ||
              t.businessName.toLowerCase().includes(q) ||
              t.city.toLowerCase().includes(q)
            }
          />
        </div>
      )}

      {activePage === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage provisioned administrator accounts, password reset policies, and first-login requirements. Plaintext passwords are never stored or displayed.
            </p>
            <button
              type="button"
              onClick={() => setCreateAccountOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Initial Account
            </button>
          </div>

          <DataTable
            data={state.accounts}
            columns={accountColumns}
            keyExtractor={(a) => a.id}
            searchPlaceholder="Search administrator name, email, organization..."
            searchFilter={(a, q) =>
              a.fullName.toLowerCase().includes(q) ||
              a.email.toLowerCase().includes(q) ||
              a.tenantName.toLowerCase().includes(q)
            }
          />
        </div>
      )}

      {activePage === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-lg p-1">
              {(
                [
                  { id: 'tenants', label: 'Tenant Reports' },
                  { id: 'applications', label: 'Application Reports' },
                  { id: 'distribution', label: 'Business Distribution' },
                  { id: 'growth', label: 'Tenant Growth' },
                  { id: 'activity', label: 'Platform Activity' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReportTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    reportTab === tab.id
                      ? 'bg-[#1E396A] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportDateRange}
                onChange={(e) => setReportDateRange(e.target.value as '30d' | '90d' | 'ytd')}
                className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="ytd">Year to Date (2026)</option>
              </select>
              <button
                type="button"
                onClick={() => exportCsvReport(reportTab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#396BA4] hover:bg-[#2d588a] text-white text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {reportTab === 'tenants' && (
            <DataTable
              data={state.tenants}
              columns={tenantColumns}
              keyExtractor={(t) => t.id}
            />
          )}
          {reportTab === 'applications' && (
            <DataTable
              data={state.applications}
              columns={appColumns}
              keyExtractor={(a) => a.id}
            />
          )}
          {reportTab === 'distribution' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white mb-4">
                  Business Type Distribution ({reportDateRange.toUpperCase()})
                </h2>
                <DistributionBreakdown
                  items={[
                    {
                      label: 'Pharmacies',
                      value: state.tenants.filter((t) => t.businessType === 'Pharmacy').length,
                      color: '#F05D21',
                    },
                    {
                      label: 'Pharmaceutical Businesses',
                      value: state.tenants.filter((t) => t.businessType === 'Pharmaceutical').length,
                      color: '#1E396A',
                    },
                  ]}
                />
              </div>
              <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white mb-4">
                  Tenant Operational Status
                </h2>
                <DistributionBreakdown
                  items={[
                    {
                      label: 'Active',
                      value: state.tenants.filter((t) => t.status === 'Active').length,
                      color: '#16A34A',
                    },
                    {
                      label: 'Suspended',
                      value: state.tenants.filter((t) => t.status === 'Suspended').length,
                      color: '#DC2626',
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {reportTab === 'growth' && (
            <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-bold text-[#1E396A] dark:text-white mb-4">
                Monthly Tenant Onboarding Growth
              </h2>
              <SimpleBarChart
                data={tenantGrowthData}
                primaryColor="#1E396A"
                secondaryColor="#F05D21"
                primaryLabel="Pharmacies"
                secondaryLabel="Pharmaceutical"
              />
            </div>
          )}
          {reportTab === 'activity' && (
            <DataTable
              data={superAdminActivities}
              columns={auditColumns}
              keyExtractor={(l) => l.id}
            />
          )}
        </div>
      )}

      {activePage === 'notifications' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Platform Notifications</h2>
            <button
              type="button"
              onClick={() => markAllNotificationsRead('super_admin')}
              className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {superNotifications.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 flex items-start justify-between gap-4 ${
                  n.read ? 'bg-white dark:bg-[#111B2E]' : 'bg-[#F4F6F9]/60 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{n.date}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activePage === 'audit_logs' && (
        <DataTable
          data={superAdminActivities}
          columns={auditColumns}
          keyExtractor={(l) => l.id}
          searchPlaceholder="Search actor, action, resource, description..."
          searchFilter={(l, q) =>
            l.actor.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            l.resourceId.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
          }
        />
      )}

      {activePage === 'files' && (
        <DataTable
          data={state.platformFiles}
          columns={fileColumns}
          keyExtractor={(f) => f.id}
          searchPlaceholder="Search document name or tenant..."
          searchFilter={(f, q) =>
            f.fileName.toLowerCase().includes(q) ||
            f.tenantName.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
          }
        />
      )}

      {activePage === 'system_config' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-3xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#1E396A] dark:text-white">Platform Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Global defaults applied across newly provisioned Pharmacy and Pharmaceutical tenants.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Platform Display Name
              </label>
              <input
                type="text"
                value={configDraft.platformName}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, platformName: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Support Contact Email
              </label>
              <input
                type="email"
                value={configDraft.supportEmail}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, supportEmail: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Near-Expiry Alert Window (Days)
              </label>
              <input
                type="number"
                value={configDraft.expiryAlertDays}
                onChange={(e) =>
                  setConfigDraft({
                    ...configDraft,
                    expiryAlertDays: Number(e.target.value) || 90,
                  })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                value={configDraft.sessionTimeoutMinutes}
                onChange={(e) =>
                  setConfigDraft({
                    ...configDraft,
                    sessionTimeoutMinutes: Number(e.target.value) || 30,
                  })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={configDraft.enforceFirstLoginPasswordChange}
              onChange={(e) =>
                setConfigDraft({
                  ...configDraft,
                  enforceFirstLoginPasswordChange: e.target.checked,
                })
              }
              className="rounded border-slate-300 dark:border-slate-600"
            />
            Enforce mandatory password change on first login for newly provisioned tenant admins
          </label>

          <button
            type="button"
            onClick={() => {
              updateSystemConfig(configDraft);
              showToast('Platform configuration saved and logged to audit trail.');
            }}
            className="px-5 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold"
          >
            Save Configuration
          </button>
        </div>
      )}

      {activePage === 'search' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Search Across Applications, Tenants, and Accounts
            </label>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Type business name, ref #, city, or email..."
              className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#1E396A] dark:text-white mb-3">Matching Tenants</h3>
              <div className="space-y-2.5">
                {state.tenants
                  .filter(
                    (t) =>
                      !globalSearch.trim() ||
                      t.businessName.toLowerCase().includes(globalSearch.toLowerCase()) ||
                      t.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
                      t.city.toLowerCase().includes(globalSearch.toLowerCase())
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.businessName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.code} · {t.businessType} · {t.city}
                        </p>
                      </div>
                      <StatusLabel label={t.status} />
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#1E396A] dark:text-white mb-3">Matching Applications</h3>
              <div className="space-y-2.5">
                {state.applications
                  .filter(
                    (a) =>
                      !globalSearch.trim() ||
                      a.businessName.toLowerCase().includes(globalSearch.toLowerCase()) ||
                      a.refNumber.toLowerCase().includes(globalSearch.toLowerCase())
                  )
                  .map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.businessName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {a.refNumber} · {a.businessType}
                        </p>
                      </div>
                      <StatusLabel label={a.status} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activePage === 'settings' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-2xl space-y-5">
          <h2 className="text-base font-bold text-[#1E396A] dark:text-white">Administrator Profile &amp; Data Controls</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Signed-in Super Admin</p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">Amina Farah Hassan</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">superadmin@miahict.so</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Organization</p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">MI&apos;AH ICT Solutions</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Platform Operations Control</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Restore Initial Sample Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reset all applications, tenants, accounts, and workspace transactions to baseline records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                restoreSampleData();
                showToast('Original sample data restored.');
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#F05D21] text-xs font-semibold text-slate-800 dark:text-slate-200 shrink-0"
            >
              Restore Sample Data
            </button>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        open={selectedApp !== null}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.businessName || 'Application Details'}
        subtitle={
          selectedApp
            ? `${selectedApp.refNumber} · ${selectedApp.businessType} · Submitted ${selectedApp.submittedAt}`
            : ''
        }
        footer={
          selectedApp && (
            <>
              {(selectedApp.status === 'Submitted' || selectedApp.status === 'Under Review') && (
                <>
                  {selectedApp.status === 'Submitted' && (
                    <button
                      type="button"
                      onClick={() => {
                        verifyApplication(selectedApp.id);
                        setSelectedApp({
                          ...selectedApp,
                          status: 'Under Review',
                        });
                        showToast(`Information verified for ${selectedApp.refNumber}.`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#396BA4] hover:bg-[#2d588a] text-white text-xs font-semibold"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify Information
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedApp;
                      setSelectedApp(null);
                      setRejectModalApp(target);
                      setRejectReason('');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-semibold"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = approveApplication(selectedApp.id);
                      setSelectedApp(null);
                      if (res) {
                        setProvisionSummary({
                          tenant: res.tenant,
                          account: res.account,
                          source: 'Application Approval',
                        });
                        showToast(
                          `Approved ${selectedApp.businessName}. Provisioned tenant ${res.tenant.code} & admin account.`
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve &amp; Provision Tenant
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
              >
                Close
              </button>
            </>
          )
        }
      >
        {selectedApp && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Current Application Status</span>
              <StatusLabel label={selectedApp.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Owner / Authorized Contact</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedApp.ownerName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Email &amp; Phone</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedApp.email} · {selectedApp.phone}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Commercial Registration #</p>
                <p className="font-mono font-semibold text-[#1E396A] dark:text-sky-300 mt-0.5">
                  {selectedApp.registrationNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">MOH Practicing License #</p>
                <p className="font-mono font-semibold text-[#1E396A] dark:text-sky-300 mt-0.5">
                  {selectedApp.licenseNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">City &amp; Address</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedApp.city} — {selectedApp.address}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Facility Details</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{selectedApp.facilityDetail}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Applicant Notes</p>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                {selectedApp.notes || 'No additional notes provided.'}
              </p>
            </div>

            {selectedApp.rejectionReason && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200">
                <span className="font-semibold">Rejection Reason: </span>
                {selectedApp.rejectionReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        open={rejectModalApp !== null}
        onClose={() => setRejectModalApp(null)}
        title="Reject Application"
        subtitle={rejectModalApp ? `${rejectModalApp.refNumber} · ${rejectModalApp.businessName}` : ''}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectModalApp(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (rejectModalApp && rejectReason.trim()) {
                  rejectApplication(rejectModalApp.id, rejectReason.trim());
                  showToast(`Application ${rejectModalApp.refNumber} rejected.`);
                  setRejectModalApp(null);
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-40"
            >
              Confirm Rejection
            </button>
          </>
        }
      >
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Rejection Reason (visible in application status lookup) *
        </label>
        <textarea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Specify missing registration or licensing documentation..."
          className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#DC2626]"
        />
      </Modal>

      {/* Tenant Details Modal */}
      <Modal
        open={selectedTenant !== null}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.businessName || 'Tenant Details'}
        subtitle={selectedTenant ? `${selectedTenant.code} · ${selectedTenant.businessType}` : ''}
      >
        {selectedTenant && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <span className="font-medium text-slate-600 dark:text-slate-300">Tenant Status</span>
              <StatusLabel label={selectedTenant.status} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Owner / Admin</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedTenant.ownerName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Contact</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedTenant.email} · {selectedTenant.phone}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Address</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTenant.city} — {selectedTenant.address}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Subscription &amp; Created</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTenant.plan} · Since {selectedTenant.createdAt}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Active Users</p>
                <p className="font-semibold text-[#1E396A] dark:text-sky-300 tabular-nums mt-0.5">
                  {selectedTenant.usersCount}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Monthly Transactions</p>
                <p className="font-semibold text-[#1E396A] dark:text-sky-300 tabular-nums mt-0.5">
                  {selectedTenant.monthlyTransactions}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Initial Account Modal */}
      <Modal
        open={createAccountOpen}
        onClose={() => setCreateAccountOpen(false)}
        title="Provision Initial Admin Account"
        subtitle="Password is generated securely and never displayed in plaintext."
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateAccountOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!newAccountForm.fullName.trim() || !newAccountForm.email.includes('@')}
              onClick={() => {
                createAccount(newAccountForm);
                setCreateAccountOpen(false);
                showToast(`Initial account provisioned for ${newAccountForm.email}.`);
                setNewAccountForm({
                  tenantId: state.tenants[0]?.id || '',
                  fullName: '',
                  email: '',
                  role: 'Pharmacy Admin',
                  requirePasswordChange: true,
                });
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Create Account
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Tenant Organization
            </label>
            <select
              value={newAccountForm.tenantId}
              onChange={(e) => setNewAccountForm({ ...newAccountForm, tenantId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              {state.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.businessName} ({t.businessType})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Administrator Full Name *
            </label>
            <input
              type="text"
              value={newAccountForm.fullName}
              onChange={(e) => setNewAccountForm({ ...newAccountForm, fullName: e.target.value })}
              placeholder="Dr. ..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Work Email *
            </label>
            <input
              type="email"
              value={newAccountForm.email}
              onChange={(e) => setNewAccountForm({ ...newAccountForm, email: e.target.value })}
              placeholder="admin@pharmacy.so"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Role
            </label>
            <select
              value={newAccountForm.role}
              onChange={(e) =>
                setNewAccountForm({
                  ...newAccountForm,
                  role: e.target.value as 'Pharmacy Admin' | 'Pharmaceutical Admin' | 'Super Admin',
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              <option value="Pharmacy Admin">Pharmacy Admin</option>
              <option value="Pharmaceutical Admin">Pharmaceutical Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={newAccountForm.requirePasswordChange}
              onChange={(e) =>
                setNewAccountForm({
                  ...newAccountForm,
                  requirePasswordChange: e.target.checked,
                })
              }
            />
            Require password change on first login
          </label>
        </div>
      </Modal>

      {/* Manual Create Tenant & Account Modal */}
      <Modal
        open={createTenantOpen}
        onClose={() => setCreateTenantOpen(false)}
        title="Create Tenant & Provision Initial Account"
        subtitle="Creates an isolated Pharmacy or Pharmaceutical workspace and triggers simulated welcome delivery."
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateTenantOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                !newTenantForm.businessName.trim() ||
                !newTenantForm.ownerName.trim() ||
                !newTenantForm.email.includes('@')
              }
              onClick={() => {
                const res = createTenantWithAccount({
                  ...newTenantForm,
                  address: newTenantForm.address || `${newTenantForm.city} Commercial District`,
                  registrationNumber:
                    newTenantForm.registrationNumber || `SOM-REG-${Math.floor(10000 + Math.random() * 89999)}`,
                });
                setCreateTenantOpen(false);
                setProvisionSummary({
                  tenant: res.tenant,
                  account: res.account,
                  source: 'Manual Provisioning',
                });
                showToast(`Created ${res.tenant.businessName} (${res.tenant.code}).`);
                setNewTenantForm({
                  businessName: '',
                  businessType: 'Pharmacy',
                  ownerName: '',
                  email: '',
                  phone: '+252 61 ',
                  city: 'Mogadishu',
                  address: '',
                  registrationNumber: '',
                });
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Create Tenant &amp; Provision
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNewTenantForm({ ...newTenantForm, businessType: 'Pharmacy' })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                newTenantForm.businessType === 'Pharmacy'
                  ? 'border-[#F05D21] bg-orange-50/60 dark:bg-orange-950/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <p className="text-xs font-bold text-[#1E396A] dark:text-white">Pharmacy Tenant</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Includes POS, Inventory &amp; Laboratory
              </p>
            </button>
            <button
              type="button"
              onClick={() =>
                setNewTenantForm({ ...newTenantForm, businessType: 'Pharmaceutical' })
              }
              className={`p-3 rounded-xl border text-left transition-colors ${
                newTenantForm.businessType === 'Pharmaceutical'
                  ? 'border-[#1E396A] dark:border-[#396BA4] bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <p className="text-xs font-bold text-[#1E396A] dark:text-white">
                Pharmaceutical Tenant
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Bulk supply, warehouse &amp; B2B receivables
              </p>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={newTenantForm.businessName}
                onChange={(e) =>
                  setNewTenantForm({ ...newTenantForm, businessName: e.target.value })
                }
                placeholder="Organization Name"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner / Admin Full Name *
              </label>
              <input
                type="text"
                value={newTenantForm.ownerName}
                onChange={(e) =>
                  setNewTenantForm({ ...newTenantForm, ownerName: e.target.value })
                }
                placeholder="Dr. / Admin Name"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email *
              </label>
              <input
                type="email"
                value={newTenantForm.email}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                placeholder="admin@business.so"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={newTenantForm.phone}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <select
                value={newTenantForm.city}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Mogadishu">Mogadishu</option>
                <option value="Hargeisa">Hargeisa</option>
                <option value="Garowe">Garowe</option>
                <option value="Bosaso">Bosaso</option>
                <option value="Kismayo">Kismayo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registration #
              </label>
              <input
                type="text"
                value={newTenantForm.registrationNumber}
                onChange={(e) =>
                  setNewTenantForm({ ...newTenantForm, registrationNumber: e.target.value })
                }
                placeholder="SOM-REG-XXXXX"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Simulated 6-Step Tenant Provisioning Confirmation Modal */}
      <Modal
        open={provisionSummary !== null}
        onClose={() => setProvisionSummary(null)}
        title="Tenant Provisioning Completed"
        subtitle={
          provisionSummary
            ? `${provisionSummary.source} · ${provisionSummary.tenant.code}`
            : ''
        }
        maxWidthClass="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setProvisionSummary(null)}
            className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
          >
            Done
          </button>
        }
      >
        {provisionSummary && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                {provisionSummary.tenant.businessName} ({provisionSummary.tenant.businessType})
              </p>
              <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">
                Admin Account: <span className="font-mono">{provisionSummary.account.email}</span>
              </p>
            </div>

            <div className="space-y-2">
              {[
                `1. Isolated tenant workspace created (${provisionSummary.tenant.code})`,
                `2. Business role assigned: ${provisionSummary.account.role}`,
                '3. Initial encrypted access token & secure credential link generated (plaintext never stored)',
                `4. Welcome onboarding message prepared for ${provisionSummary.tenant.ownerName}`,
                `5. Simulated Email (${provisionSummary.tenant.email}) & WhatsApp (${provisionSummary.tenant.phone}) dispatch: Delivered`,
                '6. Mandatory first-login password change policy enforced on initial sign-in',
              ].map((step) => (
                <div
                  key={step}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        open={editingApp !== null}
        onClose={() => setEditingApp(null)}
        title={`Edit Application — ${editingApp?.refNumber || ''}`}
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingApp(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editAppForm.businessName.trim() || !editAppForm.ownerName.trim()}
              onClick={() => {
                if (!editingApp) return;
                updateApplication(editingApp.id, {
                  businessName: editAppForm.businessName.trim(),
                  businessType: editAppForm.businessType,
                  ownerName: editAppForm.ownerName.trim(),
                  email: editAppForm.email.trim(),
                  phone: editAppForm.phone.trim(),
                  city: editAppForm.city.trim(),
                  address: editAppForm.address.trim(),
                  registrationNumber: editAppForm.registrationNumber.trim(),
                  licenseNumber: editAppForm.licenseNumber.trim(),
                  facilityDetail: editAppForm.facilityDetail.trim(),
                  notes: editAppForm.notes.trim(),
                });
                showToast(`Updated application ${editingApp.refNumber}.`);
                setEditingApp(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={editAppForm.businessName}
                onChange={(e) => setEditAppForm({ ...editAppForm, businessName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Type
              </label>
              <select
                value={editAppForm.businessType}
                onChange={(e) =>
                  setEditAppForm({ ...editAppForm, businessType: e.target.value as BusinessType })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Pharmaceutical">Pharmaceutical</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                value={editAppForm.ownerName}
                onChange={(e) => setEditAppForm({ ...editAppForm, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editAppForm.email}
                onChange={(e) => setEditAppForm({ ...editAppForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editAppForm.phone}
                onChange={(e) => setEditAppForm({ ...editAppForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={editAppForm.city}
                onChange={(e) => setEditAppForm({ ...editAppForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={editAppForm.address}
                onChange={(e) => setEditAppForm({ ...editAppForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commercial Registration #
              </label>
              <input
                type="text"
                value={editAppForm.registrationNumber}
                onChange={(e) =>
                  setEditAppForm({ ...editAppForm, registrationNumber: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                MOH License #
              </label>
              <input
                type="text"
                value={editAppForm.licenseNumber}
                onChange={(e) => setEditAppForm({ ...editAppForm, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={editAppForm.notes}
              onChange={(e) => setEditAppForm({ ...editAppForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal
        open={editingTenant !== null}
        onClose={() => setEditingTenant(null)}
        title={`Edit Tenant — ${editingTenant?.code || ''}`}
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingTenant(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editTenantForm.businessName.trim() || !editTenantForm.ownerName.trim()}
              onClick={() => {
                if (!editingTenant) return;
                updateTenant(editingTenant.id, {
                  businessName: editTenantForm.businessName.trim(),
                  businessType: editTenantForm.businessType,
                  ownerName: editTenantForm.ownerName.trim(),
                  email: editTenantForm.email.trim(),
                  phone: editTenantForm.phone.trim(),
                  city: editTenantForm.city.trim(),
                  address: editTenantForm.address.trim(),
                  plan: editTenantForm.plan.trim(),
                  status: editTenantForm.status,
                });
                showToast(`Updated tenant ${editTenantForm.businessName.trim()}.`);
                setEditingTenant(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={editTenantForm.businessName}
                onChange={(e) =>
                  setEditTenantForm({ ...editTenantForm, businessName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Type
              </label>
              <select
                value={editTenantForm.businessType}
                onChange={(e) =>
                  setEditTenantForm({
                    ...editTenantForm,
                    businessType: e.target.value as BusinessType,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Pharmaceutical">Pharmaceutical</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner / Admin *
              </label>
              <input
                type="text"
                value={editTenantForm.ownerName}
                onChange={(e) =>
                  setEditTenantForm({ ...editTenantForm, ownerName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editTenantForm.email}
                onChange={(e) => setEditTenantForm({ ...editTenantForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editTenantForm.phone}
                onChange={(e) => setEditTenantForm({ ...editTenantForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={editTenantForm.city}
                onChange={(e) => setEditTenantForm({ ...editTenantForm, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={editTenantForm.address}
                onChange={(e) => setEditTenantForm({ ...editTenantForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Plan
              </label>
              <input
                type="text"
                value={editTenantForm.plan}
                onChange={(e) => setEditTenantForm({ ...editTenantForm, plan: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operational Status
              </label>
              <select
                value={editTenantForm.status}
                onChange={(e) =>
                  setEditTenantForm({
                    ...editTenantForm,
                    status: e.target.value as TenantStatus,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Setup">Pending Setup</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* View Account Modal */}
      <Modal
        open={viewingAccount !== null}
        onClose={() => setViewingAccount(null)}
        title={viewingAccount?.fullName || 'Account Details'}
        subtitle={viewingAccount ? `${viewingAccount.role} · ${viewingAccount.tenantName}` : ''}
        maxWidthClass="max-w-lg"
      >
        {viewingAccount && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
              <span className="font-mono font-semibold text-[#1E396A] dark:text-sky-300">
                {viewingAccount.email}
              </span>
              <StatusLabel label={viewingAccount.status} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Organization</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingAccount.tenantName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Assigned Role</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingAccount.role}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Password Policy</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {viewingAccount.requirePasswordChange ? 'Change required on next login' : 'Compliant'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Last Login</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                  {viewingAccount.lastLoginAt}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        open={editingAccount !== null}
        onClose={() => setEditingAccount(null)}
        title={`Edit Administrator Account`}
        subtitle={editingAccount?.email || ''}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingAccount(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editAccountForm.fullName.trim() || !editAccountForm.email.includes('@')}
              onClick={() => {
                if (!editingAccount) return;
                const matchedTenant = state.tenants.find((t) => t.id === editAccountForm.tenantId);
                updateAccount(editingAccount.id, {
                  tenantId: editAccountForm.tenantId,
                  tenantName:
                    matchedTenant?.businessName ||
                    (editAccountForm.role === 'Super Admin'
                      ? "MI'AH ICT Solutions"
                      : editingAccount.tenantName),
                  fullName: editAccountForm.fullName.trim(),
                  email: editAccountForm.email.trim(),
                  role: editAccountForm.role,
                  status: editAccountForm.status,
                  requirePasswordChange: editAccountForm.requirePasswordChange,
                });
                showToast(`Updated account for ${editAccountForm.fullName.trim()}.`);
                setEditingAccount(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={editAccountForm.fullName}
              onChange={(e) => setEditAccountForm({ ...editAccountForm, fullName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Email *
            </label>
            <input
              type="email"
              value={editAccountForm.email}
              onChange={(e) => setEditAccountForm({ ...editAccountForm, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <select
                value={editAccountForm.role}
                onChange={(e) =>
                  setEditAccountForm({
                    ...editAccountForm,
                    role: e.target.value as 'Pharmacy Admin' | 'Pharmaceutical Admin' | 'Super Admin',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Pharmacy Admin">Pharmacy Admin</option>
                <option value="Pharmaceutical Admin">Pharmaceutical Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={editAccountForm.status}
                onChange={(e) =>
                  setEditAccountForm({
                    ...editAccountForm,
                    status: e.target.value as AccountStatus,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Pending Password Change">Pending Password Change</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tenant Organization
            </label>
            <select
              value={editAccountForm.tenantId}
              onChange={(e) => setEditAccountForm({ ...editAccountForm, tenantId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            >
              <option value="platform">MI&apos;AH ICT Solutions (Platform)</option>
              {state.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.businessName} ({t.businessType})
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={editAccountForm.requirePasswordChange}
              onChange={(e) =>
                setEditAccountForm({
                  ...editAccountForm,
                  requirePasswordChange: e.target.checked,
                })
              }
            />
            Require password change on next login
          </label>
        </div>
      </Modal>

      {/* View Document Modal */}
      <Modal
        open={viewingFile !== null}
        onClose={() => setViewingFile(null)}
        title={viewingFile?.fileName || 'Document Details'}
        subtitle={viewingFile ? `${viewingFile.category} · ${viewingFile.size}` : ''}
        maxWidthClass="max-w-lg"
      >
        {viewingFile && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#396BA4] dark:text-sky-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{viewingFile.fileName}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified platform compliance artifact · {viewingFile.size}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Tenant / Applicant</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingFile.tenantName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Category</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingFile.category}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Uploaded Date</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                  {viewingFile.uploadedAt}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Document ID</p>
                <p className="font-mono font-medium text-[#1E396A] dark:text-sky-300 mt-0.5">
                  {viewingFile.id}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        open={editingFile !== null}
        onClose={() => setEditingFile(null)}
        title="Edit Platform Document Metadata"
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingFile(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editFileForm.fileName.trim()}
              onClick={() => {
                if (!editingFile) return;
                updatePlatformFile(editingFile.id, {
                  fileName: editFileForm.fileName.trim(),
                  category: editFileForm.category,
                  tenantName: editFileForm.tenantName.trim(),
                  size: editFileForm.size.trim(),
                });
                showToast(`Updated document metadata for ${editFileForm.fileName.trim()}.`);
                setEditingFile(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Name *
            </label>
            <input
              type="text"
              value={editFileForm.fileName}
              onChange={(e) => setEditFileForm({ ...editFileForm, fileName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={editFileForm.category}
                onChange={(e) =>
                  setEditFileForm({
                    ...editFileForm,
                    category: e.target.value as PlatformFileRecord['category'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="License">License</option>
                <option value="Registration">Registration</option>
                <option value="Lab Report Template">Lab Report Template</option>
                <option value="Export">Export</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Size
              </label>
              <input
                type="text"
                value={editFileForm.size}
                onChange={(e) => setEditFileForm({ ...editFileForm, size: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tenant / Applicant
            </label>
            <input
              type="text"
              value={editFileForm.tenantName}
              onChange={(e) => setEditFileForm({ ...editFileForm, tenantName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
        </div>
      </Modal>

      {/* View Audit Event Details Modal */}
      <Modal
        open={viewingAudit !== null}
        onClose={() => setViewingAudit(null)}
        title="Audit Event Inspection"
        subtitle={viewingAudit ? `${viewingAudit.action} · ${viewingAudit.timestamp}` : ''}
        maxWidthClass="max-w-lg"
      >
        {viewingAudit && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-mono font-bold text-[#1E396A] dark:text-sky-300">
                {viewingAudit.action}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <Lock className="h-3 w-3" />
                Immutable Compliance Log
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Actor</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingAudit.actor}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Actor Role</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingAudit.actorRole}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Resource</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {viewingAudit.resource} ({viewingAudit.resourceId})
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Timestamp</p>
                <p className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                  {viewingAudit.timestamp}
                </p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Description</p>
              <p className="mt-1 p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] text-slate-700 dark:text-slate-200 leading-relaxed">
                {viewingAudit.description}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete / Archive Confirmation Modals */}
      <DeleteConfirmModal
        open={deleteTargetApp !== null}
        onClose={() => setDeleteTargetApp(null)}
        title="Archive & Delete Application"
        recordType="Tenant Application"
        recordLabel={
          deleteTargetApp
            ? `${deleteTargetApp.refNumber} · ${deleteTargetApp.businessName}`
            : ''
        }
        isSoftDelete
        warningMessage="Regulatory onboarding applications are archived for compliance before being removed from the active review queue."
        onConfirm={() => {
          if (!deleteTargetApp) return;
          const res = deleteApplication(deleteTargetApp.id);
          showToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetApp(null);
        }}
      />

      <DeleteConfirmModal
        open={deleteTargetTenant !== null}
        onClose={() => setDeleteTargetTenant(null)}
        title="Archive & Delete Tenant Organization"
        recordType="Tenant Organization"
        recordLabel={
          deleteTargetTenant
            ? `${deleteTargetTenant.code} · ${deleteTargetTenant.businessName}`
            : ''
        }
        isSoftDelete
        warningMessage="Archiving this tenant removes it from active platform operations, archives linked tenant administrator accounts, and writes an immutable audit log entry."
        onConfirm={() => {
          if (!deleteTargetTenant) return;
          const res = deleteTenant(deleteTargetTenant.id);
          showToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetTenant(null);
        }}
      />

      <DeleteConfirmModal
        open={deleteTargetAccount !== null}
        onClose={() => setDeleteTargetAccount(null)}
        title="Delete Administrator Account"
        recordType="Administrator Account"
        recordLabel={
          deleteTargetAccount
            ? `${deleteTargetAccount.fullName} (${deleteTargetAccount.email})`
            : ''
        }
        warningMessage="This will revoke access and remove the administrator account from the platform. Protected primary Super Admin accounts cannot be deleted."
        onConfirm={() => {
          if (!deleteTargetAccount) return;
          const res = deleteAccount(deleteTargetAccount.id);
          showToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetAccount(null);
        }}
      />

      <DeleteConfirmModal
        open={deleteTargetFile !== null}
        onClose={() => setDeleteTargetFile(null)}
        title="Archive & Delete Platform Document"
        recordType="Platform Document"
        recordLabel={
          deleteTargetFile
            ? `${deleteTargetFile.fileName} (${deleteTargetFile.tenantName})`
            : ''
        }
        isSoftDelete
        warningMessage="Compliance documents are archived in the audit snapshot log before removal from the active file repository."
        onConfirm={() => {
          if (!deleteTargetFile) return;
          const res = deletePlatformFile(deleteTargetFile.id);
          showToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetFile(null);
        }}
      />
    </DashboardShell>
  );
};
