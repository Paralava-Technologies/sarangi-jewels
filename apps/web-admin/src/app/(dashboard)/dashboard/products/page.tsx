'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories, uploadFile, type Product, type Category } from '@/lib/api';
import { Pagination } from '@/components/Pagination';
import { RichTextEditor } from '@/components/RichTextEditor';
function formatPrice(cents: number, currency = 'INR') {
  return (cents / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

export default function ProductsPage(): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    isRental: false,
    basePrice: 0,
    rentPrice: '' as number | '',
    rentalDeposit: '' as number | '',
    material: '',
    purity: '',
    gemstone: '',
    weightGrams: '',
    composition: '',
    careInstructions: '',
    sizeAndFit: '',
    shippingAndReturns: '',
    hsnCode: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([fetchProducts(page), fetchCategories(1, 100)]);
      setProducts(prodRes.data);
      setTotalPages(prodRes.meta.totalPages || 1);
      
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: catRes.data[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [formData.categoryId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.categoryId,
      isRental: product.isRental || false,
      basePrice: product.basePriceCents / 100,
      rentPrice: product.rentPriceCents ? product.rentPriceCents / 100 : '',
      rentalDeposit: product.rentalDepositCents ? product.rentalDepositCents / 100 : '',
      material: product.material || '',
      purity: product.purity || '',
      gemstone: product.gemstone || '',
      weightGrams: product.weightGrams ? String(product.weightGrams) : '',
      composition: product.composition || '',
      careInstructions: product.careInstructions || '',
      sizeAndFit: product.sizeAndFit || '',
      shippingAndReturns: product.shippingAndReturns || '',
      hsnCode: product.hsnCode || '',
    });
    setVariants(product.variants?.map((v: any) => ({ ...v, price: v.priceCents / 100, rentPrice: v.rentPriceCents ? v.rentPriceCents / 100 : '', rentalDeposit: v.rentalDepositCents ? v.rentalDepositCents / 100 : '' })) || []);
    setImages(product.images || []);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProductId(null);
    setVariants([]);
    setImages([]);
    setFormData({
      name: '', slug: '', description: '', categoryId: categories[0]?.id || '', isRental: false, basePrice: 0, rentPrice: '', rentalDeposit: '', material: '', purity: '', gemstone: '', weightGrams: '', composition: '', careInstructions: '', sizeAndFit: '', shippingAndReturns: '', hsnCode: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const sanitizedSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const payload = {
        ...formData,
        slug: sanitizedSlug,
        description: formData.description || undefined,
        material: formData.material || undefined,
        purity: formData.purity || undefined,
        gemstone: formData.gemstone || undefined,
        composition: formData.composition || undefined,
        careInstructions: formData.careInstructions || undefined,
        sizeAndFit: formData.sizeAndFit || undefined,
        shippingAndReturns: formData.shippingAndReturns || undefined,
        hsnCode: formData.hsnCode || undefined,
        basePriceCents: Math.round(Number(formData.basePrice) * 100),
        rentPriceCents: formData.rentPrice !== '' ? Math.round(Number(formData.rentPrice) * 100) : null,
        rentalDepositCents: formData.rentalDeposit !== '' ? Math.round(Number(formData.rentalDeposit) * 100) : null,
        weightGrams: formData.weightGrams ? Number(formData.weightGrams) : undefined,
        variants: variants.map(v => ({ ...v, priceCents: Math.round(Number(v.price) * 100), rentPriceCents: v.rentPrice !== '' ? Math.round(Number(v.rentPrice) * 100) : null, rentalDepositCents: v.rentalDeposit !== '' ? Math.round(Number(v.rentalDeposit) * 100) : null, stockQuantity: Number(v.stockQuantity) })),
        images: images.map((img, idx) => ({ ...img, sortOrder: idx })),
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }
      handleCancel();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      const newImages = [...images];
      newImages[idx].url = url;
      setImages(newImages);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Products</h1>
            <button 
              onClick={() => { setLoading(true); load(); }}
              disabled={loading}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
              title="Refresh Products"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Create and manage catalogue.</p>
        </div>
        <button
          onClick={isCreating ? handleCancel : () => setIsCreating(true)}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90"
        >
          {isCreating ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Slug</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Category</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isRental" checked={formData.isRental} onChange={e => setFormData({...formData, isRental: e.target.checked})} className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary" />
              <label htmlFor="isRental" className="ml-2 block text-sm font-medium text-neutral-700">Available for Rent</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Base Price</label>
              <input required type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Rent Price / day (Optional)</label>
              <input type="number" step="0.01" value={formData.rentPrice} onChange={e => setFormData({...formData, rentPrice: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="Defaults to 10% of base price" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Rental Deposit (Optional)</label>
              <input type="number" step="0.01" value={formData.rentalDeposit} onChange={e => setFormData({...formData, rentalDeposit: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="Deposit taken on rent" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">HSN Code (GST)</label>
              <input type="text" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} placeholder="e.g. 711319" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <RichTextEditor value={formData.description} onChange={val => setFormData({...formData, description: val})} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Composition</label>
              <RichTextEditor value={formData.composition} onChange={val => setFormData({...formData, composition: val})} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Care Instructions</label>
              <RichTextEditor value={formData.careInstructions} onChange={val => setFormData({...formData, careInstructions: val})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Size & Fit</label>
              <RichTextEditor value={formData.sizeAndFit} onChange={val => setFormData({...formData, sizeAndFit: val})} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Shipping & Returns</label>
              <RichTextEditor value={formData.shippingAndReturns} onChange={val => setFormData({...formData, shippingAndReturns: val})} />
            </div>

            {/* Images */}
            <div className="md:col-span-2 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-neutral-700">Images</label>
                <button type="button" onClick={() => setImages([...images, { url: '', alt: '' }])} className="text-xs font-medium text-brand-primary">
                  + Add Image
                </button>
              </div>
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  {img.url ? (
                    <div className="flex-1 flex gap-2 items-center">
                      <img src={img.url} alt="" className="h-10 w-10 object-cover rounded border" />
                      <input type="text" value={img.url} disabled className="flex-1 block w-full rounded-md border-neutral-300 bg-neutral-100 shadow-sm sm:text-sm" />
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="flex-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90" />
                  )}
                  <input type="text" placeholder="Alt Text" value={img.alt || ''} onChange={e => {
                    const newImages = [...images];
                    newImages[idx].alt = e.target.value;
                    setImages(newImages);
                  }} className="flex-1 block w-full rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="text-red-500 font-bold px-2">×</button>
                </div>
              ))}
            </div>

            {/* Variants */}
            <div className="md:col-span-2 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-neutral-700">Variants (SKU & Inventory)</label>
                <button type="button" onClick={() => setVariants([...variants, { sku: '', name: '', price: formData.basePrice, rentPrice: '', rentalDeposit: '', stockQuantity: 0 }])} className="text-xs font-medium text-brand-primary">
                  + Add Variant
                </button>
              </div>
              {variants.length > 0 && (
                <div className="flex gap-2 mb-2 px-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <div className="w-1/6">SKU</div>
                  <div className="w-1/6">Name</div>
                  <div className="w-1/6">Price</div>
                  <div className="w-1/6">Rent Price</div>
                  <div className="w-1/6">Deposit</div>
                  <div className="w-1/6">Stock</div>
                  <div className="px-2 w-6"></div>
                </div>
              )}
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input type="text" placeholder="SKU" required value={v.sku} onChange={e => {
                    const newV = [...variants]; newV[idx].sku = e.target.value; setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <input type="text" placeholder="Name" required value={v.name} onChange={e => {
                    const newV = [...variants]; newV[idx].name = e.target.value; setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <input type="number" step="0.01" placeholder="Price" required value={v.price} onChange={e => {
                    const newV = [...variants]; newV[idx].price = Number(e.target.value); setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <input type="number" step="0.01" placeholder="Rent Price" value={v.rentPrice} onChange={e => {
                    const newV = [...variants]; newV[idx].rentPrice = e.target.value === '' ? '' : Number(e.target.value); setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <input type="number" step="0.01" placeholder="Deposit" value={v.rentalDeposit} onChange={e => {
                    const newV = [...variants]; newV[idx].rentalDeposit = e.target.value === '' ? '' : Number(e.target.value); setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <input type="number" placeholder="Stock Qty" required value={v.stockQuantity} onChange={e => {
                    const newV = [...variants]; newV[idx].stockQuantity = Number(e.target.value); setVariants(newV);
                  }} className="w-1/6 block rounded-md border-neutral-300 shadow-sm sm:text-sm" />
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} className="text-red-500 font-bold px-2">×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90">
              {editingProductId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      {!isCreating && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Search products by name or slug..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full sm:w-1/3 rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          />
          <select 
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="block w-full sm:w-1/4 rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="block w-full sm:w-1/4 rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(p => !filterCategoryId || p.categoryId === filterCategoryId)
                .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                  if (sortOrder === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                  if (sortOrder === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                  if (sortOrder === 'price-high') return b.basePriceCents - a.basePriceCents;
                  if (sortOrder === 'price-low') return a.basePriceCents - b.basePriceCents;
                  if (sortOrder === 'rating') {
                    const avgA = a.reviews?.length ? a.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / a.reviews.length : 0;
                    const avgB = b.reviews?.length ? b.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / b.reviews.length : 0;
                    return avgB - avgA;
                  }
                  return 0;
                })
                .map((product) => (
                <tr key={product.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {categories.find(c => c.id === product.categoryId)?.name ?? product.categoryId}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(product.basePriceCents, product.currency)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {(() => {
                      const reviews = product.reviews || [];
                      const reviewCount = reviews.length;
                      const avgRating = reviewCount > 0 
                        ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1) 
                        : '-';
                      return reviewCount > 0 ? `${avgRating} ★ (${reviewCount})` : 'No reviews';
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-sm font-medium text-brand-primary hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
