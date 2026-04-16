
'use client';

import { 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  CollectionReference, 
  DocumentReference,
  serverTimestamp 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: { merge?: boolean }) {
  setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, options || {})
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: options?.merge ? 'update' : 'write',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  return addDoc(colRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}
