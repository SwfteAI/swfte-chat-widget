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
  // Strip content-encoding/content-length because fetch() already
  // auto-decompresses gzip/br/deflate before exposing `upstream.body`;
  // forwarding those headers would mislead the client into trying to
  // decompress an already-plaintext body or expecting the wrong length.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  forward as GET,
  forward as POST,
  forward as PATCH,
  forward as PUT,
  forward as DELETE,
};
