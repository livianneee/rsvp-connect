import logoGlobaltix from '../assets/images/logo-globaltix-footer.png'

// GlobalTix footer wordmark (white "GLOBAL" + green "TiX").
export default function BrandLogo({ className = '' }) {
  return (
    <img
      src={logoGlobaltix}
      alt="GlobalTix"
      className={`h-5 w-auto ${className}`}
    />
  )
}
