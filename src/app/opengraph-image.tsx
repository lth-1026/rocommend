import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rocommend — 스페셜티 커피 로스터리 추천'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    return fetch(new URL('./fonts/Pretendard-Bold.ttf', import.meta.url)).then((r) =>
      r.arrayBuffer()
    )
  } catch {
    return null
  }
}

export default async function Image() {
  const fontData = await loadFont()

  return new ImageResponse(
    <div
      style={{
        background: '#F0EDE9',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        fontFamily: fontData ? 'Pretendard' : 'serif',
      }}
    >
      {/* 로고 */}
      <svg width="140" height="140" viewBox="0 0 425 425" fill="none">
        <circle cx="325" cy="100" r="100" fill="#1A1917" />
        <circle cx="325" cy="325" r="100" fill="#1A1917" />
        <path
          d="M0 160C0 71.6344 71.6344 0 160 0V0C182.091 0 200 17.9086 200 40V150C200 177.614 177.614 200 150 200H40C17.9086 200 0 182.091 0 160V160Z"
          fill="#1A1917"
        />
        <path
          d="M0 325C0 269.772 44.7715 225 100 225H150C177.614 225 200 247.386 200 275V375C200 402.614 177.614 425 150 425H100C44.7715 425 0 380.228 0 325V325Z"
          fill="#1A1917"
        />
      </svg>

      {/* 서비스명 */}
      <div
        style={{
          marginTop: 44,
          fontSize: 88,
          fontWeight: 700,
          color: '#1A1917',
          letterSpacing: '-3px',
          lineHeight: 1,
        }}
      >
        roco
      </div>

      {/* 설명 — 폰트 로드 성공 시에만 한국어 표시 */}
      {fontData && (
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: '#6B6560',
            letterSpacing: '-0.5px',
          }}
        >
          커피 로스터리 추천
        </div>
      )}
    </div>,
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: 'Pretendard',
                data: fontData,
                style: 'normal',
                weight: 700,
              },
            ],
          }
        : {}),
    }
  )
}
