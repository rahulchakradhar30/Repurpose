import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCompareItems,
  addCompareItem,
  removeCompareItem,
  clearCompareItems,
  isDrugInCompare,
  CompareItem
} from '@/lib/compareStorage';

describe('Compare Workspace Storage & Workflow', () => {
  beforeEach(() => {
    clearCompareItems();
  });

  it('starts empty with no hardcoded drugs', () => {
    expect(getCompareItems()).toEqual([]);
  });

  it('adds a drug to compare workspace successfully', () => {
    const item1: CompareItem = {
      id: 'metformin',
      drug: 'Metformin',
      drugSlug: 'metformin',
      conditionSlug: 'overview',
      lastVerifiedDate: '2026-10-01'
    };

    const res = addCompareItem(item1);
    expect(res.success).toBe(true);
    expect(isDrugInCompare('Metformin')).toBe(true);
    expect(isDrugInCompare('metformin')).toBe(true);
    expect(getCompareItems().length).toBe(1);
  });

  it('prevents adding duplicate drugs', () => {
    const item1: CompareItem = {
      id: 'metformin',
      drug: 'Metformin',
      drugSlug: 'metformin',
      lastVerifiedDate: '2026-10-01'
    };

    addCompareItem(item1);
    const duplicateRes = addCompareItem(item1);
    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.reason).toBe('already_exists');
    expect(getCompareItems().length).toBe(1);
  });

  it('supports comparing up to 3 drugs simultaneously', () => {
    const drugs = ['Metformin', 'Imatinib', 'Sildenafil', 'Thalidomide'];
    drugs.slice(0, 3).forEach(d => {
      const res = addCompareItem({
        id: d.toLowerCase(),
        drug: d,
        drugSlug: d.toLowerCase(),
        lastVerifiedDate: '2026-10-01'
      });
      expect(res.success).toBe(true);
    });

    expect(getCompareItems().length).toBe(3);

    // 4th drug should be rejected with limit_reached
    const overflowRes = addCompareItem({
      id: 'thalidomide',
      drug: 'Thalidomide',
      drugSlug: 'thalidomide',
      lastVerifiedDate: '2026-10-01'
    });
    expect(overflowRes.success).toBe(false);
    expect(overflowRes.reason).toBe('limit_reached');
  });

  it('removes a drug from comparison and clears workspace', () => {
    addCompareItem({
      id: 'metformin',
      drug: 'Metformin',
      drugSlug: 'metformin',
      lastVerifiedDate: '2026-10-01'
    });
    addCompareItem({
      id: 'imatinib',
      drug: 'Imatinib',
      drugSlug: 'imatinib',
      lastVerifiedDate: '2026-10-01'
    });

    expect(getCompareItems().length).toBe(2);

    removeCompareItem('Metformin');
    expect(isDrugInCompare('Metformin')).toBe(false);
    expect(isDrugInCompare('Imatinib')).toBe(true);
    expect(getCompareItems().length).toBe(1);

    clearCompareItems();
    expect(getCompareItems().length).toBe(0);
  });
});
