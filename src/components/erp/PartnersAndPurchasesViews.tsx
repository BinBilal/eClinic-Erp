import React, { useMemo, useState } from 'react';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { ColumnDef, DataTable } from '../ui/DataTable';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { Modal } from '../ui/Modal';
import { StatusLabel } from '../ui/StatusLabel';
import { useDemoStore } from '../../store/demoStore';
import {
  CustomerRecord,
  PurchaseItem,
  PurchaseRecord,
  SupplierRecord,
  TenantScope,
} from '../../types/erp';

interface ScopeProps {
  tenantScope: TenantScope;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CustomersView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, addCustomer, updateCustomer, deleteCustomer } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRecord | null>(null);
  const [viewing, setViewing] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);

  const scopedCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === tenantScope),
    [state.customers, tenantScope]
  );

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: (tenantScope === 'pharmacy' ? 'Individual' : 'Pharmacy') as CustomerRecord['customerType'],
    balanceReceivable: '0',
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      customerType: tenantScope === 'pharmacy' ? 'Individual' : 'Pharmacy',
      balanceReceivable: '0',
    });
    setModalOpen(true);
  };

  const openEdit = (c: CustomerRecord) => {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      customerType: c.customerType,
      balanceReceivable: String(c.balanceReceivable),
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateCustomer(editing.id, {
        ...form,
        balanceReceivable: Number(form.balanceReceivable) || 0,
      });
      onToast(`Updated customer ${form.name}.`);
    } else {
      addCustomer({
        ...form,
        balanceReceivable: Number(form.balanceReceivable) || 0,
        tenantScope,
      });
      onToast(`Added customer ${form.name}.`);
    }
    setModalOpen(false);
  };

  const columns: ColumnDef<CustomerRecord>[] = [
    {
      key: 'name',
      header: tenantScope === 'pharmacy' ? 'Customer Name' : 'Business Client',
      render: (c) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.address}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (c) => <span className="text-xs text-slate-700 dark:text-slate-300">{c.customerType}</span>,
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (c) => (
        <div className="text-xs">
          <p className="text-slate-800 dark:text-slate-200">{c.phone}</p>
          <p className="text-slate-500 dark:text-slate-400">{c.email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Purchases',
      align: 'right',
      render: (c) => (
        <span className="text-xs font-semibold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${c.totalPurchases.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'rec',
      header: 'Receivable Balance',
      align: 'right',
      render: (c) => (
        <span
          className={`text-xs font-semibold tabular-nums ${
            c.balanceReceivable > 0
              ? 'text-[#D97706] dark:text-amber-400'
              : 'text-[#16A34A] dark:text-emerald-400'
          }`}
        >
          ${c.balanceReceivable.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewing(c)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View history"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(c)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit customer"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCustomer(c)}
            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="Delete customer"
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {tenantScope === 'pharmacy'
            ? 'Manage retail customers, partner clinics, and transaction history.'
            : 'Manage wholesale B2B clients (hospitals, clinics, pharmacies) and credit receivables.'}
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <DataTable
        data={scopedCustomers}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search customer name, phone, email..."
        searchFilter={(c, q) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
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
              disabled={!form.name.trim()}
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Customer
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full / Business Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Type</label>
              <select
                value={form.customerType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customerType: e.target.value as CustomerRecord['customerType'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Individual">Individual</option>
                <option value="Clinic">Clinic</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Receivable Balance ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.balanceReceivable}
              onChange={(e) => setForm({ ...form, balanceReceivable: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name || 'Customer Profile'}
        subtitle={viewing ? `${viewing.customerType} · ${viewing.phone}` : ''}
      >
        {viewing && (
          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Total Purchases</p>
                <p className="text-base font-bold text-[#1E396A] dark:text-sky-300 tabular-nums mt-0.5">
                  ${viewing.totalPurchases.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Receivable Balance</p>
                <p className="text-base font-bold text-[#D97706] dark:text-amber-400 tabular-nums mt-0.5">
                  ${viewing.balanceReceivable.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Last Transaction</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                  {viewing.lastPurchaseAt}
                </p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#1E396A] dark:text-white mb-2">Recent Invoices</p>
              <div className="space-y-1.5">
                {state.sales
                  .filter((s) => s.customerId === viewing.id)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-mono font-semibold text-[#1E396A] dark:text-sky-300">{s.invoiceNo}</span>
                      <span className="tabular-nums dark:text-slate-300">{s.date}</span>
                      <span className="font-semibold tabular-nums dark:text-white">${s.total.toFixed(2)}</span>
                      <StatusLabel label={s.paymentStatus} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <DeleteConfirmModal
        open={deletingCustomer !== null}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={() => {
          if (!deletingCustomer) return;
          const res = deleteCustomer(deletingCustomer.id);
          onToast(res.message, res.ok ? 'success' : 'error');
        }}
        isSoftDelete
        recordType="customer"
        recordLabel={deletingCustomer ? `${deletingCustomer.name} (${deletingCustomer.phone})` : ''}
        warningMessage="Deleting this customer archives their profile from the active customer directory while preserving existing historical invoice records."
      />
    </div>
  );
};

export const SuppliersView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, addSupplier, updateSupplier, deleteSupplier } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);
  const [viewing, setViewing] = useState<SupplierRecord | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierRecord | null>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    balancePayable: '0',
  });

  const openAddSupplier = () => {
    setEditingSupplier(null);
    setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', balancePayable: '0' });
    setModalOpen(true);
  };

  const openEditSupplier = (s: SupplierRecord) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      balancePayable: String(s.balancePayable),
    });
    setModalOpen(true);
  };

  const scopedSuppliers = useMemo(
    () => state.suppliers.filter((s) => s.tenantScope === tenantScope),
    [state.suppliers, tenantScope]
  );

  const columns: ColumnDef<SupplierRecord>[] = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{s.address}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Person',
      render: (s) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800 dark:text-slate-200">{s.contactPerson}</p>
          <p className="text-slate-500 dark:text-slate-400">{s.phone}</p>
        </div>
      ),
    },
    {
      key: 'supplied',
      header: 'Total Supplied',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-semibold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${s.totalSupplied.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'payable',
      header: 'Balance Payable',
      align: 'right',
      render: (s) => (
        <span
          className={`text-xs font-semibold tabular-nums ${
            s.balancePayable > 0
              ? 'text-[#DC2626] dark:text-red-400'
              : 'text-[#16A34A] dark:text-emerald-400'
          }`}
        >
          ${s.balancePayable.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewing(s)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View supplier details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEditSupplier(s)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit supplier"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingSupplier(s)}
            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="Delete supplier"
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage pharmaceutical suppliers, contact details, payable balances, and supply history.
        </p>
        <button
          type="button"
          onClick={openAddSupplier}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      <DataTable
        data={scopedSuppliers}
        columns={columns}
        keyExtractor={(s) => s.id}
        searchPlaceholder="Search supplier, contact person, phone..."
        searchFilter={(s, q) =>
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q)
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
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
              disabled={!form.name.trim()}
              onClick={() => {
                if (editingSupplier) {
                  updateSupplier(editingSupplier.id, {
                    name: form.name.trim(),
                    contactPerson: form.contactPerson.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    address: form.address.trim(),
                    balancePayable: Math.max(0, Number(form.balancePayable) || 0),
                  });
                  onToast(`Updated supplier ${form.name}.`);
                } else {
                  addSupplier({
                    name: form.name.trim(),
                    contactPerson: form.contactPerson.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    address: form.address.trim(),
                    balancePayable: Math.max(0, Number(form.balancePayable) || 0),
                    tenantScope,
                  });
                  onToast(`Added supplier ${form.name}.`);
                }
                setModalOpen(false);
                setForm({
                  name: '',
                  contactPerson: '',
                  phone: '',
                  email: '',
                  address: '',
                  balancePayable: '0',
                });
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              {editingSupplier ? 'Save Changes' : 'Save Supplier'}
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier Company Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Warehouse / Office Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Balance Payable ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.balancePayable}
              onChange={(e) => setForm({ ...form, balancePayable: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name || 'Supplier Details'}
        subtitle={viewing ? `${viewing.contactPerson} · ${viewing.phone}` : ''}
      >
        {viewing && (
          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Total Supplied</p>
                <p className="text-base font-bold text-[#1E396A] dark:text-sky-300 tabular-nums mt-0.5">
                  ${viewing.totalSupplied.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Payable Balance</p>
                <p className="text-base font-bold text-[#DC2626] dark:text-red-400 tabular-nums mt-0.5">
                  ${viewing.balancePayable.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Last Supply</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                  {viewing.lastSupplyAt}
                </p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#1E396A] dark:text-white mb-2">Purchase Order History</p>
              <div className="space-y-1.5">
                {state.purchases
                  .filter((p) => p.supplierId === viewing.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-mono font-semibold text-[#1E396A] dark:text-sky-300">{p.poNumber}</span>
                      <span className="tabular-nums dark:text-slate-300">{p.date}</span>
                      <span className="font-semibold tabular-nums dark:text-white">${p.total.toFixed(2)}</span>
                      <StatusLabel label={p.paymentStatus} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <DeleteConfirmModal
        open={deletingSupplier !== null}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={() => {
          if (!deletingSupplier) return;
          const res = deleteSupplier(deletingSupplier.id);
          onToast(res.message, res.ok ? 'success' : 'error');
        }}
        isSoftDelete
        recordType="supplier"
        recordLabel={deletingSupplier ? `${deletingSupplier.name} (${deletingSupplier.contactPerson})` : ''}
        warningMessage="Deleting this supplier archives them from the active directory while preserving historical purchase orders."
      />
    </div>
  );
};

export const PurchasesView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, recordPurchase, updatePurchase, deletePurchase } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseRecord | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<PurchaseRecord | null>(null);
  const [poEditForm, setPoEditForm] = useState({
    supplierId: '',
    date: '',
    paymentStatus: 'Paid' as PurchaseRecord['paymentStatus'],
    goodsReceived: true,
  });

  const scopedSuppliers = useMemo(
    () => state.suppliers.filter((s) => s.tenantScope === tenantScope),
    [state.suppliers, tenantScope]
  );
  const scopedProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === tenantScope),
    [state.products, tenantScope]
  );
  const scopedPurchases = useMemo(
    () => state.purchases.filter((p) => p.tenantScope === tenantScope),
    [state.purchases, tenantScope]
  );

  const [supplierId, setSupplierId] = useState(scopedSuppliers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Paid');
  const [goodsReceived, setGoodsReceived] = useState(true);
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Draft item picker
  const [draftProductId, setDraftProductId] = useState(scopedProducts[0]?.id || '');
  const [draftBatch, setDraftBatch] = useState('NEW-2611');
  const [draftExpiry, setDraftExpiry] = useState('2028-06-30');
  const [draftQty, setDraftQty] = useState('20');

  const addDraftItem = () => {
    const prod = scopedProducts.find((p) => p.id === draftProductId);
    const qty = Number(draftQty) || 0;
    if (!prod || qty <= 0) return;
    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        batchNumber: draftBatch.trim() || `BAT-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: draftExpiry,
        qty,
        unitCost: prod.costPrice,
        total: qty * prod.costPrice,
      },
    ]);
  };

  const handleRecordPurchase = () => {
    if (!supplierId || items.length === 0) return;
    const po = recordPurchase({
      supplierId,
      items,
      paymentStatus,
      goodsReceived,
      tenantScope,
    });
    onToast(
      `Recorded purchase ${po.poNumber} ($${po.total.toFixed(2)}). ${
        goodsReceived ? 'Inventory and batch records updated.' : ''
      }`
    );
    setModalOpen(false);
    setItems([]);
  };

  const columns: ColumnDef<PurchaseRecord>[] = [
    {
      key: 'po',
      header: 'PO #',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {p.poNumber}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (p) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{p.date}</span>
      ),
    },
    {
      key: 'sup',
      header: 'Supplier',
      render: (p) => <span className="font-semibold text-slate-900 dark:text-white">{p.supplierName}</span>,
    },
    {
      key: 'items',
      header: 'Line Items',
      render: (p) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {p.items.map((i) => `${i.productName} (${i.qty})`).join(', ')}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total Cost',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-semibold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${p.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'rec',
      header: 'Goods Received',
      render: (p) => <StatusLabel label={p.goodsReceived ? 'Received' : 'Pending'} />,
    },
    {
      key: 'pay',
      header: 'Payment Status',
      render: (p) => <StatusLabel label={p.paymentStatus} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingPurchase(p)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View purchase order"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPurchase(p);
              setPoEditForm({
                supplierId: p.supplierId,
                date: p.date,
                paymentStatus: p.paymentStatus,
                goodsReceived: p.goodsReceived,
              });
            }}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit purchase order"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingPurchase(p)}
            className="p-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            title="Archive purchase order"
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Record supplier purchase orders, receive batches into inventory, and track payable balances.
        </p>
        <button
          type="button"
          onClick={() => {
            setSupplierId(scopedSuppliers[0]?.id || '');
            setDraftProductId(scopedProducts[0]?.id || '');
            setItems([]);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Record Purchase
        </button>
      </div>

      <DataTable
        data={scopedPurchases}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search PO #, supplier, or product..."
        searchFilter={(p, q) =>
          p.poNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.items.some((i) => i.productName.toLowerCase().includes(q))
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record New Purchase Order"
        subtitle="Received items automatically increment stock and register batch expiry records."
        maxWidthClass="max-w-3xl"
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
              disabled={!supplierId || items.length === 0}
              onClick={handleRecordPurchase}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Confirm &amp; Save Purchase
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                {scopedSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Partial' | 'Unpaid')}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={goodsReceived}
                  onChange={(e) => setGoodsReceived(e.target.checked)}
                />
                Goods Received into Stock
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-xs font-bold text-[#1E396A] dark:text-white">Add Purchase Line Item</p>
            <div className="grid sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Product</label>
                <select
                  value={draftProductId}
                  onChange={(e) => setDraftProductId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#111B2E]"
                >
                  {scopedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.costPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Batch #</label>
                <input
                  type="text"
                  value={draftBatch}
                  onChange={(e) => setDraftBatch(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-[#111B2E]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={draftExpiry}
                  onChange={(e) => setDraftExpiry(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#111B2E]"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Qty</label>
                <input
                  type="number"
                  value={draftQty}
                  onChange={(e) => setDraftQty(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums bg-white dark:bg-[#111B2E]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={addDraftItem}
                  className="w-full py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold hover:bg-[#162b52]"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Batch / Exp</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">
                        {item.batchNumber} · {item.expiryDate}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-[#DC2626] dark:text-red-400 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2.5 bg-[#F4F6F9] dark:bg-[#0D1628] border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-[#1E396A] dark:text-white">
                <span>Total Purchase Amount</span>
                <span className="tabular-nums">
                  ${items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* View Purchase Order Modal */}
      <Modal
        open={viewingPurchase !== null}
        onClose={() => setViewingPurchase(null)}
        title={`Purchase Order ${viewingPurchase?.poNumber || ''}`}
        subtitle={viewingPurchase ? `${viewingPurchase.supplierName} · ${viewingPurchase.date}` : ''}
      >
        {viewingPurchase && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Supplier</p>
                <p className="font-bold text-[#1E396A] dark:text-white mt-0.5">{viewingPurchase.supplierName}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusLabel label={viewingPurchase.goodsReceived ? 'Received' : 'Pending'} />
                <StatusLabel label={viewingPurchase.paymentStatus} />
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Batch / Expiry</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                  {viewingPurchase.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">
                        {item.batchNumber} · {item.expiryDate}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1E396A] dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total Purchase Cost</span>
              <span className="tabular-nums">${viewingPurchase.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Purchase Order Modal */}
      <Modal
        open={editingPurchase !== null}
        onClose={() => setEditingPurchase(null)}
        title={`Edit Purchase Order ${editingPurchase?.poNumber || ''}`}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingPurchase(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingPurchase) return;
                updatePurchase(editingPurchase.id, {
                  supplierId: poEditForm.supplierId,
                  date: poEditForm.date,
                  paymentStatus: poEditForm.paymentStatus,
                  goodsReceived: poEditForm.goodsReceived,
                });
                onToast(`Updated purchase order ${editingPurchase.poNumber}.`);
                setEditingPurchase(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
            <select
              value={poEditForm.supplierId}
              onChange={(e) => setPoEditForm({ ...poEditForm, supplierId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              {scopedSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={poEditForm.date}
                onChange={(e) => setPoEditForm({ ...poEditForm, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={poEditForm.paymentStatus}
                onChange={(e) =>
                  setPoEditForm({
                    ...poEditForm,
                    paymentStatus: e.target.value as PurchaseRecord['paymentStatus'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={poEditForm.goodsReceived}
              onChange={(e) => setPoEditForm({ ...poEditForm, goodsReceived: e.target.checked })}
            />
            Goods Received into Stock
          </label>
        </div>
      </Modal>

      <DeleteConfirmModal
        open={deletingPurchase !== null}
        onClose={() => setDeletingPurchase(null)}
        onConfirm={() => {
          if (!deletingPurchase) return;
          const res = deletePurchase(deletingPurchase.id);
          onToast(res.message, res.ok ? 'success' : 'error');
        }}
        isSoftDelete
        recordType="purchase order"
        recordLabel={
          deletingPurchase
            ? `${deletingPurchase.poNumber} — ${deletingPurchase.supplierName} ($${deletingPurchase.total.toFixed(2)})`
            : ''
        }
        warningMessage="Archiving this purchase order reverses its supplier payable impact and deducts received stock quantities if goods were already stocked."
      />
    </div>
  );
};
