/**
 * Static mock products aligned with Firestore schema.
 * Expanded with a full seasonal range including advanced technical T-shirts.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrls: string[];
  category: string;
  slug: string;
  details: string[];
  stockQuantity?: number;
}

export const products: Product[] = [
  {
    id: 'void-001',
    name: 'VOID NEON JACKET',
    description: 'A high-visibility technical jacket with integrated LED fibers and liquid-repellent shell.',
    basePrice: 450,
    imageUrls: ['https://picsum.photos/seed/void1/800/1000'],
    category: 'OUTERWEAR',
    slug: 'void-neon-jacket',
    details: ['Waterproof shell', 'Neon fiber optics', 'Modular pockets', 'Internal heating core'],
    stockQuantity: 24
  },
  {
    id: 'void-012',
    name: 'ORBITAL T-SHIRT',
    description: 'Technical base-layer T-shirt with anti-microbial silver threading and moisture-wicking technology.',
    basePrice: 95,
    imageUrls: ['https://picsum.photos/seed/void12/800/1000'],
    category: 'TOPS',
    slug: 'orbital-t-shirt',
    details: ['Odor resistant', 'Moisture wicking', 'Seamless construction', 'Athletic fit', 'Silver-threaded fabric'],
    stockQuantity: 200
  },
  {
    id: 'void-013',
    name: 'NEURAL PRINT TEE',
    description: 'High-density cotton blend T-shirt featuring reactive ink that shifts color with body temperature.',
    basePrice: 110,
    imageUrls: ['https://picsum.photos/seed/void13/800/1000'],
    category: 'TOPS',
    slug: 'neural-print-tee',
    details: ['Thermoreactive ink', 'Bio-washed cotton', 'Drop shoulder fit', 'Reinforced neckband', 'Reflective hem tag'],
    stockQuantity: 120
  },
  {
    id: 'void-014',
    name: 'THERMAL REGULATION BASE',
    description: 'Advanced compression T-shirt designed to maintain core temperature in extreme urban environments.',
    basePrice: 135,
    imageUrls: ['https://picsum.photos/seed/void14/800/1000'],
    category: 'TOPS',
    slug: 'thermal-regulation-base',
    details: ['Phase-change material', 'Targeted ventilation', '4-way compression', 'UV protection 50+', 'Flatlock seams'],
    stockQuantity: 85
  },
  {
    id: 'void-015',
    name: 'GEOMETRIC COMPRESSION TOP',
    description: 'Minimalist T-shirt with integrated geometric support panels for improved posture and airflow.',
    basePrice: 125,
    imageUrls: ['https://picsum.photos/seed/void15/800/1000'],
    category: 'TOPS',
    slug: 'geometric-compression-top',
    details: ['Ergonomic architecture', 'Laser-cut perforations', 'Lightweight mesh panels', 'Silicone grip hem', 'Quick-dry finish'],
    stockQuantity: 150
  },
  {
    id: 'void-002',
    name: 'ECLIPSE PANTS',
    description: 'Ergonomic techwear pants designed for high-density urban exploration and stealth.',
    basePrice: 280,
    imageUrls: ['https://picsum.photos/seed/void2/800/1000'],
    category: 'PANTS',
    slug: 'eclipse-pants',
    details: ['Four-way stretch', 'Magnetic buckles', 'Reinforced knees', 'Quick-dry fabric'],
    stockQuantity: 45
  },
  {
    id: 'void-003',
    name: 'PARTICLE BOOTS',
    description: 'Advanced footwear featuring magnetic suspension soles and carbon fiber support.',
    basePrice: 590,
    imageUrls: ['https://picsum.photos/seed/void3/800/1000'],
    category: 'FOOTWEAR',
    slug: 'particle-boots',
    details: ['Memory foam interior', 'Vibram tech soles', 'Ankle support', 'Auto-lacing system'],
    stockQuantity: 12
  },
  {
    id: 'void-004',
    name: 'NEBULA MASK',
    description: 'Atmospheric filtration unit with geometric aesthetics and AR integration capability.',
    basePrice: 120,
    imageUrls: ['https://picsum.photos/seed/void4/800/1000'],
    category: 'ACCESSORIES',
    slug: 'nebula-mask',
    details: ['HEPA filtration', 'Breathable mesh', 'Adjustable straps', 'Anti-fog visor'],
    stockQuantity: 100
  },
  {
    id: 'void-005',
    name: 'GEOMETRIC VEST',
    description: 'Utility vest constructed from recycled orbital materials with integrated hydration pack.',
    basePrice: 310,
    imageUrls: ['https://picsum.photos/seed/void5/800/1000'],
    category: 'VESTS',
    slug: 'geometric-vest',
    details: ['Lightweight armor', 'Quick-release systems', 'Tactical loops', 'Hidden utility pockets'],
    stockQuantity: 30
  },
  {
    id: 'void-011',
    name: 'GRAVITY SLING BAG',
    description: 'Compact sling bag with magnetic Fidlock closures for daily essentials.',
    basePrice: 145,
    imageUrls: ['https://picsum.photos/seed/void11/800/1000'],
    category: 'ACCESSORIES',
    slug: 'gravity-sling-bag',
    details: ['Waterproof zippers', 'Padded tablet sleeve', 'Key tether', 'Quick-adjust strap'],
    stockQuantity: 80
  }
];