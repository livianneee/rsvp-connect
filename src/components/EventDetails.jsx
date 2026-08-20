// Date / Registration / Location block. Three columns on desktop that stack on
// small screens. Matches the Figma "Date and location" section.
function Column({ item, scriptPrimary = false }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 text-center">
      <p className="font-sans text-xl font-bold text-gold sm:text-2xl">{item.label}</p>
      <div className="flex flex-col items-center gap-3">
        <p
          className={
            scriptPrimary
              ? 'font-script text-3xl font-semibold text-gold-soft'
              : 'font-sans text-2xl font-medium text-gold-soft'
          }
        >
          {item.primary}
        </p>
        <p className="font-sans text-lg font-medium text-white sm:text-xl">{item.secondary}</p>
      </div>
    </div>
  )
}

export default function EventDetails({ details }) {
  return (
    <div className="flex w-full max-w-wide flex-col items-center gap-10">
      <div className="flex w-full flex-col items-stretch gap-10 sm:flex-row sm:justify-center sm:gap-6">
        <Column item={details.date} />
        <Column item={details.registration} />
        <Column item={details.location} scriptPrimary />
      </div>
      <p className="max-w-content text-center font-sans text-lg font-medium text-white sm:text-xl">
        {details.address}
      </p>
    </div>
  )
}
