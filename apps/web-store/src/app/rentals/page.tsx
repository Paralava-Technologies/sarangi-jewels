import React from 'react';
import { SJPageBanner, SJSectionHead, SJRentStep } from '@/components/atomic/SJHomeComponents';
import { SJProductCard } from '@/components/atomic/SJProductCard';

export default function RentalsPage() {
  return (
    <>
      <SJPageBanner 
        crumbs="Home / Rentals" 
        title="Rent Jewellery, Dance Wear &amp; Makeup" 
        desc="Look your best for the day — no lifetime commitment required" 
      />

      <section className="section" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <div className="rent-plan-toggle">
            <span className="active">By The Day</span>
            <span>By The Event (3–5 Days)</span>
            <span>Weekly</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="bridal">
        <div className="container">
          <SJSectionHead eyebrow="Bridal &amp; Occasion Jewellery" title="Statement Sets, By The Day" />
          <div className="product-grid">
            <SJProductCard isRent badgeOverride="For Rent" glyph="💎" category="Bridal Set" title="Kanjivaram Bridal Jewellery Set" price="₹1,899/day" rentNote="Deposit ₹5,000 · refundable" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="👑" category="Bridal Set" title="22k-Finish Kemp Bridal Haaram" price="₹2,299/day" rentNote="Deposit ₹6,000 · refundable" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="💍" category="Bridal Set" title="Reception Diamond-Finish Set" price="₹1,599/day" rentNote="Deposit ₹4,500 · refundable" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="🎶" category="Bridal Set" title="Engagement Pearl &amp; Kundan Set" price="₹1,299/day" rentNote="Deposit ₹3,500 · refundable" />
          </div>
        </div>
      </section>

      <section className="section section-alt" id="dance">
        <div className="container">
          <SJSectionHead eyebrow="Classical Dance" title="Costumes &amp; Performance Jewellery" />
          <div className="product-grid">
            <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Bharatanatyam" title="Arangetram Performance Set" price="₹1,799/day" rentNote="Includes temple jewellery set" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Mohiniyattam" title="Classic Kasavu Performance Set" price="₹1,299/day" rentNote="Includes jewellery &amp; hair accessories" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Kathak" title="Ghagra Performance Ensemble" price="₹1,599/day" rentNote="Sizes 6–14 yrs and adult" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="🎭" category="Kuchipudi" title="Temple-Border Performance Sari Set" price="₹1,499/day" rentNote="Includes belt &amp; jewellery" />
          </div>
        </div>
      </section>

      <section className="section" id="makeup">
        <div className="container">
          <SJSectionHead eyebrow="Complete The Look" title="Makeup Kits &amp; Artist Booking" />
          <div className="product-grid">
            <SJProductCard isRent badgeOverride="For Rent" glyph="💄" category="Makeup" title="Bridal Makeup Artist + Kit" price="₹3,500/session" rentNote="Home visit available" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="💄" category="Makeup" title="Dance Stage Makeup Kit" price="₹899/day" rentNote="Includes false lashes &amp; bindi set" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="💄" category="Makeup" title="Party Glam Artist Session" price="₹2,200/session" rentNote="Studio or home visit" />
            <SJProductCard isRent badgeOverride="For Rent" glyph="💄" category="Makeup" title="Hairstyling + Draping Add-On" price="₹1,200/session" rentNote="Book with any makeup session" />
          </div>
        </div>
      </section>

      <section className="section section-dark" id="howitworks">
        <div className="container">
          <SJSectionHead eyebrow="Simple &amp; Secure" title="How Renting Works" />
          <div className="rent-steps">
            <SJRentStep num="01" title="Pick Your Dates" desc="Choose the item and occasion dates on the calendar." />
            <SJRentStep num="02" title="Reserve Online" desc="Pay the rental fee plus a fully refundable deposit." />
            <SJRentStep num="03" title="Collect or Get Delivered" desc="Pick up from our Kochi store or choose doorstep delivery." />
            <SJRentStep num="04" title="Return &amp; Relax" desc="We handle the cleaning. Deposit refunded within 48 hours." />
          </div>
        </div>
      </section>
    </>
  );
}
