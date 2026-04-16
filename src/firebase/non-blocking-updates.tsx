
'use client';
    
/**
 * MOCK UTILITIES: Firestore integration has been removed.
 * All mutations are now no-ops.
 */

export function setDocumentNonBlocking(docRef: any, data: any, options: any) {
  console.warn('DATABASE_OFFLINE: setDocument suppressed.');
}

export function addDocumentNonBlocking(colRef: any, data: any) {
  console.warn('DATABASE_OFFLINE: addDocument suppressed.');
  return Promise.resolve();
}

export function updateDocumentNonBlocking(docRef: any, data: any) {
  console.warn('DATABASE_OFFLINE: updateDocument suppressed.');
}

export function deleteDocumentNonBlocking(docRef: any) {
  console.warn('DATABASE_OFFLINE: deleteDocument suppressed.');
}
