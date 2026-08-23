import { getCategories, getProducts } from '@/lib/api';
import Link from 'next/link';
import React from 'react';
import { SJHomeHero } from '@/components/atomic/SJHomeHero';
import { SJProductCard } from '@/components/atomic/SJProductCard';
import { 
  SJJewelDrip, SJSplitCard, SJCatCard, SJSectionHead, 
  SJTrustStrip, SJRentStep, SJStat, SJTestiCard, SJNewsletter 
} from '@/components/atomic/SJHomeComponents';

export default async function HomePage(): Promise<React.JSX.Element> {
  const [, products] = await Promise.all([getCategories(), getProducts()]);
  const featuredBuy = products.slice(0, 4);
  const featuredRent = products.slice(4, 8);

  return (
    <>
      <SJHomeHero />
      <SJJewelDrip />

      {/* BUY vs RENT */}
      <section className="split">
        <SJSplitCard 
          type="buy" tag="Own Forever" title="Buy Fine &amp; Imitation Jewellery" 
          desc="Temple sets, bridal kemp, diamond-finish necklaces and daily-wear gold-tone pieces — crafted for the collection that outlives a trend." 
          link="/shop" linkText="Explore Collection →" 
        />
        <SJSplitCard 
          type="rent" tag="Wear For The Day" title="Rent Jewellery, Dance Wear &amp; Makeup" 
          desc="Bridal sets, Bharatanatyam &amp; Mohiniyattam costumes, and professional makeup kits — reserved for your date, delivered ready to wear." 
          link="/rentals" linkText="Browse Rentals →" 
        />
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <SJSectionHead 
            eyebrow="Curated For Every Occasion" title="Shop By Category" 
            desc="From the everyday to the unforgettable — each piece chosen to carry a story." 
          />
          <div className="cat-grid">
            <SJCatCard href="/shop?category=bridal" icon="💎" title="Bridal Sets" subtitle="Necklaces · Kemp · Temple" />
            <SJCatCard href="/shop?category=earrings" icon="🎶" title="Earrings &amp; Jhumkas" subtitle="Gold-tone · Pearl · Kundan" />
            <SJCatCard href="/shop?category=dance" icon="🎭" title="Dance Costumes" subtitle="Classical · Semi-classical" />
            <SJCatCard href="/makeup" icon="💄" title="Bridal Makeup" subtitle="Kits · Artist Booking" />
          </div>
        </div>
      </section>

      {/* FEATURED — BUY */}
      <section className="section section-alt">
        <div className="container">
          <SJSectionHead 
            eyebrow="New This Season" title="Pieces To Keep" 
            desc="Handpicked from our Kochi atelier, finished in 22k gold-tone plating." 
          />
          <div className="product-grid">
            {featuredBuy.map((product, i) => (
              <SJProductCard key={product.id} product={product} badgeOverride={i === 0 ? "Bestseller" : i === 2 ? "Trending" : undefined} glyph="💎" />
            ))}
          </div>
        </div>
      </section>

      <SJTrustStrip />

      {/* FEATURED — RENT */}
      <section className="section">
        <div className="container">
          <SJSectionHead 
            eyebrow="Wear It, Return It" title="This Week's Rentals" 
            desc="Reserve online, collect from our Kochi store or get it delivered — cleaned, packed and ready." 
          />
          <div className="product-grid">
            {featuredRent.length > 0 ? featuredRent.map((product) => (
              <SJProductCard key={product.id} product={product} isRent={true} badgeOverride="For Rent" rentNote="Deposit ₹5,000 · refundable" glyph="🎭" />
            )) : (
              // Fallback if not enough products
              <>
                <SJProductCard isRent badgeOverride="For Rent" glyph="💎" category="Bridal Set" title="Kanjivaram Bridal Jewellery Set" price="₹1,899/day" rentNote="Deposit ₹5,000 · refundable" />
                <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Dance Costume" title="Mohiniyattam Performance Set" price="₹1,299/day" rentNote="Includes jewellery & hair accessories" />
                <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Dance Costume" title="Bharatanatyam Arangetram Set" price="₹1,799/day" rentNote="Includes temple jewellery set" />
                <SJProductCard isRent badgeOverride="For Rent" glyph="💄" category="Makeup" title="Bridal Makeup Artist + Kit" price="₹3,500/session" rentNote="Home visit available" />
              </>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <Link href="/rentals" className="btn btn-gold">View All Rentals</Link>
          </div>
        </div>
      </section>

      {/* HOW RENTAL WORKS */}
      <section className="section section-dark">
        <div className="container">
          <SJSectionHead eyebrow="Simple &amp; Secure" title="How Renting Works" desc="Four steps between you and the piece you&apos;ve been eyeing." />
          <div className="rent-steps">
            <SJRentStep num="01" title="Pick Your Dates" desc="Choose the item and the occasion dates." />
            <SJRentStep num="02" title="Reserve Online" desc="Pay rental fee + refundable deposit." />
            <SJRentStep num="03" title="Collect or Get Delivered" desc="Pick up in Kochi or opt for doorstep delivery." />
            <SJRentStep num="04" title="Return &amp; Relax" desc="We handle the cleaning. Deposit refunded in 48h." />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section">
        <div className="container story">
          <div className="story-media frame"></div>
          <div>
            <p className="eyebrow">Since The Shop On MG Road</p>
            <h2>A Kochi Storefront, Now Open To Everywhere</h2>
            <p>Sarangi began as a family jewellery counter in the heart of Kochi, known for temple-inspired kemp work and honest craftsmanship. Today, the same pieces — and the trusted rental wardrobe our regulars have always relied on for weddings and arangetrams — are a click away.</p>
            <p>Every set is inspected in-house before it reaches you, whether it&apos;s leaving our shelves for good or coming home to you for a single, unforgettable evening.</p>
            <div className="stat-row">
              <SJStat num="15+" text="Years In Kochi" />
              <SJStat num="4,200+" text="Pieces In Rotation" />
              <SJStat num="9,800+" text="Happy Occasions" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-alt">
        <div className="container">
          <SJSectionHead eyebrow="In Their Words" title="Loved Across Kerala" />
          <div className="testi-grid">
            <SJTestiCard stars="★★★★★" quote="Rented my daughter's Bharatanatyam set for her Arangetram — it looked brand new and fit perfectly. Saved us so much." who="Anjali R. · Ernakulam" />
            <SJTestiCard stars="★★★★★" quote="The kemp choker I bought for my wedding still gets compliments two years later. True heirloom quality." who="Meera S. · Thrissur" />
            <SJTestiCard stars="★★★★★" quote="Booked the bridal makeup artist and jewellery together — the whole look came together beautifully on the day." who="Divya K. · Kochi" />
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <SJNewsletter />
    </>
  );
}
