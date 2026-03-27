import type { SessionSnapshot } from '@/types'

const DB_NAME = 'roleweaver-history'
const DB_VERSION = 1
const STORE = 'sessions'
export const SESSION_HISTORY_MAX = 25

export type HistoryRecord = SessionSnapshot & {
  id: string
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function saveHistoryRecord(record: HistoryRecord): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    void openDb().then((db) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error ?? new Error('IDB write failed'))
      }
      tx.objectStore(STORE).put(record)
    })
  })
  await trimOldSessions(SESSION_HISTORY_MAX)
}

async function trimOldSessions(keep: number): Promise<void> {
  const all = await listHistorySummaries()
  if (all.length <= keep) return
  const toRemove = all.slice(keep)
  await new Promise<void>((resolve, reject) => {
    void openDb().then((db) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
      const s = tx.objectStore(STORE)
      for (const row of toRemove) s.delete(row.id)
    })
  })
}

export type HistorySummary = {
  id: string
  createdAt: number
  roleTitle: string
  resumeFileName: string
  jobPreview: string
  overallMatch: number
}

export async function listHistorySummaries(): Promise<HistorySummary[]> {
  const db = await openDb()
  const rows = await new Promise<HistoryRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () =>
      resolve((req.result as HistoryRecord[]) ?? [])
    req.onerror = () => reject(req.error)
  })
  db.close()
  return rows
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      roleTitle: r.analysisResult.roleTitle || 'Analysis',
      resumeFileName: r.resumeFileName || 'Résumé',
      jobPreview: r.jobDescription.slice(0, 220).replace(/\s+/g, ' ').trim(),
      overallMatch: Math.round(Number(r.analysisResult.overallMatch) || 0),
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function getHistoryRecord(id: string): Promise<HistoryRecord | null> {
  const db = await openDb()
  const row = await new Promise<HistoryRecord | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve((req.result as HistoryRecord) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return row
}

export async function clearAllHistory(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    void openDb().then((db) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
      tx.objectStore(STORE).clear()
    })
  })
}
