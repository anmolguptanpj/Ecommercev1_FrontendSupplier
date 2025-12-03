import React, { useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import api from '../../api'
import { useQuery } from '@tanstack/react-query'

function EditProducts() {
 
/************************************** View Space **********************/
    
    const[edit,setEdit] = useState(false);
    const navigate = useNavigate()
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


/******************** Edit Form *******************/  

const [form,SetForm] = useState({
name:"",
brand:"",
subCategory:"",
category:"",
mrp:"",
discount:"",
isActive:"",
productImage:[],
description:{
    minimalInformation:"",
    brief:"",
    whatsInThebox:[],
    aboutThisItem:[],
    productSpecification:{

    },
}
})


useEffect(()=>{
if(product){
    SetForm({
name:product.name || "",
brand:product.brand?.name || "",
subCategory:product.subCategory?.name||"",
category:product.category?.name||"",
mrp:product.mrp||"",
discount:product.discount||"",
isActive:product.isActive||"",
productImage:product.productImage,
description:{
    minimalInformation:product.description.minimalInformation||"",
    brief:product.description.brief||"",
    aboutThisItem:product.description?.aboutThisItem||"",
    whatsInThebox:product.description?.whatsInThebox||"",
    productSpecification:product.description?.productSpecification||""

    
}
        

    })
}
},[product])


const handleChange = (e)=>{
    SetForm({...form,[e.target.name]:e.target.value})
}

const handleEdit =() =>{
    
}

console.log(form)








  return (
    <div className='flex   w-full h-full '>

        { edit=== false  ? 

        /******************* View function UI ************ */
           ( <div className='w-full h-15 px-4'>
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
            
           <div className='w-full h-10 '>
            <div className='pr-20 flex justify-center gap-10 '>
                <button onClick={()=>setEdit(true)} className='px-4 py-1 rounded-xl bg-blue-500'>Edit</button> 
           <button onClick={()=>navigate("/products")} className='px-4 py-1 rounded-xl bg-green-500 ' >Back</button>
            </div>
           </div>
            
            
            
        </div>) : (
        

        /******************* Edit function UI *************/
            <div className='px-4 w-full h-full '>
                    <div className=' flex flex-col border-2 justify-center '>
                        <form className='flex flex-col gap-3 px-6 py-6' onSubmit={handleEdit()}>
                        <fieldset>
                            <legend>Product Introduction and Pricing</legend>
                             <div>
                                    <label>Product Name</label>
                                    <div>
                                        <input name='name' placeholder='Write your product Name' className='border-2' value={form.name} onChange={handleChange}/>
                                    </div>
                            </div>
                            <div>
                                    <label>Brand</label>
                                    <div>
                                        <select name='brand' className='border-2' value={form.brand} onChange={handleChange}>
                                        <option value={product.brand.id}>{form.brand}</option>
                                        </select>
                                    </div>
                            </div>
                            <div>
                                    <label>Category</label>
                                    <div>
                                        <select name='category' className='border-2' value={form.category} onChange={handleChange}>
                                       <option value={product.category.id}>{form.category}</option>
                                        </select>
                                    </div>
                            </div>
                             <div>
                                    <label>SubCategory</label>
                                    <div>
                                        <select name='subCategory' className='border-2' value={form.subCategory} onChange={handleChange}>
                                       <option value={product.subCategory.id}>{form.subCategory}</option>
                                        </select>
                                    </div>
                            </div>
                            <div>
                                    <label>MRP</label>
                                    <div>
                                        <input type='number' name='mrp' placeholder='Write your Product MRP' className='border-2' value={form.mrp} onChange={handleChange}/>
                                    </div>
                            </div>
                            <div>
                                    <label>Discount %</label>
                                    <div>
                                        <input name='discount' placeholder='Write the appropraite discount %' className='border-2' value={form.discount} onChange={handleChange}/>
                                    </div>
                            </div>
                            <div>
                                    <label>SalesPrice</label>
                                    <div>
                                        <input  placeholder='Write your Product MRP' disabled className='border-2' value={form.mrp*((100-(form.discount))/100)} readOnly />
                                    </div>
                            </div>
                            <div>
                                    <label>Discount %</label>
                                    <div>
                                        <input name='discount' placeholder='Write your Product MRP' className='border-2' value={form.discount} onChange={handleChange}/>
                                    </div>
                            </div>
                    
                        </fieldset>
                        </form>



                    </div>






                <div> <button
                    className='px-4 py-1 rounded-xl bg-green-500 '
                    onClick={()=>{
                    setEdit(false);
                    }}> Back</button>  </div>
            </div>
        
        )
        }
         
    </div>
  )
}

export default EditProducts