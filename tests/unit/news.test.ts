import { describe, it, expect } from 'vitest';
import { 
  VERIFIED_INITIAL_NEWS, 
  deduplicateNewsArticles, 
  validateNewsArticleItem, 
  getVerifiedNewsArticles,
  getNewsArticleBySlug 
} from '@/lib/news/newsEngine';
import { NewsArticleItem } from '@/types';

describe('Drug News & Research Updates Engine', () => {
  it('loads the verified initial news corpus without error', () => {
    expect(VERIFIED_INITIAL_NEWS.length).toBeGreaterThanOrEqual(4);
    for (const article of VERIFIED_INITIAL_NEWS) {
      expect(article.slug).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.source).toBeDefined();
      expect(article.sourceUrl).toBeDefined();
      expect(article.summary).toBeDefined();
      expect(article.evidenceBrief).toBeDefined();
      expect(article.whatThisDoesNotEstablish.length).toBeGreaterThan(0);
      expect(article.citation.sourceUrl).toBe(article.sourceUrl);
    }
  });

  it('validates schema correctly with validateNewsArticleItem', () => {
    const validSample: NewsArticleItem = VERIFIED_INITIAL_NEWS[0];
    expect(validateNewsArticleItem(validSample)).toBe(true);

    // Invalid item missing slug
    expect(validateNewsArticleItem({ title: 'No slug', source: 'FDA' })).toBe(false);

    // Invalid item with unapproved external domain (SSRF check)
    const untrustedUrlItem = {
      ...validSample,
      sourceUrl: 'https://malicious-random-site.com/fake-news',
    };
    expect(validateNewsArticleItem(untrustedUrlItem)).toBe(false);

    // Invalid item containing prescriptive medical advice
    const prescriptiveItem = {
      ...validSample,
      summary: 'Patients should take orally 500mg daily for treatment.',
    };
    expect(validateNewsArticleItem(prescriptiveItem)).toBe(false);
  });

  it('deduplicates news articles by canonical URL and title', () => {
    const duplicates: NewsArticleItem[] = [
      VERIFIED_INITIAL_NEWS[0],
      { ...VERIFIED_INITIAL_NEWS[0] }, // Exact duplicate
      { ...VERIFIED_INITIAL_NEWS[0], slug: 'different-slug' }, // Duplicate sourceUrl
      VERIFIED_INITIAL_NEWS[1],
    ];

    const deduplicated = deduplicateNewsArticles(duplicates);
    expect(deduplicated.length).toBe(2);
    expect(deduplicated[0].slug).toBe(VERIFIED_INITIAL_NEWS[0].slug);
    expect(deduplicated[1].slug).toBe(VERIFIED_INITIAL_NEWS[1].slug);
  });

  it('filters news articles by category accurately', async () => {
    const all = await getVerifiedNewsArticles('All');
    expect(all.length).toBeGreaterThanOrEqual(4);

    const safetyAlerts = await getVerifiedNewsArticles('Safety Alerts');
    expect(safetyAlerts.every(a => a.category === 'Safety Alerts')).toBe(true);

    const clinicalResearch = await getVerifiedNewsArticles('Clinical Research');
    expect(clinicalResearch.every(a => a.category === 'Clinical Research')).toBe(true);
  });

  it('retrieves single article by slug and returns null for unknown slug', async () => {
    const sample = VERIFIED_INITIAL_NEWS[0];
    const retrieved = await getNewsArticleBySlug(sample.slug);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.slug).toBe(sample.slug);

    const nonExistent = await getNewsArticleBySlug('non-existent-drug-news-slug');
    expect(nonExistent).toBeNull();
  });

  it('ensures every article has mandatory research disclaimers and source URLs', async () => {
    const articles = await getVerifiedNewsArticles();
    for (const article of articles) {
      expect(article.isAIAssisted).toBe(true);
      expect(article.sourceUrl.startsWith('https://')).toBe(true);
      expect(article.whatThisDoesNotEstablish).toBeInstanceOf(Array);
      expect(article.whatThisDoesNotEstablish.length).toBeGreaterThan(0);
    }
  });
});
