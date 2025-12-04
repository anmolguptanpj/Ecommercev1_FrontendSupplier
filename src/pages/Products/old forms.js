import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api"; // axios instance
import { useQuery } from "@tanstack/react-query";





function EditProducts() {
  const navigate = useNavigate();
  const { id } = useParams();

  // FETCH PRODUCT
  const fetchProduct = async () => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: fetchProduct,
    enabled: !!id,
  });

  // product (from API response)
  const product = data?.data ?? data?.product ?? null;

  /******************** Edit Form *******************/
  const [form, setForm] = useState({
    name: "",
    brand: "",
    subCategory: "",
    category: "",
    mrp: "",
    discount: "",
    isActive: false,
    // productImage will hold entries of shape:
    // { oldPublicId?, url?, file? }
    productImage: [],
    description: {
      minimalInformation: {},
      brief: "",
      whatsInThebox: [],
      aboutThisItem: [],
      productSpecification: {},
    },
  });

  // UI rows
  const [minimalRows, setMinimalRows] = useState([{ key: "", value: "" }]);
  const [specificationRows, setSpecificationRows] = useState([
    { category: "", subFields: [{ subField: "", details: "" }] },
  ]);

  // compute sales price
  const salesPrice = useMemo(() => {
    const mrpNum = Number(form.mrp) || 0;
    const discountNum = Number(form.discount) || 0;
    return (mrpNum * (100 - discountNum)) / 100;
  }, [form.mrp, form.discount]);

  // populate when product loads
  useEffect(() => {
    if (!product) return;

    // Build productImage initial shape
    const images = (product.productImage || []).map((img) => ({
      oldPublicId: img.public_id ?? img.publicId ?? null,
      url: img.url,
    }));

    setForm((prev) => ({
      ...prev,
      name: product.name ?? "",
      brand: product.brand?.id ?? product.brand?.name ?? "",
      subCategory: product.subCategory?.id ?? product.subCategory?.name ?? "",
      category: product.category?.id ?? product.category?.name ?? "",
      mrp: product.mrp ?? "",
      discount: product.discount ?? "",
      isActive: !!product.isActive,
      productImage: images,
      description: {
        minimalInformation: product.description?.minimalInformation ?? {},
        brief: product.description?.brief ?? "",
        aboutThisItem: product.description?.aboutThisItem ?? [],
        whatsInThebox: product.description?.whatsInThebox ?? [],
        productSpecification: product.description?.productSpecification ?? {},
      },
    }));

    // minimalRows
    const minimalEntries = product.description?.minimalInformation ?? {};
    if (Object.keys(minimalEntries).length > 0) {
      const arr = Object.entries(minimalEntries).map(([k, v]) => ({ key: k, value: v }));
      setMinimalRows(arr);
    } else {
      setMinimalRows([{ key: "", value: "" }]);
    }

    // specificationRows
    const spec = product.description?.productSpecification ?? {};
    if (Object.keys(spec).length > 0) {
      const categoryArray = Object.entries(spec).map(([category, fields]) => {
        const subFieldsArray = Object.entries(fields ?? {}).map(([subField, details]) => ({
          subField,
          details,
        }));
        return { category, subFields: subFieldsArray.length ? subFieldsArray : [{ subField: "", details: "" }] };
      });
      setSpecificationRows(categoryArray);
    } else {
      setSpecificationRows([{ category: "", subFields: [{ subField: "", details: "" }] }]);
    }
  }, [product]);

  /****************** Sync UI rows -> form.description ******************/
  useEffect(() => {
    const obj = {};
    minimalRows.forEach((r) => {
      if (r.key && r.key.trim() !== "") obj[r.key] = r.value;
    });

    setForm((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        minimalInformation: obj,
      },
    }));
  }, [minimalRows]);

  useEffect(() => {
    const nested = {};
    specificationRows.forEach((categoryObj) => {
      const cat = (categoryObj.category ?? "").toString().trim();
      if (!cat) return;
      nested[cat] = {};
      categoryObj.subFields.forEach((sub) => {
        const sf = (sub.subField ?? "").toString().trim();
        if (sf) {
          nested[cat][sf] = sub.details ?? "";
        }
      });
    });

    setForm((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        productSpecification: nested,
      },
    }));
  }, [specificationRows]);

  /****************** Handlers ******************/
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isActive") {
      setForm((prev) => ({ ...prev, isActive: !!checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrief = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        brief: value,
      },
    }));
  };

  /********** Minimal info row ops **********/
  const addMinRow = () => setMinimalRows((prev) => [...prev, { key: "", value: "" }]);
  const removeMinRow = (index) =>
    setMinimalRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  const handleMinInput = (index, field, value) => {
    setMinimalRows((prev) => {
      const updated = prev.map((r, i) => (i === index ? { ...r, [field]: value } : r));
      return updated;
    });
  };

  /********** Specification ops **********/
  const addCategory = () =>
    setSpecificationRows((prev) => [...prev, { category: "", subFields: [{ subField: "", details: "" }] }]);

  const deleteCategory = (catIdx) => setSpecificationRows((prev) => prev.filter((_, i) => i !== catIdx));

  const updateCategoryName = (catIdx, value) =>
    setSpecificationRows((prev) => prev.map((c, i) => (i === catIdx ? { ...c, category: value } : c)));

  const addSubField = (catIdx) =>
    setSpecificationRows((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, subFields: [...c.subFields, { subField: "", details: "" }] } : c))
    );

  const updateSubField = (catIdx, subIdx, field, value) =>
    setSpecificationRows((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subFields: c.subFields.map((s, si) => (si === subIdx ? { ...s, [field]: value } : s)),
            }
          : c
      )
    );

  const deleteSubField = (catIdx, subIdx) =>
    setSpecificationRows((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, subFields: c.subFields.filter((_, si) => si !== subIdx) } : c))
    );

  /********** Image handlers **********/
  // Replace the image at `index` with a new file (keeps oldPublicId reference)
  const handleImageReplace = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => {
      const images = [...prev.productImage];
      const existing = images[index] ?? {};
      images[index] = {
        ...existing,
        oldPublicId: existing.oldPublicId ?? null,
        file,
        url: existing.url ?? null, // keep url so preview can still show if needed
      };
      return { ...prev, productImage: images };
    });
  };

  // Add a brand new image (no oldPublicId)
  const handleAddNewImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      productImage: [...prev.productImage, { file }],
    }));
  };

  // Remove an image entry from form.productImage (used to delete)
  const handleRemoveImageEntry = (index) => {
    setForm((prev) => ({ ...prev, productImage: prev.productImage.filter((_, i) => i !== index) }));
  };

  /**************** Submit ****************/
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Because we may upload files, use FormData. We follow Option A: mixed array.
      const formData = new FormData();

      // Build a payload copy without file objects
      const payload = { ...form };
      // remove file objects from productImage to avoid circular data in JSON
      payload.productImage = payload.productImage.map((p) => ({ oldPublicId: p.oldPublicId ?? null, url: p.url ?? null }));

      // Collect meta info and append file blobs
      const meta = [];
      const keepPublicIds = [];
      let fileCounter = 0;

      form.productImage.forEach((entry) => {
        if (entry.file) {
          const fileKey = `file_${fileCounter}`;
          meta.push({ oldPublicId: entry.oldPublicId ?? null, fileKey });
          formData.append(fileKey, entry.file);
          fileCounter += 1;
        } else if (entry.oldPublicId) {
          // this image remains unchanged on server; tell server to keep it
          keepPublicIds.push(entry.oldPublicId);
        }
      });

      // Append payload and helpers
      formData.append("payload", JSON.stringify(payload));
      formData.append("productImageMeta", JSON.stringify(meta));
      formData.append("keepPublicIds", JSON.stringify(keepPublicIds));

      // Send as multipart/form-data
      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // After success, navigate back or refetch (simplest: go back to list)
      navigate("/products");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Check console for details.");
    }
  };

  if (isLoading) return <p>loading product details.....</p>;
  if (isError) return <p>Fetching product details failed .....</p>;



  console.log(form)

  return (
    <div className="flex w-full h-full">
      <StatefulEditor
        product={product}
        editForm={form}
        setEditForm={setForm}
        minimalRows={minimalRows}
        specificationRows={specificationRows}
        setMinimalRows={setMinimalRows}
        setSpecificationRows={setSpecificationRows}
        salesPrice={salesPrice}
        handleEdit={handleEdit}
        // handlers for inputs
        handleChange={handleChange}
        handleBrief={handleBrief}
        addMinRow={addMinRow}
        removeMinRow={removeMinRow}
        handleMinInput={handleMinInput}
        addCategory={addCategory}
        deleteCategory={deleteCategory}
        updateCategoryName={updateCategoryName}
        addSubField={addSubField}
        updateSubField={updateSubField}
        deleteSubField={deleteSubField}
        handleImageReplace={handleImageReplace}
        handleAddNewImage={handleAddNewImage}
        handleRemoveImageEntry={handleRemoveImageEntry}
        navigate={navigate}
      />
    </div>
  );
}

/**************** Subcomponent ****************/
function StatefulEditor({
  product,
  editForm,
  setEditForm,
  minimalRows,
  specificationRows,
  setMinimalRows,
  setSpecificationRows,
  salesPrice,
  handleEdit,
  handleChange,
  handleBrief,
  addMinRow,
  removeMinRow,
  handleMinInput,
  addCategory,
  deleteCategory,
  updateCategoryName,
  addSubField,
  updateSubField,
  deleteSubField,
  handleImageReplace,
  handleAddNewImage,
  handleRemoveImageEntry,
  navigate,
}) {
  const [edit, setEdit] = useState(false);

  return (
    <div className="w-full h-full px-4">
      {!edit ? (
        <div className="w-full h-15 px-4">
          <div className="w-full h-15 rounded-2xl bg-rose-400 items-center flex justify-center text-3xl font-bold py-6">
            Product Details
          </div>

          <div className="flex flex-col gap-2 py-3 w-full justify-center">
            <div className="flex gap-3 ">
              <label>Name :</label>
              <div className="border px-4 text-center ">{product?.name}</div>
            </div>

            <div className="flex gap-3">
              <label>Product No :</label>
              <div className="border px-4 text-center ">{product?.productNo}</div>
            </div>

            <div className="flex gap-3">
              <label>Brand :</label>
              <div className="border px-4 text-center ">{product?.brand?.name}</div>
            </div>

            <div className="flex gap-3">
              <label>Sub Category :</label>
              <div className="border px-4 text-center ">{product?.subCategory?.name}</div>
            </div>

            <div className="flex gap-3">
              <label>Category :</label>
              <div className="border px-4 text-center">{product?.category?.name}</div>
            </div>

            <div className="flex gap-3">
              <label>SalesPrice : </label>
              <div className="border px-4 text-center ">{product?.salesPrice ?? salesPrice.toFixed(2)}</div>
            </div>

            <div className="flex gap-3">
              <label>MRP : </label>
              <div className="border px-4 text-center ">{product?.mrp}</div>
            </div>

            <div className="flex gap-3">
              <label> Status : </label>
              <div className="border w-20 text-center px-4">{product?.isActive ? "Active" : "Inactive"}</div>
            </div>

            <div className="flex gap-3">
              <label> Discount % :</label>
              <div className="border px-4 w-20 text-center ">
                <p>
                  {product?.discount}
                  <span>%</span>
                </p>
              </div>
            </div>

            <div>
              {(product?.productImage || []).map((image, index) => (
                <div className="w-32 h-32 inline-block mr-2" key={index}>
                  <img src={image.url} className="object-contain w-full h-full" alt={product?.name} />
                </div>
              ))}
            </div>

            <div className="flex flex-col border-2 w-full ">
              <div className="px-3 py-2">
                <div className="flex gap-3">
                  <label>Minimal Information</label>
                  <div className="border px-4 text-center">
                    {product?.description?.minimalInformation &&
                      Object.entries(product.description.minimalInformation).map(([k, v]) => (
                        <div key={k}>
                          {k}: {v}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <label>Brief</label>
                  <div className="border px-4 text-center">{product?.description?.brief}</div>
                </div>

                <div className="flex gap-3">
                  <label>About this item</label>
                  <div className="border px-4 text-center">{product?.description?.aboutThisItem?.join?.(", ") ?? product?.description?.aboutThisItem}</div>
                </div>

                <div className="flex-col flex justify-center items-center">
                  <div className="py-5 w-full flex items-center justify-center ">
                    <label className=" font-bold h-7 bg-blue-500 w-full rounded-2xl text-center ">Product Specification</label>
                  </div>
                  <table className="">
                    <tbody>
                      <tr>
                        <th className="px-3 border-2 ">Field</th>
                        <th className="px-3 border-2">Sub-field</th>
                        <th className="px-3 border-2">Subdetails</th>
                      </tr>
                      {Object.entries(product?.description?.productSpecification ?? {}).map(([section, fields]) =>
                        Object.entries(fields).map(([subField, details]) => (
                          <tr key={section + subField}>
                            <td className="px-3 border-2 ">{section}</td>
                            <td className="px-3 border-2 ">{subField}</td>
                            <td className="px-3 border-2">{details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-10 ">
            <div className="pr-20 flex justify-center gap-10 ">
              <button onClick={() => setEdit(true)} className="px-4 py-1 rounded-xl bg-blue-500">
                Edit
              </button>
              <button onClick={() => navigate("/products")} className="px-4 py-1 rounded-xl bg-green-500 ">
                Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 w-full h-full ">
          <div className="flex flex-col border-2 justify-center ">
            <form className="flex flex-col gap-3 px-6 py-6" onSubmit={handleEdit}>
              <fieldset>
                <legend>Product Introduction and Pricing</legend>

                <div>
                  <label>Product Name</label>
                  <div>
                    <input name="name" placeholder="Write your product Name" className="border-2" value={editForm.name} onChange={handleChange} />
                  </div>
                </div>

                {/* BRAND */}
                <div>
                  <label>Brand</label>
                  <div>
                    <select name="brand" className="border-2" value={editForm.brand} onChange={handleChange}>
                      <option value={product?.brand?.id || editForm.brand}>{product?.brand?.name || editForm.brand}</option>
                    </select>
                  </div>
                </div>

                {/* CATEGORY */}
                <div>
                  <label>Category</label>
                  <div>
                    <select name="category" className="border-2" value={editForm.category} onChange={handleChange}>
                      <option value={product?.category?.id || editForm.category}>{product?.category?.name || editForm.category}</option>
                    </select>
                  </div>
                </div>

                {/* SUBCATEGORY */}
                <div>
                  <label>SubCategory</label>
                  <div>
                    <select name="subCategory" className="border-2" value={editForm.subCategory} onChange={handleChange}>
                      <option value={product?.subCategory?.id || editForm.subCategory}>{product?.subCategory?.name || editForm.subCategory}</option>
                    </select>
                  </div>
                </div>




                <div>
                    <label>
                        
                    </label>
                </div>

                <div>
                  <label>MRP</label>
                  <div>
                    <input type="number" name="mrp" placeholder="Write your Product MRP" className="border-2" value={editForm.mrp} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label>Discount %</label>
                  <div>
                    <input name="discount" placeholder="Write the appropriate discount %" className="border-2" value={editForm.discount} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label>SalesPrice</label>
                  <div>
                    <input placeholder="Sales price" disabled className="border-2" value={Number(salesPrice).toFixed(2)} readOnly />
                  </div>
                </div>

                {/* IMAGES */}
                <div>
                  <label className="font-bold">Product Images</label>

                  <div className="flex flex-col gap-4 mt-2">
                    {editForm.productImage.map((image, index) => (
                      <div key={index} className="border p-3 rounded flex gap-4 items-center">
                        <div className="w-32 h-32 border rounded">
                          <img
                            src={image.file ? URL.createObjectURL(image.file) : image.url}
                            alt={product?.name}
                            className="object-cover w-full h-full rounded"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm font-semibold">Replace this image</label>
                          <input type="file" accept="image/*" onChange={(e) => handleImageReplace(index, e)} />

                          <button type="button" className="mt-2 px-2 py-1 bg-red-300 rounded" onClick={() => handleRemoveImageEntry(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add new image input */}
                    <div className="border p-3 rounded">
                      <label className="font-semibold">Add New Image</label>
                      <input type="file" accept="image/*" onChange={handleAddNewImage} className="mt-2" />

                      {/* Previews for newly added images (those without oldPublicId) */}
                      <div className="flex gap-3 mt-3">
                        {editForm.productImage
                          .filter((img) => img.file && !img.oldPublicId)
                          .map((img, i) => (
                            <div key={i} className="w-32 h-32 border rounded">
                              <img src={URL.createObjectURL(img.file)} alt="New Upload" className="object-cover w-full h-full rounded" />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

              </fieldset>

              <fieldset>
                <legend>Product Description</legend>

                <div>
                  <label>Brief</label>
                  <div>
                    <input name="brief" placeholder="Write your Product brief or one word details " className="border-2" value={editForm.description.brief} onChange={handleBrief} />
                  </div>
                </div>

                {/* Minimal Information */}
                <div>
                  <label>Minimal Information</label>
                  <table>
                    <tbody>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                        <th>Action</th>
                      </tr>

                      {minimalRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <input className="border" value={row.key} onChange={(e) => handleMinInput(idx, "key", e.target.value)} />
                          </td>
                          <td>
                            <input className="border" value={row.value} onChange={(e) => handleMinInput(idx, "value", e.target.value)} />
                          </td>
                          <td>
                            <button type="button" onClick={() => removeMinRow(idx)} className="px-2 py-1 bg-red-300 rounded">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={addMinRow} className="px-3 py-1 bg-green-500 rounded text-white">
                      Add Row
                    </button>
                  </div>
                </div>

                {/* Product Specification */}
                <div>
                  <label className="font-bold">Product Specification</label>

                  {specificationRows.map((categoryObj, catIdx) => (
                    <div key={catIdx} className="border p-3 my-3 rounded">
                      <div className="flex gap-3 mb-3">
                        <label>Category:</label>
                        <input className="border px-2" value={categoryObj.category} onChange={(e) => updateCategoryName(catIdx, e.target.value)} />
                        <button type="button" className="bg-red-400 px-2 rounded text-white" onClick={() => deleteCategory(catIdx)}>
                          Delete Category
                        </button>
                      </div>

                      {categoryObj.subFields.map((sub, subIdx) => (
                        <div key={subIdx} className="flex gap-3 mb-2 ml-6 items-center">
                          <label>SubField:</label>
                          <input className="border px-2" value={sub.subField} onChange={(e) => updateSubField(catIdx, subIdx, "subField", e.target.value)} />

                          <label>Details:</label>
                          <input className="border px-2" value={sub.details} onChange={(e) => updateSubField(catIdx, subIdx, "details", e.target.value)} />

                          <button type="button" className="bg-red-300 px-2 rounded" onClick={() => deleteSubField(catIdx, subIdx)}>
                            X
                          </button>
                        </div>
                      ))}

                      <div className="ml-6">
                        <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => addSubField(catIdx)}>
                          + Add SubField
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-2">
                    <button type="button" className="bg-blue-500 text-white px-4 py-1 rounded" onClick={addCategory}>
                      + Add Category
                    </button>
                  </div>
                </div>
              </fieldset>

              <div className="flex gap-4 mt-4">
                <button type="submit" className="px-4 py-1 rounded-xl bg-blue-500 text-white">
                  Save
                </button>
                <button type="button" className="px-4 py-1 rounded-xl bg-gray-400 " onClick={() => setEdit(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4">
            <button
              className="px-4 py-1 rounded-xl bg-green-500 "
              onClick={() => {
                setEdit(false);
                navigate("/products");
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
