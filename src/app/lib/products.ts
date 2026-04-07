
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  details: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'VOID NEON JACKET',
    description: 'A high-visibility technical jacket with integrated LED fibers.',
    price: 450,
    image: 'https://picsum.photos/seed/void1/800/1000',
    category: 'Outerwear',
    details: ['Waterproof shell', 'Neon fiber optics', 'Modular pockets']
  },
  {
    id: '2',
    name: 'ECLIPSE PANTS',
    description: 'Ergonomic techwear pants designed for urban exploration.',
    price: 280,
    image: 'https://picsum.photos/seed/void2/800/1000',
    category: 'Pants',
    details: ['Four-way stretch', 'Magnetic buckles', 'Reinforced knees']
  },
  {
    id: '3',
    name: 'PARTICLE BOOTS',
    description: 'Advanced footwear featuring magnetic suspension soles.',
    price: 590,
    image: 'https://picsum.photos/seed/void3/800/1000',
    category: 'Footwear',
    details: ['Memory foam interior', 'Vibram tech soles', 'Ankle support']
  },
  {
    id: '4',
    name: 'NEBULA MASK',
    description: 'Atmospheric filtration unit with geometric aesthetics.',
    price: 120,
    image: 'https://picsum.photos/seed/void4/800/1000',
    category: 'Accessories',
    details: ['HEPA filtration', 'Breathable mesh', 'Adjustable straps']
  },
  {
    id: '5',
    name: 'GEOMETRIC VEST',
    description: 'Utility vest constructed from recycled orbital materials.',
    price: 310,
    image: 'https://picsum.photos/seed/void5/800/1000',
    category: 'Vests',
    details: ['Lightweight armor', 'Quick-release systems', 'Tactical loops']
  },
  {
    id: '6',
    name: 'VOID GLOVES',
    description: 'Haptic feedback gloves for the modern cyber-athlete.',
    price: 180,
    image: 'https://picsum.photos/seed/void6/800/1000',
    category: 'Accessories',
    details: ['Touchscreen compatible', 'Leather grip', 'Haptic modules']
  }
];
