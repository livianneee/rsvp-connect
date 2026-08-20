// Circular arrow badge used inside the RSVP buttons.
// Recreated as inline SVG (the Figma icon asset could not be exported), so it
// stays crisp at any size. `tone` picks the badge colours per button.
export default function ArrowBadge({ tone = 'onDark' }) {
  const styles = {
    // Dark "No" button -> soft gold badge with dark chevron
    onDark: { bg: '#d9b682', fg: '#242424' },
    // Gold "Yes" button -> dark badge with light chevron
    onGold: { bg: '#242424', fg: '#ffffff' },
  }[tone]

  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: styles.bg }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 6l6 6-6 6"
          stroke={styles.fg}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
