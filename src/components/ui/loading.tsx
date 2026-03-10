'use client';

interface LoadingProps {
  message?: string;
  subMessage?: string;
  tone?: 'neutral' | 'brand';
}

export function Loading({
  message = "Loading…",
  subMessage,
  tone = 'brand',
}: LoadingProps) {
  const dotColors =
    tone === 'neutral'
      ? [
          '#4b5563',
          '#6b7280',
          '#9ca3af',
        ]
      : [
          'color-mix(in srgb, var(--primary) 75%, #1f2937)',
          'color-mix(in srgb, var(--primary) 55%, #111827)',
          'color-mix(in srgb, var(--primary) 35%, #0f172a)',
        ];

  const textColor =
    tone === 'neutral'
      ? '#374151'
      : 'color-mix(in srgb, var(--primary) 85%, #1f2937)';

  const subTextColor =
    tone === 'neutral'
      ? '#6b7280'
      : 'color-mix(in srgb, var(--primary) 45%, #6b7280)';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div
          className="flex items-center justify-center gap-2"
          aria-live="polite"
          aria-label="Loading"
        >
          <span
            className="block h-3 w-3 rounded-full animate-pulse"
            style={{
              backgroundColor: dotColors[0],
              animationDelay: '0ms',
            }}
          ></span>
          <span
            className="block h-3 w-3 rounded-full animate-pulse"
            style={{
              backgroundColor: dotColors[1],
              animationDelay: '150ms',
            }}
          ></span>
          <span
            className="block h-3 w-3 rounded-full animate-pulse"
            style={{
              backgroundColor: dotColors[2],
              animationDelay: '300ms',
            }}
          ></span>
        </div>

        <div className="space-y-2">
          <h2
            className="font-semibold text-base"
            style={{ color: textColor }}
          >
            {message}
          </h2>
          {subMessage && (
            <p
              className="text-sm"
              style={{ color: subTextColor }}
            >
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
