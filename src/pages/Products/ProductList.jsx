import React from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useExtraDetails } from '../../hooks/useExtraDetails'
import api from '../../api'
import CreateProducts from './CreateProducts'

function ProductList() {
  const extra = useExtraDetails()
  const[createProductOpen,setCreateProductOpen]=useState(false)
  const navigate = useNavigate()

  const id = extra?._id

  const getProducts = async () => {
    const res = await api.get(`/${id}/products`)
    return res.data
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', id],
    queryFn: getProducts,
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading Products...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Fetching products failed
      </div>
    )
  }

  const products = data?.data || []

  return (
    <div className="flex flex-col w-full h-full bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 bg-white sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all your products inventory
            </p>
          </div>

          <button
            onClick={() =>setCreateProductOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition"
          >
            Create Product
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500">From</label>

            <input
              type="date"
              className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500">To</label>

            <input
              type="date"
              className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-3 pb-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
            />

            <label className="text-sm text-gray-600">
              Alphabetical
            </label>
          </div>

          <button className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    PRODUCT CODE
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    PRODUCT NAME
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    BRAND
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    SUB CATEGORY
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    DATE CREATED
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    STATUS
                  </th>

                  <th className="px-5 py-4 font-medium whitespace-nowrap">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      {p.productNo}
                    </td>

                    <td className="px-5 py-4 font-medium whitespace-nowrap">
                      {p.name}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {p.brand?.name || 'N/A'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {p.subCategory?.name || 'N/A'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {p.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-black text-white">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs border border-gray-300 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {createProductOpen && (
  <CreateProducts
    onClose={() => setCreateProductOpen(false)}
  />
)}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-gray-400"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList