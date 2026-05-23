import React, { useState } from 'react';
import { useExtraDetails } from '../hooks/useExtraDetails';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import InventoryView from '../modals/InventoryView';

export default function Inventory() {
  const extra = useExtraDetails();
  const id = extra?._id;

  const [recordsOpen, setRecordsOpen] = useState(false);
  const [inventoryId, setInventoryId] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventories', id],
    queryFn: async () => {
      const res = await api.get(`/inventories/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading Inventories...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Failed to load inventories
      </div>
    );
  }

  const inventories = data?.data || [];

  console.log(inventories[0])

  const cols = [
    { label: 'Product Code',          key: 'productCode',          align: 'left'  },
    { label: 'Product Name',           key: 'productName',          align: 'left'  },
    { label: 'Opening',                key: 'opening_Qty',          align: 'right' },
    { label: 'Receipt',                key: 'receipt_Qty',          align: 'right' },
    { label: 'Receipt Cost',           key: 'total_cost',   align: 'right', currency: true },
    { label: 'Sales',                  key: 'sales_Qty',            align: 'right' },
    { label: 'Revenue',                key: 'total_revenue',     align: 'right', currency: true },
    { label: 'Locked',                 key: 'locked_Qty',           align: 'right' },
    { label: 'Lost',                   key: 'lost_Qty',             align: 'right' },
    { label: 'Profit/(- Loss)',        key: 'total_profit',             align: 'right' },
    { label: 'Available',              key: 'available_Qty',          align: 'right' },
    { label: 'Remaining Goods Value',  key: 'stock_value',  align: 'right', currency: true },
  ];

  return (
    <div className="w-full bg-gray-50 text-black">

       {/* ── HEADER ── */}
    <div className="">
      <div className="bg-white border border-gray-200  p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track available stock, sales, revenue, and remaining inventory value
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold text-black">
            {inventories.length}
          </p>
        </div>
      </div>
    </div>

      {/* ── BODY ── */}
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">

          {inventories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg font-medium">No inventory records</p>
              <p className="text-sm mt-1">Records will appear here once added</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    {cols.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-4 font-medium whitespace-nowrap ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventories.map((d) => (
                    <tr
                      key={d.productId || d.id}
                      onClick={() => {
                        setInventoryId(d.productId);
                        setRecordsOpen(true);
                      }}
                      className="hover:bg-gray-50 cursor-pointer transition group"
                    >
                      {cols.map((col) => {
                        const val = d[col.key];
                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-3.5 whitespace-nowrap ${
                              col.align === 'right' ? 'text-right' : 'text-left'
                            } ${
                              col.key === 'productName'
                                ? 'font-medium max-w-xs truncate'
                                : col.key === 'productCode'
                                ? 'text-gray-500 font-mono text-xs'
                                : 'text-gray-700'
                            }`}
                          >
                            {col.currency
                              ? `₹${Number(val ?? 0).toLocaleString()}`
                              : (val ?? '—')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── INVENTORY MODAL ── */}
      {inventoryId && recordsOpen && (
        <InventoryView _id={inventoryId} onClose={() => setRecordsOpen(false)} />
      )}
    </div>
  );
}