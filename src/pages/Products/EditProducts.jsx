import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api"; // adjust if needed
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* ---------------- Zod schema ---------------- */
const SubFieldSchema = z.object({
  subField: z.string().min(1, "Subfield required"),
  details: z.string().optional(),
});

const SpecCategorySchema = z.object({
  category: z.string().min(1, "Category required"),
  subFields: z.array(SubFieldSchema).min(1, "At least one subfield"),
});

const MinimalRowSchema = z.object({
  key: z.string().min(1, "Key required"),
  value: z.string().optional(),
});

const EditProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  mrp: z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().min(0, "MRP must be >= 0")),
  discount: z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().min(0).max(100)),
  isActive: z.boolean().optional(),
  brief: z.string().optional(),
  minimalRows: z.array(MinimalRowSchema).optional(),
  specification: z.array(SpecCategorySchema).optional(),
  whatsInTheBox: z.array(z.string().min(1)).optional(),
  aboutThisItem: z.array(z.string().min(1)).optional(),
});

/* ---------------- Component ---------------- */
export default function EditProductsRHFZodViewEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const objectUrlsRef = useRef([]);

  // local UI toggle: view / edit
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch product
  const fetchProduct = async () => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: fetchProduct,
    enabled: !!id,
  });

  const product = data?.data ?? data?.product ?? null;

  // image state (hybrid)
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      objectUrlsRef.current = [];
    };
  }, []);

  // React Hook Form
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      subCategory: "",
      mrp: 0,
      discount: 0,
      isActive: false,
      brief: "",
      minimalRows: [{ key: "", value: "" }],
      specification: [{ category: "", subFields: [{ subField: "", details: "" }] }],
      whatsInTheBox: [""],
      aboutThisItem: [""],
    },
  });

  // fetch all brands
  const fetchBrands = async () => {
    const res = await api.get("/brands");
    return res.data?.data ?? res.data;
  };
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  // fetch all categories
  const fetchCategories = async () => {
    const res = await api.get("/categories");
    return res.data?.data ?? res.data;
  };
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // watch category id for subcategory loading (must be AFTER useForm)
  const selectedCategoryId = watch("category");

  const fetchSubCategories = async () => {
    if (!selectedCategoryId) return [];
    const res = await api.get(`/categories/${selectedCategoryId}/subcategories`);
    return res.data?.data ?? res.data;
  };
  const { data: subCategoriesData } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: fetchSubCategories,
    enabled: !!selectedCategoryId,
  });

  // field arrays
  const minimalFA = useFieldArray({ control, name: "minimalRows" });
  const specFA = useFieldArray({ control, name: "specification" });
  const whatsFA = useFieldArray({ control, name: "whatsInTheBox" });
  const aboutFA = useFieldArray({ control, name: "aboutThisItem" });

  // populate form + images when product loads
  useEffect(() => {
    if (!product) return;

    const dv = {
      name: product.name ?? "",
      brand: product.brand?._id ?? product.brand?.id ?? "",
      category: product.category?._id ?? product.category?.id ?? "",
      subCategory: product.subCategory?._id ?? product.subCategory?.id ?? "",

      mrp: product.mrp ?? 0,
      discount: product.discount ?? 0,
      isActive: !!product.isActive,
      brief: product.description?.brief ?? "",
      minimalRows:
        product.description?.minimalInformation && Object.keys(product.description.minimalInformation).length > 0
          ? Object.entries(product.description.minimalInformation).map(([k, v]) => ({ key: k, value: String(v) }))
          : [{ key: "", value: "" }],
      specification:
        product.description?.productSpecification && Object.keys(product.description.productSpecification).length > 0
          ? Object.entries(product.description.productSpecification).map(([category, fields]) => ({
              category,
              subFields: Object.entries(fields ?? {}).map(([subField, details]) => ({
                subField,
                details: String(details ?? ""),
              })),
            }))
          : [{ category: "", subFields: [{ subField: "", details: "" }] }],
      whatsInTheBox: product.description?.whatsInThebox?.length ? product.description.whatsInThebox : [""],
      aboutThisItem: product.description?.aboutThisItem?.length ? product.description.aboutThisItem : [""],
    };

    reset(dv);

    const imgs = (product.productImage ?? []).map((img) => ({
      oldPublicId: img.public_id ?? img.publicId ?? null,
      url: img.url ?? null,
    }));
    setProductImages(imgs);
  }, [product, reset]);

  /* ---------------- Image handlers ---------------- */

  const replaceImageAtIndex = (index, file) => {
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objUrl);

    setProductImages((prev) => {
      const copy = [...prev];
      const existing = copy[index] ?? {};
      copy[index] = {
        ...existing,
        oldPublicId: existing.oldPublicId ?? null,
        file,
        url: objUrl,
      };
      return copy;
    });
  };

  const addNewImage = (file) => {
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objUrl);
    setProductImages((prev) => [...prev, { file, url: objUrl }]);
  };

  const removeImageAtIndex = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- Helpers ---------------- */

  function buildProductSpecification(specArr) {
    const out = {};
    (specArr || []).forEach((cat) => {
      const catTrim = (cat.category || "").toString().trim();
      if (!catTrim) return;
      out[catTrim] = {};
      (cat.subFields || []).forEach((sf) => {
        const sfKey = (sf.subField || "").toString().trim();
        if (!sfKey) return;
        out[catTrim][sfKey] = (sf.details || "").toString();
      });
    });
    return out;
  }

  /* ---------------- Submit ---------------- */

  const onSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        brand: values.brand,
        category: values.category,
        subCategory: values.subCategory,
        mrp: values.mrp,
        discount: values.discount,
        isActive: !!values.isActive,
        description: {
          brief: values.brief || "",
          minimalInformation: {},
          productSpecification: {},
          whatsInThebox: (values.whatsInTheBox || []).filter(Boolean),
          aboutThisItem: (values.aboutThisItem || []).filter(Boolean),
        },
      };

      (values.minimalRows || []).forEach((r) => {
        const k = (r.key || "").toString().trim();
        if (k) payload.description.minimalInformation[k] = r.value || "";
      });

      payload.description.productSpecification = buildProductSpecification(values.specification);

      const formData = new FormData();

      const meta = [];
      const keepPublicIds = [];
      let fileCounter = 0;

      productImages.forEach((entry) => {
        if (entry.file) {
          const key = `file_${fileCounter}`;
          meta.push({ oldPublicId: entry.oldPublicId ?? null, fileKey: key });
          formData.append(key, entry.file);
          fileCounter += 1;
        } else if (entry.oldPublicId) {
          keepPublicIds.push(entry.oldPublicId);
        }
      });

      formData.append("payload", JSON.stringify(payload));
      formData.append("productImageMeta", JSON.stringify(meta));
      formData.append("keepPublicIds", JSON.stringify(keepPublicIds));

      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // after success: switch to view mode and refetch latest
      setIsEditMode(false);
      refetch();
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed. See console for details.");
    }
  };

  /* ---------------- UI subcomponents ---------------- */

  function ImageEditor() {
    return (
      <div>
        <label className="font-bold block mb-2">Product Images</label>

        {productImages.map((img, idx) => (
          <div key={idx} className="flex gap-3 items-center mb-3 border p-2 rounded">
            <div className="w-28 h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
              {img.url ? <img src={img.url} alt={`img-${idx}`} className="object-cover w-full h-full" /> : <div className="text-xs">No preview</div>}
            </div>

            <div className="flex-1">
              <div className="mb-2 text-sm">Type: {img.oldPublicId ? "Existing" : "New"}</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  replaceImageAtIndex(idx, f);
                }}
              />
              <div className="mt-2 flex gap-2">
                <button type="button" className="px-2 py-1 bg-red-300 rounded" onClick={() => removeImageAtIndex(idx)}>
                  Remove
                </button>
              </div>
              {img.oldPublicId ? <div className="mt-1 text-xs text-gray-500">oldPublicId: {img.oldPublicId}</div> : null}
            </div>
          </div>
        ))}

        <div className="mt-2 border p-3 rounded">
          <div className="mb-2">Add new image</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              addNewImage(f);
            }}
          />
        </div>
      </div>
    );
  }

  function ArrayInputSimple({ label, fieldArray, fieldName, placeholder }) {
    return (
      <div className="mt-4">
        <label className="font-bold block">{label}</label>
        <table className="w-full mt-2">
          <thead>
            <tr>
              <th className="text-left">Value</th>
              <th className="text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {fieldArray.fields.map((f, idx) => (
              <tr key={f.id}>
                <td className="py-2">
                  <input className="w-full border px-2" {...register(`${fieldName}.${idx}`)} placeholder={placeholder} />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-300 rounded"
                    onClick={() => {
                      if (fieldArray.fields.length === 1) {
                        fieldArray.replace(0, "");
                      } else {
                        fieldArray.remove(idx);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2">
          <button type="button" className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => fieldArray.append("")}>+ Add</button>
        </div>
      </div>
    );
  }

  function SpecCategoryEditor({ catIdx }) {
    // nested useFieldArray for subFields
    const subFA = useFieldArray({ control, name: `specification.${catIdx}.subFields` });

    return (
      <div className="space-y-2">
        {subFA.fields.map((sf, subIdx) => (
          <div key={sf.id} className="flex gap-2 items-center">
            <input placeholder="SubField" className="border px-2 py-1" {...register(`specification.${catIdx}.subFields.${subIdx}.subField`)} defaultValue={sf.subField} />
            <input placeholder="Details" className="border px-2 py-1 flex-1" {...register(`specification.${catIdx}.subFields.${subIdx}.details`)} defaultValue={sf.details} />
            <button
              type="button"
              className="px-2 py-1 bg-red-300 rounded"
              onClick={() => {
                if (subFA.fields.length === 1) {
                  subFA.replace(0, { subField: "", details: "" });
                } else {
                  subFA.remove(subIdx);
                }
              }}
            >
              X
            </button>
          </div>
        ))}
        <div>
          <button type="button" className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => subFA.append({ subField: "", details: "" })}>+ Add SubField</button>
        </div>
      </div>
    );
  }

  /* ------------------- View (read-only) UI ------------------- */
  function ViewMode() {
    return (
      <div>
        <div className="w-full h-15 rounded-2xl bg-rose-400 items-center flex justify-center text-3xl font-bold py-6 mb-4">Product Details</div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block font-semibold">Name</label>
            <div className="border px-3 py-1">{product?.name}</div>
          </div>

          <div>
            <label className="block font-semibold">Product No</label>
            <div className="border px-3 py-1">{product?.productNo}</div>
          </div>

          <div>
            <label className="block font-semibold">Brand</label>
            <div className="border px-3 py-1">{product?.brand?.name}</div>
          </div>

          <div>
            <label className="block font-semibold">Category</label>
            <div className="border px-3 py-1">{product?.category?.name}</div>
          </div>

          <div>
            <label className="block font-semibold">Sub Category</label>
            <div className="border px-3 py-1">{product?.subCategory?.name}</div>
          </div>

          <div>
            <label className="block font-semibold">MRP</label>
            <div className="border px-3 py-1">{product?.mrp}</div>
          </div>

          <div>
            <label className="block font-semibold">Discount %</label>
            <div className="border px-3 py-1">{product?.discount}</div>
          </div>

          <div>
            <label className="block font-semibold">Status</label>
            <div className="border px-3 py-1">{product?.isActive ? "Active" : "Inactive"}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Images</label>
          <div className="flex gap-2 mt-2">
            {(product?.productImage || []).map((img, i) => (
              <div key={i} className="w-32 h-32 border overflow-hidden"><img src={img.url} alt={`pimg-${i}`} className="object-contain w-full h-full" /></div>
            ))}
          </div>
        </div>

        <div className="mb-4 border p-3 rounded">
          <label className="block font-semibold mb-2">Minimal Information</label>
          <div>
            {product?.description?.minimalInformation && Object.entries(product.description.minimalInformation).map(([k, v]) => (
              <div key={k}><strong>{k}</strong>: {v}</div>
            ))}
          </div>
        </div>

        <div className="mb-4 border p-3 rounded">
          <label className="block font-semibold mb-2">About This Item</label>
          <div>
            {(product?.description?.aboutThisItem || []).length
              ? product.description.aboutThisItem.map((it, i) => (<div key={i} className="py-1">- {it}</div>))
              : <div className="text-gray-500">No points</div>}
          </div>
        </div>

        <div className="mb-4 border p-3 rounded">
          <label className="block font-semibold mb-2">What's In The Box</label>
          <div>
            {(product?.description?.whatsInThebox || []).length
              ? product.description.whatsInThebox.map((it, i) => (<div key={i} className="py-1">- {it}</div>))
              : <div className="text-gray-500">No items</div>}
          </div>
        </div>

        <div className="mb-6 border p-3 rounded">
          <label className="block font-semibold mb-2">Product Specification</label>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-2">Field</th>
                <th className="border px-2">Sub-field</th>
                <th className="border px-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(product?.description?.productSpecification || {}).map(([section, fields]) => Object.entries(fields).map(([subField, details]) => (
                <tr key={section + subField}><td className="border px-2">{section}</td><td className="border px-2">{subField}</td><td className="border px-2">{details}</td></tr>
              )))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsEditMode(true)}>Edit</button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => navigate("/products")}>Back</button>
        </div>
      </div>
    );
  }

  /* ------------------- Edit (form) UI ------------------- */
  if (isLoading) return <p>Loading product...</p>;
  if (isError) return <p>Failed to load product</p>;

  const watchedMrp = watch("mrp") || 0;
  const watchedDiscount = watch("discount") || 0;
  const salesPrice = ((Number(watchedMrp) || 0) * (100 - (Number(watchedDiscount) || 0))) / 100;

  return (
    <div className="p-4">
      {!isEditMode ? (
        <ViewMode />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Basic</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Name</label>
                  <input {...register("name")} className="border w-full px-2 py-1" />
                  {errors.name && <div className="text-red-500 text-sm">{String(errors.name.message)}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold">Brand</label>
                  <select {...register("brand")} className="border w-full px-2 py-1">
                    {/* previous/current value */}
                    {product?.brand && (
                      <option value={product.brand._id || product.brand.id}>{product.brand.name} (current)</option>
                    )}

                    {/* API options */}
                    {brandsData?.map((b) => (
                      <option key={b._id ?? b.id} value={b._id ?? b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold">Category</label>
                  <select
                    {...register("category")}
                    className="border w-full px-2 py-1"
                    onChange={(e) => {
                      // ensure react-hook-form gets the change
                      setValue("category", e.target.value);
                      // reset subcategory when category changes
                      setValue("subCategory", "");
                    }}
                  >
                    {product?.category && (
                      <option value={product.category._id || product.category.id}>{product.category.name} (current)</option>
                    )}

                    {categoriesData?.map((cat) => (
                      <option key={cat._id ?? cat.id} value={cat._id ?? cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold">Sub Category</label>

                  <select {...register("subCategory")} className="border w-full px-2 py-1">
                    {product?.subCategory && (
                      <option value={product.subCategory._id || product.subCategory.id}>{product.subCategory.name} (current)</option>
                    )}

                    {!selectedCategoryId && <option value="">Select a category first</option>}

                    {selectedCategoryId && (!subCategoriesData?.length ? (
                      <option value="">No subcategories found</option>
                    ) : (
                      subCategoriesData.map((sub) => (
                        <option key={sub._id ?? sub.id} value={sub._id ?? sub.id}>{sub.name}</option>
                      ))
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm">MRP</label>
                  <input type="number" {...register("mrp", { valueAsNumber: true })} className="border w-full px-2 py-1" />
                  {errors.mrp && <div className="text-red-500 text-sm">{String(errors.mrp.message)}</div>}
                </div>

                <div>
                  <label className="block text-sm">Discount %</label>
                  <input type="number" {...register("discount", { valueAsNumber: true })} className="border w-full px-2 py-1" />
                  {errors.discount && <div className="text-red-500 text-sm">{String(errors.discount.message)}</div>}
                </div>

                <div>
                  <label className="block text-sm">Sales Price (computed)</label>
                  <div className="border px-2 py-1"><span>{isNaN(salesPrice) ? "" : salesPrice.toFixed(2)}</span></div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm">Status</label>
                  <Controller control={control} name="isActive" render={({ field }) => <input type="checkbox" {...field} checked={!!field.value} />} />
                </div>
              </div>
            </section>

            <section className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Images</h3>
              <ImageEditor />
            </section>

            <section className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Description</h3>

              <div className="mb-4">
                <label className="block text-sm">Brief</label>
                <input {...register("brief")} className="border w-full px-2 py-1" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold">Minimal Information</label>
                <div className="space-y-2">
                  {minimalFA.fields.map((f, idx) => (
                    <div key={f.id} className="flex gap-2">
                      <input placeholder="Field" className="border px-2 py-1" {...register(`minimalRows.${idx}.key`)} />
                      <input placeholder="Value" className="border px-2 py-1 flex-1" {...register(`minimalRows.${idx}.value`)} />
                      <button
                        type="button"
                        className="px-2 py-1 bg-red-300 rounded"
                        onClick={() => {
                          if (minimalFA.fields.length === 1) minimalFA.replace(0, { key: "", value: "" });
                          else minimalFA.remove(idx);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  <div>
                    <button type="button" className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => minimalFA.append({ key: "", value: "" })}>+ Add Row</button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold">Product Specification</label>
                <div className="space-y-3">
                  {specFA.fields.map((catField, catIdx) => (
                    <div key={catField.id} className="border p-3 rounded">
                      <div className="flex gap-2 items-center mb-2">
                        <input placeholder="Category" className="border px-2 py-1 flex-1" {...register(`specification.${catIdx}.category`)} />
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-400 text-white rounded"
                          onClick={() => {
                            if (specFA.fields.length === 1) specFA.replace(0, { category: "", subFields: [{ subField: "", details: "" }] });
                            else specFA.remove(catIdx);
                          }}
                        >
                          Delete Category
                        </button>
                      </div>

                      <SpecCategoryEditor catIdx={catIdx} />
                    </div>
                  ))}

                  <div>
                    <button type="button" className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => specFA.append({ category: "", subFields: [{ subField: "", details: "" }] })}>+ Add Category</button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <ArrayInputSimple label="What's In The Box" fieldArray={whatsFA} fieldName="whatsInTheBox" placeholder="Item in box" />
              </div>

              <div className="mb-4">
                <ArrayInputSimple label="About This Item" fieldArray={aboutFA} fieldName="aboutThisItem" placeholder="Bullet point" />
              </div>
            </section>

            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">{isSubmitting ? "Saving..." : "Save"}</button>

              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  // cancel => go back to view mode without changing remote data
                  setIsEditMode(false);
                  // reset form values to current product
                  if (product) {
                    const dv = {
                      name: product.name ?? "",
                      brand: product.brand?._id ?? product.brand?.id ?? "",
                      category: product.category?._id ?? product.category?.id ?? "",
                      subCategory: product.subCategory?._id ?? product.subCategory?.id ?? "",
                      mrp: product.mrp ?? 0,
                      discount: product.discount ?? 0,
                      isActive: !!product.isActive,
                      brief: product.description?.brief ?? "",
                      minimalRows:
                        product.description?.minimalInformation && Object.keys(product.description.minimalInformation).length > 0
                          ? Object.entries(product.description.minimalInformation).map(([k, v]) => ({ key: k, value: String(v) }))
                          : [{ key: "", value: "" }],
                      specification:
                        product.description?.productSpecification && Object.keys(product.description.productSpecification).length > 0
                          ? Object.entries(product.description.productSpecification).map(([category, fields]) => ({
                              category,
                              subFields: Object.entries(fields ?? {}).map(([subField, details]) => ({ subField, details: String(details ?? "") })),
                            }))
                          : [{ category: "", subFields: [{ subField: "", details: "" }] }],
                      whatsInTheBox: product.description?.whatsInThebox?.length ? product.description.whatsInThebox : [""],
                      aboutThisItem: product.description?.aboutThisItem?.length ? product.description.aboutThisItem : [""],
                    };
                    reset(dv);
                    const imgs = (product.productImage ?? []).map((img) => ({ oldPublicId: img.public_id ?? img.publicId ?? null, url: img.url ?? null }));
                    setProductImages(imgs);
                  }
                }}
              >
                Cancel
              </button>

              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsEditMode(false)}>Back to View</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
