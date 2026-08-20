// Thin full-width rule between sections. Recreated in CSS to stay scalable.
export default function Divider() {
  return (
    <div
      className="h-px w-full shrink-0"
      style={{
        background:
          'linear-gradient(to right, rgba(217,182,130,0), rgba(217,182,130,0.55) 20%, rgba(217,182,130,0.55) 80%, rgba(217,182,130,0))',
      }}
    />
  )
}
