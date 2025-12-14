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
      <div>
        <div> </div>
        <div>
          <form onSubmit={handleBrand}>
            <input type='text' value={brand} onChange={(e)=>setBrand(e.target.value)}/>
            <button type='submit'>{isCreatingBrand ? 'Creating...' : 'Create Brand'} </button>
            {createBrandIsError && (<p>Error : {createBrandError?.message || 'Error creating category'}</p>)}

            
          </form>
        </div>
      </div>
    </div>
  )
}

export default Brands