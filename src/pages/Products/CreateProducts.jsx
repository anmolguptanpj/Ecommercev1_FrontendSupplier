import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useExtraDetails } from '../../hooks/useExtraDetails'
import api from '../../api'
import { useNavigate } from 'react-router-dom'

function CreateProducts({ onClose }) {
  const extra = useExtraDetails()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    discount: '',
    brand: '',
    category: '',
    subCategory: '',
    unit: '',
    images: [],
    mrp: '',
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await api.get('/brands')).data.data,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.data,
  })

  const { data: subCategories } = useQuery({
    queryKey: ['subCategories', form.category],
    enabled: !!form.category,
    queryFn: async () =>
      (await api.get(`/categories/${form.category}/subcategories`)).data.data,
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files)

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const createProductMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData()

      const supplier = extra?._id
      data.append('supplier', supplier)

      Object.keys(form).forEach((key) => {
        if (key === 'images') {
          form.images.forEach((file) => {
            data.append('images', file)
          })
        } else {
          data.append(key, form[key])
        }
      })

      return api.post('/products/create', data)
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['products'])

      setForm({
        name: '',
        discount: '',
        brand: '',
        category: '',
        subCategory: '',
        unit: '',
        mrp: '',
        images: [],
      })

      navigate('/products')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createProductMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto text-black">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Product</h1>

          <p className="text-sm text-gray-500 mt-1">
            Add a new product to inventory
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Back
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-8"
      >
        {/* Basic Details */}
        <div>
          <h2 className="text-lg font-semibold mb-5">
            Product Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Unit
              </label>

              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g KG, PCS"
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                MRP
              </label>

              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                placeholder="Enter MRP"
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Discount %
              </label>

              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                placeholder="Enter discount"
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Selling Price
              </label>

              <input
                readOnly
                value={
                  form.mrp
                    ? form.mrp * ((100 - form.discount) / 100)
                    : ''
                }
                className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div>
          <h2 className="text-lg font-semibold mb-5">
            Product Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Brand
              </label>

              <select
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              >
                <option value="">Select Brand</option>

                {brands?.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              >
                <option value="">Select Category</option>

                {categories?.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500">
                Sub Category
              </label>

              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
              >
                <option value="">Select Sub Category</option>

                {subCategories?.map((sc) => (
                  <option
                    key={sc._id}
                    value={sc._id}
                  >
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-lg font-semibold mb-5">
            Product Images
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="mb-4"
            />

            <p className="text-sm text-gray-500">
              Upload multiple product images
            </p>

            {form.images.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {form.images.map((img, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-sm"
                  >
                    {img.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition"
          >
            {createProductMutation.isPending
              ? 'Creating...'
              : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProducts