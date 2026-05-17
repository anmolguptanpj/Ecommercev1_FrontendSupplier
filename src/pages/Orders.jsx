import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useExtraDetails } from '../hooks/useExtraDetails';
import api from '../api';
import OrderView from '../modals/OrderView';

export default function Orders() {
  const [orderId, setOrderId] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);

  const extra = useExtraDetails();
  const id = extra?._id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await api.get(`/${id}/orders`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading Orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Failed to load orders
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <div className="w-full bg-gray-50 text-black">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here once placed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-left">
                    <th className="px-6 py-4 font-medium whitespace-nowrap">#</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Order No</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Order ID</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Delivery Address</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Payment</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o, index) => (
                    <tr key={o._id || o.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{o.supplierOrderNo || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{o.orderNo || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium">{o.userName || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{o.userId}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="truncate text-gray-600">{o.deliveryAddress || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          value={o.paymentStatus}
                          colorMap={{
                            paid: 'bg-green-100 text-green-700',
                            pending: 'bg-yellow-100 text-yellow-700',
                            failed: 'bg-red-100 text-red-500',
                          }}
                          fallback="Not defined"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          value={o.status}
                          colorMap={{
                            delivered: 'bg-green-100 text-green-700',
                            cancelled: 'bg-red-100 text-red-500',
                            processing: 'bg-blue-100 text-blue-600',
                          }}
                          fallback="Pending"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setOrderId(o._id);
                            setOrderOpen(true);
                          }}
                          className="px-4 py-2 rounded-2xl bg-black text-white text-xs font-medium hover:opacity-80 transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── ORDER MODAL ── */}
      {orderId && orderOpen && (
        <OrderView _id={orderId} onClose={() => setOrderOpen(false)} />
      )}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ value, colorMap, fallback }) {
  const label = value || fallback;
  const colorClass = colorMap[value?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {label}
    </span>
  );
}