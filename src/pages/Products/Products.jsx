import React from 'react'
import AddProducts from './CreateProducts'
import ProductList from './ProductList'
import ProductHeader from './ProductHeader'
import { Outlet } from 'react-router-dom'
import { Routes,Route } from 'react-router-dom'
import './Products.css'
import CreateProducts from './CreateProducts'
import Brands from './Brands'
import Categories from './Categories'
import Insideheader from '../../components/Insideheader'
import EditProducts from './EditProducts'

function Products() {
   const ProductOnlyRoute = ()=>(


      <div id='Pr_content'><Outlet/></div>
  
  )



   const BrandOnlyRoute = ()=>(

   
      <div id='Pr_content'><Outlet/></div>
    
  )





    const CategoryOnlyRoute = ()=>(

    
  
      <div id='Pr_content'><Outlet/></div>
    
  )


  return (
  <Routes>
   

     {/* Brand Routes */}
    <Route path="/categories" element={<CategoryOnlyRoute/>}>
      <Route index element={<Categories/>} />
    </Route>

   
    {/* Brand Routes */}
    <Route path="/brands" element={<BrandOnlyRoute/>}>
      <Route index element={<Brands/>} />
    </Route>



     <Route element={<ProductOnlyRoute/>}>
      <Route path="/" element={<ProductList/>} />
      <Route path="/add" element={<CreateProducts/>} />
      <Route path="/:id" element={<EditProducts />} />
     </Route>
    </Routes>
  )
}

export default Products