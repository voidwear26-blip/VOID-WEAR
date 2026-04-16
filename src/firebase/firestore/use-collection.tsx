
'use client';

/**
 * MOCK HOOK: Firestore integration has been removed.
 * Returns null/empty state to ensure UI stability.
 */
export function useCollection<T = any>(target: any) {
  return { data: null, isLoading: false, error: null };
}
