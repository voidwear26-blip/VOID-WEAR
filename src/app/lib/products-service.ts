
'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  Firestore 
} from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrls: string[];
  category: string;
  slug: string;
  details?: string[];
}

export async function getFirestoreProducts(db: Firestore): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
}

export async function getFirestoreProductById(db: Firestore, id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}
