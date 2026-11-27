import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
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
import { PharmaceuticalSalesView } from './PharmaceuticalSalesView';

interface PharmaceuticalDashboardProps {
  onSwitchExperience: (role: ExperienceRole) => void;
}

type PharmaceuticalPage =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'batch_expiry'
  | 'sales'
  | 'customers'
  | 'suppliers'
  | 'purchases'
  | 'finance'
  | 'expenses'
  | 'reports'
  | 'notifications'
  | 'settings';

const NAV_ITEMS: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Boxes className="h-4 w-4" /> },
  { id: 'batch_expiry', label: 'Batch & Expiry', icon: <CalendarClock className="h-4 w-4" /> },
  { id: 'sales', label: 'Sales & POS', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { id: 'suppliers', label: 'Suppliers', icon: <Truck className="h-4 w-4" /> },
  { id: 'purchases', label: 'Purchasing', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'finance', label: 'Finance & Accounting', icon: <Wallet className="h-4 w-4" /> },
  { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications & Alerts', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

const PAGE_TITLES: Record<PharmaceuticalPage, string> = {
  dashboard: 'Pharmaceutical Overview',
  products: 'Pharmaceutical Product Catalog',
  inventory: 'Warehouse Inventory',
  batch_expiry: 'Batch & Expiry Control',
  sales: 'Pharmaceutical Sales & POS',
  customers: 'Business Customers',
  suppliers: 'Manufacturers & Suppliers',
  purchases: 'Purchasing & Stock Receiving',
  finance: 'Finance & Accounting',
  expenses: 'Supply & Operations Expenses',
  reports: 'Reports & Analytics',
  notifications: 'Notifications & Alerts',
  settings: 'Pharmaceutical Settings',
};

export const PharmaceuticalDashboard: React.FC<PharmaceuticalDashboardProps> = ({
  onSwitchExperience,
}) => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    restoreSampleData,
  } = useDemoStore();

  const [activePage, setActivePage] = useState<PharmaceuticalPage>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState('Nov 19 – Nov 26, 2026');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const pharmaNotifications = useMemo(
    () => state.notifications.filter((n) => n.scope === 'pharmaceutical_admin'),
    [state.notifications]
  );

  const pharmaProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === 'pharmaceutical'),
    [state.products]
  );
  const pharmaBatches = useMemo(
    () => state.batches.filter((b) => b.tenantScope === 'pharmaceutical'),
    [state.batches]
  );
  const pharmaSales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === 'pharmaceutical'),
    [state.sales]
  );
  const pharmaPurchases = useMemo(
    () => state.purchases.filter((p) => p.tenantScope === 'pharmaceutical'),
    [state.purchases]
  );
  const pharmaCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === 'pharmaceutical'),
    [state.customers]
  );
  const pharmaSuppliers = useMemo(
    () => state.suppliers.filter((s) => s.tenantScope === 'pharmaceutical'),
    [state.suppliers]
  );
  const pharmaExpenses = useMemo(
    () => state.expenses.filter((e) => e.tenantScope === 'pharmaceutical'),
    [state.expenses]
  );
  const pharmaActivities = useMemo(
    () =>
      state.auditLogs.filter(
        (l) =>
          l.scope === 'pharmaceutical' ||
          (!l.scope && l.actorRole === 'Pharmaceutical Admin')
      ),
    [state.auditLogs]
  );

  const liveSalesTotal = useMemo(
    () => pharmaSales.reduce((sum, s) => sum + s.total, 0),
    [pharmaSales]
  );
  const liveExpensesTotal = useMemo(
    () => pharmaExpenses.reduce((sum, e) => sum + e.amount, 0),
    [pharmaExpenses]
  );

  const kpis = useMemo(() => {
    const todaysSales = pharmaSales
      .filter((s) => s.date === TODAY_ISO)
      .reduce((sum, s) => sum + s.total, 0);
    const monthlySales = pharmaSales
      .filter((s) => s.date.startsWith('2026-11'))
      .reduce((sum, s) => sum + s.total, 0);
    const totalProducts = pharmaProducts.length;
    const inventoryValue = pharmaProducts.reduce(
      (sum, p) => sum + p.stockQty * p.costPrice,
      0
    );
    const lowStockProducts = pharmaProducts.filter((p) => p.stockQty <= p.minStock);
    const nearExpiryBatches = pharmaBatches.filter((b) => {
      const st = getBatchStatus(b.expiryDate, state.systemConfig.expiryAlertDays);
      return st === 'Near Expiry' || st === 'Expired';
    });
    const totalCustomers = pharmaCustomers.length;
    const supplierPayables = pharmaSuppliers.reduce((sum, s) => sum + s.balancePayable, 0);
    const outstandingReceivables = pharmaCustomers.reduce(
      (sum, c) => sum + c.balanceReceivable,
      0
    );

    return {
      todaysSales,
      monthlySales,
      totalProducts,
      inventoryValue,
      lowStockProducts,
      nearExpiryBatches,
      totalCustomers,
      supplierPayables,
      outstandingReceivables,
    };
  }, [
    pharmaSales,
    pharmaProducts,
    pharmaBatches,
    pharmaCustomers,
    pharmaSuppliers,
    state.systemConfig.expiryAlertDays,
  ]);

  return (
    <DashboardShell
      roleLabel="Benaadir Pharmaceutical Supply Ltd · Pharmaceutical Admin"
      userName="Abdirahman Yusuf Shire"
      userEmail="ops@benaadirpharma.so"
      pageTitle={PAGE_TITLES[activePage]}
      breadcrumb="Pharmaceutical Supply"
      navItems={NAV_ITEMS}
      activeNavId={activePage}
      onSelectNav={(id) => setActivePage(id as PharmaceuticalPage)}
      sidebarQuickActions={[
        {
          label: 'New Sale (POS)',
          icon: <ShoppingCart className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('sales'),
        },
        {
          label: 'Add Bulk Product',
          icon: <Plus className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('products'),
        },
        {
          label: 'Receive Supplier Stock',
          icon: <ClipboardList className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('purchases'),
        },
        {
          label: 'Customer Receivables',
          icon: <Users className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('customers'),
        },
        {
          label: 'Reports & Analytics',
          icon: <BarChart3 className="h-3.5 w-3.5" />,
          onClick: () => setActivePage('reports'),
        },
      ]}
      onQuickPlusClick={() => setActivePage('sales')}
      notifications={pharmaNotifications}
      onMarkNotificationRead={markNotificationRead}
      onMarkAllNotificationsRead={() => markAllNotificationsRead('pharmaceutical_admin')}
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
          {/* Greeting & Action Controls */}
          <GreetingHeader
            title="Welcome back, Abdirahman!"
            subtitle="Here's what's happening at Benaadir Pharmaceutical Supply today."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filterLabel="New Invoice"
            onFilterClick={() => setActivePage('sales')}
          />

          {/* Primary 4-Card KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Today's Sales"
              value={`$${kpis.todaysSales.toFixed(2)}`}
              trendText="↑ 19.2% vs yesterday"
              trendPositive
              tone="orange"
              icon={<FileText className="h-5 w-5" />}
              onClick={() => setActivePage('sales')}
            />
            <KpiCard
              label="Monthly Sales"
              value={`$${kpis.monthlySales.toFixed(2)}`}
              trendText="↑ 24.1% vs last month"
              trendPositive
              tone="navy"
              icon={<Wallet className="h-5 w-5" />}
              ringPercent={Math.min(100, Math.round((kpis.monthlySales / 5000) * 100))}
              onClick={() => setActivePage('reports')}
            />
            <KpiCard
              label="Inventory Value"
              value={`$${kpis.inventoryValue.toFixed(2)}`}
              subtext={`${kpis.totalProducts} bulk SKUs in warehouse`}
              tone="blue"
              icon={<DollarSign className="h-5 w-5" />}
              onClick={() => setActivePage('inventory')}
            />
            <KpiCard
              label="Customer Receivables"
              value={`$${kpis.outstandingReceivables.toFixed(2)}`}
              trendText={`${kpis.totalCustomers} registered B2B accounts`}
              trendPositive={false}
              tone="warning"
              icon={<Users className="h-5 w-5" />}
              onClick={() => setActivePage('customers')}
            />
          </div>

          {/* Secondary 4-Card Warehouse & Payables KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Products"
              value={kpis.totalProducts}
              subtext="Active pharmaceutical SKUs"
              tone="blue"
              icon={<Package className="h-4 w-4" />}
              onClick={() => setActivePage('products')}
            />
            <KpiCard
              label="Low Stock"
              value={kpis.lowStockProducts.length}
              subtext="Reorder threshold reached"
              tone="warning"
              icon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setActivePage('inventory')}
            />
            <KpiCard
              label="Near Expiry / Expired"
              value={kpis.nearExpiryBatches.length}
              subtext="Batches needing FEFO action"
              tone="error"
              icon={<CalendarClock className="h-4 w-4" />}
              onClick={() => setActivePage('batch_expiry')}
            />
            <KpiCard
              label="Supplier Payables"
              value={`$${kpis.supplierPayables.toFixed(2)}`}
              subtext="Manufacturer balances"
              tone="error"
              icon={<Truck className="h-4 w-4" />}
              onClick={() => setActivePage('finance')}
            />
          </div>

          {/* Finance Overview (Dedicated 100% Full-Width Row) */}
          <div className="w-full">
            <FinanceOverviewCard
              tenantScope="pharmaceutical"
              liveSalesTotal={liveSalesTotal}
              liveExpensesTotal={liveExpensesTotal}
              onViewFinance={() => setActivePage('finance')}
            />
          </div>

          {/* Supply & Invoice Pipeline (Full Width) */}
          <PipelineCard
            title="Supply &amp; Invoice Pipeline"
            actionLabel="Open Sales &amp; POS"
            onAction={() => setActivePage('sales')}
            stages={[
              {
                id: 'low_stock',
                title: 'Low Stock SKUs',
                countLabel: `${kpis.lowStockProducts.length} SKUs`,
                metricLabel: 'Restock PO',
                color: '#D97706',
                items: kpis.lowStockProducts.map((p) => ({
                  id: p.id,
                  name: p.name,
                  value: `${p.stockQty} ${p.unit}`,
                  initial: p.name[0],
                  onClick: () => setActivePage('inventory'),
                })),
              },
              {
                id: 'expiry',
                title: 'Expiry Watch',
                countLabel: `${kpis.nearExpiryBatches.length} Batches`,
                metricLabel: 'FEFO Check',
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
                id: 'pending',
                title: 'Pending Credit',
                countLabel: `${
                  pharmaSales.filter((s) => s.paymentStatus === 'Pending').length
                } Open`,
                metricLabel: 'Receivables',
                color: '#F05D21',
                items: pharmaSales
                  .filter((s) => s.paymentStatus === 'Pending')
                  .map((s) => ({
                    id: s.id,
                    name: s.customerName,
                    value: `$${s.total.toFixed(2)}`,
                    initial: s.customerName[0],
                    onClick: () => setActivePage('sales'),
                  })),
              },
              {
                id: 'partial',
                title: 'Partial Settlement',
                countLabel: `${
                  pharmaSales.filter((s) => s.paymentStatus === 'Partial').length
                } Invoices`,
                metricLabel: 'In Collection',
                color: '#396BA4',
                items: pharmaSales
                  .filter((s) => s.paymentStatus === 'Partial')
                  .map((s) => ({
                    id: s.id,
                    name: s.customerName,
                    value: `$${s.total.toFixed(2)}`,
                    initial: s.customerName[0],
                    onClick: () => setActivePage('sales'),
                  })),
              },
              {
                id: 'paid',
                title: 'Paid Dispatches',
                countLabel: `${
                  pharmaSales.filter((s) => s.paymentStatus === 'Paid').length
                } Settled`,
                metricLabel: `$${pharmaSales
                  .filter((s) => s.paymentStatus === 'Paid')
                  .reduce((a, b) => a + b.total, 0)
                  .toFixed(0)}`,
                color: '#16A34A',
                items: pharmaSales
                  .filter((s) => s.paymentStatus === 'Paid')
                  .slice(0, 3)
                  .map((s) => ({
                    id: s.id,
                    name: s.customerName,
                    value: `$${s.total.toFixed(2)}`,
                    initial: s.customerName[0],
                    onClick: () => setActivePage('sales'),
                  })),
                moreCount: Math.max(
                  0,
                  pharmaSales.filter((s) => s.paymentStatus === 'Paid').length - 3
                ),
              },
            ]}
          />

          {/* 3-Column Row */}
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">
                  Revenue &amp; Receivables
                </h2>
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
                centerLabel="Monthly B2B"
                formatValue={(v) => `$${v.toFixed(0)}`}
                items={[
                  {
                    label: 'Collected Sales',
                    value: pharmaSales
                      .filter((s) => s.paymentStatus === 'Paid')
                      .reduce((a, b) => a + b.total, 0),
                    color: '#16A34A',
                  },
                  {
                    label: 'Client Receivables',
                    value: kpis.outstandingReceivables,
                    color: '#F05D21',
                  },
                  {
                    label: 'Supplier Payables',
                    value: kpis.supplierPayables,
                    color: '#1E396A',
                  },
                ]}
              />
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Tracked Bulk Units</span>
                <span className="font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
                  {pharmaProducts.reduce((a, b) => a + b.stockQty, 0)} Units
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <LeaderboardCard
                title="Top B2B Clients"
                actionLabel="View All"
                onAction={() => setActivePage('customers')}
                rows={[...pharmaCustomers]
                  .sort((a, b) => b.totalPurchases - a.totalPurchases)
                  .slice(0, 5)
                  .map((c, idx) => {
                    const maxBuy = Math.max(
                      1,
                      ...pharmaCustomers.map((x) => x.totalPurchases)
                    );
                    return {
                      id: c.id,
                      name: c.name,
                      valueText: `$${c.totalPurchases.toFixed(0)}`,
                      percent: Math.round((c.totalPurchases / maxBuy) * 100),
                      color: idx === 0 ? '#F05D21' : '#396BA4',
                    };
                  })}
              />
            </div>

            <div className="lg:col-span-4">
              <RemindersCard
                title="Inventory &amp; Expiry Alerts"
                actionLabel="View All"
                onAction={() => setActivePage('batch_expiry')}
                items={[
                  ...kpis.lowStockProducts.slice(0, 2).map((p) => ({
                    id: p.id,
                    timeLabel: `${p.stockQty} left`,
                    name: p.name,
                    detail: `Reorder min: ${p.minStock} ${p.unit}`,
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

          {/* Recently Actions (Pharmaceutical Tenant Isolated) */}
          <RecentlyActionsCard
            title="Recently Actions"
            subtitle="Latest pharmaceutical sales, warehouse inventory, purchasing, and expense activities"
            activities={pharmaActivities}
            maxItems={6}
          />

        </div>
      )}

      {activePage === 'products' && <ProductsView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'inventory' && <InventoryView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'batch_expiry' && <BatchExpiryView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'sales' && (
        <PharmaceuticalSalesView onToast={showToast} onOpenReports={() => setActivePage('reports')} />
      )}
      {activePage === 'customers' && <CustomersView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'suppliers' && <SuppliersView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'purchases' && <PurchasesView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'finance' && <FinanceView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'expenses' && <ExpensesView tenantScope="pharmaceutical" onToast={showToast} />}
      {activePage === 'reports' && <ReportsView tenantScope="pharmaceutical" onToast={showToast} />}

      {activePage === 'notifications' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">
              Pharmaceutical Notifications
            </h2>
            <button
              type="button"
              onClick={() => markAllNotificationsRead('pharmaceutical_admin')}
              className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pharmaNotifications.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 flex items-start justify-between gap-4 ${
                  n.read ? 'bg-white dark:bg-[#111B2E]' : 'bg-[#F4F6F9]/60 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                    {n.date}
                  </p>
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
          <h2 className="text-base font-bold text-[#1E396A] dark:text-white">
            Pharmaceutical Tenant Settings
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pharmaceutical Company</p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">
                Benaadir Pharmaceutical Supply Ltd
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                TEN-PM-002 · Mogadishu
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pharmaceutical Administrator
              </p>
              <p className="font-semibold text-[#1E396A] dark:text-white mt-1">
                Abdirahman Yusuf Shire
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                ops@benaadirpharma.so
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Restore Initial Sample Data
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reset all pharmaceutical invoices, warehouse stock, purchases, and receivables to baseline data.
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
