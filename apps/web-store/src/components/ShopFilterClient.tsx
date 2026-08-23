'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SJProductCard } from '@/components/atomic/SJProductCard';
import type { Category, Product } from '@noeve/shared-types';

interface ShopFilterClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
}

export function ShopFilterClient({ initialProducts, categories, initialCategory, initialQuery }: ShopFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  
  // Sort state
  const [sortMethod, setSortMethod] = useState<'popular' | 'newest' | 'price_asc' | 'price_desc'>('popular');
  
  // Price filter state
  const [priceFilters, setPriceFilters] = useState<Record<string, boolean>>({
    'under_1500': false,
    '1500_4000': false,
    '4000_8000': false,
    'above_8000': false,
  });

  // Finish filter state
  const [finishFilters, setFinishFilters] = useState<Record<string, boolean>>({
    'antique_gold': false,
    'kemp_temple': false,
    'kundan_pearl': false,
    'diamond_finish': false,
  });
  
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('sj_shop_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeCategory !== undefined) setActiveCategory(parsed.activeCategory);
        if (parsed.searchQuery !== undefined) setSearchQuery(parsed.searchQuery);
        if (parsed.sortMethod !== undefined) setSortMethod(parsed.sortMethod);
        if (parsed.priceFilters !== undefined) setPriceFilters(parsed.priceFilters);
        if (parsed.finishFilters !== undefined) setFinishFilters(parsed.finishFilters);
      } catch (e) {
        console.error('Failed to parse cached filters', e);
      }
    }
  }, []);

  // Save state to sessionStorage on change
  useEffect(() => {
    const stateToCache = { activeCategory, searchQuery, sortMethod, priceFilters, finishFilters };
    sessionStorage.setItem('sj_shop_filters', JSON.stringify(stateToCache));
  }, [activeCategory, searchQuery, sortMethod, priceFilters, finishFilters]);

  const togglePrice = (key: string) => setPriceFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleFinish = (key: string) => setFinishFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    // Category
    if (activeCategory) {
      result = result.filter(p => p.category?.slug === activeCategory || p.categoryId === categories.find(c => c.slug === activeCategory)?.id);
    }

    // Price
    const anyPriceSelected = Object.values(priceFilters).some(Boolean);
    if (anyPriceSelected) {
      result = result.filter(p => {
        const price = p.basePriceCents / 100;
        if (priceFilters['under_1500'] && price < 1500) return true;
        if (priceFilters['1500_4000'] && price >= 1500 && price <= 4000) return true;
        if (priceFilters['4000_8000'] && price > 4000 && price <= 8000) return true;
        if (priceFilters['above_8000'] && price > 8000) return true;
        return false;
      });
    }

    // Finish (mapping to material/description for now as we don't have a direct finish field)
    const anyFinishSelected = Object.values(finishFilters).some(Boolean);
    if (anyFinishSelected) {
      result = result.filter(p => {
        const textToSearch = `${p.name} ${p.description || ''} ${p.material || ''}`.toLowerCase();
        if (finishFilters['antique_gold'] && textToSearch.includes('antique')) return true;
        if (finishFilters['kemp_temple'] && (textToSearch.includes('kemp') || textToSearch.includes('temple'))) return true;
        if (finishFilters['kundan_pearl'] && (textToSearch.includes('kundan') || textToSearch.includes('pearl'))) return true;
        if (finishFilters['diamond_finish'] && (textToSearch.includes('diamond') || textToSearch.includes('ad '))) return true;
        return false;
      });
    }

    // Sort
    switch (sortMethod) {
      case 'price_asc':
        result.sort((a, b) => a.basePriceCents - b.basePriceCents);
        break;
      case 'price_desc':
        result.sort((a, b) => b.basePriceCents - a.basePriceCents);
        break;
      case 'newest':
        // Assuming higher ID means newer if createdAt is missing, or string compare
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popular':
      default:
        // default order
        break;
    }

    return result;
  }, [initialProducts, categories, activeCategory, searchQuery, sortMethod, priceFilters, finishFilters]);

  return (
    <section className="section">
      <div className="container shop-layout">
        <aside>
          <div className="filter-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}>
              <h5 style={{ margin: 0 }}>Category</h5>
              <span>{isCategoryExpanded ? '−' : '+'}</span>
            </div>
            {isCategoryExpanded && (
              <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div 
                  style={{ cursor: 'pointer', color: !activeCategory ? 'var(--oxblood)' : 'inherit', fontWeight: !activeCategory ? 'bold' : 'normal' }}
                  onClick={() => setActiveCategory(undefined)}
                >
                  All Pieces
                </div>
                {categories.map(c => (
                  <div 
                    key={c.slug}
                    style={{ cursor: 'pointer', color: activeCategory === c.slug ? 'var(--oxblood)' : 'inherit', fontWeight: activeCategory === c.slug ? 'bold' : 'normal' }}
                    onClick={() => setActiveCategory(c.slug)}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-box">
            <h5>Price</h5>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={priceFilters['under_1500']} onChange={() => togglePrice('under_1500')} /> Under ₹1,500
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={priceFilters['1500_4000']} onChange={() => togglePrice('1500_4000')} /> ₹1,500 – ₹4,000
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={priceFilters['4000_8000']} onChange={() => togglePrice('4000_8000')} /> ₹4,000 – ₹8,000
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={priceFilters['above_8000']} onChange={() => togglePrice('above_8000')} /> Above ₹8,000
              </label>
            </div>
          </div>
          <div className="filter-box">
            <h5>Finish</h5>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={finishFilters['antique_gold']} onChange={() => toggleFinish('antique_gold')} /> Antique Gold
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={finishFilters['kemp_temple']} onChange={() => toggleFinish('kemp_temple')} /> Kemp &amp; Temple
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={finishFilters['kundan_pearl']} onChange={() => toggleFinish('kundan_pearl')} /> Kundan &amp; Pearl
              </label>
            </div>
            <div className="filter-opt">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={finishFilters['diamond_finish']} onChange={() => toggleFinish('diamond_finish')} /> Diamond-Finish
              </label>
            </div>
          </div>
        </aside>
        <div>
          <div className="shop-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <span>Showing {filteredProducts.length} results</span>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--line)', minWidth: '200px' }}
              />
            </div>
            <div className="toggle-group" style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}>
              <span className={sortMethod === 'popular' ? "active" : ""} onClick={() => setSortMethod('popular')}>Popular</span>
              <span className={sortMethod === 'newest' ? "active" : ""} onClick={() => setSortMethod('newest')}>Newest</span>
              <span className={sortMethod === 'price_asc' ? "active" : ""} onClick={() => setSortMethod('price_asc')}>Price ↑</span>
              <span className={sortMethod === 'price_desc' ? "active" : ""} onClick={() => setSortMethod('price_desc')}>Price ↓</span>
            </div>
          </div>
          
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <SJProductCard key={product.id} product={product as any} glyph="💎" />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 0', textAlign: 'center' }}>
                <p>No products found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setActiveCategory(undefined);
                    setPriceFilters({ under_1500: false, '1500_4000': false, '4000_8000': false, above_8000: false });
                    setFinishFilters({ antique_gold: false, kemp_temple: false, kundan_pearl: false, diamond_finish: false });
                  }} 
                  className="btn btn-gold" 
                  style={{ marginTop: '1rem' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          
          {filteredProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button className="btn btn-gold">Load More Pieces</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
