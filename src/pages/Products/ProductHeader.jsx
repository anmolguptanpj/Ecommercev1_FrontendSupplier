import React from 'react'
import { Link } from 'react-router-dom';
import "./Products.css";


function ProductHeader() {
  return (
    <div id='Pr_HMain'>
      <div>
          <h2 id="Pr_HTitle">Product Management System </h2>
        <nav id="hLinks">
            <Link to="/products/brands">Brands</Link>
            <Link to="/products/categories">Categories</Link>
            <Link to="/products">Products</Link>
        </nav>
      </div>
    </div>
  )
}

export default ProductHeader