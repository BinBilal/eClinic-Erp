import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Edit3,
  Eye,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { TODAY_ISO } from '../../data/seedData';
import { useDemoStore } from '../../store/demoStore';
import {
  CustomerRecord,
  PaymentMethod,
  PaymentStatus,
  ProductRecord,
  SaleItem,
  SaleRecord,
} from '../../types/erp';

interface PharmaceuticalSalesViewProps {
  onToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenReports?: () => void;
}

export const PharmaceuticalSalesView: React.FC<PharmaceuticalSalesViewProps> = ({
  onToast,
  onOpenReports,
}) => {
  const { state, completeSale, updateSale, deleteSale, addCustomer } = useDemoStore();
  const [viewMode, setViewMode] = useState<'pos' | 'history'>('pos');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Strict tenant isolation: only Pharmaceutical products, customers, and sales
  const pharmaProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === 'pharmaceutical'),
    [state.products]
  );
  const pharmaCustomers = useMemo(
    () => state.customers.filter((c) => c.tenantScope === 'pharmaceutical'),
    [state.customers]
  );
  const pharmaSales = useMemo(
    () => state.sales.filter((s) => s.tenantScope === 'pharmaceutical'),
    [state.sales]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(pharmaProducts.map((p) => p.category)))],
    [pharmaProducts]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pharmaProducts.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [pharmaProducts, category, search]);

  // POS Cart & Checkout State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerId, setCustomerId] = useState(pharmaCustomers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [orderDiscount, setOrderDiscount] = useState('0');
  const [completedInvoice, setCompletedInvoice] = useState<SaleRecord | null>(null);

  // Quick Customer Registration Modal
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [custForm, setCustForm] = useState({
    name: '',
    customerType: 'Pharmacy' as CustomerRecord['customerType'],
    phone: '+252 61 ',
    email: '',
    address: '',
  });

  // Sales History CRUD States
  const [editingInvoice, setEditingInvoice] = useState<SaleRecord | null>(null);
  const [editForm, setEditForm] = useState({
    customerId: '',
    date: '',
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    paymentStatus: 'Paid' as PaymentStatus,
    discountTotal: '0',
  });
  const [deleteTarget, setDeleteTarget] = useState<SaleRecord | null>(null);

  // Sales Reporting Summary
  const reporting = useMemo(() => {
    const todayRevenue = pharmaSales
      .filter((s) => s.date === TODAY_ISO)
      .reduce((sum, s) => sum + s.total, 0);
    const totalRevenue = pharmaSales.reduce((sum, s) => sum + s.total, 0);
    const creditPending = pharmaSales
      .filter((s) => s.paymentStatus !== 'Paid')
      .reduce((sum, s) => sum + (s.paymentStatus === 'Partial' ? s.total * 0.5 : s.total), 0);
    return {
      todayRevenue,
      totalRevenue,
      creditPending,
      invoiceCount: pharmaSales.length,
    };
  }, [pharmaSales]);

  const activeCustomerId =
    pharmaCustomers.find((c) => c.id === customerId)?.id || pharmaCustomers[0]?.id || '';

  const addToCart = (product: ProductRecord) => {
    if (product.stockQty <= 0) {
      onToast(`${product.name} is currently out of warehouse stock.`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stockQty) {
          onToast(`Maximum available warehouse stock reached for ${product.name}.`, 'error');
          return prev;
        }
        const nextQty = existing.qty + 1;
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                qty: nextQty,
                total: Math.max(0, nextQty * i.unitPrice - i.discount),
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

  const setCartItemQty = (productId: string, nextQty: number) => {
    const prod = pharmaProducts.find((p) => p.id === productId);
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    if (prod && nextQty > prod.stockQty) {
      onToast(`Only ${prod.stockQty} ${prod.unit} available in warehouse.`, 'error');
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              qty: nextQty,
              total: Math.max(0, nextQty * item.unitPrice - item.discount),
            }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const parsedDiscount = Math.min(subtotal, Math.max(0, Number(orderDiscount) || 0));
  const total = Math.max(0, subtotal - parsedDiscount);

  const handleMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'Credit') {
      setPaymentStatus('Pending');
    } else if (paymentStatus === 'Pending') {
      setPaymentStatus('Paid');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !activeCustomerId) return;
    const itemsWithDiscount = cart.map((item, idx) =>
      idx === 0
        ? {
            ...item,
            discount: parsedDiscount,
            total: Math.max(0, item.qty * item.unitPrice - parsedDiscount),
          }
        : item
    );

    const inv = completeSale({
      customerId: activeCustomerId,
      items: itemsWithDiscount,
      paymentMethod,
      paymentStatus,
      tenantScope: 'pharmaceutical',
    });

    setCompletedInvoice(inv);
    setCart([]);
    setOrderDiscount('0');
    onToast(
      `Sale ${inv.invoiceNo} completed ($${inv.total.toFixed(2)}). Warehouse stock & financials updated.`
    );
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
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Invoice & Receipt"
            onClick={() => setCompletedInvoice(s)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Invoice"
            onClick={() => {
              setEditingInvoice(s);
              setEditForm({
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
            title="Archive / Delete Invoice"
            onClick={() => setDeleteTarget(s)}
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
      {/* Top Mode Switcher + Live Sales Reporting Strip */}
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
            Sales History ({pharmaSales.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-lg bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Today:{' '}
              <strong className="text-[#1E396A] dark:text-sky-300 tabular-nums">
                ${reporting.todayRevenue.toFixed(2)}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              Total Sales:{' '}
              <strong className="text-[#16A34A] dark:text-emerald-400 tabular-nums">
                ${reporting.totalRevenue.toFixed(2)}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              Open Credit:{' '}
              <strong className="text-[#D97706] dark:text-amber-400 tabular-nums">
                ${reporting.creditPending.toFixed(2)}
              </strong>
            </span>
          </div>
          {onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111B2E] text-xs font-semibold text-[#1E396A] dark:text-sky-300 hover:border-[#396BA4]"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Sales Reports
            </button>
          )}
        </div>
      </div>

      {viewMode === 'history' ? (
        <DataTable
          data={pharmaSales}
          columns={historyColumns}
          keyExtractor={(s) => s.id}
          searchPlaceholder="Search invoice #, business client, payment method..."
          searchFilter={(s, q) =>
            s.invoiceNo.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.paymentMethod.toLowerCase().includes(q)
          }
        />
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Warehouse Product Catalog Picker */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pharmaceutical SKU, product name, generic, manufacturer..."
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {p.genericName} · {p.category}
                    </p>
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
                      <span className="text-[#F05D21] font-semibold">+ Add to Cart</span>
                    </div>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="sm:col-span-2 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  No pharmaceutical products match your current filter.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Pharmaceutical Cart & Checkout */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[#F05D21]" />
                <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">
                  Pharmaceutical Sales Cart
                </h2>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Business Customer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustForm({
                      name: '',
                      customerType: 'Pharmacy',
                      phone: '+252 61 ',
                      email: '',
                      address: '',
                    });
                    setNewCustomerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F05D21] hover:underline"
                >
                  <UserPlus className="h-3 w-3" />
                  Register Customer
                </button>
              </div>
              <select
                value={activeCustomerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                {pharmaCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Sales cart is empty
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Select pharmaceutical products from the catalog to build an order.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        ${item.unitPrice.toFixed(2)} / unit
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCartItemQty(item.productId, item.qty - 1)}
                        className="h-6 w-6 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111B2E] flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          setCartItemQty(item.productId, Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-11 text-center text-xs font-bold tabular-nums py-0.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#111B2E] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setCartItemQty(item.productId, item.qty + 1)}
                        className="h-6 w-6 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111B2E] flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCartItemQty(item.productId, 0)}
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

            <div className="grid sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="EVC Plus">EVC Plus</option>
                  <option value="Zaad">Zaad</option>
                  <option value="Credit">Pharmaceutical Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
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
              disabled={cart.length === 0 || !activeCustomerId}
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Complete Sale &amp; Generate Invoice
            </button>
          </div>
        </div>
      )}

      {/* Quick Register Pharmaceutical Customer Modal */}
      <Modal
        open={newCustomerOpen}
        onClose={() => setNewCustomerOpen(false)}
        title="Register Pharmaceutical Customer"
        subtitle="Creates a new B2B customer account under this Pharmaceutical tenant."
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewCustomerOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!custForm.name.trim()}
              onClick={() => {
                const created = addCustomer({
                  name: custForm.name.trim(),
                  customerType: custForm.customerType,
                  phone: custForm.phone.trim() || '+252 61 0000000',
                  email: custForm.email.trim() || 'accounts@client.so',
                  address: custForm.address.trim() || 'Mogadishu',
                  balanceReceivable: 0,
                  tenantScope: 'pharmaceutical',
                });
                setCustomerId(created.id);
                setNewCustomerOpen(false);
                onToast(`Registered customer ${created.name} and selected for POS checkout.`);
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save &amp; Select Customer
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Customer Name *
              </label>
              <input
                type="text"
                value={custForm.name}
                onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                placeholder="e.g. Banadir Care Pharmacy"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <select
                value={custForm.customerType}
                onChange={(e) =>
                  setCustForm({
                    ...custForm,
                    customerType: e.target.value as CustomerRecord['customerType'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Hospital">Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={custForm.phone}
                onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={custForm.email}
                onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                placeholder="orders@client.so"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
              placeholder="District & Street, Mogadishu"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
        </div>
      </Modal>

      {/* Invoice & Receipt Preview Modal */}
      <Modal
        open={completedInvoice !== null}
        onClose={() => setCompletedInvoice(null)}
        title="Pharmaceutical Tax Invoice & Receipt"
        subtitle={
          completedInvoice ? `${completedInvoice.invoiceNo} · ${completedInvoice.date}` : ''
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-sky-300 bg-white dark:bg-[#0D1628]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt / Invoice
            </button>
            <button
              type="button"
              onClick={() => setCompletedInvoice(null)}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Done
            </button>
          </>
        }
      >
        {completedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
              <span>Sale recorded, warehouse stock deducted, and financial ledger updated.</span>
            </div>

            <div className="flex items-start justify-between p-3.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800">
              <div>
                <p className="font-bold text-[#1E396A] dark:text-white text-sm">
                  Benaadir Pharmaceutical Supply Ltd
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Bill To: {completedInvoice.customerName}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Payment: {completedInvoice.paymentMethod} ({completedInvoice.paymentStatus})
                </p>
              </div>
              <StatusLabel label={completedInvoice.paymentStatus} />
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
                  {completedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        ${(item.qty * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="tabular-nums">${completedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Discount</span>
                <span className="tabular-nums">-${completedInvoice.discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1E396A] dark:text-white pt-1">
                <span>Net Invoice Total</span>
                <span className="tabular-nums">${completedInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Pharmaceutical Invoice Modal */}
      <Modal
        open={editingInvoice !== null}
        onClose={() => setEditingInvoice(null)}
        title={`Edit Invoice — ${editingInvoice?.invoiceNo || ''}`}
        subtitle="Update B2B customer assignment, settlement status, or volume discount."
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingInvoice(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editingInvoice) return;
                const disc = Math.min(
                  editingInvoice.subtotal,
                  Math.max(0, Number(editForm.discountTotal) || 0)
                );
                updateSale(editingInvoice.id, {
                  customerId: editForm.customerId,
                  date: editForm.date,
                  paymentMethod: editForm.paymentMethod,
                  paymentStatus: editForm.paymentStatus,
                  discountTotal: disc,
                  total: Math.max(0, editingInvoice.subtotal - disc),
                });
                onToast(`Updated pharmaceutical invoice ${editingInvoice.invoiceNo}.`);
                setEditingInvoice(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editingInvoice && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Customer
                </label>
                <select
                  value={editForm.customerId}
                  onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  {pharmaCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
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
                  value={editForm.paymentMethod}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="EVC Plus">EVC Plus</option>
                  <option value="Zaad">Zaad</option>
                  <option value="Credit">Pharmaceutical Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
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
                  step="1"
                  value={editForm.discountTotal}
                  onChange={(e) => setEditForm({ ...editForm, discountTotal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white tabular-nums"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] flex justify-between text-xs font-semibold text-[#1E396A] dark:text-white">
              <span>Net Invoice Total</span>
              <span className="tabular-nums">
                $
                {Math.max(
                  0,
                  editingInvoice.subtotal -
                    Math.min(
                      editingInvoice.subtotal,
                      Math.max(0, Number(editForm.discountTotal) || 0)
                    )
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Archive & Delete Pharmaceutical Invoice"
        recordType="Pharmaceutical Invoice"
        recordLabel={
          deleteTarget
            ? `${deleteTarget.invoiceNo} · ${deleteTarget.customerName} ($${deleteTarget.total.toFixed(2)})`
            : ''
        }
        isSoftDelete
        warningMessage="This archives the tax invoice for audit compliance, removes it from active invoices, restores dispatched bulk quantities to warehouse inventory, and adjusts customer receivables."
        onConfirm={() => {
          if (!deleteTarget) return;
          const res = deleteSale(deleteTarget.id);
          onToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
