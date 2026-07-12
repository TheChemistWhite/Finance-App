// Minimal inline stroke icons (24x24) used across the app.
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const ChartIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-4 3 3 4-6" />
  </svg>
)

export const CardsIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="6" width="19" height="13" rx="3" />
    <path d="M2.5 10h19" />
  </svg>
)

export const SettingsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

export const BackIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const ChevronRight = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const ChevronDown = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...base} width={26} height={26} strokeWidth={2.4} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </svg>
)

export const BellIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
)

export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.6-7.5 10-7.5S22 12 22 12s-3.6 7.5-10 7.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
)

export const EyeOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c5 0 8.8 3.3 10 7-0.5 1.5-1.4 2.9-2.5 4.1M6.6 6.6C4.5 8 3 10 2 12c1.2 3.7 5 7 10 7 1.4 0 2.7-.25 3.9-.7" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M7.5 10.5V7a4.5 4.5 0 1 1 9 0v3.5" />
  </svg>
)

export const GlobeIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.3 3.7 5.3 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.3-3.7-8.5S9.6 5.8 12 3.5z" />
  </svg>
)

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
)

export const InfoIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 8v.01" />
  </svg>
)

export const HelpIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.4 9.3a2.6 2.6 0 0 1 5 1c0 1.7-2.4 2-2.4 3.7" />
    <path d="M12 17.2v.01" />
  </svg>
)

export const LogOutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 20H5.5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2H9" />
    <path d="M16 16l4-4-4-4" />
    <path d="M20 12H9" />
  </svg>
)

export const EditIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20l.9-4 10-10 3.1 3.1-10 10L4 20z" />
    <path d="M13.5 6.5l3 3" />
  </svg>
)

export const FingerprintIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 1.6.2 3.1.7 4.5" />
    <path d="M20.5 12c0-4.7-3.8-8.5-8.5-8.5" />
    <path d="M7.5 6.8A7.4 7.4 0 0 1 12 5.4a7.4 7.4 0 0 1 7.4 7.4c0 1 .05 2 .15 2.9" />
    <path d="M12 8.4a5.6 5.6 0 0 0-5.6 5.6c0 1.9-.3 3.7-.9 5.3" />
    <path d="M12 8.4a5.6 5.6 0 0 1 5.6 5.6c0 .6 0 1.2.05 1.8" />
    <path d="M9.2 11.2a3 3 0 0 1 5.8 1.2c0 2.7-.8 5.2-2.2 7.3" />
    <path d="M12 12.4c0 2.9-.6 5.6-1.8 8" />
  </svg>
)

export const AlertIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 21.5 20h-19L12 3.5z" />
    <path d="M12 10v4.5" />
    <path d="M12 17.5v.01" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
    <path d="M6.5 7 7.3 19.2A2 2 0 0 0 9.3 21h5.4a2 2 0 0 0 2-1.8L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const SpinnerIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </svg>
)
