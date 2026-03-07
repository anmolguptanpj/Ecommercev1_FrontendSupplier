import React from 'react'
import { Outlet, Routes,Route } from 'react-router-dom'
import Insideheader from '../../components/Insideheader'
import OrdersOneonOne from './Pages/OrdersOneonOne'
import OrdersPending from './Pages/OrdersPending'
import OrdersAll from './Pages/OrdersAll'

function Orders() {
  const OrderOnlyRoute = () =>{
    return(
      <div>
    <div>
      <Insideheader
      headerTitle='Orders'
      headerClass='text-2xl font-bold  w-full  text-center'
      className='w-full p-5 flex flex-col  bg-red-800 justify-center '
      links={[{path:"/orders",label:"Orders O/O"},
        {path:"/orders/pending",label:"Orders Pending"},
        {path:"/orders/all",label:"All Orders"}
      ]}
      navClass='flex w-full justify-evenly  text-xl'
      />
      </div>
    <div><Outlet/></div>
   </div>
    )
  }

  return (
    <Routes>
      <Route element={<OrderOnlyRoute/>}> 
      <Route path='/' element={<OrdersOneonOne/>}/>
      <Route path='/pending' element={<OrdersPending/>}/>
      <Route path='/All' element={<OrdersAll/>}/>
      </Route>
    </Routes>
   
  )
}

export default Orders