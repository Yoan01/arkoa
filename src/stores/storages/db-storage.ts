import { openDB } from 'idb'

const DB_NAME = 'arkoa'
const DB_VERSION = 1

const isClient =
  typeof window !== 'undefined' && typeof indexedDB !== 'undefined'

const dbPromise = isClient
  ? openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Vérifiez et créez tous les object stores nécessaires
        if (!db.objectStoreNames.contains('company')) {
          db.createObjectStore('company')
        }
      },
    })
  : null

export { dbPromise }
