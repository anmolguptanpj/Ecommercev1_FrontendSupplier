import React from 'react'
import { useExtraDetails } from '../hooks/useExtraDetails'




function OrderView() {
  const extra = useExtraDetails()
  console.log(extra)
  return (
    <div className='w-full h-full fixed inset-0 bg-white text-black'>
            <div className='w-full flex justify-center text-4xl'>
              <div>{extra.supplierName}</div>
            </div>


                            <div className='flex flex-col '>
                                <div className='
                              flex flex-col'>
                              <p>Document Details</p>
                                <div className='flex justify-between'>
                                  <div className='grid grid-cols-1 grid-rows-2'>
                                <p>Order Origin No: {"Not Available"}</p>
                                <p>Order No : {"Not Available"}</p>
                                </div>
                                  <div className='grid grid-cols-1 grid-rows-2'>
                                <p>Order Origin Date: {"Not Available"}</p>
                                <p>Todays Date: {"Not Available"}</p>
                                </div>
                                </div>
                              </div>

                            <div className='
                            flex flex-col'>
                            <p>  Customer Details</p>
                            <div className='flex  justify-between'>
                              <div className='grid grid-cols-1 grid-rows-2'>
                              <p>Name:{"Not Available"}</p>
                                <p>Address: {"Not Available"}</p>
                              </div>
                              </div>
                              </div>

                              <div>
                                Order Details
                              </div>

                              <table>
                                <thead>
                                  <tr>
                                    <th>Item No</th>
                                    <th>Item Name</th>
                                    <th>Iten Qty</th>
                                    <th>Item Price</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  
                                </tbody>
                              </table>
                  </div>
    </div>
  )
}

export default OrderView