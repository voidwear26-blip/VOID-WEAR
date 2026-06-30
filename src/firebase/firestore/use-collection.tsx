'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * HIGH-SPEED DATA UPLINK HOOK
 * Optimized with reference checking and silent-syncing to prevent UI flickering.
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!data);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Track the current query to prevent redundant re-subscriptions
  const activeQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      activeQueryRef.current = null;
      return;
    }

    // Generate a simple key for the query to detect logical changes
    const queryKey = (targetRefOrQuery as any)._query?.path?.toString() || (targetRefOrQuery as CollectionReference).path;
    
    if (activeQueryRef.current === queryKey && data) {
      return; // Already tracking this node
    }
    
    activeQueryRef.current = queryKey;
    
    // Only show loading if we don't have cached data for this query
    if (!data) setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      { includeMetadataChanges: false },
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        snapshot.docs.forEach(doc => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        console.error("🔥 SYSTEM_UPLINK_ERROR:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
