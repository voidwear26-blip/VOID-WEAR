
'use client';

/**
 * MOCK HOOK: Firestore integration has been removed.
 * Returns null state to ensure UI stability.
 */
export function useDoc<T = any>(target: any) {
  return { data: null, isLoading: false, error: null };
}
