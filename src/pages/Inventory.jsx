import React from 'react'
import { useExtraDetails } from '../hooks/useExtraDetails'
import { useQuery } from '@tanstack/react-query';
import api from '../api';

function Inventory() {

  const extra = useExtraDetails()
  const id = extra?._id
  console.log(id)

  const getInventories = async () => {
    const res = await api.get(`/inventories/${id}`);
    console.log("api hit")
    return res.data

   
  }

   const {data,isLoading,isError} = useQuery({
      queryKey:["inventories",id],
      queryFn:getInventories,
      enabled:!!id
    })

     if(isLoading) return <p>Loading Inventories....</p>
    if(isError) return <p>Fetching Inventories failed</p>

    const inventories = data || []

    console.log(inventories)
  return (
    


      // Body
                <div className = "w-full justify-center py-5 flex ">
                  {/* table body */}
                                    <table className=''>
                                     <thead>
                                            <tr className='flex gap-3 '>
                                                    <th>Product Code</th>
                                                    <th>Product Name</th>
                                                    <th>Opening Inventory</th>
                                                    <th>Receipt</th>
                                                    <th>Sales</th>
                                                    <th>Locked</th>
                                                    <th>Lost</th>
                                                    <th>Available</th>
                                                    <th>Operations</th>
                                            </tr>
                                     </thead>
                                      <tbody>
                                            <tr>
                                              
                                            </tr>
                                      </tbody>
                                    </table>
                </div>
  )
}

export default Inventory