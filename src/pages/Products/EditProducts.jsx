import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api'
import { useQuery } from '@tanstack/react-query'

function EditProducts() {
    const[edit,setEdit] = useState(false);

    const{id} = useParams()

const fetchProduct = async() => {
    const res = await api.get(`/products/${id}`)
    return res.data
}

 const {data,isLoading,isError} = useQuery({
    queryKey:["product",id],
    queryFn: fetchProduct,
    enabled: !!id,
 });


 if(isLoading) return <p>loading product details.....</p>
 if(isError) return <p>Fetching product details failed .....</p>

 const product = data?.data
 console.log(product)

  return (
    <div className='flex   w-full h-full '>

        <div className='w-full h-15 px-4'>
            <div className='w-full h-15 rounded-2xl bg-rose-400 items-center flex justify-center items text-3xl font-bold py-6'>Product Details</div>
         <div className='flex flex-col gap-2 py-3  w-full justify-center'>
               <div className='flex  gap-3 '>
                <label>Name :</label>
               <div className='border px-4 text-center '> {product?.name}</div>
            </div>
            <div className='flex gap-3'>
               <label>Product No :</label>
               <div className='border px-4 text-center '> {product?.productNo}</div>
            </div>
             <div className='flex gap-3'>
                <label>Brand :</label>
               <div className='border px-4 text-center '> {product?.brand.name}</div>
            </div>
             <div className='flex gap-3'>
                <label >Sub Category :</label>
                <div className='border px-4 text-center ' >{product?.subCategory.name}</div>
            </div>
             <div className='flex gap-3' >
                <label>Category :</label>
                <div className='border px-4 text-center'  >{product?.category.name}</div>
            </div>
            <div className='flex gap-3' >
                <label>SalesPrice : </label>
                <div className='border px-4 text-center ' >{product?.salesPrice}</div>
            </div>
            <div className='flex gap-3' >
                <label>MRP : </label>
                <div  className='border px-4 text-center ' >{product?.mrp}</div>
            </div>
            <div className='flex gap-3' >
                <label> Status : </label>
            <div className='border w-20 text-center px-4' > {(product?.isActive)? "Active" : "Inactive"}</div>
            </div>
            <div className='flex gap-3' >
                <label >Discount % :</label>
               <div className='border px-4 w-20 text-center '  > <p>{product?.discount}<span>%</span></p></div>
            </div>
              <div>
                {(product?.productImage).map((image,index)=>(<div className='w-32 h-32' key={index}>
                    <img src={image.url} className='object-contain' alt={product?.name}/>
                </div>))}
            </div>
                    <div className=' flex flex-col border-2  w-full '>

           <div className='px-3 py-2'>
             <div
            className='flex gap-3'
            ><label>Minimal Information</label>
               <div className='border px-4 text-center' >
                 {product.description?.minimalInformation}
               </div>
                </div>
            <div
            className='flex gap-3'>
            <label>Brief</label>
           <div className='border px-4 text-center' > {product.description?.brief}</div>
            </div>
            <div 
            className='flex gap-3' >
            <label>About this item</label>
           <div className='border px-4 text-center' > {product.description?.aboutThisItem}</div>
            </div>
            <div className = 'flex-col flex justify-center items-center'>
           <div className='py-5 w-full flex items-center justify-center '>
             <label className=' font-bold  h-7 bg-blue-500 w-full rounded-2xl  text-center ' >Product Specification</label>
           </div>
            <table className=''>
                <tbody>
                    <th className='px-3'>Field</th><th className='px-3'>Sub-field</th><th className=''>Subdetails</th>
                    {Object.entries(product.description?.productSpecification ?? {})?.map(([section,fields])=>(
                        <>
                        {Object.entries(fields).map(([subField,details])=>
                        <tr key={section + subField}><td>{section}</td><td>{subField}</td>{details}</tr>)}
                        </>
                    )
            )}
                </tbody>
            </table>
            </div>
           </div>
                    </div>
          
         </div>
            
            
            
            
            
        </div>
         
    </div>
  )
}

export default EditProducts