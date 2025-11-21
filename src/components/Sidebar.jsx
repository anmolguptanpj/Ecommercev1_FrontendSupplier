import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  return (
  <>
      <div id="Topbar">
          <h3>Menu</h3>
      </div>
      <div id="Links">
        <Link to='/orders'>Orders</Link>
        <Link to='/payments'>Payments</Link>
        <Link to='/customer'>Customers</Link>
        <Link to='/returns'>Returns</Link>
        <Link to='/sales'>Sales</Link>
        <Link to='/staff'>Staff</Link>
        <Link to='/products'>Products</Link>
        

      </div>
    </>
  )
}

export default Sidebar