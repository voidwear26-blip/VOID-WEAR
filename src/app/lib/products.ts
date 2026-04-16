/**
 * Static mock products aligned with Firestore schema.
 * Expanded with a full seasonal range.
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
    id: 'void-006',
    name: 'VOID GLOVES',
    description: 'Haptic feedback gloves for the modern cyber-athlete and terminal operator.',
    basePrice: 180,
    imageUrls: ['https://picsum.photos/seed/void6/800/1000'],
    category: 'ACCESSORIES',
    slug: 'void-gloves',
    details: ['Touchscreen compatible', 'Leather grip', 'Haptic modules', 'Conductive fingertips'],
    stockQuantity: 60
  },
  {
    id: 'void-007',
    name: 'SOLARIS HOODIE',
    description: 'Mid-layer thermal regulation hoodie with photoluminescent printing.',
    basePrice: 220,
    imageUrls: ['https://picsum.photos/seed/void7/800/1000'],
    category: 'TOPS',
    slug: 'solaris-hoodie',
    details: ['UV protection', 'Thumb-hole cuffs', 'Glow-in-the-dark print', 'Scuba hood'],
    stockQuantity: 50
  },
  {
    id: 'void-008',
    name: 'CYBER-TRUCKER CAP',
    description: 'Low-profile headwear with holographic VOID WEAR branding.',
    basePrice: 85,
    imageUrls: ['https://picsum.photos/seed/void8/800/1000'],
    category: 'ACCESSORIES',
    slug: 'cyber-trucker-cap',
    details: ['Laser-cut vents', 'Adjustable snapback', 'Holographic patch', 'Sweat-wicking liner'],
    stockQuantity: 150
  },
  {
    id: 'void-009',
    name: 'TITAN CARGO SHORTS',
    description: 'Heavy-duty cargo shorts for temperate urban conditions.',
    basePrice: 195,
    imageUrls: ['https://picsum.photos/seed/void9/800/1000'],
    category: 'PANTS',
    slug: 'titan-cargo-shorts',
    details: ['Oversized pockets', 'D-ring attachment', 'Ripstop fabric', 'Reinforced seat'],
    stockQuantity: 35
  },
  {
    id: 'void-010',
    name: 'OBSIDIAN RAINCOAT',
    description: 'Ultra-thin, packable raincoat with reflective geometric patterns.',
    basePrice: 380,
    imageUrls: ['https://picsum.photos/seed/void10/800/1000'],
    category: 'OUTERWEAR',
    slug: 'obsidian-raincoat',
    details: ['3-layer Gore-Tex', 'Seam-sealed', 'Underarm vents', 'Reflective panels'],
    stockQuantity: 20
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
  },
  {
    id: 'void-012',
    name: 'ORBITAL T-SHIRT',
    description: 'Technical base-layer T-shirt with anti-microbial silver threading.',
    basePrice: 95,
    imageUrls: ['https://picsum.photos/seed/void12/800/1000'],
    category: 'TOPS',
    slug: 'orbital-t-shirt',
    details: ['Odor resistant', 'Moisture wicking', 'Seamless construction', 'Athletic fit'],
    stockQuantity: 200
  }
];
