import React, { useMemo, useState } from 'react';
import { Edit3, Eye, Plus, SlidersHorizontal } from 'lucide-react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { StatusLabel } from '../ui/StatusLabel';
import { getBatchStatus, useDemoStore } from '../../store/demoStore';
import { BatchRecord, ProductRecord, StockMovementRecord, TenantScope } from '../../types/erp';

interface ScopeProps {
  tenantScope: TenantScope;
  onToast: (msg: string) => void;
}

export const ProductsView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, addProduct, updateProduct } = useDemoStore();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductRecord | null>(null);

  const scopedProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === tenantScope),
    [state.products, tenantScope]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(scopedProducts.map((p) => p.category)))],
    [scopedProducts]
  );

  const filtered = useMemo(
    () =>
      scopedProducts.filter(
        (p) => categoryFilter === 'All' || p.category === categoryFilter
      ),
    [scopedProducts, categoryFilter]
  );

  const [form, setForm] = useState({
    sku: '',
    name: '',
    genericName: '',
    category: tenantScope === 'pharmacy' ? 'Antibiotics' : 'IV Fluids',
    manufacturer: '',
    unit: tenantScope === 'pharmacy' ? 'Box' : 'Carton',
    costPrice: '',
    sellPrice: '',
    minStock: '20',
    stockQty: '0',
    description: '',
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      sku: `${tenantScope === 'pharmacy' ? 'MED' : 'PM'}-${Math.floor(1100 + Math.random() * 8800)}`,
      name: '',
      genericName: '',
      category: tenantScope === 'pharmacy' ? 'Antibiotics' : 'IV Fluids',
      manufacturer: '',
      unit: tenantScope === 'pharmacy' ? 'Box' : 'Carton',
      costPrice: '',
      sellPrice: '',
      minStock: '20',
      stockQty: '50',
      description: '',
    });
    setFormModalOpen(true);
  };

  const openEdit = (p: ProductRecord) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku,
      name: p.name,
      genericName: p.genericName,
      category: p.category,
      manufacturer: p.manufacturer,
      unit: p.unit,
      costPrice: String(p.costPrice),
      sellPrice: String(p.sellPrice),
      minStock: String(p.minStock),
      stockQty: String(p.stockQty),
      description: p.description,
    });
    setFormModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      genericName: form.genericName.trim() || form.name.trim(),
      category: form.category.trim() || 'General',
      manufacturer: form.manufacturer.trim() || 'Standard Pharma',
      unit: form.unit.trim() || 'Unit',
      costPrice: Number(form.costPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      minStock: Number(form.minStock) || 10,
      stockQty: Number(form.stockQty) || 0,
      description: form.description.trim(),
      tenantScope,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      onToast(`Updated product ${payload.name}.`);
    } else {
      addProduct(payload);
      onToast(`Added product ${payload.name} to catalog.`);
    }
    setFormModalOpen(false);
  };

  const columns: ColumnDef<ProductRecord>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Product / Medicine Name',
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {p.genericName} · {p.manufacturer}
          </p>
        </div>
      ),
    },
    {
      key: 'cat',
      header: 'Category',
      render: (p) => <span className="text-xs text-slate-700 dark:text-slate-300">{p.category}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      align: 'right',
      render: (p) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
          ${p.costPrice.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'price',
      header: tenantScope === 'pharmacy' ? 'Retail Price' : 'Wholesale Price',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-semibold tabular-nums text-[#1E396A] dark:text-sky-300">
          ${p.sellPrice.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Available Stock',
      align: 'right',
      render: (p) => (
        <span
          className={`text-xs font-semibold tabular-nums ${
            p.stockQty <= p.minStock
              ? 'text-[#D97706] dark:text-amber-400'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {p.stockQty} {p.unit}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Availability',
      render: (p) => (
        <StatusLabel
          label={
            p.stockQty === 0
              ? 'Out of Stock'
              : p.stockQty <= p.minStock
              ? 'Low Stock'
              : 'Active'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewProduct(p)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(p)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Edit product"
          >
            <Edit3 className="h-3.5 w-3.5" />
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
            ? 'Manage pharmacy medicine catalog, categories, retail pricing, and minimum reorder levels.'
            : 'Manage wholesale pharmaceutical catalog, carton/tray pricing, and bulk reorder levels.'}
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search SKU, product, generic name, manufacturer..."
        searchFilter={(p, q) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
        }
        toolbarExtra={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] text-slate-700 dark:text-slate-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
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
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU *</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Product / Medicine Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ciprofloxacin 500mg Tablets (Box 100)"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Generic Name</label>
            <input
              type="text"
              value={form.genericName}
              onChange={(e) => setForm({ ...form, genericName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
            <input
              type="text"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Stock Alert</label>
            <input
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {tenantScope === 'pharmacy' ? 'Retail Price ($)' : 'Wholesale Price ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.sellPrice}
              onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
          {!editingProduct && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opening Stock Quantity
              </label>
              <input
                type="number"
                value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* View Product Details Modal */}
      <Modal
        open={viewProduct !== null}
        onClose={() => setViewProduct(null)}
        title={viewProduct?.name || 'Product Details'}
        subtitle={viewProduct ? `${viewProduct.sku} · ${viewProduct.category}` : ''}
      >
        {viewProduct && (
          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Generic Name</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewProduct.genericName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Manufacturer</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewProduct.manufacturer}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Cost / Selling Price</p>
                <p className="font-semibold text-[#1E396A] dark:text-sky-300 tabular-nums mt-0.5">
                  ${viewProduct.costPrice.toFixed(2)} / ${viewProduct.sellPrice.toFixed(2)} per {viewProduct.unit}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Current Stock / Min Level</p>
                <p className="font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {viewProduct.stockQty} {viewProduct.unit} (Min: {viewProduct.minStock})
                </p>
              </div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Clinical / Catalog Notes</p>
              <p className="mt-1 p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] text-slate-700 dark:text-slate-300">
                {viewProduct.description || 'No additional description.'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">Active Batches</p>
              <div className="space-y-1.5">
                {state.batches
                  .filter((b) => b.productId === viewProduct.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-transparent dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-mono font-semibold text-[#1E396A] dark:text-sky-300">{b.batchNumber}</span>
                      <span className="tabular-nums dark:text-slate-200">Qty: {b.qty}</span>
                      <span className="tabular-nums dark:text-slate-300">Exp: {b.expiryDate}</span>
                      <StatusLabel label={getBatchStatus(b.expiryDate)} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const InventoryView: React.FC<ScopeProps> = ({ tenantScope, onToast }) => {
  const { state, adjustStock } = useDemoStore();
  const [tab, setTab] = useState<'stock' | 'low' | 'movements'>('stock');
  const [adjustModal, setAdjustModal] = useState<ProductRecord | null>(null);
  const [qtyDelta, setQtyDelta] = useState('0');
  const [adjustNote, setAdjustNote] = useState('');

  const scopedProducts = useMemo(
    () => state.products.filter((p) => p.tenantScope === tenantScope),
    [state.products, tenantScope]
  );

  const lowStockProducts = useMemo(
    () => scopedProducts.filter((p) => p.stockQty <= p.minStock),
    [scopedProducts]
  );

  const scopedMovements = useMemo(
    () => state.stockMovements.filter((m) => m.tenantScope === tenantScope),
    [state.stockMovements, tenantScope]
  );

  const stockColumns: ColumnDef<ProductRecord>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>,
    },
    {
      key: 'qty',
      header: 'Current Stock',
      align: 'right',
      render: (p) => (
        <span className="font-semibold tabular-nums dark:text-slate-200">
          {p.stockQty} {p.unit}
        </span>
      ),
    },
    {
      key: 'min',
      header: 'Reorder Level',
      align: 'right',
      render: (p) => (
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {p.minStock} {p.unit}
        </span>
      ),
    },
    {
      key: 'val',
      header: 'Stock Value (Cost)',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-medium tabular-nums text-[#1E396A] dark:text-sky-300">
          ${(p.stockQty * p.costPrice).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusLabel
          label={p.stockQty === 0 ? 'Out of Stock' : p.stockQty <= p.minStock ? 'Low Stock' : 'Active'}
        />
      ),
    },
    {
      key: 'action',
      header: 'Adjust',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => {
            setAdjustModal(p);
            setQtyDelta('0');
            setAdjustNote('');
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Adjust
        </button>
      ),
    },
  ];

  const movementColumns: ColumnDef<StockMovementRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (m) => (
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{m.date}</span>
      ),
    },
    {
      key: 'prod',
      header: 'Product',
      render: (m) => <span className="text-xs font-semibold text-slate-900 dark:text-white">{m.productName}</span>,
    },
    {
      key: 'type',
      header: 'Movement Type',
      render: (m) => <span className="text-xs font-medium text-[#1E396A] dark:text-sky-300">{m.type}</span>,
    },
    {
      key: 'qty',
      header: 'Qty Change',
      align: 'right',
      render: (m) => (
        <span
          className={`text-xs font-bold tabular-nums ${
            m.qtyChange >= 0
              ? 'text-[#16A34A] dark:text-emerald-400'
              : 'text-[#DC2626] dark:text-red-400'
          }`}
        >
          {m.qtyChange >= 0 ? `+${m.qtyChange}` : m.qtyChange}
        </span>
      ),
    },
    {
      key: 'ref',
      header: 'Reference',
      render: (m) => <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{m.reference}</span>,
    },
    {
      key: 'note',
      header: 'Note',
      render: (m) => <span className="text-xs text-slate-500 dark:text-slate-400">{m.note}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('stock')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
            tab === 'stock'
              ? 'bg-[#1E396A] text-white'
              : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Current Stock ({scopedProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('low')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
            tab === 'low'
              ? 'bg-[#F05D21] text-white'
              : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Low Stock Alerts ({lowStockProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('movements')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
            tab === 'movements'
              ? 'bg-[#1E396A] text-white'
              : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Stock Movements &amp; History ({scopedMovements.length})
        </button>
      </div>

      {tab === 'movements' ? (
        <DataTable
          data={scopedMovements}
          columns={movementColumns}
          keyExtractor={(m) => m.id}
          searchPlaceholder="Search product, reference, note..."
          searchFilter={(m, q) =>
            m.productName.toLowerCase().includes(q) ||
            m.reference.toLowerCase().includes(q) ||
            m.note.toLowerCase().includes(q)
          }
        />
      ) : (
        <DataTable
          data={tab === 'low' ? lowStockProducts : scopedProducts}
          columns={stockColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search SKU or product..."
          searchFilter={(p, q) =>
            p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
          }
        />
      )}

      <Modal
        open={adjustModal !== null}
        onClose={() => setAdjustModal(null)}
        title="Stock Quantity Adjustment"
        subtitle={adjustModal ? `${adjustModal.name} (Current: ${adjustModal.stockQty} ${adjustModal.unit})` : ''}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAdjustModal(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!Number(qtyDelta) || !adjustNote.trim()}
              onClick={() => {
                if (adjustModal && Number(qtyDelta) && adjustNote.trim()) {
                  adjustStock({
                    productId: adjustModal.id,
                    qtyChange: Number(qtyDelta),
                    note: adjustNote.trim(),
                    tenantScope,
                  });
                  onToast(`Adjusted stock for ${adjustModal.name} by ${qtyDelta}.`);
                  setAdjustModal(null);
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Apply Adjustment
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity Change (use negative for write-off/damage, positive for count surplus)
            </label>
            <input
              type="number"
              value={qtyDelta}
              onChange={(e) => setQtyDelta(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Reason *
            </label>
            <input
              type="text"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="e.g. Physical shelf recount or damaged vial removal"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const BatchExpiryView: React.FC<{ tenantScope: TenantScope }> = ({ tenantScope }) => {
  const { state } = useDemoStore();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Valid' | 'Near Expiry' | 'Expired'>('All');

  const scopedBatches = useMemo(
    () =>
      state.batches
        .filter((b) => b.tenantScope === tenantScope)
        .filter((b) => {
          if (statusFilter === 'All') return true;
          return getBatchStatus(b.expiryDate, state.systemConfig.expiryAlertDays) === statusFilter;
        }),
    [state.batches, tenantScope, statusFilter, state.systemConfig.expiryAlertDays]
  );

  const columns: ColumnDef<BatchRecord>[] = [
    {
      key: 'batch',
      header: 'Batch Number',
      render: (b) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {b.batchNumber}
        </span>
      ),
    },
    {
      key: 'product',
      header: 'Product Name',
      render: (b) => <span className="font-semibold text-slate-900 dark:text-white">{b.productName}</span>,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (b) => <span className="text-xs text-slate-600 dark:text-slate-300">{b.supplierName}</span>,
    },
    {
      key: 'exp',
      header: 'Expiry Date',
      render: (b) => (
        <span className="text-xs font-medium tabular-nums text-slate-800 dark:text-slate-200">
          {b.expiryDate}
        </span>
      ),
    },
    {
      key: 'qty',
      header: 'Available Qty',
      align: 'right',
      render: (b) => <span className="text-xs font-semibold tabular-nums dark:text-slate-200">{b.qty}</span>,
    },
    {
      key: 'status',
      header: 'Expiry Status',
      render: (b) => (
        <StatusLabel label={getBatchStatus(b.expiryDate, state.systemConfig.expiryAlertDays)} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={scopedBatches}
        columns={columns}
        keyExtractor={(b) => b.id}
        searchPlaceholder="Search batch number or product name..."
        searchFilter={(b, q) =>
          b.batchNumber.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.supplierName.toLowerCase().includes(q)
        }
        toolbarExtra={
          <div className="flex items-center gap-1 p-1 bg-[#F4F6F9] dark:bg-[#0D1628] rounded-lg">
            {(['All', 'Near Expiry', 'Expired', 'Valid'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#1E396A] text-[#1E396A] dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
};
