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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Optimized with reference checking to prevent redundant updates.
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Track query string to prevent redundant listener re-registration
  const queryRef = useRef<string>('');

  useEffect(() => {
    // DIAGNOSTIC_UPLINK: Verify the target reference or query path
    if (process.env.NODE_ENV === 'development' || true) {
      console.log('[useCollection] targetRefOrQuery:', targetRefOrQuery);
    }

    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      queryRef.current = '';
      return;
    }

    const currentQueryKey = targetRefOrQuery.type === 'collection' 
      ? (targetRefOrQuery as CollectionReference).path 
      : (targetRefOrQuery as any)._query?.path?.toString() || 'query';

    if (queryRef.current === currentQueryKey) return;
    queryRef.current = currentQueryKey;

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
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
        console.error('[useCollection] SNAPSHOT_FAILURE:', error);
        
        const path: string =
          targetRefOrQuery.type === 'collection'
            ? (targetRefOrQuery as CollectionReference).path
            : (targetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      unsubscribe();
      queryRef.current = '';
    };
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
