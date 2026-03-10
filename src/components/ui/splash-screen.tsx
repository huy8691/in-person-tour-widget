'use client';

interface SplashScreenProps {
  isFadingOut?: boolean;
}

export function SplashScreen({ isFadingOut = false }: SplashScreenProps) {
  return (
    <div
      className={`flex flex-1 items-center justify-center bg-white transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ fontFamily: 'var(--font-poppins, "Poppins"), sans-serif' }}
    >
      <div className="flex justify-center py-8">
        <div
          className="flex items-center justify-center"
          aria-live="polite"
          aria-label="Loading"
        >
          <span className="loader" />
        </div>
      </div>
    </div>
  );
}
