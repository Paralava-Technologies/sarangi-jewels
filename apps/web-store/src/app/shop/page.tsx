import React from 'react';
import Link from 'next/link';
import { filterByCategory, getCategories, getProducts } from '@/lib/api';
import { SJPageBanner } from '@/components/atomic/SJHomeComponents';
import { SJProductCard } from '@/components/atomic/SJProductCard';

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

      <section className="section">
        <div className="container shop-layout">
          <aside>
            <div className="filter-box">
              <h5>Category</h5>
              <Link href="/shop" className="filter-opt" style={{ display: 'block', textDecoration: 'none', color: !categorySlug ? 'var(--oxblood)' : 'inherit' }}>
                All Pieces
              </Link>
              {categories.map(c => (
                <Link key={c.slug} href={`/shop?category=${c.slug}`} className="filter-opt" style={{ display: 'block', textDecoration: 'none', color: categorySlug === c.slug ? 'var(--oxblood)' : 'inherit' }}>
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="filter-box">
              <h5>Price</h5>
              <div className="filter-opt"><input type="checkbox" /> Under ₹1,500</div>
              <div className="filter-opt"><input type="checkbox" /> ₹1,500 – ₹4,000</div>
              <div className="filter-opt"><input type="checkbox" /> ₹4,000 – ₹8,000</div>
              <div className="filter-opt"><input type="checkbox" /> Above ₹8,000</div>
            </div>
            <div className="filter-box">
              <h5>Finish</h5>
              <div className="filter-opt"><input type="checkbox" /> Antique Gold</div>
              <div className="filter-opt"><input type="checkbox" /> Kemp &amp; Temple</div>
              <div className="filter-opt"><input type="checkbox" /> Kundan &amp; Pearl</div>
              <div className="filter-opt"><input type="checkbox" /> Diamond-Finish</div>
            </div>
          </aside>
          <div>
            <div className="shop-toolbar">
              <span>Showing {filtered.length} results</span>
              <div className="toggle-group">
                <span className="active">Popular</span>
                <span>Newest</span>
                <span>Price ↑</span>
                <span>Price ↓</span>
              </div>
            </div>
            
            <div className="product-grid">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <SJProductCard key={product.id} product={product} glyph="💎" />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '4rem 0', textAlign: 'center' }}>
                  <p>No products found matching your criteria.</p>
                  <Link href="/shop" className="btn btn-gold" style={{ marginTop: '1rem' }}>Clear Filters</Link>
                </div>
              )}
            </div>
            
            {filtered.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <a href="#" className="btn btn-gold">Load More Pieces</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
