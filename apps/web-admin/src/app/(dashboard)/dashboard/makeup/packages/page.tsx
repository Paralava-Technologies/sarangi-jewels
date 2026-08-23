'use client';

import React, { useEffect, useState } from 'react';
import { fetchMakeupPackages, createMakeupPackage, updateMakeupPackage, deleteMakeupPackage, uploadFile } from '@/lib/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function MakeupPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(e.target.files[0]);
      setImageUrl(url);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await fetchMakeupPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingPkg(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setPriceCents('');
    setImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setTitle(pkg.title);
    setSlug(pkg.slug);
    setDescription(pkg.description || '');
    setPriceCents((pkg.priceCents / 100).toString());
    setImageUrl(pkg.imageUrl || '');
    setIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const savePackage = async () => {
    try {
      const payload = {
        title,
        slug,
        description,
        priceCents: Math.round(parseFloat(priceCents) * 100),
        imageUrl,
        isActive,
      };

      if (editingPkg) {
        await updateMakeupPackage(editingPkg.id, payload);
      } else {
        await createMakeupPackage(payload);
      }
      setIsModalOpen(false);
      loadPackages();
    } catch (err) {
      console.error(err);
      alert('Error saving package');
    }
  };

  const removePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await deleteMakeupPackage(id);
        loadPackages();
      } catch (err) {
        console.error(err);
        alert('Error deleting package');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Makeup Packages</h1>
          <p className="text-sm text-neutral-500">Manage dynamic bridal and makeup service packages.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Add Package
        </button>
      </div>

      {loading ? (
        <div className="text-neutral-500">Loading packages...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              {pkg.imageUrl && (
                <img src={pkg.imageUrl} alt={pkg.title} className="mb-4 h-48 w-full rounded-md object-cover" />
              )}
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900">{pkg.title}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div 
                className="mb-4 text-sm text-neutral-500 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: pkg.description }}
              />
              <div className="mb-4 text-lg font-semibold text-violet-600">
                {pkg.currency} {(pkg.priceCents / 100).toFixed(2)}
              </div>
              <div className="flex gap-2 border-t border-neutral-100 pt-4">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => removePackage(pkg.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingPkg ? 'Edit Package' : 'New Package'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Price (in {editingPkg?.currency || 'INR'})</label>
                <input
                  type="number"
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="package-image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="package-image-upload"
                    className={`flex items-center cursor-pointer rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
                  Active (Visible on storefront)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePackage}
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
