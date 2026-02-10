import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OurTurn — Daily care for families living with dementia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#FAF7F2',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #B85A2F 0%, #E8B86D 100%)',
          }}
        />

        {/* Decorative blob */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(249, 212, 180, 0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(253, 238, 225, 0.5)',
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 40,
            background: '#FFF8F0',
            border: '4px solid #D97757',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#D97757',
              fontFamily: 'Georgia, serif',
            }}
          >
            O
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#2D1F14',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          OurTurn
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#5C4A3A',
            fontFamily: 'system-ui, sans-serif',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Daily care for families living with dementia
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #B85A2F, #E8B86D)',
            marginTop: 32,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 18,
            color: '#9C8B7A',
            fontFamily: 'system-ui, sans-serif',
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          A calm app for your loved one. A powerful hub for you.
        </div>
      </div>
    ),
    { ...size },
  );
}
