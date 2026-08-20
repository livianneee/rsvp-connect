import BrandLogo from './BrandLogo.jsx'

export default function Footer({ footer }) {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-4 px-6">
      <BrandLogo />
      <div className="max-w-content text-center">
        {footer.lines.map((line, i) => (
          <p key={i} className="font-sans text-sm font-medium leading-6 text-white/90 sm:text-base">
            {line}
          </p>
        ))}
      </div>
    </footer>
  )
}
