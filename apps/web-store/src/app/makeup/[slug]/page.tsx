import React from 'react';
import { notFound } from 'next/navigation';
import { getMakeupPackage, getMakeupPackages } from '@/lib/api';
import { SJPageBanner, SJSectionHead } from '@/components/atomic/SJHomeComponents';
import { MakeupBookingForm } from '@/components/MakeupBookingForm';
import { SJProductCard } from '@/components/atomic/SJProductCard';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pkg = await getMakeupPackage(resolvedParams.slug);
  if (!pkg) return { title: 'Package Not Found' };
  return { title: `${pkg.title} — Sarangi Jewels` };
}

export default async function MakeupPackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pkg = await getMakeupPackage(resolvedParams.slug);
  if (!pkg || !pkg.isActive) return notFound();

  const packages = await getMakeupPackages();
  const otherPackages = packages.filter(p => p.isActive && p.id !== pkg.id).slice(0, 4);

  return (
    <>
      <SJPageBanner 
        crumbs={`Home / Rentals / Makeup / ${pkg.title}`} 
        title={pkg.title} 
      />

      <section className="section bg-white pt-16 pb-24 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-50/50 via-white to-white"></div>
        
        <div className="container max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-16 items-start">
          {pkg.imageUrl && (
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-200 to-pink-200 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <img src={pkg.imageUrl} alt={pkg.title} className="relative w-full rounded-2xl object-cover shadow-xl aspect-[4/5] transform transition duration-500 hover:scale-[1.01]" />
            </div>
          )}
          <div className={`w-full ${pkg.imageUrl ? "lg:w-1/2" : "text-center max-w-3xl mx-auto"} flex flex-col justify-center sticky top-24`}>
            <div className="inline-flex items-center space-x-2 bg-violet-50 px-3 py-1 rounded-full text-violet-700 text-sm font-semibold mb-6 shadow-sm border border-violet-100 self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span>Premium Service</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-neutral-900 leading-tight">
              {pkg.title}
            </h1>
            
            <div className="flex items-end gap-2 mb-8 border-b border-neutral-100 pb-8">
              <span className="text-3xl font-bold text-violet-600">
                {pkg.currency} {(pkg.priceCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-neutral-500 font-medium mb-1">/ session</span>
            </div>
            
            <div className="prose prose-lg prose-neutral mb-10 max-w-none text-neutral-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h3]:mt-6 [&_h3]:mb-3">
              {pkg.description ? (
                <div dangerouslySetInnerHTML={{ __html: pkg.description }} />
              ) : (
                <p>
                  Experience our premium makeup service tailored to your specific needs. Our professional artists ensure you look your best for your special day.
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <a href="#book" className="btn btn-primary w-full text-center py-3 text-lg font-bold">
                Book This Package
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="book" className="section section-alt">
        <div className="container" style={{ maxWidth: '760px' }}>
          <SJSectionHead eyebrow="Secure Your Spot" title={`Book ${pkg.title}`} />
          {/* We could pass a default service name to the form, but the form component manages its own state for now */}
          <MakeupBookingForm />
        </div>
      </section>

      {otherPackages.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <SJSectionHead eyebrow="Other Services" title="More Makeup Packages" />
            <div className="product-grid">
              {otherPackages.map((other) => (
                <SJProductCard 
                  key={other.id}
                  product={{
                    id: other.id,
                    slug: other.slug,
                    name: other.title,
                    basePriceCents: other.priceCents,
                    currency: other.currency,
                    material: null,
                    purity: null,
                    gemstone: null,
                    weightGrams: null,
                    careInstructions: null,
                    images: other.imageUrl ? [{ id: '1', url: other.imageUrl, alt: other.title }] : [],
                    variants: [],
                    description: other.description,
                  }} 
                  glyph="💄" 
                  href={`/makeup/${other.slug}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
