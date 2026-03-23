import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';

dotenv.config();

const products = [
  { id: 1, name: "Back Patterned Shirt", price: 258, image: "/images/product-shirt-1.jpg", category: "Tops", description: "Elegant back patterned shirt with intricate European design details.", colors: ["#FFFFFF", "#F5F5DC", "#000000"], sizes: ["S", "M", "L", "XL"] },
  { id: 2, name: "Batik Patterned Shirred Blouse", price: 60, image: "/images/product-blouse-1.jpg", category: "Tops", description: "Soft shirred blouse featuring a unique batik pattern for a sophisticated look.", colors: ["#E6E6FA", "#40E0D0"], sizes: ["XS", "S", "M", "L"] },
  { id: 3, name: "Black & Red Plaid Long Dress", price: 150, image: "/images/product-dress.jpg", category: "Dresses", description: "Classic plaid dress in a long silhouette, perfect for evening gatherings.", colors: ["#FF0000", "#000000"], sizes: ["S", "M", "L"] },
  { id: 101, name: "Beige Suede Ankle Boot", price: 205, image: "/images/collection-01.jpg", category: "Footwear", description: "Handcrafted suede ankle boots with a comfortable chunky sole.", colors: ["#D2B48C", "#8B4513"], sizes: ["36", "37", "38", "39", "40"] },
  { id: 102, name: "BIZE Brown Knit Blouse", price: 125, image: "/images/collection-02.jpg", category: "Tops", colors: ["#8B4513", "#A52A2A"], sizes: ["S", "M", "L"] },
  { id: 103, name: "Cold-Shoulder Knit Blouse", price: 125, image: "/images/collection-03.jpg", category: "Tops", colors: ["#800080", "#808080"], sizes: ["S", "M", "L"] },
  { id: 104, name: "BIZE Plaid Blouse", price: 90, image: "/images/collection-04.jpg", category: "Tops", colors: ["#FF0000", "#000000"], sizes: ["S", "M", "L"] },
  { id: 105, name: "Red Batwing Blouse", price: 145, image: "/images/collection-05.jpg", category: "Tops", colors: ["#FF0000"], sizes: ["One Size"] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    await Product.insertMany(products);
    
    console.log('Database seeded with initial AtCozy products');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
