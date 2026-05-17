import React, { useState } from 'react'
import api from '../api'

function ManageStock({
  productId,
  supplierId,
  productName,
  supplierName,
  onClose,
  refetch,
}) {
  const [formData, setFormData] = useState({
    receipt_Qty: '',
    sold_Qty: '',
    locked_Qty: '',
    lost_Qty: '',
    unit_cost_price: '',
    unit_selling_price: '',
    remarks: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const transactionType =
    Number(formData.receipt_Qty) > 0
      ? 'RECEIPT'
      : Number(formData.sold_Qty) > 0
      ? 'SALES'
      : Number(formData.locked_Qty) > 0
      ? 'LOCKED'
      : Number(formData.lost_Qty) > 0
      ? 'LOST/DAMAGED'
      : 'ADJUSTMENT'

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const payload = {
        receipt_Qty: Number(formData.receipt_Qty) || 0,
        sold_Qty: Number(formData.sold_Qty) || 0,
        locked_Qty: Number(formData.locked_Qty) || 0,
        lost_Qty: Number(formData.lost_Qty) || 0,
        unit_cost_price: Number(formData.unit_cost_price) || 0,
        unit_selling_price: Number(formData.unit_selling_price) || 0,
        remarks: formData.remarks,
      }

      const res = await api.post(
        `/inventories/${supplierId}/${productId}`,
        payload
      )

      if (res.data) {
        refetch?.()

        setSuccess(true)

        setTimeout(() => {
          onClose?.()
        }, 1800)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping"></div>

            <div className="relative w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Stock Updated
          </h2>

          <p className="mt-3 text-gray-500">
            Inventory updated successfully
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Manage Stock
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Create inventory transaction
          </p>

          {/* Reference Cards */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Product
              </p>

              <p className="font-semibold text-gray-900 text-lg">
                {productName}
              </p>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Supplier
              </p>

              <p className="font-semibold text-gray-900 text-lg">
                {supplierName}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200"
        >
          Close
        </button>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Transaction Type */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Detected Transaction Type
            </p>

            <div className="mt-4 inline-flex items-center px-5 py-3 rounded-full bg-black text-white text-sm font-semibold tracking-wide">
              {transactionType}
            </div>
          </div>

          {/* Quantity Details */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Quantity Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Receipt Quantity"
                name="receipt_Qty"
                value={formData.receipt_Qty}
                onChange={handleChange}
                type="number"
              />

              <InputField
                label="Sold Quantity"
                name="sold_Qty"
                value={formData.sold_Qty}
                onChange={handleChange}
                type="number"
              />

              <InputField
                label="Locked Quantity"
                name="locked_Qty"
                value={formData.locked_Qty}
                onChange={handleChange}
                type="number"
              />

              <InputField
                label="Lost / Damaged Quantity"
                name="lost_Qty"
                value={formData.lost_Qty}
                onChange={handleChange}
                type="number"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Pricing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Unit Cost Price"
                name="unit_cost_price"
                value={formData.unit_cost_price}
                onChange={handleChange}
                type="number"
              />

              <InputField
                label="Unit Selling Price"
                name="unit_selling_price"
                value={formData.unit_selling_price}
                onChange={handleChange}
                type="number"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-lg font-semibold mb-4 text-gray-900">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={6}
              placeholder="Enter transaction remarks..."
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl bg-black text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={0}
        className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
      />
    </div>
  )
}

export default ManageStock