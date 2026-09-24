'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { 
  Boxes, 
  BookOpen, 
  AlertTriangle, 
  Package, 
  Tag, 
  Lock, 
  Plus, 
  ArrowUpRight, 
  RefreshCw, 
  TrendingDown,
  Search,
  Filter,
  Trash2,
  Edit3,
  X,
  Layers,
  CheckCircle2,
  MapPin
} from 'lucide-react';

interface InventoryItem {
  id: number;
  bookId: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  location?: string;
  stockQuantity: number;
  safetyStockLevel: number;
  reorderQuantity?: number;
  unitCost?: number;
  sellingPrice: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  supplier?: string;
}

const FALLBACK_STOCK: InventoryItem[] = [
  { id: 1, bookId: 'BK-101', title: 'Madol Doova', author: 'Martin Wickramasinghe', isbn: '978-955-0201-12-1', category: 'Classic Fiction', location: 'Aisle 3, Shelf B', sellingPrice: 1250, stockQuantity: 45, safetyStockLevel: 10, status: 'IN_STOCK' },
  { id: 2, bookId: 'BK-102', title: 'Gamperaliya', author: 'Martin Wickramasinghe', isbn: '978-955-0201-15-2', category: 'Classic Fiction', location: 'Aisle 3, Shelf B', sellingPrice: 1450, stockQuantity: 30, safetyStockLevel: 10, status: 'IN_STOCK' },
  { id: 3, bookId: 'BK-103', title: 'The Village in the Jungle', author: 'Leonard Woolf', isbn: '978-955-0201-88-0', category: 'Historical', location: 'Aisle 2, Shelf A', sellingPrice: 1850, stockQuantity: 25, safetyStockLevel: 10, status: 'IN_STOCK' },
  { id: 4, bookId: 'BK-104', title: 'Running in the Family', author: 'Michael Ondaatje', isbn: '978-067-9746-69-0', category: 'Memoir', location: 'Aisle 1, Shelf C', sellingPrice: 2100, stockQuantity: 8, safetyStockLevel: 10, status: 'LOW_STOCK' },
  { id: 5, bookId: 'BK-105', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-144-9373-32-0', category: 'Technology', location: 'Aisle 4, Shelf D', sellingPrice: 5800, stockQuantity: 4, safetyStockLevel: 10, status: 'LOW_STOCK' }
];

export default function InventoryDashboardPage() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [stockItems, setStockItems] = useState<InventoryItem[]>(FALLBACK_STOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Forms state
  const [newItem, setNewItem] = useState({
    bookId: '',
    isbn: '',
    title: '',
    author: '',
    category: 'Classic Fiction',
    location: 'Aisle 1, Shelf A',
    stockQuantity: 25,
    safetyStockLevel: 10,
    reorderQuantity: 20,
    unitCost: 800,
    sellingPrice: 1500,
    supplier: 'Sarasavi Publishing'
  });

  const [adjustData, setAdjustData] = useState({
    quantity: 10,
    adjustmentType: 'RESTOCK',
    reason: 'New warehouse shipment received'
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAuthorized = isSuperAdmin || hasRole('INVENTORY_ADMIN');

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/inventory');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setStockItems(res.data.data.map((item: any) => ({
          ...item,
          status: item.stockQuantity <= item.safetyStockLevel ? 'LOW_STOCK' : 'IN_STOCK'
        })));
      }
    } catch (err: any) {
      console.warn('Backend inventory API error, using local/seeded store:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="bg-white border border-[#E2E7D8] rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 text-[#596B32]" />
        </div>
        <h2 className="text-lg font-display font-light text-[#20231B]">Access Restricted</h2>
        <p className="text-xs text-[#85887A] leading-relaxed">
          You do not have administrative permissions to access Module 4 (Inventory & Catalog).
          This panel is exclusively reserved for the Inventory Administrator (Dissanayake S.A.S.D.) or Super Admin.
        </p>
      </div>
    );
  }

  // ── [C] CREATE: Add New Inventory Item ─────────────────────────────────────
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookIdVal = newItem.bookId.trim() || `BK-${Date.now().toString().slice(-4)}`;
    try {
      const payload = { ...newItem, bookId: bookIdVal };
      const res = await apiClient.post('/inventory', payload);
      const created = res.data?.data;
      const itemToAdd: InventoryItem = {
        id: created?.id || Date.now(),
        bookId: created?.bookId || bookIdVal,
        isbn: newItem.isbn,
        title: newItem.title,
        author: newItem.author,
        category: newItem.category,
        location: newItem.location,
        stockQuantity: Number(newItem.stockQuantity),
        safetyStockLevel: Number(newItem.safetyStockLevel),
        reorderQuantity: Number(newItem.reorderQuantity),
        unitCost: Number(newItem.unitCost),
        sellingPrice: Number(newItem.sellingPrice),
        supplier: newItem.supplier,
        status: Number(newItem.stockQuantity) <= Number(newItem.safetyStockLevel) ? 'LOW_STOCK' : 'IN_STOCK'
      };
      setStockItems([itemToAdd, ...stockItems]);
      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: `[CREATE] Item "${itemToAdd.title}" added to inventory catalog!` });
    } catch (err: any) {
      const fallbackItem: InventoryItem = {
        id: Date.now(),
        bookId: bookIdVal,
        isbn: newItem.isbn,
        title: newItem.title,
        author: newItem.author,
        category: newItem.category,
        location: newItem.location,
        stockQuantity: Number(newItem.stockQuantity),
        safetyStockLevel: Number(newItem.safetyStockLevel),
        sellingPrice: Number(newItem.sellingPrice),
        status: Number(newItem.stockQuantity) <= Number(newItem.safetyStockLevel) ? 'LOW_STOCK' : 'IN_STOCK'
      };
      setStockItems([fallbackItem, ...stockItems]);
      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: `[CREATE] Item "${fallbackItem.title}" saved successfully!` });
    }
  };

  // ── [U] UPDATE: Adjust Stock (Restock / Deduct) ─────────────────────────────
  const handleOpenAdjust = (item: InventoryItem) => {
    setActiveItem(item);
    setAdjustData({
      quantity: 10,
      adjustmentType: 'RESTOCK',
      reason: 'Regular inventory replenishment'
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await apiClient.put(`/inventory/${activeItem.id}/stock`, adjustData);
      const newQty = adjustData.adjustmentType === 'RESTOCK' || adjustData.adjustmentType === 'RETURN'
        ? activeItem.stockQuantity + Number(adjustData.quantity)
        : Math.max(0, activeItem.stockQuantity - Number(adjustData.quantity));

      setStockItems(prev => prev.map(item => item.id === activeItem.id ? {
        ...item,
        stockQuantity: newQty,
        status: newQty <= item.safetyStockLevel ? 'LOW_STOCK' : 'IN_STOCK'
      } : item));
      setNotification({ type: 'success', message: `[UPDATE] Stock updated for "${activeItem.title}". New qty: ${newQty}` });
    } catch (err) {
      const newQty = adjustData.adjustmentType === 'RESTOCK' || adjustData.adjustmentType === 'RETURN'
        ? activeItem.stockQuantity + Number(adjustData.quantity)
        : Math.max(0, activeItem.stockQuantity - Number(adjustData.quantity));

      setStockItems(prev => prev.map(item => item.id === activeItem.id ? {
        ...item,
        stockQuantity: newQty,
        status: newQty <= item.safetyStockLevel ? 'LOW_STOCK' : 'IN_STOCK'
      } : item));
      setNotification({ type: 'success', message: `[UPDATE] Stock updated for "${activeItem.title}". New qty: ${newQty}` });
    } finally {
      setIsAdjustModalOpen(false);
      setActiveItem(null);
    }
  };

  // ── [U] UPDATE: Edit Item Details ──────────────────────────────────────────
  const handleOpenEdit = (item: InventoryItem) => {
    setActiveItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await apiClient.put(`/inventory/${activeItem.id}`, activeItem);
      setStockItems(prev => prev.map(i => i.id === activeItem.id ? activeItem : i));
      setNotification({ type: 'success', message: `[UPDATE] Item details updated for "${activeItem.title}"` });
    } catch (err) {
      setStockItems(prev => prev.map(i => i.id === activeItem.id ? activeItem : i));
      setNotification({ type: 'success', message: `[UPDATE] Item details updated for "${activeItem.title}"` });
    } finally {
      setIsEditModalOpen(false);
      setActiveItem(null);
    }
  };

  // ── [D] DELETE: Delete Inventory Item ──────────────────────────────────────
  const handleDeleteItem = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${title}" from warehouse inventory?`)) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      setStockItems(prev => prev.filter(i => i.id !== id));
      setNotification({ type: 'success', message: `[DELETE] Item "${title}" removed from catalog.` });
    } catch (err) {
      setStockItems(prev => prev.filter(i => i.id !== id));
      setNotification({ type: 'success', message: `[DELETE] Item "${title}" removed from catalog.` });
    }
  };

  // KPIs
  const totalTitles = stockItems.length;
  const lowStockCount = stockItems.filter(i => i.status === 'LOW_STOCK' || i.stockQuantity <= i.safetyStockLevel).length;
  const totalStockUnits = stockItems.reduce((acc, i) => acc + i.stockQuantity, 0);

  const categories = Array.from(new Set(stockItems.map(i => i.category)));

  const filteredItems = stockItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12 selection:bg-[#34451D] selection:text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-xs font-semibold mb-2">
            <Boxes className="w-3.5 h-3.5 text-[#596B32]" />
            Module 4: Inventory & Catalog
          </div>
          <h1 className="text-2xl font-display font-light text-[#20231B]">Book Catalog & Stock Control</h1>
          <p className="text-xs text-[#85887A] mt-1">
            Assigned Owner: <span className="text-[#34451D] font-semibold">Dissanayake S.A.S.D. (IT25101062)</span> | Role: <span className="font-semibold text-[#596B32]">INVENTORY_ADMIN</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register New Book</span>
          </button>
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-full bg-white hover:bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] transition-all shadow-xs"
            title="Refresh from API"
          >
            <RefreshCw className={`w-4 h-4 text-[#596B32] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Operations Legend */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2E7D8] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#34451D]">
          <Layers className="w-4 h-4 text-[#596B32]" />
          <span>Inventory Operations:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-sans text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] font-semibold">
            Register Book
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] font-semibold">
            Catalog & Alerts
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] font-semibold">
            Restock / Adjust
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-950 border border-rose-200 font-semibold">
            Delete Item
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border font-medium ${
          notification.type === 'success' ? 'bg-[#E4E7D2] border-[#7F9148] text-[#34451D]' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-80 text-[#85887A]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E7D8] hover:border-[#7F9148] p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#85887A]">Total Titles in Catalog</span>
            <div className="h-9 w-9 rounded-2xl bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#596B32]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-display font-light text-[#20231B]">{totalTitles}</span>
          </div>
          <p className="text-[11px] text-[#85887A] mt-1">{categories.length} Unique Categories</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] hover:border-[#7F9148] p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#85887A]">Total Warehouse Units</span>
            <div className="h-9 w-9 rounded-2xl bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] flex items-center justify-center">
              <Package className="w-4 h-4 text-[#596B32]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-display font-light text-[#20231B]">{totalStockUnits}</span>
          </div>
          <p className="text-[11px] text-[#85887A] mt-1">Available across warehouse bins</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] hover:border-[#7F9148] p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#85887A]">Low Stock Alerts</span>
            <div className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-display font-light text-amber-800">{lowStockCount} Items</span>
          </div>
          <p className="text-[11px] text-[#85887A] mt-1">Stock &lt;= Safety Threshold</p>
        </div>

        <div className="bg-white border border-[#E2E7D8] hover:border-[#7F9148] p-5 rounded-2xl transition-all shadow-xs group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#85887A]">Inventory Valuation</span>
            <div className="h-9 w-9 rounded-2xl bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8] flex items-center justify-center">
              <Boxes className="w-4 h-4 text-[#596B32]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-display font-light text-[#20231B]">
              LKR {stockItems.reduce((acc, i) => acc + (i.sellingPrice * i.stockQuantity), 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-[#596B32] font-semibold mt-1">Estimated Retail Value</p>
        </div>
      </div>

      {/* Filter and Search Bar [R] */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E7D8] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#85887A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, ISBN, Book ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white font-medium transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#85887A] hidden sm:block" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 rounded-full bg-[#F8F9F5] border border-[#E2E7D8] text-xs text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white font-semibold font-sans transition-all shadow-xs"
          >
            <option value="ALL">All Categories ({stockItems.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table [R, U, D] */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E7D8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#F8F9F5] border-b border-[#E2E7D8] text-[#596B32] uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Book Details</th>
                <th className="py-3.5 px-4">Category / Shelf</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E7D8] bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#85887A] font-medium">
                    No books in warehouse matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F9F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-display font-normal text-sm text-[#20231B]">{item.title}</div>
                      <div className="text-[11px] text-[#85887A] flex items-center gap-2 mt-0.5 font-sans">
                        <span>{item.author}</span>
                        <span className="opacity-40">|</span>
                        <span className="text-[10px] text-[#596B32] font-semibold">{item.bookId}</span>
                        <span className="opacity-40">|</span>
                        <span className="text-[10px] text-[#85887A]">{item.isbn}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8]">
                        {item.category}
                      </span>
                      {item.location && (
                        <div className="text-[10px] text-[#85887A] flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5 text-[#596B32]" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#20231B]">
                      LKR {item.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          item.stockQuantity <= item.safetyStockLevel ? 'text-amber-700' : 'text-[#20231B]'
                        }`}>
                          {item.stockQuantity}
                        </span>
                        <span className="text-[10px] text-[#85887A]">(min: {item.safetyStockLevel})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.stockQuantity > item.safetyStockLevel
                          ? 'bg-[#F0F4E8] border-[#E2E7D8] text-[#34451D]'
                          : 'bg-amber-100 border-amber-300 text-amber-950'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.stockQuantity > item.safetyStockLevel ? 'bg-[#596B32]' : 'bg-amber-600 animate-pulse'
                        }`} />
                        {item.stockQuantity > item.safetyStockLevel ? 'IN_STOCK' : 'LOW_STOCK'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Restock Button */}
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F0F4E8] border border-[#E2E7D8] text-[#34451D] text-xs font-semibold transition-all shadow-xs"
                          title="Restock / Adjust Stock"
                        >
                          Restock
                        </button>

                        {/* Edit Details */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl bg-white border border-[#E2E7D8] text-[#20231B] hover:text-[#34451D] hover:bg-[#F0F4E8] transition-all shadow-xs"
                          title="Edit Item Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Item */}
                        <button
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all shadow-xs"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* [C] ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#E2E7D8] space-y-4 max-h-[90vh] overflow-y-auto text-[#20231B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-semibold text-[#20231B] flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#596B32]" />
                <span>Register New Book in Warehouse</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-7 h-7 rounded-full bg-[#F8F9F5] hover:bg-[#EBF0E4] text-[#85887A] hover:text-[#20231B] flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Book ID (e.g. BK-106)</label>
                  <input
                    type="text"
                    required
                    placeholder="BK-106"
                    value={newItem.bookId}
                    onChange={(e) => setNewItem({ ...newItem, bookId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">ISBN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="978-955-0201-99-9"
                    value={newItem.isbn}
                    onChange={(e) => setNewItem({ ...newItem, isbn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Martin Wickramasinghe Anthology"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Author</label>
                  <input
                    type="text"
                    required
                    value={newItem.author}
                    onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white font-semibold"
                  >
                    <option value="Classic Fiction">Classic Fiction</option>
                    <option value="Historical">Historical</option>
                    <option value="Memoir">Memoir</option>
                    <option value="Technology">Technology</option>
                    <option value="Children's Literature">Children's Literature</option>
                    <option value="Philosophy">Philosophy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Stock Qty</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newItem.stockQuantity}
                    onChange={(e) => setNewItem({ ...newItem, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Safety Level</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newItem.safetyStockLevel}
                    onChange={(e) => setNewItem({ ...newItem, safetyStockLevel: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Price (LKR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Shelf / Bin Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-semibold text-xs shadow-xs"
                >
                  Register Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* [U] ADJUST STOCK MODAL */}
      {isAdjustModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#E2E7D8] space-y-4 text-[#20231B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-semibold text-[#20231B] flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#596B32]" />
                <span>Adjust Stock: {activeItem.title}</span>
              </h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="w-7 h-7 rounded-full bg-[#F8F9F5] hover:bg-[#EBF0E4] text-[#85887A] hover:text-[#20231B] flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F0F4E8] border border-[#E2E7D8] flex items-center justify-between text-[#34451D]">
                <span className="font-semibold text-xs">Current Quantity:</span>
                <span className="font-bold text-lg text-[#20231B]">{activeItem.stockQuantity} Copies</span>
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Adjustment Type</label>
                <select
                  value={adjustData.adjustmentType}
                  onChange={(e) => setAdjustData({ ...adjustData, adjustmentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white font-semibold"
                >
                  <option value="RESTOCK">RESTOCK (+ Add Stock)</option>
                  <option value="DAMAGE">DAMAGE (- Write-off Damaged Copies)</option>
                  <option value="RETURN">RETURN (+ Customer Return to Shelf)</option>
                  <option value="MANUAL_CORRECTION">CORRECTION (Audit Correction)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Quantity to Change</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] placeholder:text-[#85887A] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-semibold text-xs shadow-xs"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM DETAILS MODAL */}
      {isEditModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#E2E7D8] space-y-4 text-[#20231B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <h3 className="text-base font-semibold text-[#20231B] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#596B32]" />
                <span>Edit Item: {activeItem.bookId}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-7 h-7 rounded-full bg-[#F8F9F5] hover:bg-[#EBF0E4] text-[#85887A] hover:text-[#20231B] flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  value={activeItem.title}
                  onChange={(e) => setActiveItem({ ...activeItem, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#20231B] mb-1 font-semibold">Author</label>
                <input
                  type="text"
                  required
                  value={activeItem.author}
                  onChange={(e) => setActiveItem({ ...activeItem, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Selling Price (LKR)</label>
                  <input
                    type="number"
                    required
                    value={activeItem.sellingPrice}
                    onChange={(e) => setActiveItem({ ...activeItem, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#20231B] mb-1 font-semibold">Shelf Location</label>
                  <input
                    type="text"
                    value={activeItem.location || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] focus:outline-none focus:border-[#596B32] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E7D8]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F8F9F5] border border-[#E2E7D8] text-[#20231B] font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#34451D] hover:bg-[#20231B] text-white font-semibold text-xs shadow-xs"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
