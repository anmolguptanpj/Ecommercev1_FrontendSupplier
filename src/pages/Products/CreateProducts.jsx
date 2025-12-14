import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useExtraDetails } from '../../hooks/useExtraDetails';
import api from '../../api';
import { Link, useNavigate } from 'react-router-dom';

function CreateProducts() {

  const extra = useExtraDetails(); 
  const queryClient = useQueryClient();
  const input = "border-b-2 w-100 focus:outline-none"
  const select = "border-b-2 w-100 "
  const label = " font-bold"
  const optionS="bg-blue-950 w-50 text-white"
  const navigate = useNavigate()
  const buttonS = "px-1 hover:bg-sky-900 w-30 rounded-xl cursor-pointer text-center"

  const [form, setForm] = useState({
    name: "",
    discount: "",
    brand: "",
    category: "",
    subCategory: "",
    unit: "",
    images: [],
    mrp: ""
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/brands")).data.data
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data
  });

  const { data: subCategories } = useQuery({
    queryKey: ["subCategories", form.category],
    enabled: !!form.category,
    queryFn: async () => (await api.get(`/categories/${form.category}/subcategories`)).data.data
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
   const files = Array.from(e.target.files);
   setForm(prev=>({
    ...prev,images:[...prev.images,...files]
   }))
  };

  const createProductMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
console.log(typeof data)
      // Attach supplierId automatically
      const supplier = extra?._id
      data.append("supplier", supplier);

      Object.keys(form).forEach((key) => {
        if (key === "images") {
          form.images.forEach((file) => data.append("images", file));
        } else {
          data.append(key, form[key]);
        }
      });

      return api.post("/products/create", data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setForm({
        name: "",
        discount: "",
        brand: "",
        category: "",
        subCategory: "",
        unit: "",
        mrp:"",
        images: []
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProductMutation.mutate();
  };

  console.log(form.images)
  

  return (
  <div className='flex justify-center w-full h-full '>
      <form className='w-full border ' onSubmit={handleSubmit} style={{ padding: 20 }}>
     <div className='w-full border-y-4'>
       <h2 className='text-center'>Create Product</h2>
     </div>

   <div className='w-[80%] flex justify-center items-center'>
     <div className='flex flex-col w-35'>
        {/* Name */}
      <label className={label}>Name</label> 
      <input className={input} type='text' name='name' value={form.name} onChange={handleChange} />  

      {/* Price */}
      <label className={label} >Discount %</label> 
      <input className={input} type='number' pattern='[0-9]'  name='discount' value={form.discount} onChange={handleChange} />  

      {/* Price */}
      <label className={label}>MRP</label> 
      <input className={input} type='number' inputMode='numeric' name='mrp' pattern="[0-9]*" value={form.mrp} onChange={handleChange} />  

        {/* Price */}
      <label className={label}>Sales</label> 
      <input className={input}  value={form.mrp*((100-form.discount)/100)} onChange={handleChange} />  

      {/* Unit */}
      <label className={label}>Unit</label> 
      <input className={input} type='text' name='unit' value={form.unit} onChange={handleChange} />  

      {/* Brand */}
      <label className={label}>Brand</label> 
      <select className={select} name='brand' value={form.brand} onChange={handleChange}>
        <option className={optionS} value="">Select Brand</option>
        {brands?.map(b => (
          <option className={optionS} key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select>  

      {/* Category */}
      <label className={label}>Category</label> 
      <select className={select} name='category' value={form.category} onChange={handleChange}>
        <option className={optionS} value="">Select Category</option>
        {categories?.map(c => (
          <option className={optionS} key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>  

      {/* Subcategory */}
      <label className={label}>Subcategory</label> 
      <select  className={select} name='subCategory' value={form.subCategory} onChange={handleChange}>
        <option className={optionS} value="">Select Sub Category</option>
        {subCategories?.map(sc => (
          <option className={optionS} key={sc._id} value={sc._id}>{sc.name}</option>
        ))}
      </select>  




      {/* Images */}
      <label  className={label}>Product Images</label> 
      <input className={input} type='file' multiple accept='image/*' onChange={handleImages} />  
    </div>
   </div>

    <div className=' mt-2 flex border-y-4 w-full justify-center gap-5 py-2'>
        <button className={`${buttonS} bg-green-500` } type='submit'>
        {createProductMutation.isPending ? "Creating..." : "Create Product"}
      </button>
      <Link className={`${buttonS} bg-blue-500`} to={"/products"}>
       Back
      </Link>
    </div>
    </form>
  </div>
  )
}

export default CreateProducts;
