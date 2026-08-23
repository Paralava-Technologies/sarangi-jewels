import React from 'react';
import { filterByCategory, getCategories, getProducts } from '@/lib/api';
import { SJPageBanner } from '@/components/atomic/SJHomeComponents';
import { ShopFilterClient } from '@/components/ShopFilterClient';

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps): Promise<React.JSX.Element> {
  const searchParamsAwaited = await searchParams;
  const categoryParam = searchParamsAwaited.category;
  const qParam = searchParamsAwaited.q;
  
  const categorySlug = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const q = Array.isArray(qParam) ? qParam[0] : qParam;
  
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  let filtered = products;
  if (categorySlug) {
    if (activeCategory) {
      filtered = products.filter(p => p.categoryId === activeCategory.id || p.category?.slug === categorySlug);
    } else {
      filtered = filterByCategory(products, categorySlug);
    }
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
  }

  return (
    <>
      <SJPageBanner 
        crumbs={activeCategory ? `Home / Shop / ${activeCategory.name}` : 'Home / Shop'} 
        title={activeCategory ? activeCategory.name : 'Fine & Imitation Jewellery'} 
        desc={activeCategory?.description || `${filtered.length} pieces, curated by our Kochi jewellers`}
      />

      <ShopFilterClient 
        initialProducts={products}
        categories={categories}
        initialCategory={categorySlug}
        initialQuery={q}
      />
    </>
  );
}
