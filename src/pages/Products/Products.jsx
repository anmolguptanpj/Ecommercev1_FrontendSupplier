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
import Insideheader from '../../components/Insideheader'

function Products() {
   const ProductOnlyRoute = ()=>(

    <div id="Pr_main">
      <div id="Pr_header"><ProductHeader/></div>
        <div style={{textAlign:"",justifyContent:""}}>
        <div id = "productInsideHeader"><Insideheader
        headerTitle='Products'
        headerStyle={{}}
        style={{display:"flex",flexDirection:"column",justifyContent:"center",textAlign:'center',backgroundColor:''}}
        navStyle={{display:"flex",flexDirection:"row",justifyContent:"space-around"}}
        links={[
          {path:"/products/add",label:"CreateProducts"},
          {path:"/products/:id",label:"Manage Products"},

      ]}
/>
</div >
    </div>
      <div id='Pr_content'><Outlet/></div>
    </div>
  )



   const BrandOnlyRoute = ()=>(

    <div id="Pr_main">
      <div id="Pr_header"><ProductHeader/></div>
        <div style={{textAlign:"",justifyContent:""}}>
        <div id = "productInsideHeader"><Insideheader
        headerTitle='Brands'
        headerStyle={{}}
        style={{display:"flex",flexDirection:"column",justifyContent:"center",textAlign:'center'}}
        navStyle={{display:"flex",flexDirection:"row",justifyContent:"space-around"}}
/>
</div >
    </div>
      <div id='Pr_content'><Outlet/></div>
    </div>
  )





    const CategoryOnlyRoute = ()=>(

    <div id="Pr_main">
      <div id="Pr_header"><ProductHeader/></div>
        <div style={{textAlign:"",justifyContent:""}}>
        <div id = "productInsideHeader"><Insideheader
        headerTitle='Category'
        headerStyle={{}}
        style={{display:"flex",flexDirection:"column",justifyContent:"center",textAlign:'center'}}
        navStyle={{display:"flex",flexDirection:"row",justifyContent:"space-around"}}
/>
</div >
    </div>
      <div id='Pr_content'><Outlet/></div>
    </div>
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
      <Route path="/:id" element={<ProductDetails />} />
     </Route>
    </Routes>
  )
}

export default Products