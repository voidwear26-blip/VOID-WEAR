'use client';

import { useState, useEffect } from 'react';
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
 * Features protective logic to stabilize the subscription lifecycle and avoid
 * internal SDK state assertion errors (e.g. ID: ca9).
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial State: If no query, we are effectively 'not loading' any active service
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
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
        if (!isMounted) return;

        const results = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id
        }));
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        if (!isMounted) return;

        // Log critical uplink errors for review but don't hang UI
        if (err.code !== 'cancelled') {
          console.error("🔥 SYSTEM_UPLINK_CRASH:", err);
          setError(err);
        }
        setIsLoading(false);
      }
    );

    // 3. Purge listener on node unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
