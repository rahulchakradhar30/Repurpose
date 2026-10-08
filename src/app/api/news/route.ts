import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedNewsArticles } from '@/lib/news/newsEngine';
import { checkRateLimit } from '@/lib/network';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rateCheck = checkRateLimit(`news-api-${ip}`, 60, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;

  try {
    const articles = await getVerifiedNewsArticles(category);
    return NextResponse.json({
      articles,
      totalCount: articles.length,
      category: category || 'All',
      lastVerifiedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('API /api/news error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve verified news updates' },
      { status: 500 }
    );
  }
}
