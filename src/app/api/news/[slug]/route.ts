import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticleBySlug } from '@/lib/news/newsEngine';
import { checkRateLimit } from '@/lib/network';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rateCheck = checkRateLimit(`news-detail-api-${ip}`, 60, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing article slug' }, { status: 400 });
  }

  try {
    const article = await getNewsArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (err: unknown) {
    console.error(`API /api/news/${slug} error:`, err);
    return NextResponse.json(
      { error: 'Failed to retrieve news article details' },
      { status: 500 }
    );
  }
}
