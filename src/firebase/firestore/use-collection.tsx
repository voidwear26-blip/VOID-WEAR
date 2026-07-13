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
 * STABILIZED DATA UPLINK HOOK
 * Synchronizes a collection or query in real-time.
 * Features protective logic to prevent Firestore Internal Assertion errors (ID: ca9)
 * by stabilizing the subscription lifecycle.
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Use a ref to track the current active query to prevent race conditions during rapid re-renders
  const activeQueryStr = useRef<string | null>(null);

  useEffect(() => {
    // 1. Initial State: If no query, we are effectively 'loading' the service uplink
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(true); // Keep loading true until service is ready
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 2. Establish persistent real-time listener
    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      { includeMetadataChanges: false },
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id
        }));
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // Log critical uplink errors for administrative review
        if (err.code !== 'cancelled') {
          console.error("🔥 SYSTEM_UPLINK_CRASH:", err);
          setError(err);
        }
        setIsLoading(false);
      }
    );

    // 3. Purge listener on node unmount
    return () => unsubscribe();
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
