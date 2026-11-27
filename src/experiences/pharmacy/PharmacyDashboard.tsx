import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  BatchExpiryView,
  InventoryView,
  ProductsView,
} from '../../components/erp/CatalogAndInventoryViews';
import {
  ExpensesView,
  FinanceView,
  ReportsView,
} from '../../components/erp/FinanceExpensesReportsViews';
import {
  CustomersView,
  PurchasesView,
  SuppliersView,
} from '../../components/erp/PartnersAndPurchasesViews';
import { DonutOverviewChart } from '../../components/ui/Charts';
import { DashboardShell, SidebarNavItem } from '../../components/ui/DashboardShell';
import { FinanceOverviewCard } from '../../components/ui/FinanceOverviewCard';
import { KpiCard } from '../../components/ui/KpiCard';
import {
  GreetingHeader,
  LeaderboardCard,
  PipelineCard,
  RemindersCard,
} from '../../components/ui/NexoraWidgets';
import { RecentlyActionsCard } from '../../components/ui/RecentlyActionsCard';
import { TODAY_ISO } from '../../data/seedData';
import { getBatchStatus, useDemoStore } from '../../store/demoStore';
import { ExperienceRole } from '../../types/erp';
import { LaboratoryModule } from './LaboratoryModule';
import { PharmacyPosView } from './PharmacyPosView';

interface PharmacyDashboardProps {
  onSwitchExperience: (role: ExperienceRole) => void;
}

type PharmacyPage =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'batch_expiry'
  | 'sales_pos'
  | 'customers'
  | 'suppliers'
  | 'purchases'
  | 'finance'
  | 'expenses'
  | 'lab_reports'
  | 'reports'
  | 'notifications'
  | 'settings';

const NAV_ITEMS: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Boxes className="h-4 w-4" /> },
  { id: 'batch_expiry', label: 'Batch & Expiry', icon: <CalendarClock className="h-4 w-4" /> },
  { id: 'sales_pos', label: 'Sales & POS', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { id: 'suppliers', label: 'Suppliers', icon: <Truck className="h-4 w-4" /> },
  { id: 'purchases', label: 'Purchases', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'finance', label: 'Finance', icon: <Wallet className="h-4 w-4" /> },
  { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
  { id: 'lab_reports', label: 'Laboratory Reports', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

const PAGE_TITLES: Record<PharmacyPage, string> = {
  dashboard: 'Pharmacy Dashboard',
  products: 'Medicine & Product Catalog',
  inventory: 'Pharmacy Inventory & Stock',
  batch_expiry: 'Batch & Expiry Tracking',
  sales_pos: 'Sales & Point of Sale (POS)',
  customers: 'Pharmacy Customers',
  suppliers: 'Pharmaceutical Suppliers',
  purchases: 'Purchases & Stock Receiving',
  finance: 'Pharmacy Finance',
  expenses: 'Operating Expenses',
  lab_reports: 'Laboratory Reports',
  reports: 'Pharmacy Reports',
  notifications: 'Notifications & Alerts',
  settings: 'Pharmacy Settings',
};

export const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({
  onSwitchExperience,
}) => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    restoreSampleData,
  } = useDemoStore();

  const [activePage, setActivePage] = useState<PharmacyPage>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState('Nov 19 – Nov 26, 2026');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const pharmacyNotifications = useMemo(
    () => state.notifications.filter((n) => n.scope === 'pharmacy_admin'),
    [state.notifications]
  );

  const pharmacyProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === 'pharmacy'),
    [state.products]
  );
  const pharmacyBatches = useMemo(
    () => state.batches.filter((b) => b.tenantScope === 'pharmacy'),
    [state.batches]
  );
  const pharmacySales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === 'pharmacy'),
    [state.sales]
  );
  const pharmacyPurchases = useMemo(
    () => state.purchases.filter((p) => p.tenantScope === 'pharmacy'),
    [state.purchases]
  );
  const pharmacySuppliers = useMemo(
    () => state.suppliers.filter((s) => s.tenantScope === 'pharmacy'),
    [state.suppliers]
  );
  const pharmacyExpenses = useMemo(
    () => state.expenses.filter((e) => e.tenantScope === 'pharmacy'),
    [state.expenses]
  );
  const pharmacyActivities = useMemo(
    () =>
      state.auditLogs.filter(
        (l) => l.scope === 'pharmacy' || (!l.scope && l.actorRole === 'Pharmacy Admin')
      ),
    [state.auditLogs]
  );

  const liveSalesTotal = useMemo(
    () => pharmacySales.reduce((sum, s) => sum + s.total, 0),
    [pharmacySales]
  );
  const liveExpensesTotal = useMemo(
    () => pharmacyExpenses.reduce((sum, e) => sum + e.amount, 0),
    [pharmacyExpenses]
  );

  // 9 Required Pharmacy Dashboard KPIs
  const kpis = useMemo(() => {
    const todaysSales = pharmacySales
      .filter((s) => s.date === TODAY_ISO)
      .reduce((sum, s) => sum + s.total, 0);
    const monthlySales = pharmacySales
      .filter((s) => s.date.startsWith('2026-11'))
      .reduce((sum, s) => sum + s.total, 0);
    const totalProducts = pharmacyProducts.length;
    const lowStockProducts = pharmacyProducts.filter((p) => p.stockQty <= p.minStock);
    const nearExpiryBatches = pharmacyBatches.filter((b) => {
      const st = getBatchStatus(b.expiryDate, state.systemConfig.expiryAlertDays);
      return st === 'Near Expiry' || st === 'Expired';
    });
    const supplierPayables = pharmacySuppliers.reduce((sum, s) => sum + s.balancePayable, 0);
    const totalLab = state.labRequests.length;
    const answeredLab = state.labRequests.filter((r) => r.status === 'Answered').length;
    const pendingLab = state.labRequests.filter((r) => r.status === 'Pending').length;

    return {
      todaysSales,
      monthlySales,
      totalProducts,
      lowStockProducts,
      nearExpiryBatches,
      supplierPayables,
      totalLab,
      answeredLab,
      pendingLab,
    };
  }, [
    pharmacySales,
    pharmacyProducts,
    pharmacyBatches,
    pharmacySuppliers,
    state.labRequests,
    state.systemConfig.expiryAlertDays,
  ]);

  return (
    <DashboardShell
      roleLabel="Al-Shifa Modern Pharmacy · Pharmacy Admin"
      userName="Dr. Hassan Mohamed Warsame"
      userEmail="hassan@alshifapharma.so"
      pageTitle={PAGE_TITLES[activePage]}
      breadcrumb="Pharmacy Operations"
      navItems={NAV_ITEMS}
      activeNavId={activePage}
      onSelectNav={(id) => setActivePage(id as PharmacyPage)}
      sidebarQuickActions={[
        {
          label: 'New Sale (POS)',
          icon: <ShoppingCart className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('sales_pos'),
        },
        {
          label: 'Add Medicine / Product',
          icon: <Plus className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('products'),
        },
        {
          label: 'Record Purchase',
          icon: <ClipboardList className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('purchases'),
        },
        {
          label: 'Laboratory Reports',
          icon: <FlaskConical className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('lab_reports'),
        },
        {
          label: 'View Reports',
          icon: <BarChart3 className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('reports'),
        },
      ]}
      onQuickPlusClick={() => setActivePage('sales_pos')}
      notifications={pharmacyNotifications}
      onMarkNotificationRead={markNotificationRead}
      onMarkAllNotificationsRead={() => markAllNotificationsRead('pharmacy_admin')}
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      onGlobalSearchSubmit={(val) => {
        if (val.trim()) setActivePage('products');
      }}
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
          {/* Nexora Greeting & Action Controls */}
          <GreetingHeader
            title="Welcome back, Dr. Hassan!"
            subtitle="Here's what's happening with Al-Shifa Modern Pharmacy today."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filterLabel="Open POS"
            onFilterClick={() => setActivePage('sales_pos')}
          />

          {/* Primary 4-Card Nexora KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Today's Sales"
              value={`$${kpis.todaysSales.toFixed(2)}`}
              trendText="↑ 14.8% vs yesterday"
              trendPositive
              tone="orange"
              icon={<ShoppingCart className="h-5 w-5" />}
              onClick={() => setActivePage('sales_pos')}
            />
            <KpiCard
              label="Monthly Sales"
              value={`$${kpis.monthlySales.toFixed(2)}`}
              trendText="↑ 21.4% vs last month"
              trendPositive
              tone="navy"
              icon={<Wallet className="h-5 w-5" />}
              ringPercent={Math.min(100, Math.round((kpis.monthlySales / 1000) * 100))}
              onClick={() => setActivePage('reports')}
            />
            <KpiCard
              label="Total Products"
              value={kpis.totalProducts}
              subtext={`${kpis.lowStockProducts.length} low stock · ${kpis.nearExpiryBatches.length} expiry alerts`}
              tone="blue"
              icon={<Package className="h-5 w-5" />}
              onClick={() => setActivePage('products')}
            />
            <KpiCard
              label="Supplier Payables"
              value={`$${kpis.supplierPayables.toFixed(2)}`}
              trendText="Open supplier credit balances"
              trendPositive={false}
              tone="error"
              icon={<Truck className="h-5 w-5" />}
              onClick={() => setActivePage('finance')}
            />
          </div>

          {/* Secondary 5-Card Inventory & Lab KPI Row (All 9 Required KPIs Visible) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            <KpiCard
              label="Low Stock"
              value={kpis.lowStockProducts.length}
              subtext="Below min threshold"
              tone="warning"
              icon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setActivePage('inventory')}
            />
            <KpiCard
              label="Near Expiry / Expired"
              value={kpis.nearExpiryBatches.length}
              subtext="Batches needing action"
              tone="error"
              icon={<CalendarClock className="h-4 w-4" />}
              onClick={() => setActivePage('batch_expiry')}
            />
            <KpiCard
              label="Total Lab Requests"
              value={kpis.totalLab}
              subtext="Patient diagnostics"
              tone="navy"
              icon={<FlaskConical className="h-4 w-4" />}
              onClick={() => setActivePage('lab_reports')}
            />
            <KpiCard
              label="Answered Requests"
              value={kpis.answeredLab}
              subtext="Ready for WhatsApp"
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setActivePage('lab_reports')}
            />
            <KpiCard
              label="Pending Requests"
              value={kpis.pendingLab}
              subtext="Awaiting lab result"
              tone="warning"
              icon={<ClipboardList className="h-4 w-4" />}
              onClick={() => setActivePage('lab_reports')}
            />
          </div>

          {/* Finance Overview (Dedicated 100% Full-Width Row) */}
          <div className="w-full">
            <FinanceOverviewCard
              tenantScope="pharmacy"
              liveSalesTotal={liveSalesTotal}
              liveExpensesTotal={liveExpensesTotal}
              onViewFinance={() => setActivePage('finance')}
            />
          </div>

          {/* Pharmacy & Lab Operations Pipeline (Full Width) */}
          <PipelineCard
            title="Pharmacy &amp; Lab Operations Pipeline"
            actionLabel="Open POS"
            onAction={() => setActivePage('sales_pos')}
            stages={[
              {
                id: 'low_stock',
                title: 'Low Stock',
                countLabel: `${kpis.lowStockProducts.length} Items`,
                metricLabel: 'Reorder Now',
                color: '#D97706',
                items: kpis.lowStockProducts.map((p) => ({
                  id: p.id,
                  name: p.name,
                  value: `${p.stockQty} ${p.unit} left`,
                  initial: p.name[0],
                  onClick: () => setActivePage('inventory'),
                })),
              },
              {
                id: 'expiry',
                title: 'Expiry Alerts',
                countLabel: `${kpis.nearExpiryBatches.length} Batches`,
                metricLabel: 'Quarantine',
                color: '#DC2626',
                items: kpis.nearExpiryBatches.map((b) => ({
                  id: b.id,
                  name: b.productName,
                  value: `${b.batchNumber} · ${b.expiryDate}`,
                  initial: b.productName[0],
                  onClick: () => setActivePage('batch_expiry'),
                })),
              },
              {
                id: 'lab_pending',
                title: 'Lab Pending',
                countLabel: `${kpis.pendingLab} Tests`,
                metricLabel: 'Result Entry',
                color: '#396BA4',
                items: state.labRequests
                  .filter((r) => r.status === 'Pending')
                  .map((r) => ({
                    id: r.id,
                    name: r.patientName,
                    value: r.testName,
                    initial: r.patientName[0],
                    onClick: () => setActivePage('lab_reports'),
                  })),
              },
              {
                id: 'lab_answered',
                title: 'Lab Answered',
                countLabel: `${kpis.answeredLab} Ready`,
                metricLabel: 'WhatsApp',
                color: '#16A34A',
                items: state.labRequests
                  .filter((r) => r.status === 'Answered')
                  .map((r) => ({
                    id: r.id,
                    name: r.patientName,
                    value: r.testName,
                    initial: r.patientName[0],
                    onClick: () => setActivePage('lab_reports'),
                  })),
              },
              {
                id: 'recent_sales',
                title: 'Completed POS',
                countLabel: `${pharmacySales.length} Sales`,
                metricLabel: `$${kpis.monthlySales.toFixed(2)}`,
                color: '#1E396A',
                items: pharmacySales.slice(0, 3).map((s) => ({
                  id: s.id,
                  name: s.customerName,
                  value: `$${s.total.toFixed(2)} · ${s.paymentMethod}`,
                  initial: s.customerName[0],
                  onClick: () => setActivePage('sales_pos'),
                })),
                moreCount: Math.max(0, pharmacySales.length - 3),
              },
            ]}
          />

          {/* 3-Column Row: Payment Overview Donut, Top Products, Alerts & Reminders */}
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Payment Overview</h2>
                <button
                  type="button"
                  onClick={() => setActivePage('finance')}
                  className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <DonutOverviewChart
                centerValue={`$${Math.round(kpis.monthlySales)}`}
                centerLabel="Monthly Sales"
                formatValue={(v) => `$${v.toFixed(0)}`}
                items={[
                  {
                    label: 'Cash',
                    value: pharmacySales
                      .filter((s) => s.paymentMethod === 'Cash')
                      .reduce((a, b) => a + b.total, 0),
                    color: '#16A34A',
                  },
                  {
                    label: 'EVC Plus / Zaad',
                    value: pharmacySales
                      .filter((s) => s.paymentMethod === 'EVC Plus' || s.paymentMethod === 'Zaad')
                      .reduce((a, b) => a + b.total, 0),
                    color: '#F05D21',
                  },
                  {
                    label: 'Bank Transfer',
                    value: pharmacySales
                      .filter((s) => s.paymentMethod === 'Bank Transfer')
                      .reduce((a, b) => a + b.total, 0),
                    color: '#1E396A',
                  },
                  {
                    label: 'Credit',
                    value: pharmacySales
                      .filter((s) => s.paymentMethod === 'Credit')
                      .reduce((a, b) => a + b.total, 0),
                    color: '#396BA4',
                  },
                ]}
              />
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Recent POs</span>
                <span className="font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
                  {pharmacyPurchases.length} Orders
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <LeaderboardCard
                title="Top Stock Value Medicines"
                actionLabel="View All"
                onAction={() => setActivePage('products')}
                rows={[...pharmacyProducts]
                  .sort((a, b) => b.stockQty * b.sellPrice - a.stockQty * a.sellPrice)
                  .slice(0, 5)
                  .map((p, idx) => {
                    const maxVal = Math.max(
                      1,
                      ...pharmacyProducts.map((x) => x.stockQty * x.sellPrice)
                    );
                    const val = p.stockQty * p.sellPrice;
                    return {
                      id: p.id,
                      name: p.name,
                      valueText: `$${val.toFixed(0)}`,
                      percent: Math.round((val / maxVal) * 100),
                      color: idx === 0 ? '#F05D21' : '#396BA4',
                    };
                  })}
              />
            </div>

            <div className="lg:col-span-4">
              <RemindersCard
                title="Stock & Expiry Reminders"
                actionLabel="View All"
                onAction={() => setActivePage('batch_expiry')}
                items={[
                  ...kpis.lowStockProducts.slice(0, 2).map((p) => ({
                    id: p.id,
                    timeLabel: `${p.stockQty} left`,
                    name: p.name,
                    detail: `Below min stock (${p.minStock} ${p.unit})`,
                    icon: <AlertTriangle className="h-3.5 w-3.5" />,
                    accentBg: 'bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400',
                    onClick: () => setActivePage('inventory'),
                  })),
                  ...kpis.nearExpiryBatches.slice(0, 2).map((b) => ({
                    id: b.id,
                    timeLabel: b.expiryDate.slice(5),
                    name: b.productName,
                    detail: `Batch ${b.batchNumber} · Qty ${b.qty}`,
                    icon: <CalendarClock className="h-3.5 w-3.5" />,
                    accentBg: 'bg-red-50 dark:bg-red-950/60 text-[#DC2626] dark:text-red-400',
                    onClick: () => setActivePage('batch_expiry'),
                  })),
                ]}
              />
            </div>
          </div>

          {/* Recently Actions (Pharmacy Tenant Isolated) */}
          <RecentlyActionsCard
            title="Recently Actions"
            subtitle="Latest pharmacy sales, catalog, inventory, purchasing, and lab operations"
            activities={pharmacyActivities}
            maxItems={6}
          />

        </div>
      )}

      {activePage === 'products' && <ProductsView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'inventory' && <InventoryView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'batch_expiry' && <BatchExpiryView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'sales_pos' && <PharmacyPosView onToast={showToast} />}
      {activePage === 'customers' && <CustomersView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'suppliers' && <SuppliersView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'purchases' && <PurchasesView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'finance' && <FinanceView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'expenses' && <ExpensesView tenantScope="pharmacy" onToast={showToast} />}
      {activePage === 'lab_reports' && <LaboratoryModule onToast={showToast} />}
      {activePage === 'reports' && <ReportsView tenantScope="pharmacy" onToast={showToast} />}

      {activePage === 'notifications' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Pharmacy Notifications &amp; Alerts</h2>
            <button
              type="button"
              onClick={() => markAllNotificationsRead('pharmacy_admin')}
              className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pharmacyNotifications.map((n) => (
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

      {activePage === 'settings' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-2xl space-y-5">
          <h2 className="text-base font-bold text-[#1E396A] dark:text-white">Pharmacy Tenant Settings</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pharmacy Organization</p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">Al-Shifa Modern Pharmacy</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">TEN-PH-001 · Mogadishu</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pharmacy Administrator</p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">Dr. Hassan Mohamed Warsame</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">hassan@alshifapharma.so</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Restore Initial Sample Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revert simulated sales, stock movements, purchases, and lab requests to baseline data.
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
    </DashboardShell>
  );
};
