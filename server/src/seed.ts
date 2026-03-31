import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

// Fetches all products from atcozy.com Shopify JSON API and seeds them
async function fetchShopifyProducts() {
  const resp = await fetch('https://atcozy.com/products.json?limit=250');
  const data = await resp.json();
  return data.products;
}

function categorizeProduct(p: any): string {
  const type = (p.product_type || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const tags = (p.tags || []).map((t: string) => t.toLowerCase());

  if (type.includes('dress') || title.includes('dress')) return 'Dresses';
  if (type.includes('shirt') || title.includes('shirt') || title.includes('blouse') || tags.includes('blouse')) return 'Tops';
  if (type.includes('pants') || title.includes('pants') || title.includes('trousers')) return 'Bottoms';
  if (type.includes('skirt') || title.includes('skirt')) return 'Bottoms';
  if (type.includes('jacket') || title.includes('jacket') || title.includes('cape') || title.includes('poncho')) return 'Outerwear';
  if (type.includes('tunic') || title.includes('tunic')) return 'Tops';
  if (title.includes('boot') || title.includes('ankle boot')) return 'Boots';
  if (title.includes('sneaker') || title.includes('high-top')) return 'Sneakers';
  if (title.includes('pump') || title.includes('heel') || title.includes('slingback')) return 'Heels';
  if (title.includes('loafer') || title.includes('slip-on') || title.includes('shoe')) return 'Shoes';
  if (type.includes('top')) return 'Tops';
  return 'Other';
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    console.log('Fetching products from atcozy.com...');
    const shopifyProducts = await fetchShopifyProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

    const products = shopifyProducts.map((p: any, index: number) => {
      const allImages = (p.images || []).map((img: any) => img.src);
      const placeholderImg = `https://placehold.co/600x600/2a2a2a/gold?text=${encodeURIComponent(p.title.slice(0, 20))}`;
      const firstImage = p.images?.[0]?.src || placeholderImg;
      const firstVariant = p.variants?.[0];
      const price = parseFloat(firstVariant?.price || '0');
      const compareAt = firstVariant?.compare_at_price ? parseFloat(firstVariant.compare_at_price) : undefined;
      const colors = p.options?.find((o: any) => o.name?.toLowerCase() === 'color')?.values || [];
      const sizeOption = p.options?.find((o: any) =>
        ['size', 'shoe size'].includes(o.name?.toLowerCase())
      );
      const sizes = sizeOption?.values || [];
      const available = p.variants?.some((v: any) => v.available) ?? true;
      const totalStock = p.variants?.filter((v: any) => v.available).length * 5 || 10;

      return {
        id: index + 1,
        shopifyId: p.id,
        name: p.title,
        handle: p.handle,
        price,
        compareAtPrice: compareAt,
        image: firstImage,
        images: allImages,
        category: categorizeProduct(p),
        productType: p.product_type || '',
        vendor: p.vendor || 'AtCozy',
        description: stripHtml(p.body_html || ''),
        tags: p.tags || [],
        colors,
        sizes,
        variants: (p.variants || []).map((v: any) => ({
          title: v.title,
          price: parseFloat(v.price),
          available: v.available,
          sku: v.sku || '',
        })),
        stock: totalStock,
        available,
        featured: index < 16,
        source: 'atcozy.com',
      };
    });

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products from atcozy.com`);

    // Categories summary
    const cats: Record<string, number> = {};
    products.forEach((p: any) => { cats[p.category] = (cats[p.category] || 0) + 1; });
    console.log('📊 Categories:', cats);

    // Create admin user
    await User.deleteMany({ email: 'admin@atcozy.com' });
    const adminUser = new User({
      name: 'AtCozy Admin',
      email: 'admin@atcozy.com',
      password: 'AtCozy2026!',
      role: 'admin',
    });
    await adminUser.save();
    console.log('👤 Admin user: admin@atcozy.com / AtCozy2026!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
