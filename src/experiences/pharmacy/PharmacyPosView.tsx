import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit3, Eye, Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useDemoStore } from '../../store/demoStore';
import { PaymentMethod, PaymentStatus, ProductRecord, SaleItem, SaleRecord } from '../../types/erp';

interface PharmacyPosViewProps {
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PharmacyPosView: React.FC<PharmacyPosViewProps> = ({ onToast }) => {
  const { state, completeSale, updateSale, deleteSale } = useDemoStore();
  const [viewMode, setViewMode] = useState<'pos' | 'history'>('pos');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [editSaleForm, setEditSaleForm] = useState({
    customerId: '',
    date: '',
    paymentMethod: 'Cash' as PaymentMethod,
    paymentStatus: 'Paid' as PaymentStatus,
    discountTotal: '0',
  });
  const [deleteTargetSale, setDeleteTargetSale] = useState<SaleRecord | null>(null);

  const pharmacyProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === 'pharmacy'),
    [state.products]
  );
  const pharmacyCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === 'pharmacy'),
    [state.customers]
  );
  const pharmacySales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === 'pharmacy'),
    [state.sales]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(pharmacyProducts.map((p) => p.category)))],
    [pharmacyProducts]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pharmacyProducts.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [pharmacyProducts, category, search]);

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerId, setCustomerId] = useState(pharmacyCustomers[0]?.id || 'cust-1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [orderDiscount, setOrderDiscount] = useState('0');
  const [completedReceipt, setCompletedReceipt] = useState<SaleRecord | null>(null);

  const addToCart = (product: ProductRecord) => {
    if (product.stockQty <= 0) {
      onToast(`${product.name} is currently out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stockQty) {
          onToast(`Maximum available stock reached for ${product.name}.`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                qty: i.qty + 1,
                total: (i.qty + 1) * i.unitPrice - i.discount,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          qty: 1,
          unitPrice: product.sellPrice,
          discount: 0,
          total: product.sellPrice,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const prod = pharmacyProducts.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          if (prod && nextQty > prod.stockQty) {
            onToast(`Only ${prod.stockQty} units available in stock.`);
            return item;
          }
          return {
            ...item,
            qty: nextQty,
            total: Math.max(0, nextQty * item.unitPrice - item.discount),
          };
        })
        .filter((x): x is SaleItem => x !== null)
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const parsedDiscount = Math.min(subtotal, Math.max(0, Number(orderDiscount) || 0));
  const total = Math.max(0, subtotal - parsedDiscount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Distribute order-level discount proportionally on first item for clean ledger consistency
    const itemsWithDiscount = cart.map((item, idx) =>
      idx === 0
        ? {
            ...item,
            discount: parsedDiscount,
            total: Math.max(0, item.qty * item.unitPrice - parsedDiscount),
          }
        : item
    );

    const sale = completeSale({
      customerId,
      items: itemsWithDiscount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Credit' ? 'Pending' : 'Paid',
      tenantScope: 'pharmacy',
    });

    setCompletedReceipt(sale);
    setCart([]);
    setOrderDiscount('0');
    onToast(`Sale ${sale.invoiceNo} completed ($${sale.total.toFixed(2)}). Stock updated.`);
  };

  const historyColumns: ColumnDef<SaleRecord>[] = [
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
      key: 'cust',
      header: 'Customer',
      render: (s) => <span className="font-medium text-slate-900 dark:text-white">{s.customerName}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (s) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {s.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (s) => <span className="text-xs text-slate-700 dark:text-slate-300">{s.paymentMethod}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-bold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${s.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusLabel label={s.paymentStatus} />,
    },
    {
      key: 'receipt',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Receipt"
            onClick={() => setCompletedReceipt(s)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Sale"
            onClick={() => {
              setEditingSale(s);
              setEditSaleForm({
                customerId: s.customerId,
                date: s.date,
                paymentMethod: s.paymentMethod,
                paymentStatus: s.paymentStatus,
                discountTotal: String(s.discountTotal),
              });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            title="Archive / Delete Sale"
            onClick={() => setDeleteTargetSale(s)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('pos')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              viewMode === 'pos'
                ? 'bg-[#F05D21] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white'
            }`}
          >
            Point of Sale Terminal
          </button>
          <button
            type="button"
            onClick={() => setViewMode('history')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              viewMode === 'history'
                ? 'bg-[#1E396A] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white'
            }`}
          >
            Sales History ({pharmacySales.length})
          </button>
        </div>
      </div>

      {viewMode === 'history' ? (
        <DataTable
          data={pharmacySales}
          columns={historyColumns}
          keyExtractor={(s) => s.id}
          searchPlaceholder="Search invoice #, customer, payment method..."
          searchFilter={(s, q) =>
            s.invoiceNo.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.paymentMethod.toLowerCase().includes(q)
          }
        />
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Product Catalog Picker */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medicine by name, generic, or SKU..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4] focus:bg-white dark:focus:bg-[#0D1628] dark:text-white"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const out = p.stockQty <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={out}
                    onClick={() => addToCart(p)}
                    className={`text-left p-3.5 rounded-xl border transition-colors ${
                      out
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1628]/50 opacity-55 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#F05D21] dark:hover:border-[#F05D21] bg-white dark:bg-[#0D1628]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                      <span className="text-sm font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
                        ${p.sellPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.genericName}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span
                        className={`font-medium tabular-nums ${
                          p.stockQty <= p.minStock
                            ? 'text-[#D97706] dark:text-amber-400'
                            : 'text-[#16A34A] dark:text-emerald-400'
                        }`}
                      >
                        Stock: {p.stockQty} {p.unit}
                      </span>
                      <span className="text-[#F05D21] font-semibold">+ Add</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Cart & Checkout */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[#F05D21]" />
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">Current Dispensing Cart</h2>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-[#DC2626] dark:text-red-400 hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                {pharmacyCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Cart is empty</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Select medicines from the left catalog to begin checkout.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, -1)}
                        className="h-6 w-6 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111B2E] flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums dark:text-white">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, 1)}
                        className="h-6 w-6 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111B2E] flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, -item.qty)}
                        className="ml-1 text-slate-400 hover:text-[#DC2626] dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="w-16 text-right text-xs font-bold text-[#1E396A] dark:text-sky-300 tabular-nums">
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
                >
                  <option value="Cash">Cash</option>
                  <option value="EVC Plus">EVC Plus</option>
                  <option value="Zaad">Zaad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Customer Credit</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Discount</span>
                <span className="tabular-nums font-medium">-${parsedDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1E396A] dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Payable</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Complete Sale &amp; Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Sale Confirmation Receipt Modal */}
      <Modal
        open={completedReceipt !== null}
        onClose={() => setCompletedReceipt(null)}
        title="Sale Completed — Receipt"
        subtitle={
          completedReceipt
            ? `${completedReceipt.invoiceNo} · ${completedReceipt.date}`
            : ''
        }
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-sky-300 bg-white dark:bg-[#0D1628]"
            >
              Print Receipt
            </button>
            <button
              type="button"
              onClick={() => setCompletedReceipt(null)}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Done
            </button>
          </>
        }
      >
        {completedReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
              <span>Sale recorded and inventory stock quantities updated.</span>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-[#1E396A] dark:text-white text-sm">Al-Shifa Modern Pharmacy</p>
              <p className="text-slate-500 dark:text-slate-400">Customer: {completedReceipt.customerName}</p>
              <p className="text-slate-500 dark:text-slate-400">
                Payment: {completedReceipt.paymentMethod} ({completedReceipt.paymentStatus})
              </p>
            </div>

            <div className="border-y border-slate-200 dark:border-slate-800 py-2.5 space-y-1.5">
              {completedReceipt.items.map((item, i) => (
                <div key={i} className="flex justify-between gap-2 dark:text-slate-200">
                  <span>
                    {item.productName} ×{item.qty}
                  </span>
                  <span className="font-semibold tabular-nums">
                    ${(item.qty * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="tabular-nums">${completedReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Discount</span>
                <span className="tabular-nums">-${completedReceipt.discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1E396A] dark:text-white pt-1">
                <span>Total Paid</span>
                <span className="tabular-nums">${completedReceipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        open={editingSale !== null}
        onClose={() => setEditingSale(null)}
        title={`Edit Sale — ${editingSale?.invoiceNo || ''}`}
        subtitle="Update customer, payment method, settlement status, or order discount."
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingSale(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingSale) return;
                const disc = Math.min(
                  editingSale.subtotal,
                  Math.max(0, Number(editSaleForm.discountTotal) || 0)
                );
                updateSale(editingSale.id, {
                  customerId: editSaleForm.customerId,
                  date: editSaleForm.date,
                  paymentMethod: editSaleForm.paymentMethod,
                  paymentStatus: editSaleForm.paymentStatus,
                  discountTotal: disc,
                  total: Math.max(0, editingSale.subtotal - disc),
                });
                onToast(`Updated sale ${editingSale.invoiceNo}.`);
                setEditingSale(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editingSale && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer
                </label>
                <select
                  value={editSaleForm.customerId}
                  onChange={(e) => setEditSaleForm({ ...editSaleForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  {pharmacyCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={editSaleForm.date}
                  onChange={(e) => setEditSaleForm({ ...editSaleForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white tabular-nums"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={editSaleForm.paymentMethod}
                  onChange={(e) =>
                    setEditSaleForm({
                      ...editSaleForm,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="EVC Plus">EVC Plus</option>
                  <option value="Zaad">Zaad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Customer Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={editSaleForm.paymentStatus}
                  onChange={(e) =>
                    setEditSaleForm({
                      ...editSaleForm,
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editSaleForm.discountTotal}
                  onChange={(e) =>
                    setEditSaleForm({ ...editSaleForm, discountTotal: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white tabular-nums"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] flex justify-between text-xs font-semibold text-[#1E396A] dark:text-white">
              <span>Updated Total</span>
              <span className="tabular-nums">
                $
                {Math.max(
                  0,
                  editingSale.subtotal -
                    Math.min(editingSale.subtotal, Math.max(0, Number(editSaleForm.discountTotal) || 0))
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <DeleteConfirmModal
        open={deleteTargetSale !== null}
        onClose={() => setDeleteTargetSale(null)}
        title="Archive & Delete Sale Receipt"
        recordType="Pharmacy Sale"
        recordLabel={
          deleteTargetSale
            ? `${deleteTargetSale.invoiceNo} · ${deleteTargetSale.customerName} ($${deleteTargetSale.total.toFixed(2)})`
            : ''
        }
        isSoftDelete
        warningMessage="This will remove the sale from active POS history, restore dispensed stock quantities to inventory, adjust customer balance, and preserve an immutable archive snapshot for financial audit compliance."
        onConfirm={() => {
          if (!deleteTargetSale) return;
          const res = deleteSale(deleteTargetSale.id);
          onToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetSale(null);
        }}
      />
    </div>
  );
};
