import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function CreateProducts() {

 const queryClient = useQueryClient();

 const[form,setForm] = useState({
  name:"",
  salesPrice:"",
  brand:"",
  supplier:"",
  category:"",
  subCategory:"",
  unit:"",
  images:[]


 });


 const {data: brands , isLoading:brandsLoading} = useQuery({
  queryKey:["brands"],
  queryFn: async()=>{
    const res = await api.get("/brands");
    return res.data;
  }
 })

 const{data:categories} = useQuery({
  queryKey:["categories"],
  queryFn: async()=>(await api.get("/categories")).data
 })
  

 const{data:subCategories} = useQuery({
  queryKey:["subCategories",form.category],
  enabled:!!form.category,
  queryFn: async()=>(await api.get(`/subcategories/${form.category}`)).data
 })


 const handleChange = (e) => {
  setForm({...form,[e.target.name]:e.target.value})
 }

 const handleImages = (e) =>{
  setForm({...form, images: Array.from(e.target.files)})
 }


  const createProductMutation= useMutation({
  mutationFn: async()=>{
    const data = new FormData();

    Object.keys(form).forEach((key)=> {
      if(key ==="images") {
        form.images.forEach((file)=> data.append("images",file));
      } else {
        data.append(key,form[key]);
      }
    });

    return api.post("/api/products",data);
  },




onSuccess:()=>{
  console.log("Product Created Successfully");

  queryClient.invalidateQueries(["products"]);
  setForm({
    name:"",
    salesPrice:"",
    brand:"",
    supplier:"",
    category:"",
    subCategory:"",
    unit:"",
    images:[]
  });
}

 });


 const handleSubmit = (e)=>{
  e.preventDefault();
  createProductMutation.mutate();
 };


  return (
<div>
  <form onSubmit={handleSubmit} style={{padding:20}}>
    <h2>Create Product</h2>

    {createProductMutation.isPending && <p>Uploading...</p>}
    {createProductMutation.isError && <p style={{color:"red"}}>Error creating Product</p>}
    {createProductMutation.isSuccess && <p style={{color:"green"}}>Product created!</p>}

    {/*Name */}
    <label>Name</label><br />
    <input type='text' name='name' value={form.name} onChange={handleChange} /><br/><br/>

    {/*Price */}
    <label>Sales Price</label> <br/>
    <input type='number' name='salesPrice' value={form.salesPrice} onChange={handleChange}/><br/><br/>

     {/* Unit */}
     <label>Unit</label><br/>
     <input type='text' name='unit' value={form.unit} onChange={handleChange}/><br/><br/>

     {/* Brand */ }
      <label>Brand</label><br/>
      <select name='brand' value={form.brand} onChange={handleChange}>
      <option value="">Select Brand</option>
      {brands?.map((b)=>{<option key={b._id} value={b._id}>{b.name}</option>})}
      </select><br/><br/>

    {/*Category*/}
    <label>Category</label><br/>
    <select name="category" value={form.category} onChange={handleChange}>
      <option value= ""> Select Category</option>
        {categories?.map((c)=>{<option key={c._id} value={c._id}>{c.name}</option>})}
     
    </select><br/><br/>

    {/*Sub Category*/}
    <label>Sub Category</label><br/>
    <select name='subCategory' value={form.subCategory} onChange={handleChange}>
        <option value= ""> Select Sub Category</option>
      {subCategories?.map((sc)=>{<option key={sc._id} value={sc._id}>{sc.name}</option>})}
    </select><br/><br/>

      {/*Images*/}
      <label>Product Images</label><br/>
      <input type='file' multiple accept='image/*' onChange={handleImages} /><br/><br/>
      <button type='submit' disabled={createProductMutation.isPending}>
        {createProductMutation.isPending ? "Creating..." : "Create Product"}
      </button>



  </form>
</div>
  )
}

export default CreateProducts