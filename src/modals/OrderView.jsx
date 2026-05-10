import React from 'react'
import { useExtraDetails } from '../hooks/useExtraDetails'
import { useQuery } from '@tanstack/react-query'
import api from '../api'




function OrderView({_id,onClose}) {
  const extra = useExtraDetails()
  const address = extra.address
  const supplierId = extra._id
  console.log(_id)
  console.log(supplierId)

  const getOrder = async () => {
    const res = await api.get(`/order/${supplierId}/${_id}`)
    return res.data
  }

  const {data,isLoading,isError} = useQuery({
    queryKey:["order",_id,supplierId],
    queryFn:getOrder,
    enabled: !!_id && !!supplierId
  })

  if(isLoading) return <p>Loading Order...</p>
  if(isError) return <p> Fetching Order failed</p>
  const order = data?.data || []
  const items = order.items



  return (
    <div className='w-full h-full fixed inset-0 bg-white text-black'>
            <div className='w-full flex flex-col items-center justify-center text-4xl'>
              <div className='text-4xl'>{extra.supplierName}</div>
              <div className='text-xl'>{`${address.houseNo},${address.street},${address.city}-${address.pincode},${address.state}`}</div>
            </div>


                            <div className='flex flex-col '>
                                <div className='
                              flex flex-col'>
                              <p>Document Details</p>
                                <div className='flex justify-between px-2'>
                                  <div className='grid grid-cols-2 grid-rows-2'>
                                <p>Order Origin No:</p><p>{order.orderNo||"Not Available"}</p>
                                <p>Order No :</p><p>{order.supplierOrderNo||"Not Available"}</p>
                                </div>
                                  <div className='grid grid-cols-2 grid-rows-2'>
                                <p>Order Origin Date:</p><p> { new Date(order.createdAt).toLocaleString() || "Not Available"}</p>
                                <p>Todays Date:</p><p> {(new Date).toLocaleString()}</p>
                                </div>
                                </div>
                              </div>

                            <div className='
                            flex flex-col'>
                            <p>  Customer Details</p>
                            <div className='flex  justify-between px-2 '>
                              <div className='grid grid-cols-2 grid-rows-2'>
                              <p>Name:</p><p>{order.userName||"Not Available"}</p>
                              <p>Address:</p><p>{order.deliveryAddress || "Not Available"}</p>
                              </div>
                              </div>
                              </div>

                              <div>
                                Order Details
                              </div>

                              <table>
                                <thead>
                                  <tr className='w-full grid grid-cols-6 ' >
                                    <th>Item No</th>
                                    <th>Item Name</th>
                                    <th>Item Qty</th>
                                    <th>Item Price</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                 {items.map((i,index)=>(<>
                                 <tr className='w-full grid grid-cols-6 ' key={items._id}>
                                  {index+1}
                                 <td>
                                  {i.name}
                                 </td>
                                 <td>
                                  {i.quantity}
                                 </td>
                                 <td>
                                  {i.unitPrice}
                                 </td>
                                 <td>
                                  {i.quantity * i.unitPrice}
                                 </td>
                                 <td>
                                  {i.status || "pending"}
                                 </td>
                                 </tr>
                                 </>))}
                                 <tr className='grid grid-cols-3 grid-rows-1' >
                                  <th className='grid grid-cols-2'>
                                    Total
                                  </th>
                                  <td className='grid grid-cols-1'>
                                   {order.totalQty}
                                  </td>
                                  <td className='grid grid-cols-1'>
                                  {order.totalPrice}
                                  </td>
                                 </tr>
                                </tbody>
                              </table>
                  </div>

                  <div className='flex justify-end p-6 '>
                    <button onClick={onClose}
                    className='bg-green-500 px-2 py-1 rounded-xl'>Back</button>
                  </div>
    </div>
  )
}

export default OrderView