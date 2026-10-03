export interface NotebookDossierItem {
  id: string; // e.g. drugSlug__conditionSlug or drugSlug__overview
  drug: string;
  condition: string;
  drugSlug: string;
  conditionSlug: string;
  score: number;
  state: string;
  savedAt: string;
  notes?: string;
  tags?: string[];
  checklist?: Record<string, boolean>;
}

const STORAGE_KEY = 'repurpose_saved_dossiers';
export const NOTEBOOK_UPDATED_EVENT = 'repurpose_notebook_updated';
export const RETENTION_DAYS = 30;

let memoryStore: NotebookDossierItem[] = [];

/**
 * Filter out items older than 30 days to strictly enforce privacy retention policy.
 */
export function pruneExpiredItems(items: NotebookDossierItem[]): { active: NotebookDossierItem[]; purgedCount: number } {
  const now = Date.now();
  const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
  
  const active: NotebookDossierItem[] = [];
  let purgedCount = 0;

  for (const item of items) {
    const itemDate = new Date(item.savedAt).getTime();
    if (isNaN(itemDate) || now - itemDate > maxAgeMs) {
      purgedCount++;
    } else {
      active.push(item);
    }
  }

  return { active, purgedCount };
}

export function getNotebookItems(): NotebookDossierItem[] {
  if (typeof window === 'undefined') {
    return memoryStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: NotebookDossierItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Automatically prune items older than 30 days
    const { active, purgedCount } = pruneExpiredItems(parsed);
    if (purgedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    }
    return active;
  } catch (err) {
    console.error('Failed to retrieve notebook dossiers:', err);
    return [];
  }
}

export function saveNotebookItems(items: NotebookDossierItem[]): void {
  const { active } = pruneExpiredItems(items);
  if (typeof window === 'undefined') {
    memoryStore = active;
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    window.dispatchEvent(new CustomEvent(NOTEBOOK_UPDATED_EVENT, { detail: active }));
  } catch (err) {
    console.error('Failed to persist notebook dossiers:', err);
  }
}

export function addOrUpdateNotebookItem(item: NotebookDossierItem): void {
  const current = getNotebookItems();
  const existingIdx = current.findIndex(i => i.id === item.id);
  let updated: NotebookDossierItem[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...item,
      // preserve creation date if already set
      savedAt: current[existingIdx].savedAt || item.savedAt || new Date().toISOString(),
    };
  } else {
    updated = [{ ...item, savedAt: item.savedAt || new Date().toISOString() }, ...current];
  }

  saveNotebookItems(updated);
}

export function removeNotebookItem(id: string): void {
  const current = getNotebookItems();
  const filtered = current.filter(i => i.id !== id);
  saveNotebookItems(filtered);
}

export function isDossierInNotebook(id: string): boolean {
  if (!id) return false;
  const current = getNotebookItems();
  return current.some(i => i.id === id);
}

export function clearNotebookItems(): void {
  saveNotebookItems([]);
}

export function subscribeNotebookItems(callback: (items: NotebookDossierItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    callback(getNotebookItems());
  };
  window.addEventListener(NOTEBOOK_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(NOTEBOOK_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
