import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlog } from '@/lib/api';
import { SJBlogComments } from '@/components/atomic/SJBlogComments';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} | SARANGI Journal`,
    description: post.excerpt || `Read ${post.title} on the SARANGI Journal.`,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) notFound();

  return (
    <main className="pb-24">
      <article>
        {/* Header */}
        <header className="pt-32 pb-16 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 uppercase tracking-wider mb-6">
            {post.category && (
              <>
                <Link href={`/blog?category=${post.category.slug}`} className="hover:text-brand-primary">{post.category.name}</Link>
                <span>&mdash;</span>
              </>
            )}
            <time>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-brand-primaryDark mb-6 leading-tight">
            {post.title}
          </h1>
          {post.excerpt && <p className="text-xl text-neutral-600 max-w-2xl mx-auto">{post.excerpt}</p>}
        </header>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="w-full max-w-6xl mx-auto px-4 mb-16">
            <div className="aspect-[16/9] w-full bg-neutral-100 overflow-hidden rounded-md">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Content */}
        {/* We use dangerouslySetInnerHTML here assuming the content is sanitized/safe Markdown converted to HTML, or rich text */}
        <div 
          className="prose prose-lg prose-neutral mx-auto px-4 prose-headings:font-display prose-headings:font-normal prose-a:text-brand-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="max-w-3xl mx-auto px-4 mt-16 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>Written by {post.author}</p>
          <div className="mt-8">
            <Link href="/blog" className="inline-block border border-brand-primary text-brand-primary px-8 py-3 hover:bg-brand-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold">
              Back to Journal
            </Link>
          </div>
          
          <div className="text-left mt-16">
            <SJBlogComments postId={post.id} />
          </div>
        </footer>
      </article>
    </main>
  );
}
