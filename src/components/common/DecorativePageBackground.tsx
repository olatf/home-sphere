type DecorativePageBackgroundProps = {
  gridOpacity?: number;
  gridSize?: string;
  showGlow?: boolean;
};

export function DecorativePageBackground({
  gridOpacity = 0.4,
  gridSize = '64px',
  showGlow = true,
}: Readonly<DecorativePageBackgroundProps>) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-grey-stroke) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grey-stroke) 1px, transparent 1px)',
          backgroundSize: `${gridSize} ${gridSize}`,
          opacity: gridOpacity,
        }}
      />

      {showGlow ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, color-mix(in srgb, var(--color-brand-primary) 7%, transparent) 0%, transparent 70%)',
          }}
        />
      ) : null}
    </>
  );
}
