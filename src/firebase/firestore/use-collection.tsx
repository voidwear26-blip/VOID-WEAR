
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  CollectionReference,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION HARDENED: useCollection hook
 * Safely extracts query paths and handles cross-collection group permissions.
 */
export function useCollection<T = DocumentData>(
  targetRefOrQuery: Query<T> | CollectionReference<T> | null | undefined
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!targetRefOrQuery);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      async (serverError: FirestoreError) => {
        // Safe path extraction for different query types
        let path = 'unknown';
        if ((targetRefOrQuery as any).path) {
          path = (targetRefOrQuery as any).path;
        } else if ((targetRefOrQuery as any)._query?.path?.canonicalString) {
          path = (targetRefOrQuery as any)._query.path.canonicalString();
        }

        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        // DO NOT log to console; handled by FirebaseErrorListener
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
