import { fetchWithTimeoutAndRetry } from '@/lib/network';
import { PubMedCitation } from '@/types';

export async function fetchPubMedCitations(drugName: string, condition: string): Promise<PubMedCitation[]> {
  const cleanDrug = drugName.trim();
  const cleanCondition = condition.trim();

  if (!cleanDrug || !cleanCondition) return [];

  const query = `(${cleanDrug}[Title/Abstract]) AND (${cleanCondition}[Title/Abstract]) AND (clinical[Title/Abstract] OR trial[Title/Abstract] OR efficacy[Title/Abstract] OR repurpos*[Title/Abstract])`;
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=4&sort=pub_date`;

  try {
    const searchRes = await fetchWithTimeoutAndRetry(searchUrl, { timeoutMs: 6000, retries: 1 });
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const idList: string[] = searchData?.esearchresult?.idlist || [];

    if (idList.length === 0) {
      // Fallback: simpler search without keywords
      const simpleQuery = `(${cleanDrug}[Title/Abstract]) AND (${cleanCondition}[Title/Abstract])`;
      const simpleUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(simpleQuery)}&retmode=json&retmax=3`;
      const simpleRes = await fetchWithTimeoutAndRetry(simpleUrl, { timeoutMs: 5000, retries: 1 });
      if (!simpleRes.ok) return [];
      const simpleData = await simpleRes.json();
      const simpleIds = simpleData?.esearchresult?.idlist || [];
      if (simpleIds.length === 0) return [];
      return fetchSummariesForPmids(simpleIds);
    }

    return fetchSummariesForPmids(idList);
  } catch (error) {
    console.error(`PubMed search error for ${drugName} + ${condition}:`, error);
    return [];
  }
}

async function fetchSummariesForPmids(pmids: string[]): Promise<PubMedCitation[]> {
  if (pmids.length === 0) return [];

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;

  try {
    const res = await fetchWithTimeoutAndRetry(summaryUrl, { timeoutMs: 6000, retries: 1 });
    if (!res.ok) return [];

    const data = await res.json();
    const resultObj = data?.result || {};
    const citations: PubMedCitation[] = [];

    for (const pmid of pmids) {
      const item = resultObj[pmid];
      if (!item) continue;

      const title = (item.title || 'PubMed Indexed Publication').replace(/<[^>]+>/g, '').trim();
      const journal = item.source || item.fulljournalname || 'Biomedical Journal';
      const pubDate = item.pubdate || item.sortpubdate?.slice(0, 10) || 'Recent';
      
      const authors: string[] = [];
      if (Array.isArray(item.authors)) {
        for (const a of item.authors.slice(0, 3)) {
          if (a.name) authors.push(a.name);
        }
        if (item.authors.length > 3) {
          authors.push('et al.');
        }
      }

      let doi = '';
      if (Array.isArray(item.articleids)) {
        const doiObj = item.articleids.find((id: { idtype: string; value: string }) => id.idtype === 'doi');
        if (doiObj) doi = doiObj.value;
      }

      citations.push({
        pmid,
        title,
        journal,
        pubDate,
        authors,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        abstractSnippet: item.abstract || undefined,
      });
    }

    return citations;
  } catch (err) {
    console.error('PubMed summary error:', err);
    return [];
  }
}
