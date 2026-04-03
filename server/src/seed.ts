import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

// Fetches all products from atcozy.com Shopify JSON API and seeds them
// Using /collections/all/products.json as it often has better image coverage than /products.json
async function fetchShopifyProducts() {
  const url = 'https://atcozy.com/collections/all/products.json?limit=250';
  console.log(`Fetching from: ${url}`);
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch products: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  return data.products;
}

function categorizeProduct(p: any): string {
  const type = (p.product_type || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const tags = (p.tags || []).map((t: string) => t.toLowerCase());

  if (type.includes('dress') || title.includes('dress')) return 'Dresses';
  if (type.includes('shirt') || title.includes('shirt') || title.includes('blouse') || tags.includes('blouse')) return 'Tops';
  if (type.includes('pants') || title.includes('pants') || title.includes('trousers') || tags.includes('pants')) return 'Bottoms';
  if (type.includes('skirt') || title.includes('skirt') || tags.includes('skirt')) return 'Bottoms';
  if (type.includes('jacket') || title.includes('jacket') || title.includes('cape') || title.includes('poncho') || type.includes('outerwear')) return 'Outerwear';
  if (type.includes('tunic') || title.includes('tunic')) return 'Tops';
  if (title.includes('boot') || title.includes('ankle boot') || tags.includes('boots')) return 'Boots';
  if (title.includes('sneaker') || title.includes('high-top') || tags.includes('sneakers')) return 'Sneakers';
  if (title.includes('pump') || title.includes('heel') || title.includes('slingback') || tags.includes('heels')) return 'Heels';
  if (title.includes('loafer') || title.includes('slip-on') || title.includes('shoe')) return 'Shoes';
  if (type.includes('top')) return 'Tops';
  return 'Other';
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';
}

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Fetching products from atcozy.com...');
    const shopifyProducts = await fetchShopifyProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

    const products = shopifyProducts.map((p: any, index: number) => {
      const allImages = (p.images || []).map((img: any) => img.src);
      
      // Fallback to placeholder if no images found
      const placeholderImg = `https://placehold.co/600x800/2a2a2a/gold?text=${encodeURIComponent(p.title.slice(0, 20))}`;
      const firstImage = (p.images && p.images.length > 0) ? p.images[0].src : placeholderImg;
      
      if (!p.images || p.images.length === 0) {
        console.warn(`⚠️ No images for: ${p.title}`);
      }

      const firstVariant = p.variants?.[0];
      const price = parseFloat(firstVariant?.price || '0');
      const compareAt = firstVariant?.compare_at_price ? parseFloat(firstVariant.compare_at_price) : undefined;
      
      const colors = p.options?.find((o: any) => o.name?.toLowerCase() === 'color')?.values || [];
      const sizeOption = p.options?.find((o: any) =>
        ['size', 'shoe size', 'bze'].includes(o.name?.toLowerCase())
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
        featured: index < 12, // First 12 products as featured
        source: 'atcozy.com',
      };
    });

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products from atcozy.com`);

    // Categories summary
    const cats: Record<string, number> = {};
    products.forEach((p: any) => { cats[p.category] = (cats[p.category] || 0) + 1; });
    console.log('📊 Categories count:', cats);

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@atcozy.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'AtCozy Admin',
        email: adminEmail,
        password: 'AtCozy2026!', // In a real app, this should be hashed, but User model likely handles hashing
        role: 'admin',
      });
      await adminUser.save();
      console.log(`👤 Admin user created: ${adminEmail}`);
    } else {
      console.log(`👤 Admin user already exists: ${adminEmail}`);
    }

    console.log('Migration complete. Exiting...');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

seed();

