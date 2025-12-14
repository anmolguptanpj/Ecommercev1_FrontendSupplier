import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api'

export default function Categories() {
  const queryClient = useQueryClient()
  const inputS="focus:outline-none border-b-2 w-100"
  const select="focus:outline-none border-b-2 w-100"
  const labels=""
  const buttonS="hover:bg-green-500 px-1 text-center w-40 rounded-xl"
  const optionS="bg-blue-950"
  const legends="font-bold border-b-4 "

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
    <div className="p-4   w-full flex-col flex items-center">
      <div className="mb-6">
        <form onSubmit={handleCategory}>
          <fieldset className='border-2 p-5' >
            <legend className={legends}>Category</legend>
            <label className={labels} htmlFor="category-input">Create Category</label>
            <br />
            <input
              className={inputS}
              id="category-input"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics"
            />
            <br/>
          <div className='flex w-100 justify-center p-5'>
               <button className={`${buttonS} bg-emerald-500`} type="submit" disabled={isCreatingCategory}>
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </button>
          </div>
            {createCategoryIsError && (
              <p>Error: {createCategoryError?.message || 'Error creating category'}</p>
            )}
          </fieldset>
        </form>
      </div>

      <div className='p-5'>
        <form onSubmit={handleSubCategory}>
          <fieldset className='border-2 p-5'>
            <legend className={legends} >Sub Category</legend>
            <select
              className={select}
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
            >
              <option className={optionS} value="">Select Category</option>
              {categories.map((c) => (
                <option className={optionS} key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <br />
            <input
            className={inputS}
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Mobile Phones"
            />
            <br />
         <div  className='flex w-100 justify-center p-5' >
             <button className={`${buttonS} bg-emerald-500`} type="submit" disabled={isCreatingSub}>
              {isCreatingSub ? 'Creating...' : 'Create Sub Category'}
            </button>
         </div>
            {createSubIsError && (
              <p>Error: {createSubError?.message || 'Error creating subcategory'}</p>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  )
}
