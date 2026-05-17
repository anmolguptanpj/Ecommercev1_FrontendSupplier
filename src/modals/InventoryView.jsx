import React, { useState } from 'react'
import { useExtraDetails } from '../hooks/useExtraDetails'
import { useQuery } from '@tanstack/react-query'
import api from '../api'
import ManageStock from './ManageStock'
import Inventory from '../pages/Inventory'

function InventoryView({ _id, onClose }) {
  const extra = useExtraDetails()
  const supplierId = extra?._id

  const[manegeStockOpen,setManageStockOpen]=useState(false)

  const getInventoryRecords = async () => {
    const res = await api.get(`/inventories/${supplierId}/${_id}`)
    return res.data
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventories', _id, supplierId],
    queryFn: getInventoryRecords,
    enabled: !!_id && !!supplierId,
  })

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center text-gray-500">
        Loading Records...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center text-red-500">
        Failed to fetch records
      </div>
    )
  }

  const records = data?.data || {}

  const product = records?.productInfo
  const supplier = records?.supplierInfo
  const inventory = records?.cleanTransactions || []

  console.log(inventory)

  const latest = inventory[0] || {}

  const StatCard = ({ title, value }) => (
    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-semibold mt-1">{value}</h3>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto text-black">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {product?.name || 'Inventory'}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Supplier : {supplier?.supplierName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={()=>{setManageStockOpen(true);}} className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition">
            Manage Stock
          </button>
          {manegeStockOpen && (supplier && _id) && <ManageStock productName={product.name} supplierName={supplier.supplierName} productId={_id} supplierId={supplier._id} onClose={()=>setManageStockOpen(false)} />}


          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="p-6 space-y-8">
        {/* Summary Cards */}
       
        {/* Transactions Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Inventory Transactions
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Complete stock movement history
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Total Rows : {inventory.length}
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className=" sm-overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr className="text-left">
                     <th className="px-4 py-4 font-medium">Date</th>
                    <th className="px-4 py-4 font-medium">Type</th>
                    <th className="px-4 py-4 font-medium">Opening</th>
                    <th className="px-4 py-4 font-medium">Receipt</th>
                    <th className="px-4 py-4 font-medium">Sold</th>
                    <th className="px-4 py-4 font-medium">Locked</th>
                    <th className="px-4 py-4 font-medium">Lost</th>
                    <th className="px-4 py-4 font-medium">Available</th>
                    <th className="px-4 py-4 font-medium">Revenue</th>
                    <th className="px-4 py-4 font-medium">Cost</th>
                    <th className="px-4 py-4 font-medium">Profit</th>
                    <th className="px-4 py-4 font-medium">Remarks</th>
                   
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                           <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-black text-white">
                          {item.type}
                        </span>
                      </td>

                      <td className="px-4 py-4">{item.opening_Qty}</td>

                       <td className="px-4 py-4">{item.receipt_Qty}</td>

                       <td className="px-4 py-4">{item.sold_Qty}</td>
                       <td className="px-4 py-4">{item.locked_Qty}</td>
                       <td className="px-4 py-4">{item.lost_Qty}</td>

                      <td className="px-4 py-4 font-medium">
                        {item.available_Qty}
                      </td>

                      

                      
                      <td className="px-4 py-4">
                        ₹{item.total_revenue}
                      </td>
                      

                     

                      <td className="px-4 py-4">
                        ₹{item.total_cost}
                      </td>

                     

                      <td className="px-4 py-4 font-semibold">
                        ₹{item.total_profit}
                      </td>

                      <td className="px-4 py-4 min-w-[200px] text-gray-600">
                        {item.remarks}
                      </td>

                     
                    </tr>
                  ))}

                  {inventory.length === 0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-10 text-gray-400"
                      >
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryView