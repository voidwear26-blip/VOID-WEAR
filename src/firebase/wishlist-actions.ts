
'use client';

import { doc, collection, setDoc, getDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { Product } from '@/app/lib/products-service';

/**
 * Toggles a product in the user's wishlist.
 */
export async function toggleWishlist(db: Firestore, userId: string, product: Product) {
  const wishlistRef = doc(db, 'users', userId, 'wishlist', product.id);
  const wishlistSnap = await getDoc(wishlistRef);

  if (wishlistSnap.exists()) {
    await deleteDoc(wishlistRef);
  } else {
    await setDoc(wishlistRef, {
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.imageUrls[0],
      category: product.category,
      addedAt: new Date().toISOString()
    });
  }
}
