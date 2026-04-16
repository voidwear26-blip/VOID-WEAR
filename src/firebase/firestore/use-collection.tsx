
'use client';

import { useState, useEffect, useRef } from 'react';
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
        const path = (targetRefOrQuery as any).path || 'complex-query';
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
