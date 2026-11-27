import React, { useMemo, useState } from 'react';
import { Download, Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { DistributionBreakdown, SimpleBarChart } from '../ui/Charts';
import { ColumnDef, DataTable } from '../ui/DataTable';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { KpiCard } from '../ui/KpiCard';
import { Modal } from '../ui/Modal';
import { StatusLabel } from '../ui/StatusLabel';
import { TODAY_ISO } from '../../data/seedData';
import { getBatchStatus, useDemoStore } from '../../store/demoStore';
import {
  ExpenseRecord,
  PaymentMethod,
  PaymentStatus,
  PurchaseRecord,
  TenantScope,
} from '../../types/erp';

interface ScopeProps {
  tenantScope: TenantScope;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const FinanceView: React.FC<{
  tenantScope: TenantScope;
  onToast?: (msg: string, type?: 'success' | 'error') => void;
}> = ({ tenantScope, onToast }) => {
  const {
    state,
    updateSale,
    deleteSale,
    updatePurchase,
    deletePurchase,
    updateExpense,
    deleteExpense,
  } = useDemoStore();

  type LedgerEntry = {
    id: string;
    kind: 'sale' | 'purchase' | 'expense';
    date: string;
    ref: string;
    type: string;
    party: string;
    method: string;
    amount: number;
    status: string;
  };

  const [viewingEntry, setViewingEntry] = useState<LedgerEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LedgerEntry | null>(null);
  const [ledgerForm, setLedgerForm] = useState({
    date: '',
    status: 'Paid',
    method: 'Cash',
    category: '',
    description: '',
    amount: '0',
  });

  const scopedSales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === tenantScope),
    [state.sales, tenantScope]
  );
  const scopedPurchases = useMemo(
    () => state.purchases.filter((p) => p.tenantScope === tenantScope),
    [state.purchases, tenantScope]
  );
  const scopedExpenses = useMemo(
    () => state.expenses.filter((e) => e.tenantScope === tenantScope),
    [state.expenses, tenantScope]
  );
  const scopedCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === tenantScope),
    [state.customers, tenantScope]
  );
  const scopedSuppliers = useMemo(
    () => state.suppliers.filter((s) => s.tenantScope === tenantScope),
    [state.suppliers, tenantScope]
  );

  const totalSalesRev = scopedSales.reduce((sum, s) => sum + s.total, 0);
  const totalReceivables = scopedCustomers.reduce((sum, c) => sum + c.balanceReceivable, 0);
  const totalPayables = scopedSuppliers.reduce((sum, s) => sum + s.balancePayable, 0);
  const totalExpenses = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const ledger = useMemo<LedgerEntry[]>(() => {
    const entries: LedgerEntry[] = [
      ...scopedSales.map((s) => ({
        id: s.id,
        kind: 'sale' as const,
        date: s.date,
        ref: s.invoiceNo,
        type: 'Sales Revenue',
        party: s.customerName,
        method: s.paymentMethod,
        amount: s.total,
        status: s.paymentStatus,
      })),
      ...scopedPurchases.map((p) => ({
        id: p.id,
        kind: 'purchase' as const,
        date: p.date,
        ref: p.poNumber,
        type: 'Supplier Purchase',
        party: p.supplierName,
        method: 'Account Payable',
        amount: -p.total,
        status: p.paymentStatus,
      })),
      ...scopedExpenses.map((e) => ({
        id: e.id,
        kind: 'expense' as const,
        date: e.date,
        ref: e.reference,
        type: 'Operating Expense',
        party: e.category,
        method: e.paymentMethod,
        amount: -e.amount,
        status: 'Paid',
      })),
    ];
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [scopedSales, scopedPurchases, scopedExpenses]);

  const cashflowChart = [
    { label: 'Jul', value: Math.round(totalSalesRev * 0.65), secondaryValue: Math.round(totalExpenses * 0.8) },
    { label: 'Aug', value: Math.round(totalSalesRev * 0.72), secondaryValue: Math.round(totalExpenses * 0.9) },
    { label: 'Sep', value: Math.round(totalSalesRev * 0.81), secondaryValue: Math.round(totalExpenses * 0.85) },
    { label: 'Oct', value: Math.round(totalSalesRev * 0.94), secondaryValue: Math.round(totalExpenses * 0.95) },
    { label: 'Nov', value: Math.round(totalSalesRev), secondaryValue: Math.round(totalExpenses) },
  ];

  const openEditLedger = (r: LedgerEntry) => {
    setEditingEntry(r);
    if (r.kind === 'expense') {
      const exp = scopedExpenses.find((e) => e.id === r.id);
      setLedgerForm({
        date: r.date,
        status: 'Paid',
        method: r.method,
        category: exp?.category || r.party,
        description: exp?.description || '',
        amount: String(exp?.amount ?? Math.abs(r.amount)),
      });
    } else {
      setLedgerForm({
        date: r.date,
        status: r.status,
        method: r.method,
        category: '',
        description: '',
        amount: String(Math.abs(r.amount)),
      });
    }
  };

  const columns: ColumnDef<LedgerEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{r.date}</span>
      ),
    },
    {
      key: 'ref',
      header: 'Reference',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {r.ref}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (r) => <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{r.type}</span>,
    },
    {
      key: 'party',
      header: 'Counterparty',
      render: (r) => <span className="text-xs text-slate-600 dark:text-slate-300">{r.party}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (r) => <span className="text-xs text-slate-600 dark:text-slate-300">{r.method}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => (
        <span
          className={`text-xs font-bold tabular-nums ${
            r.amount >= 0
              ? 'text-[#16A34A] dark:text-emerald-400'
              : 'text-[#DC2626] dark:text-red-400'
          }`}
        >
          {r.amount >= 0 ? `+$${r.amount.toFixed(2)}` : `-$${Math.abs(r.amount).toFixed(2)}`}
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
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingEntry(r)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View entry"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEditLedger(r)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit entry"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingEntry(r)}
            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="Archive entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Recorded Sales Revenue"
          value={`$${totalSalesRev.toFixed(2)}`}
          tone="navy"
        />
        <KpiCard
          label="Customer Receivables"
          value={`$${totalReceivables.toFixed(2)}`}
          tone="warning"
        />
        <KpiCard
          label="Supplier Payables"
          value={`$${totalPayables.toFixed(2)}`}
          tone="error"
        />
        <KpiCard
          label="Operating Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          tone="blue"
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1E396A] dark:text-white mb-1">Revenue vs Operating Expenses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">5-month financial trend (USD)</p>
          <SimpleBarChart
            data={cashflowChart}
            primaryColor="#1E396A"
            secondaryColor="#F05D21"
            primaryLabel="Revenue"
            secondaryLabel="Expenses"
            formatValue={(v) => `$${v}`}
          />
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1E396A] dark:text-white mb-1">Payment Channel Mix</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Sales distribution by payment method</p>
          <DistributionBreakdown
            formatValue={(v) => `$${v.toFixed(2)}`}
            items={[
              {
                label: 'Bank Transfer',
                value: scopedSales
                  .filter((s) => s.paymentMethod === 'Bank Transfer')
                  .reduce((a, b) => a + b.total, 0),
                color: '#1E396A',
              },
              {
                label: 'EVC Plus / Zaad',
                value: scopedSales
                  .filter((s) => s.paymentMethod === 'EVC Plus' || s.paymentMethod === 'Zaad')
                  .reduce((a, b) => a + b.total, 0),
                color: '#F05D21',
              },
              {
                label: 'Cash',
                value: scopedSales
                  .filter((s) => s.paymentMethod === 'Cash')
                  .reduce((a, b) => a + b.total, 0),
                color: '#16A34A',
              },
              {
                label: 'Credit Terms',
                value: scopedSales
                  .filter((s) => s.paymentMethod === 'Credit')
                  .reduce((a, b) => a + b.total, 0),
                color: '#396BA4',
              },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={ledger}
        columns={columns}
        keyExtractor={(r) => `${r.type}-${r.id}`}
        searchPlaceholder="Search transaction reference or party..."
        searchFilter={(r, q) =>
          r.ref.toLowerCase().includes(q) ||
          r.party.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
        }
      />

      {/* View Ledger Entry Modal */}
      <Modal
        open={viewingEntry !== null}
        onClose={() => setViewingEntry(null)}
        title={`Financial Transaction ${viewingEntry?.ref || ''}`}
        subtitle={viewingEntry ? `${viewingEntry.type} · ${viewingEntry.date}` : ''}
        maxWidthClass="max-w-lg"
      >
        {viewingEntry && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Counterparty / Category</p>
                <p className="font-bold text-[#1E396A] dark:text-white mt-0.5">{viewingEntry.party}</p>
              </div>
              <StatusLabel label={viewingEntry.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <p className="text-slate-500 dark:text-slate-400">Payment Method</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingEntry.method}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <p className="text-slate-500 dark:text-slate-400">Net Impact</p>
                <p
                  className={`font-bold text-sm tabular-nums mt-0.5 ${
                    viewingEntry.amount >= 0
                      ? 'text-[#16A34A] dark:text-emerald-400'
                      : 'text-[#DC2626] dark:text-red-400'
                  }`}
                >
                  {viewingEntry.amount >= 0
                    ? `+$${viewingEntry.amount.toFixed(2)}`
                    : `-$${Math.abs(viewingEntry.amount).toFixed(2)}`}
                </p>
              </div>
            </div>
            {viewingEntry.kind === 'expense' && (
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <p className="text-slate-500 dark:text-slate-400">Expense Description</p>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                  {scopedExpenses.find((e) => e.id === viewingEntry.id)?.description || '—'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Ledger Entry Modal */}
      <Modal
        open={editingEntry !== null}
        onClose={() => setEditingEntry(null)}
        title={`Edit ${editingEntry?.type || 'Transaction'} (${editingEntry?.ref || ''})`}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingEntry(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingEntry) return;
                if (editingEntry.kind === 'sale') {
                  updateSale(editingEntry.id, {
                    date: ledgerForm.date,
                    paymentStatus: ledgerForm.status as PaymentStatus,
                    paymentMethod: ledgerForm.method as PaymentMethod,
                  });
                } else if (editingEntry.kind === 'purchase') {
                  updatePurchase(editingEntry.id, {
                    date: ledgerForm.date,
                    paymentStatus: ledgerForm.status as PurchaseRecord['paymentStatus'],
                  });
                } else {
                  updateExpense(editingEntry.id, {
                    date: ledgerForm.date,
                    category: ledgerForm.category,
                    description: ledgerForm.description,
                    paymentMethod: ledgerForm.method,
                    amount: Math.max(0, Number(ledgerForm.amount) || 0),
                  });
                }
                onToast?.(`Updated financial transaction ${editingEntry.ref}.`);
                setEditingEntry(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editingEntry && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={ledgerForm.date}
                onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            {editingEntry.kind === 'sale' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={ledgerForm.method}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, method: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="EVC Plus">EVC Plus</option>
                    <option value="Zaad">Zaad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={ledgerForm.status}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </>
            )}

            {editingEntry.kind === 'purchase' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={ledgerForm.status}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            )}

            {editingEntry.kind === 'expense' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={ledgerForm.category}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ledgerForm.amount}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={ledgerForm.method}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, method: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
                    >
                      <option value="Cash">Cash</option>
                      <option value="EVC Plus">EVC Plus</option>
                      <option value="Zaad">Zaad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={ledgerForm.description}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <DeleteConfirmModal
        open={deletingEntry !== null}
        onClose={() => setDeletingEntry(null)}
        onConfirm={() => {
          if (!deletingEntry) return;
          const res =
            deletingEntry.kind === 'sale'
              ? deleteSale(deletingEntry.id)
              : deletingEntry.kind === 'purchase'
              ? deletePurchase(deletingEntry.id)
              : deleteExpense(deletingEntry.id);
          onToast?.(res.message, res.ok ? 'success' : 'error');
        }}
        isSoftDelete
        recordType="financial ledger entry"
        recordLabel={
          deletingEntry
            ? `${deletingEntry.ref} — ${deletingEntry.party} ($${Math.abs(deletingEntry.amount).toFixed(2)})`
            : ''
        }
        warningMessage="Archiving this financial entry updates revenue, expense, and partner balance totals immediately while preserving an audit trail."
      />
    </div>
  );
};

export const ExpensesView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, addExpense, updateExpense, deleteExpense } = useDemoStore();
  const [catFilter, setCatFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRecord | null>(null);

  const scopedExpenses = useMemo(
    () => state.expenses.filter((e) => e.tenantScope === tenantScope),
    [state.expenses, tenantScope]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(scopedExpenses.map((e) => e.category)))],
    [scopedExpenses]
  );

  const filtered = useMemo(
    () => scopedExpenses.filter((e) => catFilter === 'All' || e.category === catFilter),
    [scopedExpenses, catFilter]
  );

  const [form, setForm] = useState({
    date: TODAY_ISO,
    category:
      tenantScope === 'pharmacy'
        ? 'Utilities & Cold Chain Power'
        : 'Fleet & Distribution Logistics',
    description: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
  });

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      key: 'ref',
      header: 'Ref #',
      render: (e) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {e.reference}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (e) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{e.date}</span>
      ),
    },
    {
      key: 'cat',
      header: 'Category',
      render: (e) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{e.category}</span>,
    },
    {
      key: 'desc',
      header: 'Description',
      render: (e) => <span className="text-xs text-slate-600 dark:text-slate-300">{e.description}</span>,
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (e) => <span className="text-xs text-slate-600 dark:text-slate-300">{e.paymentMethod}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (e) => (
        <span className="text-xs font-bold tabular-nums text-[#DC2626] dark:text-red-400">
          ${e.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (e) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingExpense(e)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View expense"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingExpense(e);
              setForm({
                date: e.date,
                category: e.category,
                description: e.description,
                amount: String(e.amount),
                paymentMethod: e.paymentMethod,
              });
              setModalOpen(true);
            }}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit expense"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingExpense(e)}
            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="Archive expense"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs dark:text-slate-300">
          Total Filtered Expenses:{' '}
          <span className="font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setForm({
              date: TODAY_ISO,
              category:
                tenantScope === 'pharmacy'
                  ? 'Utilities & Cold Chain Power'
                  : 'Fleet & Distribution Logistics',
              description: '',
              amount: '',
              paymentMethod: 'Bank Transfer',
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Record Expense
        </button>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(e) => e.id}
        searchPlaceholder="Search expense reference, category, description..."
        searchFilter={(e, q) =>
          e.reference.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        }
        toolbarExtra={
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Expense Categories' : c}
              </option>
            ))}
          </select>
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? `Edit Expense (${editingExpense.reference})` : 'Record Operating Expense'}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!form.description.trim() || !(Number(form.amount) > 0)}
              onClick={() => {
                if (editingExpense) {
                  updateExpense(editingExpense.id, {
                    date: form.date,
                    category: form.category.trim(),
                    description: form.description.trim(),
                    amount: Number(form.amount),
                    paymentMethod: form.paymentMethod,
                  });
                  onToast(`Updated expense ${editingExpense.reference}.`);
                } else {
                  addExpense({
                    date: form.date,
                    category: form.category,
                    description: form.description.trim(),
                    amount: Number(form.amount),
                    paymentMethod: form.paymentMethod,
                    reference: `EXP-${tenantScope === 'pharmacy' ? 'PH' : 'WH'}-${Math.floor(
                      1200 + Math.random() * 800
                    )}`,
                    tenantScope,
                  });
                  onToast(`Recorded expense ($${Number(form.amount).toFixed(2)}).`);
                }
                setModalOpen(false);
                setEditingExpense(null);
                setForm({ ...form, description: '', amount: '' });
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              {editingExpense ? 'Save Changes' : 'Save Expense'}
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              <option value="Cash">Cash</option>
              <option value="EVC Plus">EVC Plus</option>
              <option value="Zaad">Zaad</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={viewingExpense !== null}
        onClose={() => setViewingExpense(null)}
        title={`Expense ${viewingExpense?.reference || ''}`}
        subtitle={viewingExpense ? `${viewingExpense.category} · ${viewingExpense.date}` : ''}
        maxWidthClass="max-w-md"
      >
        {viewingExpense && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <p className="text-slate-500 dark:text-slate-400">Amount</p>
                <p className="font-bold text-base text-[#DC2626] dark:text-red-400 tabular-nums mt-0.5">
                  ${viewingExpense.amount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <p className="text-slate-500 dark:text-slate-400">Payment Method</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {viewingExpense.paymentMethod}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
              <p className="text-slate-500 dark:text-slate-400">Description</p>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5">{viewingExpense.description}</p>
            </div>
          </div>
        )}
      </Modal>

      <DeleteConfirmModal
        open={deletingExpense !== null}
        onClose={() => setDeletingExpense(null)}
        onConfirm={() => {
          if (!deletingExpense) return;
          const res = deleteExpense(deletingExpense.id);
          onToast(res.message, res.ok ? 'success' : 'error');
        }}
        isSoftDelete
        recordType="operating expense"
        recordLabel={
          deletingExpense
            ? `${deletingExpense.reference} — ${deletingExpense.category} ($${deletingExpense.amount.toFixed(2)})`
            : ''
        }
        warningMessage="Archiving this expense removes it from active operating totals and financial charts while preserving the audit log."
      />
    </div>
  );
};

export const ReportsView: React.FC<{
  tenantScope: TenantScope;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}> = ({
  tenantScope,
  onToast,
}) => {
  const { state } = useDemoStore();
  const pharmacyTabs = [
    { id: 'sales', label: 'Sales Reports' },
    { id: 'inventory', label: 'Inventory Reports' },
    { id: 'purchases', label: 'Purchase Reports' },
    { id: 'expenses', label: 'Expense Reports' },
    { id: 'financial', label: 'Financial Reports' },
    { id: 'laboratory', label: 'Laboratory Reports' },
  ];
  const pharmaceuticalTabs = [
    { id: 'sales', label: 'Sales Reports' },
    { id: 'inventory', label: 'Inventory Reports' },
    { id: 'purchases', label: 'Purchase Reports' },
    { id: 'customers', label: 'Customer Reports' },
    { id: 'financial', label: 'Financial Reports' },
    { id: 'expiry', label: 'Expiry Reports' },
  ];

  const tabs = tenantScope === 'pharmacy' ? pharmacyTabs : pharmaceuticalTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-26');

  const scopedSales = useMemo(
    () =>
      state.sales.filter(
        (s) => s.tenantScope === tenantScope && s.date >= startDate && s.date <= endDate
      ),
    [state.sales, tenantScope, startDate, endDate]
  );

  const scopedProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === tenantScope),
    [state.products, tenantScope]
  );

  const scopedPurchases = useMemo(
    () =>
      state.purchases.filter(
        (p) => p.tenantScope === tenantScope && p.date >= startDate && p.date <= endDate
      ),
    [state.purchases, tenantScope, startDate, endDate]
  );

  const scopedExpenses = useMemo(
    () =>
      state.expenses.filter(
        (e) => e.tenantScope === tenantScope && e.date >= startDate && e.date <= endDate
      ),
    [state.expenses, tenantScope, startDate, endDate]
  );

  const scopedCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === tenantScope),
    [state.customers, tenantScope]
  );

  const scopedBatches = useMemo(
    () => state.batches.filter((b) => b.tenantScope === tenantScope),
    [state.batches, tenantScope]
  );

  const exportCsv = () => {
    const csv = `eClinic ERP Report,${activeTab}\nScope,${tenantScope}\nFrom,${startDate}\nTo,${endDate}\nSales Count,${scopedSales.length}\nSales Revenue,${scopedSales.reduce((a, b) => a + b.total, 0).toFixed(2)}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenantScope}_${activeTab}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onToast(`Exported ${activeTab} CSV report.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#1E396A] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
          />
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#396BA4] hover:bg-[#2d588a] text-white text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Sales Report ({startDate} — {endDate})</h2>
            <span className="text-sm font-bold text-[#16A34A] dark:text-emerald-400 tabular-nums">
              Total: ${scopedSales.reduce((a, b) => a + b.total, 0).toFixed(2)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedSales.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-[#1E396A] dark:text-sky-300">{s.invoiceNo}</td>
                    <td className="px-4 py-3 tabular-nums">{s.date}</td>
                    <td className="px-4 py-3 font-medium">{s.customerName}</td>
                    <td className="px-4 py-3">{s.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">${s.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Inventory Valuation Report</h2>
            <span className="text-sm font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
              Cost Valuation: ${scopedProducts.reduce((a, p) => a + p.stockQty * p.costPrice, 0).toFixed(2)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-[#1E396A] dark:text-sky-300">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.stockQty} {p.unit}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      ${(p.stockQty * p.costPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Purchase Report</h2>
            <span className="text-sm font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
              Total: ${scopedPurchases.reduce((a, b) => a + b.total, 0).toFixed(2)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">PO #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedPurchases.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-[#1E396A] dark:text-sky-300">{p.poNumber}</td>
                    <td className="px-4 py-3 tabular-nums">{p.date}</td>
                    <td className="px-4 py-3 font-medium">{p.supplierName}</td>
                    <td className="px-4 py-3"><StatusLabel label={p.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">${p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Expense Summary Report</h2>
            <span className="text-sm font-bold text-[#DC2626] dark:text-red-400 tabular-nums">
              Total: ${scopedExpenses.reduce((a, b) => a + b.amount, 0).toFixed(2)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Ref #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedExpenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-mono text-[#1E396A] dark:text-sky-300">{e.reference}</td>
                    <td className="px-4 py-3 tabular-nums">{e.date}</td>
                    <td className="px-4 py-3 font-medium">{e.category}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{e.description}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'financial' && <FinanceView tenantScope={tenantScope} onToast={onToast} />}

      {activeTab === 'laboratory' && tenantScope === 'pharmacy' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Laboratory Diagnostics Summary</h2>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
              {state.labRequests.filter((r) => r.status === 'Answered').length} Answered / {state.labRequests.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Request #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Test Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">WhatsApp Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {state.labRequests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-[#1E396A] dark:text-sky-300">{r.requestNo}</td>
                    <td className="px-4 py-3 font-medium">{r.patientName}</td>
                    <td className="px-4 py-3">{r.testName}</td>
                    <td className="px-4 py-3 tabular-nums">{r.requestDate}</td>
                    <td className="px-4 py-3"><StatusLabel label={r.status} /></td>
                    <td className="px-4 py-3"><StatusLabel label={r.whatsappStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'customers' && tenantScope === 'pharmaceutical' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Pharmaceutical Customer Accounts Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Total Purchases</th>
                  <th className="px-4 py-3 text-right">Outstanding Receivable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="px-4 py-3">{c.customerType}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${c.totalPurchases.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#D97706] dark:text-amber-400">
                      ${c.balanceReceivable.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expiry' && tenantScope === 'pharmaceutical' && (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Warehouse Batch &amp; Expiry Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Batch #</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                {scopedBatches.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-[#1E396A] dark:text-sky-300">{b.batchNumber}</td>
                    <td className="px-4 py-3 font-medium">{b.productName}</td>
                    <td className="px-4 py-3 tabular-nums">{b.expiryDate}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{b.qty}</td>
                    <td className="px-4 py-3">
                      <StatusLabel label={getBatchStatus(b.expiryDate, state.systemConfig.expiryAlertDays)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
