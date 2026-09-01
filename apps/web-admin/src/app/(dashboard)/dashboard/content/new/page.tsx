'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog } from '@/lib/api';
import dynamic from 'next/dynamic';

const ReactQuill: any = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: 'Admin',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    tags: '',
    published: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formDataData = new FormData();
      formDataData.append('file', file);

      try {
        const token = localStorage.getItem('sarangi_admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/catalog/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataData
        });

        if (!res.ok) throw new Error('Upload failed');
        const json = await res.json();
        const url = json.data.url;

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error(err);
        alert('Image upload failed');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await createBlog(payload);
      router.push('/dashboard/content');
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>

      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Post Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Enter post title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (optional)</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="e.g. my-awesome-post"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Short summary..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content</label>
                <button
                  type="button"
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                  className="text-xs font-medium text-brand-primary hover:underline"
                >
                  {isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Editor'}
                </button>
              </div>
              <div className="bg-white" style={{ minHeight: '300px' }}>
                {isHtmlMode ? (
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    className="flex min-h-[300px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="Write your HTML here..."
                  />
                ) : (
                  <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      modules={modules}
                      value={formData.content}
                      onChange={(value: string) => setFormData((prev) => ({ ...prev, content: value }))}
                      style={{ height: '300px', marginBottom: '40px' }}
                    />
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold">SEO & Metadata</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Title</label>
                <input
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Optimal length: 50-60 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Description</label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  className="flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Optimal length: 150-160 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="e.g. jewelry, wedding, fashion"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Publish immediately
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-4 border-t px-6 py-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-primaryDark disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
