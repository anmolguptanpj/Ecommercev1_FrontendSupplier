import { useQueryClient, useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import api from '../../api'

function Brands() {

  const[brand,setBrand] = useState("");

  const queryClient = useQueryClient()

  const {
    mutate : createBrand,
    isLoading : isCreatingBrand,
    isError : createBrandIsError,
    error: createBrandError
  } = useMutation({
    mutationFn: async(newBrand) =>{
    return await api.post('/brands',newBrand)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['brands'])
      setBrand('')
    }

  })

  const handleBrand = (e) => {
    e.preventDefault();
      if(!brand.trim()) return
      createBrand({name:brand.trim()})
  }
  return (
    <div>
      <div className='w-full flex justify-center'>
        <div className=''>
          <form className='p-4' onSubmit={handleBrand}>
          <fieldset className='p-5 border-3'>
            <legend>Brand</legend>
             <label>Brand:</label>
       
             
             <div className='border-2'> <input className='w-100 focus:outline-none' type='text' value={brand} onChange={(e)=>setBrand(e.target.value)}/></div>
           <div className='w-100 flex justify-center p-3'> <button className=' px-2 rounded-xl bg-green-500 hover:bg-blue-500' type='submit'>{isCreatingBrand ? 'Creating...' : 'Create Brand'} </button></div>
           <div className='h-5 w-100'> {createBrandIsError && (<p>Error : {createBrandError?.message || 'Error creating category'}</p>)}</div>
          

          </fieldset>
            
          </form>
        </div>
      </div>
    </div>
  )
}

export default Brands