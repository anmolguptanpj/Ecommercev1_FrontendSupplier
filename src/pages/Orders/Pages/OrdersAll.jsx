import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../api'
import { useNavigate } from 'react-router-dom'
import { useExtraDetails } from '../../../hooks/useExtraDetails'
import OrderView from '../../../modals/OrderView'



function OrdersAll() {

  const [orderId,setOrderId]=useState("")
  const [orderOpen,setOrderOpen] = useState(true)
  const navigate = useNavigate()
  const extra = useExtraDetails()
  const tables = " "

  console.log(extra)

  const id = extra?._id
  

  console.log(id)

  const getOrders = async() => {
    const res = await api.get(`/${id}/orders`);

    return res.data
  }

  const {data,isLoading,isError} = useQuery({
    queryKey:["orders",id],
    queryFn:getOrders,
    enabled: !!id
  })

  if(isLoading) return <p>Loading Orders...</p>
  if(isError) return <p> Fetching Orders failed</p>
  const orders = data?.data || []
  console.log(data)
  return (
    <div className='w-full h-full '>
      <div className=' w-full h-full flex justify-center'>
        <table className='flex flex-col'>
          <caption>Orders</caption>
       <thead>
         <tr className='flex gap-12  w-full '>
          <th className={`${tables} w-5 `} >OrderNo</th>
          <th className={`${tables} w-5 `} >Order ID</th>
          <th className={`${tables} w-20 `}>Customer Id</th>
          <th className={`${tables} w-10  `} >Customer Name</th>
          <th className={`${tables} w-30 `}>Customer Address</th>
          <th className={`${tables} w-10`} >Payment Status</th>
          <th className={`${tables} w-20`} >Order Origin Time</th>
          <th className={`${tables} w-5`} >Status</th>
          <th className={`${tables} w-5`} >View</th>
        </tr>
       </thead>
       <tbody>
         {
          orders.map((o)=>(<tr className='flex gap-12  ' key={o.id}>
            <td className={`${tables} w-5 `}>{o.supplierOrderNo}</td>
            <td className={`${tables} w-5 `}>{o.orderNo}</td>
            <td className={`${tables} w-20 `}>{o.userId}</td>
            <td className={`${tables}w-10  `}>{o.userName}</td>
            <td className={`${tables} w-30 `}>{o.deliveryAddress}</td>
            <td className={`${tables} w-10`}>{o.paymentStatus || "Not defined"}</td>
            <td className={`${tables}w-20  `}>{new Date(o.createdAt).toLocaleString()}</td>
            <td className={`${tables} w-5`}>{o.status || "pending"}</td>
            <td className={`${tables} w-5`}><button onClick={()=>{setOrderId(o._id);alert("button clicked"); setOrderOpen(true)}} className='px-2 py-1 rounded-xl bg-green-500'>View</button></td>
          </tr>))
        }
       </tbody>
        </table>
      </div>
        
      {orderId && orderOpen && <OrderView _id={orderId}
      onClose={()=>setOrderOpen(True)}/>}
      
    </div>
  )
}

export default OrdersAll