import React, { useEffect, useRef, useState } from "react";

import api from "../../api";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* ─────────────────────────────────────────────
   Zod Schema
───────────────────────────────────────────── */
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
  mrp: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number().min(0, "MRP must be ≥ 0")
  ),
  discount: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number().min(0).max(100)
  ),
  isActive: z.boolean().optional(),
  brief: z.string().optional(),
  minimalRows: z.array(MinimalRowSchema).optional(),
  specification: z.array(SpecCategorySchema).optional(),
  whatsInTheBox: z.array(z.string().min(1)).optional(),
  aboutThisItem: z.array(z.string().min(1)).optional(),
});

/* ─────────────────────────────────────────────
   Reusable Design Components
───────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-3xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-xl font-semibold mb-5">{children}</h2>;
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="font-semibold mt-2">{value || "N/A"}</h3>
    </div>
  );
}

function InputField({ label, register, type = "text", error }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type={type}
        {...register}
        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, register, children, error }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <select
        {...register}
        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition bg-white appearance-none"
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Btn({ children, onClick, type = "button", variant = "default", disabled, className = "" }) {
  const base = "px-5 py-2.5 rounded-2xl transition font-medium text-sm disabled:opacity-50";
  const variants = {
    default: "border border-gray-300 hover:bg-gray-100",
    primary: "bg-black text-white hover:opacity-90",
    danger: "border border-red-300 text-red-500 hover:bg-red-50",
    ghost: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    icon: "bg-red-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-red-600",
    green: "bg-black text-white px-4 py-2 rounded-xl hover:opacity-80 text-sm",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function EditProducts({id,onClose}) {
  

  const objectUrlsRef = useRef([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);

  /* ── Fetch product ── */
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

  /* ── Fetch brands ── */
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await api.get("/brands");
      return res.data?.data ?? res.data;
    },
  });

  /* ── Fetch categories ── */
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data?.data ?? res.data;
    },
  });

  /* ── Form ── */
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

  const selectedCategoryId = watch("category");
  const watchedMrp = watch("mrp") || 0;
  const watchedDiscount = watch("discount") || 0;
  const sellingPrice = ((Number(watchedMrp) || 0) * (100 - (Number(watchedDiscount) || 0))) / 100;

  /* ── Fetch subcategories ── */
  const { data: subCategoriesData } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const res = await api.get(`/categories/${selectedCategoryId}/subcategories`);
      return res.data?.data ?? res.data;
    },
    enabled: !!selectedCategoryId,
  });

  /* ── Field arrays ── */
  const minimalFA = useFieldArray({ control, name: "minimalRows" });
  const specFA = useFieldArray({ control, name: "specification" });
  const whatsFA = useFieldArray({ control, name: "whatsInTheBox" });
  const aboutFA = useFieldArray({ control, name: "aboutThisItem" });

  /* ── Populate form when product loads ── */
  const buildDefaultValues = (p) => ({
    name: p.name ?? "",
    brand: p.brand?._id ?? p.brand?.id ?? "",
    category: p.category?._id ?? p.category?.id ?? "",
    subCategory: p.subCategory?._id ?? p.subCategory?.id ?? "",
    mrp: p.mrp ?? 0,
    discount: p.discount ?? 0,
    isActive: !!p.isActive,
    brief: p.description?.brief ?? "",
    minimalRows:
      p.description?.minimalInformation &&
      Object.keys(p.description.minimalInformation).length > 0
        ? Object.entries(p.description.minimalInformation).map(([k, v]) => ({
            key: k,
            value: String(v),
          }))
        : [{ key: "", value: "" }],
    specification:
      p.description?.productSpecifications &&
      Object.keys(p.description.productSpecifications).length > 0
        ? Object.entries(p.description.productSpecifications).map(([category, fields]) => ({
            category,
            subFields: Object.entries(fields ?? {}).map(([subField, details]) => ({
              subField,
              details: String(details ?? ""),
            })),
          }))
        : [{ category: "", subFields: [{ subField: "", details: "" }] }],
    whatsInTheBox: p.description?.whatsInTheBox?.length ? p.description.whatsInTheBox : [""],
    aboutThisItem: p.description?.aboutThisItem?.length ? p.description.aboutThisItem : [""],
  });

  useEffect(() => {
    if (!product) return;
    reset(buildDefaultValues(product));
    setProductImages(
      (product.productImage ?? []).map((img) => ({
        oldPublicId: img.public_id ?? img.publicId ?? null,
        url: img.url ?? null,
      }))
    );
  }, [product, reset]);

  /* ── Cleanup object URLs ── */
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
      objectUrlsRef.current = [];
    };
  }, []);

  /* ── Image handlers ── */
  const replaceImageAtIndex = (index, file) => {
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objUrl);
    setProductImages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], file, url: objUrl };
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

  /* ── Helpers ── */
  const buildProductSpecification = (specArr) => {
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
  };

  /* ── Submit ── */
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
          productSpecifications: {},
          whatsInTheBox: (values.whatsInTheBox || []).filter(Boolean),
          aboutThisItem: (values.aboutThisItem || []).filter(Boolean),
        },
      };

      (values.minimalRows || []).forEach((r) => {
        const k = (r.key || "").toString().trim();
        if (k) payload.description.minimalInformation[k] = r.value || "";
      });

      payload.description.productSpecifications = buildProductSpecification(values.specification);

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

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
      setIsEditMode(false);
      refetch();
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed. See console for details.");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (product) {
      reset(buildDefaultValues(product));
      setProductImages(
        (product.productImage ?? []).map((img) => ({
          oldPublicId: img.public_id ?? img.publicId ?? null,
          url: img.url ?? null,
        }))
      );
    }
  };

  /* ─────────────────────────────────────────────
     Sub-components (defined inside to access control/register)
  ───────────────────────────────────────────── */

  /* Nested spec subfields */
  function SpecCategoryEditor({ catIdx }) {
    const subFA = useFieldArray({ control, name: `specification.${catIdx}.subFields` });
    return (
      <div className="space-y-2 mt-3">
        {subFA.fields.map((sf, subIdx) => (
          <div key={sf.id} className="flex gap-2 items-center">
            <input
              placeholder="Sub-field name"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition flex-1"
              {...register(`specification.${catIdx}.subFields.${subIdx}.subField`)}
            />
            <input
              placeholder="Details"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition flex-[2]"
              {...register(`specification.${catIdx}.subFields.${subIdx}.details`)}
            />
            <button
              type="button"
              onClick={() => {
                if (subFA.fields.length === 1) subFA.replace(0, { subField: "", details: "" });
                else subFA.remove(subIdx);
              }}
              className="px-3 py-2 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm hover:bg-red-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => subFA.append({ subField: "", details: "" })}
          className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1 mt-1"
        >
          + Add sub-field
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Loading / Error
  ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading Product...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Failed to load product
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 overflow-y-auto  bg-gray-50 text-black">

      {/* SUCCESS TOAST */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-lg text-sm font-medium">
          ✓ Product Successfully Updated
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {isEditMode ? "Edit Product" : "Product Details"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage product information and inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <Btn variant="primary" onClick={() => setIsEditMode(true)}>
                Edit Product
              </Btn>
            )}
            <Btn variant="default" onClick={ onClose}>
              Back
            </Btn>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto p-6">

        {/* ══════════════════════════════════
            VIEW MODE
        ══════════════════════════════════ */}
        {!isEditMode ? (
          <div className="space-y-6">

            {/* Basic Info */}
            <Card>
              <SectionTitle>Basic Information</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard title="Product Name" value={product?.name} />
                <InfoCard title="Product Number" value={product?.productNo} />
                <InfoCard title="Brand" value={product?.brand?.name} />
                <InfoCard title="Category" value={product?.category?.name} />
                <InfoCard title="Sub Category" value={product?.subCategory?.name} />
                <InfoCard title="MRP" value={`₹${product?.mrp}`} />
                <InfoCard title="Discount" value={`${product?.discount}%`} />
                <InfoCard
                  title="Status"
                  value={product?.isActive ? "Active" : "Inactive"}
                />
              </div>
            </Card>

            {/* Images */}
            <Card>
              <SectionTitle>Product Images</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(product?.productImage || []).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden border border-gray-200"
                  >
                    <img src={img.url} alt="product" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card>
              <SectionTitle>Product Description</SectionTitle>
              <p className="text-gray-700 leading-7">
                {product?.description?.brief || "No Description"}
              </p>
            </Card>

            {/* Minimal Information */}
            {product?.description?.minimalInformation &&
              Object.keys(product.description.minimalInformation).length > 0 && (
                <Card>
                  <SectionTitle>Minimal Information</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.description.minimalInformation).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3"
                      >
                        <span className="text-sm text-gray-500 min-w-max">{k}</span>
                        <span className="text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            {/* About This Item */}
            {product?.description?.aboutThisItem?.length > 0 && (
              <Card>
                <SectionTitle>About This Item</SectionTitle>
                <ul className="space-y-2">
                  {product.description.aboutThisItem.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* What's In The Box */}
            {product?.description?.whatsInTheBox?.length > 0 && (
              <Card>
                <SectionTitle>What's In The Box</SectionTitle>
                <ul className="space-y-2">
                  {product.description.whatsInTheBox.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Product Specifications */}
            {product?.description?.productSpecifications &&
              Object.keys(product.description.productSpecifications).length > 0 && (
                <Card>
                  <SectionTitle>Product Specifications</SectionTitle>
                  <div className="space-y-5">
                    {Object.entries(product.description.productSpecifications).map(
                      ([section, fields]) => (
                        <div key={section}>
                          <h3 className="font-semibold text-sm text-gray-500 mb-2 uppercase tracking-wide">
                            {section}
                          </h3>
                          <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            {Object.entries(fields).map(([subField, details], i, arr) => (
                              <div
                                key={subField}
                                className={`flex px-5 py-3 ${i !== arr.length - 1 ? "border-b border-gray-200" : ""}`}
                              >
                                <span className="text-sm text-gray-500 w-1/3">{subField}</span>
                                <span className="text-sm font-medium">{details}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}
          </div>

        ) : (
          /* ══════════════════════════════════
              EDIT MODE
          ══════════════════════════════════ */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic Info */}
            <Card>
              <SectionTitle>Basic Information</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Product Name"
                  register={register("name")}
                  error={errors.name?.message}
                />

                {/* Brand */}
                <SelectField label="Brand" register={register("brand")} error={errors.brand?.message}>
                  <option value="">Select brand</option>
                  {brandsData?.map((b) => (
                    <option key={b._id ?? b.id} value={b._id ?? b.id}>
                      {b.name}
                    </option>
                  ))}
                </SelectField>

                {/* Category */}
                <SelectField
                  label="Category"
                  register={{
                    ...register("category"),
                    onChange: (e) => {
                      setValue("category", e.target.value);
                      setValue("subCategory", "");
                    },
                  }}
                  error={errors.category?.message}
                >
                  <option value="">Select category</option>
                  {categoriesData?.map((cat) => (
                    <option key={cat._id ?? cat.id} value={cat._id ?? cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </SelectField>

                {/* Sub Category */}
                <SelectField label="Sub Category" register={register("subCategory")} error={errors.subCategory?.message}>
                  <option value="">{!selectedCategoryId ? "Select a category first" : "Select sub-category"}</option>
                  {subCategoriesData?.map((sub) => (
                    <option key={sub._id ?? sub.id} value={sub._id ?? sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </SelectField>

                <InputField
                  label="MRP (₹)"
                  type="number"
                  register={register("mrp", { valueAsNumber: true })}
                  error={errors.mrp?.message}
                />

                <InputField
                  label="Discount %"
                  type="number"
                  register={register("discount", { valueAsNumber: true })}
                  error={errors.discount?.message}
                />

                {/* Selling Price */}
                <div>
                  <label className="text-sm text-gray-500">Selling Price</label>
                  <div className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-semibold">
                    ₹{isNaN(sellingPrice) ? "—" : sellingPrice.toFixed(2)}
                  </div>
                </div>

                {/* Status toggle */}
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-sm text-gray-500">Status</label>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                          field.value ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            field.value ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  />
                  <span className="text-sm font-medium">
                    {watch("isActive") ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card>
              <SectionTitle>Product Images</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group"
                  >
                    {img.url ? (
                      <img src={img.url} alt={`img-${index}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                        No preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-3">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-gray-100 transition">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => replaceImageAtIndex(index, e.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeImageAtIndex(index)}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                    {img.oldPublicId && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-lg">
                        Saved
                      </span>
                    )}
                  </div>
                ))}

                {/* Add new image slot */}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition group">
                  <span className="text-3xl text-gray-300 group-hover:text-gray-600 transition">+</span>
                  <span className="text-xs text-gray-400 mt-1">Add image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => addNewImage(e.target.files?.[0])}
                  />
                </label>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <SectionTitle>Description</SectionTitle>
              <div>
                <label className="text-sm text-gray-500">Brief</label>
                <textarea
                  rows={5}
                  {...register("brief")}
                  className="w-full mt-2 border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-black transition resize-none"
                />
              </div>
            </Card>

            {/* Minimal Information */}
            <Card>
              <SectionTitle>Minimal Information</SectionTitle>
              <div className="space-y-3">
                {minimalFA.fields.map((f, idx) => (
                  <div key={f.id} className="flex gap-3 items-center">
                    <input
                      placeholder="Field name"
                      className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition flex-1 text-sm"
                      {...register(`minimalRows.${idx}.key`)}
                    />
                    <input
                      placeholder="Value"
                      className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition flex-[2] text-sm"
                      {...register(`minimalRows.${idx}.value`)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (minimalFA.fields.length === 1) minimalFA.replace(0, { key: "", value: "" });
                        else minimalFA.remove(idx);
                      }}
                      className="px-3 py-3 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm hover:bg-red-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => minimalFA.append({ key: "", value: "" })}
                  className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1"
                >
                  + Add row
                </button>
              </div>
            </Card>

            {/* Product Specifications */}
            <Card>
              <SectionTitle>Product Specifications</SectionTitle>
              <div className="space-y-4">
                {specFA.fields.map((catField, catIdx) => (
                  <div
                    key={catField.id}
                    className="border border-gray-200 rounded-2xl p-5"
                  >
                    <div className="flex gap-3 items-center mb-1">
                      <input
                        placeholder="Category name (e.g. Display, Battery)"
                        className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-black transition flex-1 text-sm font-semibold"
                        {...register(`specification.${catIdx}.category`)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (specFA.fields.length === 1)
                            specFA.replace(0, { category: "", subFields: [{ subField: "", details: "" }] });
                          else specFA.remove(catIdx);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                    <SpecCategoryEditor catIdx={catIdx} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => specFA.append({ category: "", subFields: [{ subField: "", details: "" }] })}
                  className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1"
                >
                  + Add category
                </button>
              </div>
            </Card>

            {/* What's In The Box */}
            <Card>
              <SectionTitle>What's In The Box</SectionTitle>
              <div className="space-y-3">
                {whatsFA.fields.map((f, idx) => (
                  <div key={f.id} className="flex gap-3 items-center">
                    <input
                      placeholder="Item in box"
                      className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition flex-1 text-sm"
                      {...register(`whatsInTheBox.${idx}`)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (whatsFA.fields.length === 1) whatsFA.replace(0, "");
                        else whatsFA.remove(idx);
                      }}
                      className="px-3 py-3 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm hover:bg-red-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => whatsFA.append("")}
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  + Add item
                </button>
              </div>
            </Card>

            {/* About This Item */}
            <Card>
              <SectionTitle>About This Item</SectionTitle>
              <div className="space-y-3">
                {aboutFA.fields.map((f, idx) => (
                  <div key={f.id} className="flex gap-3 items-center">
                    <input
                      placeholder="Bullet point"
                      className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition flex-1 text-sm"
                      {...register(`aboutThisItem.${idx}`)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (aboutFA.fields.length === 1) aboutFA.replace(0, "");
                        else aboutFA.remove(idx);
                      }}
                      className="px-3 py-3 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm hover:bg-red-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => aboutFA.append("")}
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  + Add point
                </button>
              </div>
            </Card>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-4">
              <Btn type="button" variant="default" onClick={handleCancel}>
                Cancel
              </Btn>
              <Btn
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}