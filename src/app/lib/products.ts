/**
 * Static mock products aligned with Firestore schema.
 * Used as fallback data.
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
}

export const products: Product[] = [
  {
    id: '1',
    name: 'VOID NEON JACKET',
    description: 'A high-visibility technical jacket with integrated LED fibers.',
    basePrice: 450,
    imageUrls: ['https://picsum.photos/seed/void1/800/1000'],
    category: 'Outerwear',
    slug: 'void-neon-jacket',
    details: ['Waterproof shell', 'Neon fiber optics', 'Modular pockets']
  },
  {
    id: '2',
    name: 'ECLIPSE PANTS',
    description: 'Ergonomic techwear pants designed for urban exploration.',
    basePrice: 280,
    imageUrls: ['https://picsum.photos/seed/void2/800/1000'],
    category: 'Pants',
    slug: 'eclipse-pants',
    details: ['Four-way stretch', 'Magnetic buckles', 'Reinforced knees']
  },
  {
    id: '3',
    name: 'PARTICLE BOOTS',
    description: 'Advanced footwear featuring magnetic suspension soles.',
    basePrice: 590,
    imageUrls: ['https://picsum.photos/seed/void3/800/1000'],
    category: 'Footwear',
    slug: 'particle-boots',
    details: ['Memory foam interior', 'Vibram tech soles', 'Ankle support']
  },
  {
    id: '4',
    name: 'NEBULA MASK',
    description: 'Atmospheric filtration unit with geometric aesthetics.',
    basePrice: 120,
    imageUrls: ['https://picsum.photos/seed/void4/800/1000'],
    category: 'Accessories',
    slug: 'nebula-mask',
    details: ['HEPA filtration', 'Breathable mesh', 'Adjustable straps']
  },
  {
    id: '5',
    name: 'GEOMETRIC VEST',
    description: 'Utility vest constructed from recycled orbital materials.',
    basePrice: 310,
    imageUrls: ['https://picsum.photos/seed/void5/800/1000'],
    category: 'Vests',
    slug: 'geometric-vest',
    details: ['Lightweight armor', 'Quick-release systems', 'Tactical loops']
  },
  {
    id: '6',
    name: 'VOID GLOVES',
    description: 'Haptic feedback gloves for the modern cyber-athlete.',
    basePrice: 180,
    imageUrls: ['https://picsum.photos/seed/void6/800/1000'],
    category: 'Accessories',
    slug: 'void-gloves',
    details: ['Touchscreen compatible', 'Leather grip', 'Haptic modules']
  }
];
