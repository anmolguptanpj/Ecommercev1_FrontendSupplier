import React from 'react'
import { Link } from 'react-router-dom';
import "./Products.css";


function ProductHeader() {
  const links="hover:underline"
  return (
    <div className=' w-full h-20 flex shadow-2xs flex-col bg-gray-300 items-center' id='Pr_HMain'>
      <div className='h-10'>
         <h2 className='text-3xl  font-bold' id="Pr_HTitle">Product Management System </h2>
      </div>
       <div className='h-10 flex justify-end items-end '>
         <nav className='flex justify-evenly items-end gap-5  text-2xl font-semibold' id="hLinks">
            <Link  className={links} to="/products/brands">Brands</Link>
            <Link  className={links} to="/products/categories">Categories</Link>
            <Link  className={links} to="/products">Products</Link>
        </nav>
       </div>
    </div>
  )
}

export default ProductHeader