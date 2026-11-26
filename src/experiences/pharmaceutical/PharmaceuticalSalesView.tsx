import React, { useMemo, useState } from 'react';
import { FileText, Plus, Printer, Trash2 } from 'lucide-react';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useDemoStore } from '../../store/demoStore';
import { PaymentMethod, PaymentStatus, SaleItem, SaleRecord } from '../../types/erp';

interface PharmaceuticalSalesViewProps {
  onToast: (msg: string) => void;
}

export const PharmaceuticalSalesView: React.FC<PharmaceuticalSalesViewProps> = ({ onToast }) => {
  const { state, completeSale } = useDemoStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<SaleRecord | null>(null);

  const pharmaSales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === 'pharmaceutical'),
    [state.sales]
  );
  const pharmaCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === 'pharmaceutical'),
    [state.customers]
  );
  const pharmaProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === 'pharmaceutical'),
    [state.products]
  );

  const [customerId, setCustomerId] = useState(pharmaCustomers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [items, setItems] = useState<SaleItem[]>([]);

  const [draftProductId, setDraftProductId] = useState(pharmaProducts[0]?.id || '');
  const [draftQty, setDraftQty] = useState('5');
  const [draftDiscount, setDraftDiscount] = useState('0');

  const addInvoiceLine = () => {
    const prod = pharmaProducts.find((p) => p.id === draftProductId);
    const qty = Number(draftQty) || 0;
    const disc = Number(draftDiscount) || 0;
    if (!prod || qty <= 0) return;
    if (qty > prod.stockQty) {
      onToast(`Only ${prod.stockQty} ${prod.unit} available in warehouse.`);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        qty,
        unitPrice: prod.sellPrice,
        discount: Math.min(qty * prod.sellPrice, disc),
        total: Math.max(0, qty * prod.sellPrice - disc),
      },
    ]);
    setDraftDiscount('0');
  };

  const handleCreateInvoice = () => {
    if (!customerId || items.length === 0) return;
    const inv = completeSale({
      customerId,
      items,
      paymentMethod,
      paymentStatus,
      tenantScope: 'pharmaceutical',
    });
    onToast(
      `Created pharmaceutical invoice ${inv.invoiceNo} ($${inv.total.toFixed(2)}). Stock & receivables updated.`
    );
    setCreateOpen(false);
    setItems([]);
    setViewingInvoice(inv);
  };

  const columns: ColumnDef<SaleRecord>[] = [
    {
      key: 'inv',
      header: 'Invoice #',
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {s.invoiceNo}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (s) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{s.date}</span>
      ),
    },
    {
      key: 'client',
      header: 'Business Customer',
      render: (s) => (
        <span className="font-semibold text-slate-900 dark:text-white">{s.customerName}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items Dispatched',
      render: (s) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {s.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (s) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">{s.paymentMethod}</span>
      ),
    },
    {
      key: 'total',
      header: 'Invoice Total',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-bold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${s.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (s) => <StatusLabel label={s.paymentStatus} />,
    },
    {
      key: 'view',
      header: 'Invoice',
      align: 'right',
      render: (s) => (
        <button
          type="button"
          onClick={() => setViewingInvoice(s)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FileText className="h-3.5 w-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create pharmaceutical supply invoices for registered business clients, apply volume discounts, and track credit settlements.
        </p>
        <button
          type="button"
          onClick={() => {
            setCustomerId(pharmaCustomers[0]?.id || '');
            setDraftProductId(pharmaProducts[0]?.id || '');
            setItems([]);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create Pharmaceutical Invoice
        </button>
      </div>

      <DataTable
        data={pharmaSales}
        columns={columns}
        keyExtractor={(s) => s.id}
        searchPlaceholder="Search invoice #, business client, payment method..."
        searchFilter={(s, q) =>
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.paymentMethod.toLowerCase().includes(q)
        }
      />

      {/* Create Pharmaceutical Invoice Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Pharmaceutical Sales Invoice"
        subtitle="Issuing an invoice deducts warehouse stock and updates customer receivables if on credit."
        maxWidthClass="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!customerId || items.length === 0}
              onClick={handleCreateInvoice}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Issue Invoice
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                {pharmaCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EVC Plus">EVC Plus</option>
                <option value="Cash">Cash</option>
                <option value="Credit">Pharmaceutical Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-xs font-bold text-[#1E396A] dark:text-white">Add Bulk Product Line</p>
            <div className="grid sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Pharmaceutical Item
                </label>
                <select
                  value={draftProductId}
                  onChange={(e) => setDraftProductId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#111B2E]"
                >
                  {pharmaProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.sellPrice.toFixed(2)} ({p.stockQty} {p.unit} avail)
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={draftQty}
                  onChange={(e) => setDraftQty(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums bg-white dark:bg-[#111B2E]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Discount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={draftDiscount}
                  onChange={(e) => setDraftDiscount(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums bg-white dark:bg-[#111B2E]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={addInvoiceLine}
                  className="w-full py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold hover:bg-[#162b52]"
                >
                  Add Line
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
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Discount</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">-${item.discount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-[#DC2626] dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2.5 bg-[#F4F6F9] dark:bg-[#0D1628] border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-bold text-[#1E396A] dark:text-white">
                <span>Invoice Net Total</span>
                <span className="tabular-nums">
                  ${items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        open={viewingInvoice !== null}
        onClose={() => setViewingInvoice(null)}
        title="Pharmaceutical Tax Invoice"
        subtitle={
          viewingInvoice ? `${viewingInvoice.invoiceNo} · ${viewingInvoice.date}` : ''
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-sky-300 bg-white dark:bg-[#0D1628]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Invoice
            </button>
            <button
              type="button"
              onClick={() => setViewingInvoice(null)}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Close
            </button>
          </>
        }
      >
        {viewingInvoice && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between p-3.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <div>
                <p className="font-bold text-[#1E396A] dark:text-white text-sm">
                  Benaadir Pharmaceutical Supply Ltd
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Bill To: {viewingInvoice.customerName}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Payment: {viewingInvoice.paymentMethod}
                </p>
              </div>
              <StatusLabel label={viewingInvoice.paymentStatus} />
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F4F6F9] dark:bg-[#0D1628] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-200">
                  {viewingInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between text-sm font-bold text-[#1E396A] dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Net Invoice Total</span>
              <span className="tabular-nums">${viewingInvoice.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
