import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api'

export default function Categories() {
  const queryClient = useQueryClient()
  const inputS=""
  const select=""
  const labels=""
  const buttonS=""

  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')

  // Fetch categories (default to empty array so .map is safe)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data
    }
  })

  // Create category mutation
  const {
    mutate: createCategory,
    isLoading: isCreatingCategory,
    isError: createCategoryIsError,
    error: createCategoryError
  } = useMutation({
    mutationFn: async (newCategory) => {
      // accept variables passed to mutate()
      return await api.post('/categories', newCategory)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      setCategory('')
    }
  })

  // Create subcategory mutation
  const {
    mutate: createSubCategory,
    isLoading: isCreatingSub,
    isError: createSubIsError,
    error: createSubError
  } = useMutation({
    mutationFn: async ({ parentId, name }) => {
      return await api.post(`/categories/${parentId}/subcategories`, { name })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      setSubCategory('')
      setParentCategoryId('')
    }
  })

  const handleCategory = (e) => {
    e.preventDefault()
    if (!category.trim()) return
    createCategory({ name: category.trim() })
  }

  const handleSubCategory = (e) => {
    e.preventDefault()
    if (!parentCategoryId) return alert('Please select a parent category')
    if (!subCategory.trim()) return
    createSubCategory({ parentId: parentCategoryId, name: subCategory.trim() })
  }

  return (
    <div className="p-4 w-full flex-col flex items-center">
      <div className="mb-6">
        <form onSubmit={handleCategory}>
          <fieldset>
            <legend>Category</legend>
            <label htmlFor="category-input">Create Category</label>
            <br />
            <input
              id="category-input"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics"
            />
            <br />
            <button type="submit" disabled={isCreatingCategory}>
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </button>
            {createCategoryIsError && (
              <p>Error: {createCategoryError?.message || 'Error creating category'}</p>
            )}
          </fieldset>
        </form>
      </div>

      <div>
        <form onSubmit={handleSubCategory}>
          <fieldset>
            <legend>Sub Category</legend>
            <select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <br />
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Mobile Phones"
            />
            <br />
            <button type="submit" disabled={isCreatingSub}>
              {isCreatingSub ? 'Creating...' : 'Create Sub Category'}
            </button>
            {createSubIsError && (
              <p>Error: {createSubError?.message || 'Error creating subcategory'}</p>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  )
}
