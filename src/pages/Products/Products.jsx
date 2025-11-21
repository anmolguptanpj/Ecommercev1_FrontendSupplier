import React from 'react'
import AddProducts from './CreateProducts'
import ProductList from './ProductList'
import ProductHeader from './ProductHeader'
import { Outlet } from 'react-router-dom'
import { Routes,Route } from 'react-router-dom'
import ProductDetails from './ProductDetails'
import './Products.css'
import CreateProducts from './CreateProducts'
import Brands from './Brands'
import Categories from './Categories'

function Products() {
  const ProductRoute = ()=>(
    <div id="Pr_main">
      <div id="Pr_header"><ProductHeader/></div>
      <div id='Pr_content'><Outlet/></div>
    </div>
  )


  return (
  <Routes>
     <Route element={<ProductRoute/>}>
      <Route path="/" element={<ProductList/>} />
      <Route path="/add" element={<CreateProducts/>} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/brands" element={<Brands/>} />
       <Route path="/categories" element={<Categories/>} />
     </Route>
    </Routes>
  )
}

export default Products