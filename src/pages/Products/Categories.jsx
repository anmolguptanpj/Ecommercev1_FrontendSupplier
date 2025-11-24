import { useMutation, useQueryClient,useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import api from '../../api';


function Categories() {

  const queryClient = useQueryClient();



  const [category,setCategory] = useState("")
  const [subCategory,setSubCategory] = useState("")
  const [parentCategoryId,setParentCategoryId] = useState("")


  const {data:categories,isLoading} = useQuery({
    queryKey:["categories"],
    queryFn: async()=>{
      const res = await api.get("/categories");
      return res.data;
    }
  });

  const {mutate: createCategory, isPending , isError,error } = useMutation({
    mutationFn: async()=>{
      return await api.post("/categories",{name: category});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setCategory("")
    }
  })

    const {mutate: createSubCategory, isPending:subLoading , isError : subError ,error :sub } = useMutation({
    mutationFn: async({parentId,name})=>{
      return await api.post(`/categories/${parentId}/subcategories`,{name});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setSubCategory("")
      setParentCategoryId("")
    }
  })

  const handleCategory = async (e) =>  {
    e.preventDefault()
    if(!category.trim()) return;
    createCategory({name:category.trim()});

  };


  const handleSubCategory = async (e) =>  {
    e.preventDefault()
    if(!parentCategoryId) return alert('Please select a parent category')
    if(!subCategory.trim()) return; 
    createSubCategory({parentId: parentCategoryId,name: subCategory.trim()});

  };
  return (
    <div>
      <div>
        <div>
         <form onSubmit={handleCategory}>
         <fieldset>
          <legend>Category</legend>
           <label>Create Category</label><br/>
           <input type="text" value={category} onChange={(e)=>setCategory(e.target.value)} /><br/>
           {}
            <button type='submit'>{isPending ? "Creating..." : "Create Category"}</button>
            {isError && <p> Error : {error?.message || " Error creating a new category "}</p>}
         </fieldset>
         </form>

        <form onSubmit={handleSubCategory}>
            <fieldset>
              <legend>Sub Category </legend>
              <select value=>
              <option value="">Select Category</option>
              {categories?.map((c)=>{<option key={c._id} value={c._id}>{c.name}</option>})}
            </select><br/>
           <input type="text" value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} />
           {}
            <button type='submit'>{isPending ? "Creating..." : "Create Sub Category"}</button>
            {isError && <p> Error : {error?.message || " Error creating a new category "}</p>}
            </fieldset>
         </form>
        </div>
      </div>
    </div>
  )
}

export default Categories