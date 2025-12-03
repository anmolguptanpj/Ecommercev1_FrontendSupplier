import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import { useQuery } from '@tanstack/react-query'

function EditProducts() {

    /************************************** View Space **********************/
    const [edit, setEdit] = useState(false)
    const navigate = useNavigate()
    const { id } = useParams()

    // for dynamic table row counts (you actually don't need these, but keeping them)
    const [minRows, setMinRows] = useState(1)
    const [specRows, setSpecRows] = useState(1)

    // dynamic row data states
    const [minimalRows, setMinimalRows] = useState([
        { key: "", value: "" }
    ])

    const [specificationRows, setSpecificationRows] = useState([
        { category: "", subField: "", details: "" }
    ])

    const fetchProduct = async () => {
        const res = await api.get(`/products/${id}`)
        return res.data
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["product", id],
        queryFn: fetchProduct,
        enabled: !!id,
    })

    if (isLoading) return <p>loading product details.....</p>
    if (isError) return <p>Fetching product details failed .....</p>

    const product = data?.data
    console.log(product)

    /******************** Edit Form *******************/
    const [form, SetForm] = useState({
        name: "",
        brand: "",
        subCategory: "",
        category: "",
        mrp: "",
        discount: "",
        isActive: "",
        productImage: [],
        description: {
            minimalInformation: {},
            brief: "",
            whatsInThebox: [],
            aboutThisItem: [],
            productSpecification: {},
        }
    })

    useEffect(() => {
        if (product) {
            SetForm({
                name: product.name || "",
                brand: product.brand?.name || "",
                subCategory: product.subCategory?.name || "",
                category: product.category?.name || "",
                mrp: product.mrp || "",
                discount: product.discount || "",
                isActive: product.isActive || "",
                productImage: product.productImage || [],
                description: {
                    minimalInformation: product.description?.minimalInformation || {},
                    brief: product.description?.brief || "",
                    aboutThisItem: product.description?.aboutThisItem || [],
                    whatsInThebox: product.description?.whatsInThebox || [],
                    productSpecification: product.description?.productSpecification || {}
                }
            })

            // Pre-fill row tables based on existing minimal info
            const minimalEntries = product.description?.minimalInformation
            if (minimalEntries) {
                const arr = Object.entries(minimalEntries).map(([k, v]) => ({ key: k, value: v }))
                setMinimalRows(arr.length ? arr : [{ key: "", value: "" }])
                setMinRows(arr.length || 1)
            }

            // Pre-fill specification rows
            const spec = product.description?.productSpecification
            if (spec) {
                const arr = []
                Object.entries(spec).forEach(([category, fields]) => {
                    Object.entries(fields).forEach(([sub, detail]) => {
                        arr.push({ category, subField: sub, details: detail })
                    })
                })

                setSpecificationRows(arr.length ? arr : [{ category: "", subField: "", details: "" }])
                setSpecRows(arr.length || 1)
            }
        }
    }, [product])

    const handleChange = (e) => {
        SetForm({ ...form, [e.target.name]: e.target.value })
    }

    const handlebrief = (e) => {
        SetForm({
            ...form,
            description: {
                ...form.description,
                brief: e.target.value
            }
        })
    }

    /**************** Minimal Information ****************/
    const addMinRow = () => {
        setMinimalRows(prev => [...prev, { key: "", value: "" }])
        setMinRows(prev => prev + 1)
    }

    const removeMinRow = () => {
        if (minimalRows.length > 1) {
            setMinimalRows(prev => prev.slice(0, prev.length - 1))
            setMinRows(prev => prev - 1)
        }
    }

    const handleMinInput = (index, field, value) => {
        const updated = [...minimalRows]
        updated[index][field] = value
        setMinimalRows(updated)

        // sync to form
        const obj = {}
        updated.forEach(r => {
            if (r.key.trim() !== "") obj[r.key] = r.value
        })

        SetForm({
            ...form,
            description: {
                ...form.description,
                minimalInformation: obj
            }
        })
    }

    /**************** Product Specification ****************/
    const addSpecRow = () => {
        setSpecificationRows(prev => [...prev, { category: "", subField: "", details: "" }])
        setSpecRows(prev => prev + 1)
    }

    const removeSpecRow = () => {
        if (specificationRows.length > 1) {
            setSpecificationRows(prev => prev.slice(0, prev.length - 1))
            setSpecRows(prev => prev - 1)
        }
    }

    const handleSpecInput = (index, field, value) => {
        const updated = [...specificationRows]
        updated[index][field] = value
        setSpecificationRows(updated)

        // merge into nested object
        const nested = {}
        updated.forEach(r => {
            if (!r.category) return

            if (!nested[r.category]) nested[r.category] = {}

            if (r.subField.trim() !== "")
                nested[r.category][r.subField] = r.details
        })

        SetForm({
            ...form,
            description: {
                ...form.description,
                productSpecification: nested
            }
        })
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/products/${id}`, form)
            setEdit(false)
            // optionally refetch or navigate
            // navigate('/products')
        } catch (err) {
            console.error("Update failed:", err)
        }
    }

    const mrpNum = Number(form.mrp) || 0
    const discountNum = Number(form.discount) || 0
    const salesPrice = mrpNum * (100 - discountNum) / 100

    console.log(form)

    return (
        <div className='flex w-full h-full '>

            {edit === false ? (

                /******************* View function UI ************ */
                <div className='w-full h-15 px-4'>
                    <div className='w-full h-15 rounded-2xl bg-rose-400 items-center flex justify-center text-3xl font-bold py-6'>
                        Product Details
                    </div>

                    <div className='flex flex-col gap-2 py-3 w-full justify-center'>
                        <div className='flex gap-3 '>
                            <label>Name :</label>
                            <div className='border px-4 text-center '> {product?.name}</div>
                        </div>

                        <div className='flex gap-3'>
                            <label>Product No :</label>
                            <div className='border px-4 text-center '> {product?.productNo}</div>
                        </div>

                        <div className='flex gap-3'>
                            <label>Brand :</label>
                            <div className='border px-4 text-center '> {product?.brand?.name}</div>
                        </div>

                        <div className='flex gap-3'>
                            <label >Sub Category :</label>
                            <div className='border px-4 text-center ' >{product?.subCategory?.name}</div>
                        </div>

                        <div className='flex gap-3' >
                            <label>Category :</label>
                            <div className='border px-4 text-center'  >{product?.category?.name}</div>
                        </div>

                        <div className='flex gap-3' >
                            <label>SalesPrice : </label>
                            <div className='border px-4 text-center ' >{product?.salesPrice}</div>
                        </div>

                        <div className='flex gap-3' >
                            <label>MRP : </label>
                            <div className='border px-4 text-center ' >{product?.mrp}</div>
                        </div>

                        <div className='flex gap-3' >
                            <label> Status : </label>
                            <div className='border w-20 text-center px-4' > {(product?.isActive) ? "Active" : "Inactive"}</div>
                        </div>

                        <div className='flex gap-3' >
                            <label >Discount % :</label>
                            <div className='border px-4 w-20 text-center '  >
                                <p>{product?.discount}<span>%</span></p>
                            </div>
                        </div>

                        <div>
                            {(product?.productImage || []).map((image, index) => (
                                <div className='w-32 h-32' key={index}>
                                    <img src={image.url} className='object-contain' alt={product?.name} />
                                </div>
                            ))}
                        </div>

                        <div className='flex flex-col border-2 w-full '>
                            <div className='px-3 py-2'>
                                <div className='flex gap-3'>
                                    <label>Minimal Information</label>
                                    <div className='border px-4 text-center'>
                                        {/* simple representation */}
                                        {product.description && product.description.minimalInformation &&
                                            Object.entries(product.description.minimalInformation).map(([k, v]) => (
                                                <div key={k}>{k}: {v}</div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className='flex gap-3'>
                                    <label>Brief</label>
                                    <div className='border px-4 text-center' >
                                        {product.description?.brief}
                                    </div>
                                </div>

                                <div className='flex gap-3' >
                                    <label>About this item</label>
                                    <div className='border px-4 text-center' >
                                        {product.description?.aboutThisItem}
                                    </div>
                                </div>

                                <div className='flex-col flex justify-center items-center'>
                                    <div className='py-5 w-full flex items-center justify-center '>
                                        <label className=' font-bold h-7 bg-blue-500 w-full rounded-2xl text-center ' >
                                            Product Specification
                                        </label>
                                    </div>
                                    <table className=''>
                                        <tbody>
                                            <tr>
                                                <th className='px-3 border-2 '>Field</th>
                                                <th className='px-3 border-2'>Sub-field</th>
                                                <th className='px-3 border-2'>Subdetails</th>
                                            </tr>
                                            {Object.entries(product.description?.productSpecification ?? {}).map(
                                                ([section, fields]) => (
                                                    Object.entries(fields).map(([subField, details]) => (
                                                        <tr key={section + subField}>
                                                            <td className='px-3 border-2 '>{section}</td>
                                                            <td className='px-3 border-2 '>{subField}</td>
                                                            <td className='px-3 border-2'>{details}</td>
                                                        </tr>
                                                    ))
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
                            <button
                                onClick={() => setEdit(true)}
                                className='px-4 py-1 rounded-xl bg-blue-500'
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => navigate("/products")}
                                className='px-4 py-1 rounded-xl bg-green-500 '
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>

            ) : (

                /******************* Edit function UI *************/
                <div className='px-4 w-full h-full '>
                    <div className='flex flex-col border-2 justify-center '>
                        <form className='flex flex-col gap-3 px-6 py-6' onSubmit={handleEdit}>
                            <fieldset>
                                <legend>Product Introduction and Pricing</legend>

                                <div>
                                    <label>Product Name</label>
                                    <div>
                                        <input
                                            name='name'
                                            placeholder='Write your product Name'
                                            className='border-2'
                                            value={form.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label>Brand</label>
                                    <div>
                                        <select
                                            name='brand'
                                            className='border-2'
                                            value={form.brand}
                                            onChange={handleChange}
                                        >
                                            <option value={product.brand.id}>{form.brand}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label>Category</label>
                                    <div>
                                        <select
                                            name='category'
                                            className='border-2'
                                            value={form.category}
                                            onChange={handleChange}
                                        >
                                            <option value={product.category.id}>{form.category}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label>SubCategory</label>
                                    <div>
                                        <select
                                            name='subCategory'
                                            className='border-2'
                                            value={form.subCategory}
                                            onChange={handleChange}
                                        >
                                            <option value={product.subCategory.id}>{form.subCategory}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label>MRP</label>
                                    <div>
                                        <input
                                            type='number'
                                            name='mrp'
                                            placeholder='Write your Product MRP'
                                            className='border-2'
                                            value={form.mrp}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label>Discount %</label>
                                    <div>
                                        <input
                                            name='discount'
                                            placeholder='Write the appropriate discount %'
                                            className='border-2'
                                            value={form.discount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label>SalesPrice</label>
                                    <div>
                                        <input
                                            placeholder='Sales price'
                                            disabled
                                            className='border-2'
                                            value={salesPrice}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Product Description</legend>

                                <div>
                                    <label>Brief</label>
                                    <div>
                                        <input
                                            name='brief'
                                            placeholder='Write your Product brief or one word details '
                                            className='border-2'
                                            value={form.description.brief}
                                            onChange={handlebrief}
                                        />
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
                                            </tr>

                                            {minimalRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <input
                                                            className='border'
                                                            value={row.key}
                                                            onChange={(e) => handleMinInput(idx, "key", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className='border'
                                                            value={row.value}
                                                            onChange={(e) => handleMinInput(idx, "value", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button type="button" onClick={addMinRow}>Add Row</button>
                                    <button type="button" onClick={removeMinRow}>Delete Row</button>
                                </div>

                                {/* Product Specification */}
                                <div>
                                    <label>Product Specification</label>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th>Category</th>
                                                <th>SubField</th>
                                                <th>Details</th>
                                            </tr>

                                            {specificationRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <input
                                                            className='border'
                                                            value={row.category}
                                                            onChange={(e) => handleSpecInput(idx, "category", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className='border'
                                                            value={row.subField}
                                                            onChange={(e) => handleSpecInput(idx, "subField", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className='border'
                                                            value={row.details}
                                                            onChange={(e) => handleSpecInput(idx, "details", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button type="button" onClick={addSpecRow}>Add Row</button>
                                    <button type="button" onClick={removeSpecRow}>Delete Row</button>
                                </div>
                            </fieldset>

                            <div className='flex gap-4 mt-4'>
                                <button
                                    type="submit"
                                    className='px-4 py-1 rounded-xl bg-blue-500 text-white'
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className='px-4 py-1 rounded-xl bg-gray-400 '
                                    onClick={() => setEdit(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div>
                        <button
                            className='px-4 py-1 rounded-xl bg-green-500 '
                            onClick={() => {
                                setEdit(false)
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EditProducts
