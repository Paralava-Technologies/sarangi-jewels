import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const htmlPath = path.resolve(__dirname, '../../docs/ReferenceDesign/gemini-code-1784205367169.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Extract the main content area inside the container and style
  let styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  let style = styleMatch ? `<style>${styleMatch[1]}</style>` : '';
  
  let contentMatch = htmlContent.match(/<div class="container">([\s\S]*?)<!-- Minimal Footer matching store -->/);
  let content = contentMatch ? contentMatch[1].trim() : htmlContent;

  const finalHtml = `${style}\n<div class="custom-blog-wrapper">${content}</div>`;

  await prisma.post.create({
    data: {
      title: 'Where Fashion Finds Its Nerve',
      slug: 'where-fashion-finds-its-nerve',
      author: 'Sarangi Jewels Studio',
      excerpt: "There's a particular kind of quiet before something new breaks through — the pause before a match strikes, the breath before a first step. That's where Sarangi Jewels lives. Not the loud middle of the fashion conversation, but the electric edge of it.",
      content: finalHtml,
      published: true,
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      publishedAt: new Date()
    }
  });
  console.log('Blog post created successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
