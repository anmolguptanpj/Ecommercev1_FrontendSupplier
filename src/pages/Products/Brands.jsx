import { useQueryClient, useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import api from '../../api';

export default function Brands({onClose}) {
  const [brand, setBrand] = useState('');

  const queryClient = useQueryClient();

  const {
    mutate: createBrand,
    isLoading: isCreatingBrand,
    isError: createBrandIsError,
    error: createBrandError,
  } = useMutation({
    mutationFn: async (newBrand) => {
      return await api.post('/brands', newBrand);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
      setBrand('');
    },
  });

  const handleBrand = (e) => {
    e.preventDefault();
    if (!brand.trim()) return;
    createBrand({ name: brand.trim() });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 text-black">

      {/* ── HEADER ── */}
      <div className="flex w-full justify-center items-center bg-white border-b border-gray-200">
        <div className="w-[75%] mx-auto px-6 py-5">
          <h1 className="text-3xl font-semibold">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage product brands</p>
        </div>
        <div className='w-[25%]'>
           <button
            onClick={onClose}
            type="button"
            className="px-5  py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 "
          >
            Back
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-5">Create Brand</h2>

          <form onSubmit={handleBrand} className="space-y-5">
            {/* Input */}
            <div>
              <label className="text-sm text-gray-500">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike, Apple, Samsung"
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition text-sm"
              />
            </div>

            {/* Error */}
            <div className="h-5">
              {createBrandIsError && (
                <p className="text-red-500 text-sm">
                  {createBrandError?.message || 'Error creating brand'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isCreatingBrand}
              className="w-full px-5 py-2.5 rounded-2xl bg-black text-white hover:opacity-90 transition font-medium text-sm disabled:opacity-50"
            >
              {isCreatingBrand ? 'Creating…' : 'Create Brand'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}