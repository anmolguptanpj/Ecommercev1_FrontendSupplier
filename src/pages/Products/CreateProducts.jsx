import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useExtraDetails } from '../../hooks/useExtraDetails';
import api from '../../api';

function CreateProducts() {

  const extra = useExtraDetails(); 
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    salesPrice: "",
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

      return api.post("/products", data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setForm({
        name: "",
        salesPrice: "",
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
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Create Product</h2>

      {/* Name */}
      <label>Name</label><br />
      <input type='text' name='name' value={form.name} onChange={handleChange} /><br /><br />

      {/* Price */}
      <label>Sales Price</label><br />
      <input type='number' name='salesPrice' value={form.salesPrice} onChange={handleChange} /><br /><br />

      {/* Price */}
      <label>MRP</label><br />
      <input type='number' name='mrp' value={form.mrp} onChange={handleChange} /><br /><br />

      {/* Unit */}
      <label>Unit</label><br />
      <input type='text' name='unit' value={form.unit} onChange={handleChange} /><br /><br />

      {/* Brand */}
      <label>Brand</label><br />
      <select name='brand' value={form.brand} onChange={handleChange}>
        <option value="">Select Brand</option>
        {brands?.map(b => (
          <option key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select><br /><br />

      {/* Category */}
      <label>Category</label><br />
      <select name='category' value={form.category} onChange={handleChange}>
        <option value="">Select Category</option>
        {categories?.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select><br /><br />

      {/* Subcategory */}
      <label>Subcategory</label><br />
      <select name='subCategory' value={form.subCategory} onChange={handleChange}>
        <option value="">Select Sub Category</option>
        {subCategories?.map(sc => (
          <option key={sc._id} value={sc._id}>{sc.name}</option>
        ))}
      </select><br /><br />




      {/* Images */}
      <label>Product Images</label><br />
      <input type='file' multiple accept='image/*' onChange={handleImages} /><br /><br />

      <button type='submit'>
        {createProductMutation.isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  )
}

export default CreateProducts;
