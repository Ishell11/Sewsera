// src/app/pages/seller/SellerDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Layout } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const C = { primary: '#C4623F', dark: '#1A2B3C', teal: '#2A9D8F', gold: '#C89558', bg: '#F5F0E8' };

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  processing: { label: 'Processing', color: C.teal, bg: '#E8F8F6' },
  shipped: { label: 'Shipped', color: '#3B82F6', bg: '#EFF6FF' },
  delivered: { label: 'Delivered', color: '#10B981', bg: '#ECFDF5' },
};

interface Order {
  id: string;
  product: string;
  customer: string;
  quantity: number;
  total: number;
  status: string;
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  status: string;
}

// Monthly sales data (can be computed from orders or stored separately)
const SALES_DATA = [
  { month: 'Jan', sales: 42000 },
  { month: 'Feb', sales: 38000 },
  { month: 'Mar', sales: 51000 },
  { month: 'Apr', sales: 47000 },
  { month: 'May', sales: 62000 },
  { month: 'Jun', sales: 58000 },
];

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalSales = SALES_DATA.reduce((s, d) => s + d.sales, 0);
  const lowStock = inventory.filter(i => i.status === 'low_stock').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  useEffect(() => {
    if (!currentUser?.uid) return;
    const fetchSellerData = async () => {
      try {
        // Fetch orders for this seller
        const ordersQuery = query(collection(db, 'orders'), where('sellerId', '==', currentUser.uid));
        const ordersSnap = await getDocs(ordersQuery);
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersList);

        // Fetch inventory for this seller
        const inventoryQuery = query(collection(db, 'inventory'), where('sellerId', '==', currentUser.uid));
        const inventorySnap = await getDocs(inventoryQuery);
        const inventoryList = inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventory(inventoryList);
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-2xl mx-auto md:max-w-4xl px-4 md:px-8 py-5">
        {/* Welcome */}
        <div className="mb-5">
          <p className="text-sm text-gray-500">Good day,</p>
          <h2 className="text-xl" style={{ color: C.dark }}>Welcome, {currentUser?.name?.split(' ')[0]}!</h2>
        </div>

        {/* Alert */}
        {(lowStock > 0 || pendingOrders > 0) && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              {lowStock > 0 && `${lowStock} item(s) low in stock. `}
              {pendingOrders > 0 && `${pendingOrders} order(s) awaiting confirmation.`}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Revenue', value: `₱${totalSales.toLocaleString()}`, icon: <TrendingUp size={18} />, color: C.primary, bg: '#FDF5F2' },
            { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={18} />, color: C.teal, bg: '#E8F8F6' },
            { label: 'Products', value: inventory.length, icon: <Package size={18} />, color: C.dark, bg: '#F5F0E8' },
            { label: 'Low Stock', value: lowStock, icon: <AlertTriangle size={18} />, color: '#F59E0B', bg: '#FFFBEB' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-xl" style={{ color: C.dark }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: C.dark }}>Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">₱{totalSales.toLocaleString()} total this year</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs flex items-center gap-1">
              <TrendingUp size={11} /> +18%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={SALES_DATA}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="sales" stroke={C.primary} strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: C.dark }}>Recent Orders</h3>
            <button onClick={() => navigate('/seller/orders')} className="flex items-center gap-1 text-sm" style={{ color: C.primary }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map(o => {
              const cfg = STATUS_CONFIG[o.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm truncate" style={{ color: C.dark }}>{o.product}</p>
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{o.customer} · {o.quantity}</p>
                    <p className="text-xs mt-1" style={{ color: C.primary }}>₱{o.total.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}