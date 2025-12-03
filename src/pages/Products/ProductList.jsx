import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useExtraDetails } from '../../hooks/useExtraDetails'
import api from '../../api'



function ProductList() {
  const navigate = useNavigate()
  const extra = useExtraDetails()

  const id=extra?._id


  const getProducts = async ( ) => {
    const res = await api.get(`/${id}/products`);

    return res.data
  }
  
  const {data , isLoading , isError} = useQuery({ 
    queryKey:["products",id],
    queryFn:getProducts,
    enabled: !!id
  })

  if(isLoading) return <p>Loading Products....</p>
  if(isError) return <p>Fetching products failed</p>

  const products = data?.data

  

  






  return (
   <div className='flex flex-col ' id='fullBody'>
                        <div className='flex flex-col justify-center items-center h-20' id='productListHeader'>
                          <p className='text-center font-bold'>Product</p>
                        </div>
                        
                        <div id='secondheader' className='flex w-full justify-center'>
                                        <form className='flex justify-center w-full gap-3 '>
                                          <div className=' flex items-center  gap-2'>
                                          <label> From:
                                          </label>
                                          <input className='border px-1' type='date'/>
                                        </div >
                                          <div className=' items-center flex gap-2'>
                                          <label> To :
                                          </label>
                                          <input className='border px-1 ' type='date'/>
                                        </div >
                                        <div className= '  gap-2 flex justify-center items-center'>
                                          <label>Alphabetical</label>
                                          <input type='checkbox'/>
                                        </div>
                                        <div>
                                          <button>Search</button>
                                        </div>
                                        </form>
                        </div>

            <div id='thirdproductlistbody' className='w-full flex p-10 flex-row justify-center overflow-y-auto'>
                  <div>
                      <div>
                              
                                          <table className='' >
                                                    <tbody>
                                                                  <tr className=''>
                                                                            <th className="px-4 py-2 border ">
                                                                              PRODUCT CODE 
                                                                            </th>
                                                                            <th className="px-4 py-2 border " >
                                                                              PRODUCT NAME
                                                                            </th >
                                                                            <th className="px-4 py-2 border ">
                                                                              Brand
                                                                            </th>
                                                                             <th className="px-4 py-2 border ">
                                                                              Sub Category
                                                                            </th>
                                                                            <th className="px-4 py-2 border ">
                                                                              DATE CREATED
                                                                            </th>
                                                                            <th className="px-4 py-2 border ">
                                                                              IS ACTIVE
                                                                            </th>
                                                                            <th className="px-4 py-2 border ">
                                                                              ACTIONS
                                                                            </th>
                                                                  
                                                                  </tr>

                                                                  {
                                                                    products.map((p)=>(
                                                                      <tr key={p.id} >
                                                                                <td className="px-4 text-center py-5 border ">
                                                                                    {p.productNo}
                                                                                </td>
                                                                                 <td className="px-10 text-center py-2 border ">
                                                                                    {p.name}
                                                                                </td>
                                                                                 <td className="px-4 text-center py-2 border ">
                                                                                    {p.brand?.name}
                                                                                  </td>
                                                                                   <td className="px-4 text-center py-2 border ">
                                                                                    {p.subCategory?.name}
                                                                                  </td>
                                                                                   <td className="px-4 text-center py-2 border ">
                                                                                    {new Date(p.createdAt).toLocaleDateString()}
                                                                                  </td>
                                                                                   <td className="px-4 text-center py-2 border ">
                                                                                    {p.isActive ?  <p>Active</p> : <p>Inactive</p>}
                                                                                  </td>
                                                                                   <td className="px-4 text-center py-2 border ">
                                                                                  <button onClick={()=>navigate(`/products/${p.id}`)} className="px-2 py-1 rounded bg-blue-500 ">Manage</button>
                                                                                  </td>
                                                                      </tr>
                                                                    ))
                                                                  }
                                                      </tbody>
                                          </table>
                                  
                      </div>
                  </div>

            </div>

    
    
   </div>
  )
}

export default ProductList