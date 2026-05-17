import React from 'react';
import { useExtraDetails } from '../hooks/useExtraDetails';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export default function OrderView({ _id, onClose }) {
  const extra = useExtraDetails();
  const address = extra.address;
  const supplierId = extra._id;

  const getOrder = async () => {
    const res = await api.get(`/order/${supplierId}/${_id}`);
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', _id, supplierId],
    queryFn: getOrder,
    enabled: !!_id && !!supplierId,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center text-gray-500">
        Loading Order...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center text-red-500">
        Failed to load order
      </div>
    );
  }

  const order = data?.data || {};
  const items = order.items || [];

  const fullAddress = address
    ? `${address.houseNo}, ${address.street}, ${address.city} - ${address.pincode}, ${address.state}`
    : 'N/A';

  return (
    <div className="fixed inset-0 bg-gray-50 text-black overflow-y-auto z-50">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{extra.supplierName}</h1>
            <p className="text-sm text-gray-500 mt-1">{fullAddress}</p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-gray-300 hover:bg-gray-100 transition text-sm font-medium"
          >
            Back
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Document Details */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-5">Document Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard title="Order Origin No" value={order.orderNo} />
            <InfoCard title="Supplier Order No" value={order.supplierOrderNo} />
            <InfoCard
              title="Order Origin Date"
              value={order.createdAt ? new Date(order.createdAt).toLocaleString() : null}
            />
            <InfoCard title="Today's Date" value={new Date().toLocaleString()} />
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-5">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Name" value={order.userName} />
            <InfoCard title="Delivery Address" value={order.deliveryAddress} />
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-5">Order Details</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="pb-3 pr-4 font-medium">#</th>
                  <th className="pb-3 pr-4 font-medium">Item Name</th>
                  <th className="pb-3 pr-4 font-medium text-right">Qty</th>
                  <th className="pb-3 pr-4 font-medium text-right">Unit Price</th>
                  <th className="pb-3 pr-4 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium">{item.name || 'N/A'}</td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right">₹{item.unitPrice}</td>
                    <td className="py-3 pr-4 text-right font-semibold">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'cancelled'
                            ? 'bg-red-100 text-red-500'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={2} className="pt-4 font-semibold text-gray-500 text-sm uppercase tracking-wide">
                    Total
                  </td>
                  <td className="pt-4 text-right font-semibold">{order.totalQty}</td>
                  <td />
                  <td className="pt-4 text-right font-bold text-base">₹{order.totalPrice}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── InfoCard (same as EditProducts) ── */
function InfoCard({ title, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="font-semibold mt-2 text-sm">{value || 'N/A'}</h3>
    </div>
  );
}