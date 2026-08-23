import React from 'react';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/api';
import { SJProductDetail } from '@/components/atomic/SJProductDetail';

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | NOEVE',
      description: 'The requested product could not be found.',
    };
  }

  const image = product.images?.[0]?.url || 'https://sarangijewels.com/images/logo.png';
  
  return {
    title: `${product.name} | NOEVE`,
    description: product.description || `Shop ${product.name} at NOEVE.`,
    openGraph: {
      title: `${product.name} | NOEVE`,
      description: product.description || `Shop ${product.name} at NOEVE.`,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | NOEVE`,
      description: product.description || `Shop ${product.name} at NOEVE.`,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProduct(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  // Filter out the current product from related products
  const relatedProducts = allProducts.filter((p) => p.id !== product.id);

  return (
    <SJProductDetail
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
