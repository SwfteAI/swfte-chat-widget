import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TARGET = process.env.SWFTE_BASE_URL ?? 'https://api.swfte.com/agents';

async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;

  if (!process.env.SWFTE_API_KEY) {
    return NextResponse.json(
      { error: 'SWFTE_API_KEY env var is not set on the server.' },
      { status: 500 },
    );
  }

  const url = `${TARGET}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${process.env.SWFTE_API_KEY}`);
  if (process.env.SWFTE_WORKSPACE_ID) {
    headers.set('x-workspace-id', process.env.SWFTE_WORKSPACE_ID);
  }
  headers.delete('host');
  headers.delete('content-length');

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    // @ts-expect-error duplex required for streaming bodies in Node 18+
    duplex: 'half',
  });

  // Pipe the streaming body straight back to the browser.
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export {
  forward as GET,
  forward as POST,
  forward as PATCH,
  forward as PUT,
  forward as DELETE,
};
