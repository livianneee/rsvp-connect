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
        {/* Scrim: darkens the top (behind the white branding) and bottom
            (fades into the navy body), leaving the skyline clear in the middle. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,36,64,0.62) 0%, rgba(28,48,84,0.28) 22%, rgba(37,64,109,0) 45%, rgba(37,64,109,0.7) 80%, #25406d 100%)',
          }}
        />
      </div>

      {/* Foreground branding */}
      <div className="relative flex w-full max-w-wide flex-col items-center px-6 pb-16 pt-[clamp(72px,18vh,200px)] text-center">
        <p className="font-script text-[clamp(20px,2.4vw,26px)] leading-none text-white/95">
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
