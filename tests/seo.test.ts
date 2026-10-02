import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { generateMetadata as generateDrugMetadata } from '@/app/drug/[slug]/page';
import {
  isDrugPublishable,
  getPublishedDrugSlugs,
  getPublishedDrugBySlug,
  PUBLISHED_DRUG_REGISTRY,
} from '@/lib/publishedDrugs';
import {
  getCanonicalUrl,
  generateHomeJsonLd,
  generateDrugPageJsonLd,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
  SITE_CONFIG,
} from '@/lib/seo';

describe('Production SEO Suite', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://repurpose-research.org';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  describe('Canonical URL Generator (getCanonicalUrl)', () => {
    it('should generate valid HTTPS canonical URLs without double slashes', () => {
      expect(getCanonicalUrl('/')).toBe('https://repurpose-research.org');
      expect(getCanonicalUrl('')).toBe('https://repurpose-research.org');
      expect(getCanonicalUrl('/what-is-drug-repurposing')).toBe(
        'https://repurpose-research.org/what-is-drug-repurposing'
      );
      expect(getCanonicalUrl('drug/metformin')).toBe(
        'https://repurpose-research.org/drug/metformin'
      );
    });

    it('should strip trailing slashes for consistency', () => {
      expect(getCanonicalUrl('/methodology/')).toBe(
        'https://repurpose-research.org/methodology'
      );
      expect(getCanonicalUrl('///sources///')).toBe(
        'https://repurpose-research.org/sources'
      );
    });
  });

  describe('Robots Directives (robots.ts)', () => {
    it('should allow search engines to crawl public content and static assets', () => {
      const robotsConfig = robots();
      expect(robotsConfig.rules).toBeDefined();

      const userAgentRule = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules.find((r) => r.userAgent === '*')
        : robotsConfig.rules;

      expect(userAgentRule).toBeDefined();
      expect(userAgentRule?.allow).toContain('/');
      expect(userAgentRule?.allow).toContain('/drug/');
      expect(userAgentRule?.allow).toContain('/what-is-drug-repurposing');
      expect(userAgentRule?.allow).toContain('/methodology');
      expect(userAgentRule?.allow).toContain('/sources');
      expect(userAgentRule?.allow).toContain('/about');
    });

    it('should disallow API endpoints and query-parameter URLs from being crawled', () => {
      const robotsConfig = robots();
      const userAgentRule = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules.find((r) => r.userAgent === '*')
        : robotsConfig.rules;

      const disallowed = userAgentRule?.disallow;
      expect(disallowed).toBeDefined();
      expect(disallowed).toContain('/api/');
      expect(disallowed).toContain('/*?*');
      expect(disallowed).toContain('/_next/');
      expect(disallowed).toContain('/saved');
      expect(disallowed).toContain('/admin');
    });

    it('should reference the canonical sitemap XML URL', () => {
      const robotsConfig = robots();
      expect(robotsConfig.sitemap).toBe('https://repurpose-research.org/sitemap.xml');
    });
  });

  describe('Dynamic Sitemap Generator (sitemap.ts)', () => {
    it('should include all primary public educational pages', () => {
      const entries = sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain('https://repurpose-research.org');
      expect(urls).toContain('https://repurpose-research.org/what-is-drug-repurposing');
      expect(urls).toContain('https://repurpose-research.org/methodology');
      expect(urls).toContain('https://repurpose-research.org/sources');
      expect(urls).toContain('https://repurpose-research.org/about');
    });

    it('should only include verified, publishable drug dossiers in sitemap', () => {
      const entries = sitemap();
      const urls = entries.map((e) => e.url);

      // Curated verified drugs must be present
      expect(urls).toContain('https://repurpose-research.org/drug/metformin');
      expect(urls).toContain('https://repurpose-research.org/drug/thalidomide');
      expect(urls).toContain('https://repurpose-research.org/drug/imatinib');
      expect(urls).toContain('https://repurpose-research.org/drug/azithromycin');

      // Unverified or random searched terms must NEVER appear in sitemap
      expect(urls).not.toContain('https://repurpose-research.org/drug/fake-drug');
      expect(urls).not.toContain('https://repurpose-research.org/drug/aspirin-random-search');

      // Query parameters must NEVER be in sitemap URLs
      entries.forEach((e) => {
        expect(e.url).not.toContain('?');
        expect(e.url).toMatch(/^https:\/\//);
      });
    });
  });

  describe('Drug Publishing Thresholds & Metadata Generation', () => {
    it('should accept verified records meeting full biomedical criteria', () => {
      const metformin = PUBLISHED_DRUG_REGISTRY.metformin;
      expect(isDrugPublishable(metformin)).toBe(true);
      expect(getPublishedDrugBySlug('metformin')).not.toBeNull();
    });

    it('should reject unverified or thin drug records', () => {
      // Missing generic name
      expect(
        isDrugPublishable({
          slug: 'test-drug',
          isIndexable: true,
          drug: {
            genericName: '',
            brandNames: [],
            rxNormId: '123',
            drugClass: 'Test',
            mechanismOfAction: 'Test mechanism',
            approvedIndications: ['Indication'],
            warnings: [],
            contraindications: [],
            lastVerifiedDate: '2026-10-02',
            sources: [
              { name: 'RxNorm', url: 'https://rxnorm', timestamp: '2026-10-02', status: 'ok' },
              { name: 'openFDA', url: 'https://openfda', timestamp: '2026-10-02', status: 'ok' },
            ],
          },
        })
      ).toBe(false);

      // Missing sources (fewer than 2 independent sources)
      expect(
        isDrugPublishable({
          slug: 'single-source-drug',
          isIndexable: true,
          educationalOverview: 'Long overview explaining the drug mechanisms in scientific detail.',
          candidates: [],
          drug: {
            genericName: 'SingleSourceDrug',
            brandNames: [],
            rxNormId: '999',
            drugClass: 'Test',
            mechanismOfAction: 'Test',
            approvedIndications: ['Indication'],
            warnings: [],
            contraindications: [],
            lastVerifiedDate: '2026-10-02',
            sources: [
              { name: 'RxNorm', url: 'https://rxnorm', timestamp: '2026-10-02', status: 'ok' },
            ],
          },
        })
      ).toBe(false);

      // Explicitly non-indexable
      expect(
        isDrugPublishable({
          ...PUBLISHED_DRUG_REGISTRY.metformin,
          isIndexable: false,
        })
      ).toBe(false);
    });

    it('should only return verified slugs via getPublishedDrugSlugs', () => {
      const slugs = getPublishedDrugSlugs();
      expect(slugs).toContain('metformin');
      expect(slugs).toContain('thalidomide');
      expect(slugs).toContain('imatinib');
      expect(slugs).toContain('azithromycin');
      expect(slugs.length).toBeGreaterThanOrEqual(4);
    });

    it('should generate indexable metadata for azithromycin', async () => {
      const meta = await generateDrugMetadata({
        params: Promise.resolve({ slug: 'azithromycin' }),
      });

      expect(meta.title).toContain('Azithromycin');
      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      );
      expect(meta.alternates?.canonical).toBe('https://repurpose-research.org/drug/azithromycin');
    });

    it('should generate indexable metadata for verified drugs', async () => {
      const meta = await generateDrugMetadata({
        params: Promise.resolve({ slug: 'metformin' }),
      });

      expect(meta.title).toContain('Metformin');
      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      );
      expect(meta.alternates?.canonical).toBe('https://repurpose-research.org/drug/metformin');
    });

    it('should return noindex for unverified or unpublishable slugs', async () => {
      const meta = await generateDrugMetadata({
        params: Promise.resolve({ slug: 'unverified-compound' }),
      });

      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: true,
        })
      );
    });
  });

  describe('Structured Data (JSON-LD Generators)', () => {
    it('should generate valid WebSite and SoftwareApplication schemas without fake reviews', () => {
      const schemas = generateHomeJsonLd();
      expect(Array.isArray(schemas)).toBe(true);

      const websiteSchema = schemas.find((s) => s['@type'] === 'WebSite') as any;
      expect(websiteSchema).toBeDefined();
      expect(websiteSchema?.url).toBe('https://repurpose-research.org');

      const appSchema = schemas.find((s) => s['@type'] === 'SoftwareApplication') as any;
      expect(appSchema).toBeDefined();
      expect(appSchema?.applicationCategory).toBe('HealthApplication');
      // Must NOT contain fake aggregate ratings or review stars
      expect((appSchema as Record<string, unknown>).aggregateRating).toBeUndefined();
      expect((appSchema as Record<string, unknown>).review).toBeUndefined();

      // Person schema must match real creator info
      const personSchema = schemas.find((s) => s['@type'] === 'Person') as any;
      expect(personSchema).toBeDefined();
      expect(personSchema?.name).toBe(SITE_CONFIG.creator.name);
      expect(personSchema?.email).toBe(SITE_CONFIG.creator.contactEmail);
    });

    it('should generate MedicalWebPage schema with verified sources and citations for drug dossiers', () => {
      const guide = PUBLISHED_DRUG_REGISTRY.metformin;
      const jsonLd = generateDrugPageJsonLd(guide);

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('MedicalWebPage');
      expect(jsonLd.name).toContain('Metformin');
      expect(jsonLd.citation).toBeDefined();
      expect(Array.isArray(jsonLd.citation)).toBe(true);
      expect(jsonLd.citation.length).toBeGreaterThan(0);
      expect(jsonLd.citation[0]).toContain('http');
      expect(jsonLd.aspect).toContain('Repurposing Candidate');
    });

    it('should generate BreadcrumbList with correct hierarchy', () => {
      const breadcrumbs = generateBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Data Sources', url: '/sources' },
      ]);

      expect(breadcrumbs['@type']).toBe('BreadcrumbList');
      expect(breadcrumbs.itemListElement).toHaveLength(2);
      expect(breadcrumbs.itemListElement[0].item).toBe('https://repurpose-research.org');
      expect(breadcrumbs.itemListElement[1].item).toBe('https://repurpose-research.org/sources');
    });

    it('should generate Article schema with valid dates and author credit', () => {
      const article = generateArticleJsonLd({
        headline: 'What is Drug Repurposing?',
        description: 'Comprehensive guide to drug repositioning.',
        path: '/what-is-drug-repurposing',
        datePublished: '2025-01-10T00:00:00Z',
        dateModified: '2026-03-01T00:00:00Z',
      });

      expect(article['@type']).toBe('Article');
      expect(article.mainEntityOfPage).toBe(
        'https://repurpose-research.org/what-is-drug-repurposing'
      );
      expect(article.author.name).toBe('P. Rahul Chakradhar');
    });
  });
});
