import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNotebookItems,
  addOrUpdateNotebookItem,
  removeNotebookItem,
  clearNotebookItems,
  isDossierInNotebook,
  pruneExpiredItems,
  NotebookDossierItem,
  RETENTION_DAYS
} from '@/lib/notebookStorage';

describe('Research Notebook Storage & 30-Day Auto-Purge Policy', () => {
  beforeEach(() => {
    clearNotebookItems();
  });

  it('starts with an empty notebook', () => {
    expect(getNotebookItems()).toEqual([]);
  });

  it('adds and updates dossier records', () => {
    const item: NotebookDossierItem = {
      id: 'metformin__type-2-diabetes',
      drug: 'Metformin',
      condition: 'Type 2 Diabetes',
      drugSlug: 'metformin',
      conditionSlug: 'type-2-diabetes',
      score: 88,
      state: 'Approved indication',
      savedAt: new Date().toISOString(),
      tags: ['Metabolic'],
    };

    addOrUpdateNotebookItem(item);
    expect(isDossierInNotebook('metformin__type-2-diabetes')).toBe(true);
    expect(getNotebookItems().length).toBe(1);

    // Update with notes
    addOrUpdateNotebookItem({
      ...item,
      notes: 'Investigator review note',
    });
    const retrieved = getNotebookItems();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].notes).toBe('Investigator review note');
  });

  it('correctly identifies and purges items older than 30 days', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const freshItem: NotebookDossierItem = {
      id: 'recent_drug',
      drug: 'Recent Drug',
      condition: 'Recent Condition',
      drugSlug: 'recent-drug',
      conditionSlug: 'recent-condition',
      score: 75,
      state: 'Investigational',
      savedAt: new Date(now - 10 * dayMs).toISOString(), // 10 days old
    };

    const expiredItem: NotebookDossierItem = {
      id: 'old_drug',
      drug: 'Old Drug',
      condition: 'Old Condition',
      drugSlug: 'old-drug',
      conditionSlug: 'old-condition',
      score: 60,
      state: 'Preclinical',
      savedAt: new Date(now - 35 * dayMs).toISOString(), // 35 days old (expired)
    };

    const { active, purgedCount } = pruneExpiredItems([freshItem, expiredItem]);
    expect(purgedCount).toBe(1);
    expect(active.length).toBe(1);
    expect(active[0].id).toBe('recent_drug');
  });

  it('removes item by ID', () => {
    addOrUpdateNotebookItem({
      id: 'item_1',
      drug: 'Drug A',
      condition: 'Cond A',
      drugSlug: 'drug-a',
      conditionSlug: 'cond-a',
      score: 50,
      state: 'Investigational',
      savedAt: new Date().toISOString(),
    });

    expect(isDossierInNotebook('item_1')).toBe(true);
    removeNotebookItem('item_1');
    expect(isDossierInNotebook('item_1')).toBe(false);
    expect(getNotebookItems().length).toBe(0);
  });
});
