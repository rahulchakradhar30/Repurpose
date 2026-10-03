import { DrugConcept, RepurposingCandidate } from '@/types';

export interface CompareItem {
  id: string;
  drug: string;
  drugSlug: string;
  drugConcept?: DrugConcept;
  conditionSlug?: string;
  candidate?: RepurposingCandidate;
  candidates?: RepurposingCandidate[];
  lastVerifiedDate: string;
}

const STORAGE_KEY = 'repurpose_compare_items';
export const COMPARE_UPDATED_EVENT = 'repurpose_compare_updated';

// In-memory fallback for SSR and test environments where localStorage/window is not available
let memoryStore: CompareItem[] = [];

export function getCompareItems(): CompareItem[] {
  if (typeof window === 'undefined') {
    return memoryStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read compare items from storage:', err);
    return [];
  }
}

export function saveCompareItems(items: CompareItem[]): void {
  const capped = items.slice(0, 3);
  if (typeof window === 'undefined') {
    memoryStore = capped;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT, { detail: capped }));
  } catch (err) {
    console.error('Failed to save compare items to storage:', err);
  }
}

export function addCompareItem(item: CompareItem): { success: boolean; reason?: 'limit_reached' | 'already_exists' } {
  const current = getCompareItems();
  const exists = current.some(
    c => c.id.toLowerCase() === item.id.toLowerCase() || 
         c.drug.toLowerCase() === item.drug.toLowerCase() ||
         c.drugSlug.toLowerCase() === item.drugSlug.toLowerCase()
  );
  if (exists) {
    return { success: false, reason: 'already_exists' };
  }
  if (current.length >= 3) {
    return { success: false, reason: 'limit_reached' };
  }
  const updated = [...current, item];
  saveCompareItems(updated);
  return { success: true };
}

export function removeCompareItem(idOrDrug: string): void {
  const current = getCompareItems();
  const target = idOrDrug.toLowerCase().trim();
  const filtered = current.filter(
    c => c.id.toLowerCase() !== target && 
         c.drug.toLowerCase() !== target &&
         c.drugSlug.toLowerCase() !== target
  );
  saveCompareItems(filtered);
}

export function isDrugInCompare(drugNameOrSlug: string): boolean {
  if (!drugNameOrSlug) return false;
  const current = getCompareItems();
  const target = drugNameOrSlug.toLowerCase().trim();
  return current.some(
    c => c.id.toLowerCase() === target || 
         c.drug.toLowerCase() === target ||
         c.drugSlug.toLowerCase() === target
  );
}

export function clearCompareItems(): void {
  saveCompareItems([]);
}

export function subscribeCompareItems(callback: (items: CompareItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    callback(getCompareItems());
  };
  window.addEventListener(COMPARE_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(COMPARE_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
