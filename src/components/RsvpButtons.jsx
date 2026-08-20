import ArrowBadge from './ArrowBadge.jsx'

// The two RSVP calls-to-action. Pill buttons matching the Figma design:
//   No  -> dark (#242424) with a gold arrow badge
//   Yes -> gold (#d9b682) with a dark arrow badge
export default function RsvpButtons({ onRespond }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-6 pt-2">
      <button
        type="button"
        onClick={() => onRespond('no')}
        className="group flex items-center justify-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 font-poppins text-base text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
      >
        <span>No, can’t make it</span>
        <ArrowBadge tone="onDark" />
      </button>

      <button
        type="button"
        onClick={() => onRespond('yes')}
        className="group flex items-center justify-center gap-3 rounded-full bg-gold py-2 pl-6 pr-2 font-poppins text-base text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
      >
        <span>Yes, I’m coming</span>
        <ArrowBadge tone="onGold" />
      </button>
    </div>
  )
}
