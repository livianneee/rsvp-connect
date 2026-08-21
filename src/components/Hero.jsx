// -----------------------------------------------------------------------------
// Hero / Header
// -----------------------------------------------------------------------------
// The Figma design uses a Marina Bay Sands twilight photo behind the branding,
// fading into the navy page. That photo is a proprietary brand asset and could
// not be exported here, so the default is a polished twilight-sky gradient with
// real, accessible text.
//
// TO USE THE REAL PHOTO: drop the image into `src/assets/images/` (or `public/`)
// and set `heroImage` on the edition (see src/data/editions.js), e.g.
//     import heroSingapore from '../assets/images/hero-singapore.png'
//     heroImage: heroSingapore
// The layout, gradient overlay and text all stay the same.
// -----------------------------------------------------------------------------
export default function Hero({ edition }) {
  const hasPhoto = Boolean(edition.heroImage)

  return (
    <header className="relative flex min-h-[600px] w-full flex-col items-center overflow-hidden">
      {/* Background layer: photo if provided, else a twilight-sky gradient */}
      <div aria-hidden className="absolute inset-0">
        {hasPhoto ? (
          <img
            src={edition.heroImage}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(180deg, #7fb2d9 0%, #5c8dbf 28%, #3f6699 52%, #2d4d7d 74%, #25406d 100%)',
            }}
          />
        )}
        {/* Scrim: keeps the top light (so the dark sponsor logos read on the sky),
            gives the white branding a touch of contrast in the middle, and fades
            into the navy body at the bottom. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(37,64,109,0.10) 0%, rgba(37,64,109,0.05) 30%, rgba(37,64,109,0.10) 50%, rgba(37,64,109,0.7) 80%, #25406d 100%)',
          }}
        />
      </div>

      {/* Foreground branding */}
      <div className="relative flex w-full max-w-wide flex-col items-center px-6 pb-16 pt-[clamp(28px,6vh,56px)] text-center">
        {/* Sponsors */}
        {edition.sponsors?.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-sans text-sm font-semibold text-white/90">Sponsors:</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {edition.sponsors.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="inline-flex items-center transition-opacity hover:opacity-80"
                >
                  <img src={s.logo} alt={s.name} className={s.className || 'h-6 w-auto sm:h-7'} />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="mt-[clamp(44px,12vh,150px)] font-script text-[clamp(20px,2.4vw,26px)] leading-none text-white/95">
          {edition.tagline}
        </p>

        {edition.logo ? (
          // Real logo (includes the "SINGAPORE EDITION" label + wordmark)
          <img
            src={edition.logo}
            alt={`GlobalTix Connect — ${edition.editionName}`}
            className="mt-5 h-auto w-full max-w-[640px]"
          />
        ) : (
          <>
            {edition.editionName && (
              <p className="mt-4 font-sans text-[clamp(11px,1.4vw,14px)] font-bold uppercase tracking-[0.28em] text-white">
                {edition.editionName}
              </p>
            )}
            {/* Text fallback wordmark */}
            <h1 className="mt-2 flex max-w-full select-none flex-wrap items-baseline justify-center leading-none text-white">
              <span className="font-sans text-[clamp(34px,8vw,92px)] font-bold tracking-tight">
                {edition.brand.part1}
              </span>
              <span className="font-script text-[clamp(44px,10vw,124px)] font-semibold sm:-ml-2">
                {edition.brand.part2}
              </span>
            </h1>
          </>
        )}
      </div>
    </header>
  )
}
