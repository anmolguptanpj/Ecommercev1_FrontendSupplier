import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

export default function Categories({ onClose }) {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  /* ── Fetch categories ── */
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  /* ── Create category ── */
  const {
    mutate: createCategory,
    isLoading: isCreatingCategory,
    isError: createCategoryIsError,
    error: createCategoryError,
  } = useMutation({
    mutationFn: async (newCategory) => {
      return await api.post('/categories', newCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setCategory('');
    },
  });

  /* ── Create subcategory ── */
  const {
    mutate: createSubCategory,
    isLoading: isCreatingSub,
    isError: createSubIsError,
    error: createSubError,
  } = useMutation({
    mutationFn: async ({ parentId, name }) => {
      return await api.post(`/categories/${parentId}/subcategories`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setSubCategory('');
      setParentCategoryId('');
    },
  });

  const handleCategory = (e) => {
    e.preventDefault();
    if (!category.trim()) return;
    createCategory({ name: category.trim() });
  };

  const handleSubCategory = (e) => {
    e.preventDefault();
    if (!parentCategoryId) return alert('Please select a parent category');
    if (!subCategory.trim()) return;
    createSubCategory({ parentId: parentCategoryId, name: subCategory.trim() });
  };

  return (
    <div className="fixed w-full overflow-y-auto inset-0 bg-gray-50 text-black">

      {/* ── HEADER ── */}
      <div className=" w-full flex justify-center items-center   bg-white border-b border-gray-200">
      
          <div className="w-[75%] mx-auto px-6 py-5">
          <h1 className="text-3xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage categories and sub-categories</p>

          
        </div>
         
       
       <div className='w-[25%] flex justify-start items-center'>
         <button
            onClick={onClose}
            type="button"
            className="px-5  py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Back
          </button>
       </div>
      
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl flex justify-evenly mx-auto p-6 space-y-6">

        {/* Create Category */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-5">Create Category</h2>

          <form onSubmit={handleCategory} className="space-y-5">
            <div>
              <label className="text-sm text-gray-500">Category Name</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electronics"
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition text-sm"
              />
            </div>

            <div className="h-5">
              {createCategoryIsError && (
                <p className="text-red-500 text-sm">
                  {createCategoryError?.message || 'Error creating category'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingCategory}
              className="w-full px-5 py-2.5 rounded-2xl bg-black text-white hover:opacity-90 transition font-medium text-sm disabled:opacity-50"
            >
              {isCreatingCategory ? 'Creating…' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Create Sub Category */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-5">Create Sub Category</h2>

          <form onSubmit={handleSubCategory} className="space-y-5">
            {/* Parent category select */}
            <div>
              <label className="text-sm text-gray-500">Parent Category</label>
              <select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition text-sm bg-white appearance-none"
              >
                <option value="">
                  {categoriesLoading ? 'Loading…' : 'Select a category'}
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub category name */}
            <div>
              <label className="text-sm text-gray-500">Sub Category Name</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Mobile Phones"
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition text-sm"
              />
            </div>

            <div className="h-5">
              {createSubIsError && (
                <p className="text-red-500 text-sm">
                  {createSubError?.message || 'Error creating subcategory'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingSub}
              className="w-full px-5 py-2.5 rounded-2xl bg-black text-white hover:opacity-90 transition font-medium text-sm disabled:opacity-50"
            >
              {isCreatingSub ? 'Creating…' : 'Create Sub Category'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}