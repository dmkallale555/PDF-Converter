import { ConversionRecord } from '../types';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';

const HISTORY_KEY = 'convertpro_conversion_history_v1';

// Seed demo conversion history for offline/demo users
const INITIAL_HISTORY: ConversionRecord[] = [
  {
    id: 'conv_seed_1',
    userId: 'user_admin_001',
    originalFilename: 'Quarterly_Financial_Report_2026.pdf',
    inputFormat: 'pdf',
    outputFormat: 'png',
    inputSize: 2450000,
    outputSize: 8120000,
    pageCount: 6,
    dpi: 300,
    quality: 1,
    status: 'completed',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    downloadFilename: 'Quarterly_Financial_Report_2026_png_300dpi.zip',
  },
  {
    id: 'conv_seed_2',
    userId: 'user_demo_002',
    originalFilename: 'Architectural_Floorplan_Blueprints.pdf',
    inputFormat: 'pdf',
    outputFormat: 'jpg',
    inputSize: 15400000,
    outputSize: 12200000,
    pageCount: 3,
    dpi: 600,
    quality: 0.95,
    status: 'completed',
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    downloadFilename: 'Architectural_Floorplan_Blueprints_jpg_600dpi.zip',
  },
  {
    id: 'conv_seed_3',
    userId: 'user_demo_002',
    originalFilename: 'Marketing_Flyer_Batch.jpg',
    inputFormat: 'jpg',
    outputFormat: 'pdf',
    inputSize: 4200000,
    outputSize: 3900000,
    pageCount: 4,
    status: 'completed',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    downloadFilename: 'Marketing_Flyer_Batch.pdf',
  },
];

export function getConversionHistory(userId?: string): ConversionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    let list: ConversionRecord[] = raw ? JSON.parse(raw) : INITIAL_HISTORY;
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
    }
    if (userId) {
      return list.filter((r) => r.userId === userId || r.userId === 'anonymous');
    }
    return list;
  } catch {
    return INITIAL_HISTORY;
  }
}

export function addConversionRecord(record: Omit<ConversionRecord, 'id' | 'createdAt'>): ConversionRecord {
  const history = getConversionHistory();
  const newRecord: ConversionRecord = {
    ...record,
    id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...history].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

  // If user is a real logged-in Firebase user, also persist to Firestore
  if (record.userId && record.userId !== 'anonymous' && !record.userId.startsWith('user_demo_') && !record.userId.startsWith('user_admin_')) {
    saveRecordToFirestore(record.userId, newRecord).catch((err) => {
      console.warn('Failed to sync record to Firestore:', err);
    });
  }

  return newRecord;
}

export async function saveRecordToFirestore(userId: string, record: ConversionRecord): Promise<void> {
  const path = `users/${userId}/records/${record.id}`;
  try {
    // Sanitize values for Firestore payload constraints
    const firestorePayload = {
      id: String(record.id).slice(0, 128),
      userId: String(userId).slice(0, 128),
      originalFilename: String(record.originalFilename || 'document').slice(0, 255),
      inputFormat: String(record.inputFormat || 'pdf').slice(0, 20),
      outputFormat: String(record.outputFormat || 'png').slice(0, 20),
      inputSize: Number(record.inputSize) || 0,
      outputSize: Number(record.outputSize) || 0,
      pageCount: Number(record.pageCount) || 1,
      dpi: Number(record.dpi) || 300,
      quality: Number(record.quality) || 1,
      status: record.status || 'completed',
      createdAt: String(record.createdAt || new Date().toISOString()).slice(0, 64),
      downloadFilename: String(record.downloadFilename || '').slice(0, 255),
    };
    await setDoc(doc(db, 'users', userId, 'records', record.id), firestorePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function deleteConversionRecord(id: string, userId?: string): void {
  const history = getConversionHistory();
  const updated = history.filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

  if (userId && userId !== 'anonymous' && !userId.startsWith('user_demo_') && !userId.startsWith('user_admin_')) {
    const path = `users/${userId}/records/${id}`;
    deleteDoc(doc(db, 'users', userId, 'records', id)).catch((error) => {
      handleFirestoreError(error, OperationType.DELETE, path);
    });
  }
}

export function clearUserHistory(userId?: string): void {
  if (!userId) {
    localStorage.removeItem(HISTORY_KEY);
    return;
  }
  const history = getConversionHistory();
  const updated = history.filter((r) => r.userId !== userId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

/**
 * Real-time listener for Firestore conversion records
 */
export function subscribeToUserRecords(
  userId: string, 
  onRecordsUpdated: (records: ConversionRecord[]) => void
): () => void {
  if (!userId || userId === 'anonymous' || userId.startsWith('user_demo_') || userId.startsWith('user_admin_')) {
    return () => {};
  }

  const collectionPath = `users/${userId}/records`;
  try {
    const recordsQuery = query(
      collection(db, 'users', userId, 'records'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const records: ConversionRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as ConversionRecord);
        });
        if (records.length > 0) {
          onRecordsUpdated(records);
          // Also update local storage cache
          localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export function getHistoryStats(userId?: string) {
  const list = getConversionHistory(userId);
  const total = list.length;
  const pdfToImg = list.filter((r) => r.inputFormat === 'pdf').length;
  const imgToPdf = list.filter((r) => r.outputFormat === 'pdf').length;
  const imgToImg = list.filter((r) => r.inputFormat !== 'pdf' && r.outputFormat !== 'pdf').length;
  const successCount = list.filter((r) => r.status === 'completed').length;
  const totalInputBytes = list.reduce((acc, curr) => acc + (curr.inputSize || 0), 0);
  const totalOutputBytes = list.reduce((acc, curr) => acc + (curr.outputSize || 0), 0);

  return {
    total,
    pdfToImg,
    imgToPdf,
    imgToImg,
    successCount,
    successRate: total > 0 ? Math.round((successCount / total) * 100) : 100,
    totalInputBytes,
    totalOutputBytes,
    savedBytes: Math.max(0, totalInputBytes - totalOutputBytes),
  };
}
