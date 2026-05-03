import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const BRAND = {
  bg: '#1A1A1A',
  bgAccent: '#C4633B',
  bgAccentDark: '#7A3E25',
  fg: '#F5F0E8',
  muted: '#A6A6A6',
};

type ShareType = 'streak' | 'badge' | 'rank';

function parseType(raw: string | null): ShareType {
  if (raw === 'badge' || raw === 'rank') return raw;
  return 'streak';
}

function clampStr(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function getCopy(type: ShareType, value: string, user: string) {
  const u = user ? `@${user}` : 'estudante';
  switch (type) {
    case 'badge':
      return {
        eyebrow: 'Conquista desbloqueada',
        big: clampStr(value || 'Nova conquista', 28),
        sub: `${u} no APROVA`,
      };
    case 'rank':
      return {
        eyebrow: 'Subiu de rank',
        big: clampStr(value || 'Aprovado', 28),
        sub: `${u} avançou no APROVA`,
      };
    case 'streak':
    default:
      return {
        eyebrow: 'Sequência de estudos',
        big: `${value || '0'} ${value === '1' ? 'dia seguido' : 'dias seguidos'}`,
        sub: `${u} estudando todo dia no APROVA`,
      };
  }
}

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = parseType(searchParams.get('type'));
  const value = (searchParams.get('value') ?? '').slice(0, 60);
  const user = (searchParams.get('user') ?? '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 30);

  const { eyebrow, big, sub } = getCopy(type, value, user);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: `linear-gradient(135deg, ${BRAND.bgAccentDark} 0%, ${BRAND.bg} 60%)`,
          color: BRAND.fg,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: BRAND.bgAccent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: -1,
            }}
          >
            A
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>
            APROVA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span
            style={{
              fontSize: 28,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: BRAND.bgAccent,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {big}
          </span>
          <span style={{ fontSize: 32, color: BRAND.muted }}>{sub}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 24, color: BRAND.muted }}>
            Vestibular Unifor Medicina
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: BRAND.fg }}>
            aprova.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
