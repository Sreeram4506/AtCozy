// ============================================================================
// Site Configuration
// ============================================================================

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "AtCozy - European Boutique",
  description: "AtCozy is a European boutique that offers attire and accessories for female evening dress. Fine Dresses, Sweaters, and more.",
  language: "en",
};

// ============================================================================
// Navigation Configuration
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  items: NavItem[];
}

export const navigationConfig: NavigationConfig = {
  logo: "AtCozy",
  items: [
    { label: "Shop All", href: "#all-products" },
    { label: "Dresses", href: "#all-products" },
    { label: "Tops", href: "#all-products" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
};

// ============================================================================
// Hero Section Configuration
// ============================================================================

export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  servicesLabel: string;
  copyright: string;
  ctaText: string;
  bottomLeft: string;
  bottomRight: string;
}

export const heroConfig: HeroConfig = {
  title: "AtCozy",
  subtitle: "European Boutique Collection 2026",
  backgroundImage: "/images/hero-luxe.jpg",
  servicesLabel: "Elegance | Style | Confidence",
  copyright: "",
  ctaText: "Explore the Boutique",
  bottomLeft: "Handpicked European Designs",
  bottomRight: "New Arrivals Every Week",
};

// ============================================================================
// About Section Configuration (Dual Statement)
// ============================================================================

export interface AboutConfig {
  titleLine1: string;
  titleLine2: string;
  description: string;
  image1: string;
  image1Alt: string;
  image2: string;
  image2Alt: string;
  authorImage: string;
  authorName: string;
  authorBio: string;
  ctaText: string;
}

export const aboutConfig: AboutConfig = {
  titleLine1: "European",
  titleLine2: "Elegance.",
  description: "AtCozy is a European boutique that offers attire and accessories for female evening dress. Our high-quality products will leave you feeling satisfied and fashionable. Get cozy with AtCozy's sweaters and fine dresses.",
  image1: "/images/split-left.jpg",
  image1Alt: "Fashion editorial portrait",
  image2: "/images/split-right.jpg",
  image2Alt: "Menswear editorial portrait",
  authorImage: "",
  authorName: "Olga Patalakh",
  authorBio: "Founder & Creative Director",
  ctaText: "Our Story",
};

// ============================================================================
// Works Section Configuration (City Motion)
// ============================================================================

export interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

export interface WorksConfig {
  title: string;
  subtitle: string;
  projects: WorkItem[];
}

export const worksConfig: WorksConfig = {
  title: "Movement of Style.",
  subtitle: "",
  projects: [],
};

// ============================================================================
// Services Section Configuration (Portrait Study)
// ============================================================================

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface ServicesConfig {
  title: string;
  subtitle: string;
  services: ServiceItem[];
}

export const servicesConfig: ServicesConfig = {
  title: "The Fine Details.",
  subtitle: "",
  services: [],
};

// ============================================================================
// Day to Night Section Configuration
// ============================================================================

export interface DayNightConfig {
  title: string;
  ctaText: string;
  leftImage: string;
  rightImage: string;
}

export const dayNightConfig: DayNightConfig = {
  title: "From day to night.",
  ctaText: "See the looks",
  leftImage: "/images/day-look.jpg",
  rightImage: "/images/night-look.jpg",
};

// ============================================================================
// Shop Section Configuration (Product Cards)
// ============================================================================

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
}

export interface ShopConfig {
  title: string;
  ctaText: string;
  backgroundImage: string;
  products: ProductItem[];
}

export const shopConfig: ShopConfig = {
  title: "Featured Boutique",
  ctaText: "View all collections",
  backgroundImage: "/images/shop-drop-bg.jpg",
  products: [
    { 
      id: 1, 
      name: "Back Patterned Shirt", 
      price: 258, 
      image: "/images/product-shirt-1.jpg", 
      category: "Tops",
      description: "Elegant back patterned shirt with intricate European design details.",
      colors: ["#FFFFFF", "#F5F5DC", "#000000"],
      sizes: ["S", "M", "L", "XL"]
    },
    { 
      id: 2, 
      name: "Batik Patterned Shirred Blouse", 
      price: 60, 
      image: "/images/product-blouse-1.jpg", 
      category: "Tops",
      description: "Soft shirred blouse featuring a unique batik pattern for a sophisticated look.",
      colors: ["#E6E6FA", "#40E0D0"],
      sizes: ["XS", "S", "M", "L"]
    },
    { 
      id: 3, 
      name: "Black & Red Plaid Long Dress", 
      price: 150, 
      image: "/images/product-dress.jpg", 
      category: "Dresses",
      description: "Classic plaid dress in a long silhouette, perfect for evening gatherings.",
      colors: ["#FF0000", "#000000"],
      sizes: ["S", "M", "L"]
    },
  ],
};

// ============================================================================
// Craft Section Configuration
// ============================================================================

export interface CraftConfig {
  title: string;
  description: string;
  image: string;
  features: string[];
}

export const craftConfig: CraftConfig = {
  title: "European Craftsmanship.",
  description: "We source our products from the finest European fashion shows in Turkey, France, and Italy, ensuring quality that leaves you satisfied.",
  image: "/images/craft-detail.jpg",
  features: [
    "Sourced from Turkey & France",
    "Italian Design Influence",
    "High-Quality Materials",
    "Satisfaction Guaranteed",
  ],
};

// ============================================================================
// Collection Grid Section Configuration
// ============================================================================

export interface CollectionItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CollectionConfig {
  title: string;
  items: CollectionItem[];
}

export const collectionConfig: CollectionConfig = {
  title: "The Autumn Boutique",
  items: [
    { id: 101, name: "Beige Suede Ankle Boot", price: 205, image: "/images/collection-01.jpg", category: "Footwear" },
    { id: 102, name: "BIZE Brown Knit Blouse", price: 125, image: "/images/collection-02.jpg", category: "Tops" },
    { id: 103, name: "Cold-Shoulder Knit Blouse", price: 125, image: "/images/collection-03.jpg", category: "Tops" },
    { id: 104, name: "BIZE Plaid Blouse", price: 90, image: "/images/collection-04.jpg", category: "Tops" },
    { id: 105, name: "Red Batwing Blouse", price: 145, image: "/images/collection-05.jpg", category: "Tops" },
    { id: 106, name: "Silk Evening Scarf", price: 65, image: "/images/collection-06.jpg", category: "Accessories" },
  ],
};

// ============================================================================
// Final Scene Section Configuration
// ============================================================================

export interface FinalSceneConfig {
  title: string;
  ctaText: string;
  backgroundImage: string;
}

export const finalSceneConfig: FinalSceneConfig = {
  title: "Your Elegant Journey.",
  ctaText: "Start Shopping",
  backgroundImage: "/images/final-scene.jpg",
};

// ============================================================================
// Newsletter Section Configuration
// ============================================================================

export interface NewsletterConfig {
  title: string;
  description: string;
  emailLabel: string;
  buttonText: string;
  microcopy: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
}

export const newsletterConfig: NewsletterConfig = {
  title: "Join the AtCozy List.",
  description: "Be the first to know about new European arrivals and private seasonal sales.",
  emailLabel: "Email address",
  buttonText: "Subscribe",
  microcopy: "Elegance delivered to your inbox.",
  contactEmail: "hello@atcozy.com",
  contactPhone: "+1 (Newton) Piccadilly Square",
  contactLocation: "Newton • Newton Centre",
};

// ============================================================================
// Signature Section Configuration
// ============================================================================

export interface SignatureConfig {
  title: string;
  subtitle: string;
  bottomLeft: string;
  bottomRight: string;
}

export const signatureConfig: SignatureConfig = {
  title: "AtCozy",
  subtitle: "Fine attire for every occasion.",
  bottomLeft: "© 2026 AtCozy Boutique",
  bottomRight: "Instagram / Facebook",
};

// ============================================================================
// Testimonials Section Configuration
// ============================================================================

export interface TestimonialItem {
  id: number;
  name: string;
  title: string;
  quote: string;
  image: string;
}

export interface TestimonialsConfig {
  title: string;
  testimonials: TestimonialItem[];
}

export const testimonialsConfig: TestimonialsConfig = {
  title: "Boutique Voices",
  testimonials: [
    {
      id: 1,
      name: "Olga P.",
      title: "Store Owner",
      quote: "My goal is to provide formal wear that makes women feel elegant and confident.",
      image: "/images/split-left.jpg",
    },
    {
      id: 2,
      name: "Sarah M.",
      title: "Verified Customer",
      quote: "The dresses from Turkey are simply stunning. High quality and perfect fit.",
      image: "/images/split-right.jpg",
    },
  ],
};

// ============================================================================
// FAQ Section Configuration
// ============================================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQConfig {
  title: string;
  faqs: FAQItem[];
}

export const faqConfig: FAQConfig = {
  title: "Boutique FAQ",
  faqs: [
    {
      question: "Where do you source your products?",
      answer: "We source our products directly from European fashion shows in Turkey, France, and Italy to ensure unique and high-quality designs.",
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of purchase. Items must be in their original condition with tags attached.",
    },
    {
      question: "Do you offer styling consultations?",
      answer: "Yes, you can visit us at our Newton location for personalized styling advice and fitting.",
    },
  ],
};

// ============================================================================
// Contact Section Configuration
// ============================================================================

export interface ContactConfig {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  projectTypeLabel: string;
  projectTypePlaceholder: string;
  projectTypeOptions: ContactFormOption[];
  messageLabel: string;
  submitButtonText: string;
  image: string;
}

export interface ContactFormOption {
  value: string;
  label: string;
}

export const contactConfig: ContactConfig = {
  title: "Contact the Boutique",
  subtitle: "We're here to help you find your perfect look.",
  nameLabel: "Name *",
  emailLabel: "Email *",
  projectTypeLabel: "Inquiry Type",
  projectTypePlaceholder: "Select...",
  projectTypeOptions: [
    { value: "inquiry", label: "Product Inquiry" },
    { value: "appointment", label: "Booking Fitting" },
    { value: "other", label: "Other" },
  ],
  messageLabel: "Message",
  submitButtonText: "Send Inquiry",
  image: "/images/city-motion.jpg",
};

// ============================================================================
// Footer Configuration
// ============================================================================

export interface FooterLink {
  label: string;
  href: string;
  icon?: string;
}

export interface FooterConfig {
  marqueeText: string;
  marqueeHighlightChars: string[];
  navLinks1: FooterLink[];
  navLinks2: FooterLink[];
  ctaText: string;
  ctaHref: string;
  copyright: string;
  tagline: string;
}

export const footerConfig: FooterConfig = {
  marqueeText: "Every Woman Deserves to Be Elegant",
  marqueeHighlightChars: ["W", "E"],
  navLinks1: [
    { label: "Home", href: "#hero" },
    { label: "Boutique", href: "#all-products" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  navLinks2: [
    { label: "Instagram", href: "#", icon: "Instagram" },
    { label: "Facebook", href: "#", icon: "Facebook" },
  ],
  ctaText: "Shop All",
  ctaHref: "#all-products",
  copyright: "© 2026 AtCozy. All rights reserved.",
  tagline: "European Boutique Excellence",
};

// ============================================================================
// Cart Configuration
// ============================================================================

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

// ============================================================================
// User Configuration
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  wishlist: number[];
}

// ============================================================================
// Cart Configuration
// ============================================================================

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

// ============================================================================
// User Configuration
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  wishlist: number[];
}
