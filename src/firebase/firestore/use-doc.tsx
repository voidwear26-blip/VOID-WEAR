'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

/**
 * STABILIZED DOCUMENT SYNC HOOK
 * Features a delayed-engagement guard to protect against internal SDK state conflicts (ID: ca9).
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedDocRef);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    const engagementTimer = setTimeout(() => {
      if (!isMounted) return;

      try {
        unsubscribe = onSnapshot(
          memoizedDocRef,
          (snapshot: DocumentSnapshot<DocumentData>) => {
            if (!isMounted) return;

            if (snapshot.exists()) {
              setData({ ...(snapshot.data() as T), id: snapshot.id });
            } else {
              setData(null);
            }
            setError(null);
            setIsLoading(false);
          },
          (error: FirestoreError) => {
            if (!isMounted) return;

            if (error.code === 'permission-denied') {
              const contextualError = new FirestorePermissionError({
                operation: 'get',
                path: memoizedDocRef.path,
              });
              setError(contextualError);
              errorEmitter.emit('permission-error', contextualError);
            } else {
              setError(error);
            }
            setData(null);
            setIsLoading(false);
          }
        );
      } catch (e: any) {
        if (isMounted) {
          setError(e);
          setIsLoading(false);
        }
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(engagementTimer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
