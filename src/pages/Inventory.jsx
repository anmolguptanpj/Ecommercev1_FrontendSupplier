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

    const inventories = data?.data || []
    console.log(inventories)
   

    const productcodeStyle ="w-10 text-center"
    const productStyle = "w-60 text-center"
    const openingInventoryStyle = "w-15  text-center"
    const receiptStyle = "w-15  text-center"
    const salesStyle = "w-15  text-center "
    const lockedStyle = "w-15  text-center"
    const lostStyle = "w-15  text-center"
    const availableStyle = "w-20 text-center"
    const operationsStyle = "w-30  text-center"
    const cost = "w-30 text-center"
  return (
    


      // Body
                <div className = "w-full justify-center py-5 flex ">
                  {/* table body */}
                                    <table className=''>
                                     <thead>
                                            <tr className='px-2 flex gap-3 w-260 bg-black'>
                                                    <th className={`${productcodeStyle} `}>Product Code</th>
                                                    <th className={productStyle}>Product Name</th>
                                                    <th className={openingInventoryStyle}>Opening</th>
                                                    <th className={receiptStyle}>Receipt</th>
                                                    <th className={cost}>Receipt Cost</th>
                                                    <th className={salesStyle} >Sales</th>
                                                    <th className={cost}>Revenue</th>
                                                    <th className={lockedStyle}>Locked</th>
                                                    <th className={lostStyle}>Lost</th>
                                                    <th className={cost}>Lost cost</th>
                                                    <th className={availableStyle}>Available</th>
                                                    <th className={cost}>Remaining Goods Value</th>
                                            </tr>
                                     </thead>
                                    <tbody >

                                    {
                                        inventories && inventories.map((d)=>(
                                          <tr  onClick={()=>alert(`You clicked on ${d.productName}`)} className='border-b-2 px-2 w-260  hover:bg-green-500 cursor-grab flex gap-3 w-200 bg-blue-600 ' key={d.id}>
                                              <td className={productcodeStyle}>
                                              {d.productCode}
                                              </td>
                                              <td className={productStyle}>
                                              {d.productName}
                                              </td>
                                              <td className={openingInventoryStyle}>
                                              {d.opening_Qty}
                                              </td>
                                              <td className={receiptStyle}>
                                              {d.receipt_Qty}
                                              </td>
                                               <td className={cost}>
                                              {d.total_receipt_cost}
                                              </td>
                                              <td className={salesStyle}>
                                              {d.sales_Qty}
                                              </td>
                                              <td className={cost}>
                                              {d.total_sales_cost}
                                              </td>
                                              <td className={lockedStyle}>
                                              {d.locked_Qty}
                                              </td>
                                              <td className={lostStyle}>
                                              {d.lost_Qty}
                                              </td>
                                              <td className={cost}>
                                              {d.total_lost_cost}
                                              </td>
                                              <td className={availableStyle}>
                                              {d.closing_Qty}
                                              </td>
                                              <td className={cost}>
                                              {d.closing_stock_value}
                                              </td>

                                          </tr>
                                      )) 
                                    }
                                    </tbody>
                                    </table>
                </div>
  )
}

export default Inventory