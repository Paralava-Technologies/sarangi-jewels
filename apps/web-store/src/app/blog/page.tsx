import React from 'react';
import Link from 'next/link';
import { getBlogs } from '@/lib/api';

export const metadata = {
  title: 'Journal | SARANGI',
  description: 'Read the latest stories, styling tips, and news from SARANGI.',
};

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ page?: string, category?: string }> }) {
  const { page: pageStr, category } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const { data: posts } = await getBlogs(page, 12, category);

  return (
    <main className="wrap pt-32 pb-24">
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-display text-brand-primaryDark mb-4">The Journal</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">Discover stories about our craft, the people behind the pieces, and how to style your everyday essentials.</p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-24 text-neutral-500">
          <p>No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {posts.map((post: any) => (
            <article key={post.id} className="group flex flex-col">
              <Link href={`/blog/${post.slug}`} className="block aspect-[4/3] bg-neutral-100 overflow-hidden mb-6 relative">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">NO IMAGE</div>
                )}
              </Link>
              <div className="flex items-center space-x-2 text-xs text-neutral-500 uppercase tracking-wider mb-3">
                {post.category && (
                  <>
                    <Link href={`/blog?category=${post.category.slug}`} className="hover:text-brand-primary">{post.category.name}</Link>
                    <span>&mdash;</span>
                  </>
                )}
                <time>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
              </div>
              <h2 className="text-xl md:text-2xl font-display text-brand-primaryDark mb-3 group-hover:text-brand-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && <p className="text-neutral-600 line-clamp-3 mb-4">{post.excerpt}</p>}
              <Link href={`/blog/${post.slug}`} className="mt-auto text-sm font-semibold text-brand-primary hover:underline">
                Read Article &rarr;
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
