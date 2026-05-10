import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
 const links=" bg-gray-600  w-[75%] rounded-xl text-center hover:bg-green-700"

  return (
  <div className=' flex flex-col gap-5 items-center'>
      <div  className=' w-full text-center text-4xl'  id="Topbar">
          <h3>Menu</h3>
      </div>
      <div className=' w-full items-center flex flex-col text-xl gap-10 '  id="Links">
        <Link className={links} to='/orders'>Orders</Link>
        <Link className={links} to='/payments'>Payments</Link>
        <Link className={links} to='/customer'>Customers</Link>
        <Link className={links} to='/returns'>Returns</Link>
        <Link className={links} to='/sales'>Sales</Link>
        <Link className={links} to='/staff'>Staff</Link>
        <Link className={links} to='/products'>Products</Link>
        <Link className={links} to='/inventory'>Inventory</Link>
      
      </div>
    </div>
  )
}

export default Sidebar