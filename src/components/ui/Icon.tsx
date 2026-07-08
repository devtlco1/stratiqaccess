export type IconName =
  | "compass"
  | "radar"
  | "shield-check"
  | "handshake"
  | "landmark"
  | "flask-conical"
  | "briefcase"
  | "truck"
  | "bolt"
  | "building-2"
  | "hard-hat"
  | "heart-pulse"
  | "cpu"
  | "shield"
  | "package"
  | "file-search"
  | "trending-up"
  | "menu"
  | "x"
  | "chevron-down"
  | "arrow-right"
  | "mail"
  | "map-pin"
  | "globe"
  | "phone"
  | "users"
  | "file-check"
  | "scale"
  | "calendar"
  | "key"
  | "languages"
  | "image";

const paths: Record<IconName, React.ReactNode> = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2 12.9 12.9l-3.7 1.9 1.9-3.7 3.7-1.9Z" />
    </>
  ),
  radar: (
    <>
      <path d="M12 12 20 7" />
      <path d="M12 3v3" />
      <path d="M12 21a9 9 0 1 1 9-9" />
      <path d="M12 12a5 5 0 1 0 5 5" />
    </>
  ),
  "shield-check": (
    <>
      <path d="M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </>
  ),
  handshake: (
    <>
      <path d="m3 11 4-3 3 2 3-2 4 3" />
      <path d="M6 12v3l3 2 3-2 3 2 3-2v-3" />
    </>
  ),
  landmark: (
    <>
      <path d="M4 21h16" />
      <path d="M5 21V10M9.5 21V10M14.5 21V10M19 21V10" />
      <path d="M3 10 12 4l9 6Z" />
    </>
  ),
  "flask-conical": (
    <>
      <path d="M10 3h4" />
      <path d="M10.5 3v5.5L5.8 18a2 2 0 0 0 1.8 3h8.8a2 2 0 0 0 1.8-3l-4.7-9.5V3" />
      <path d="M8 15h8" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h5.5L11 21l8-11h-5.5L13 3Z" />,
  "building-2": (
    <>
      <path d="M4 21V6l7-3 7 3v15" />
      <path d="M4 21h16" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
    </>
  ),
  "hard-hat": (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M2 16h20" />
      <path d="M11 8V5" />
    </>
  ),
  "heart-pulse": (
    <>
      <path d="M12 20s-7-4.4-9.5-9C.8 7.4 3 4 6.5 4c2 0 3.3 1.1 4 2.2C11.2 5.1 12.5 4 14.5 4 18 4 20.2 7.4 18.5 11c-.4.9-1 1.8-1.7 2.7" />
      <path d="M3 12h3l1.5-3 2 5 1.5-3H15" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  shield: <path d="M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6l-7-3Z" />,
  package: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
  "file-search": (
    <>
      <path d="M7 3h7l4 4v14H7Z" />
      <circle cx="10.5" cy="14.5" r="2.2" />
      <path d="m13.2 16.7 1.8 1.8" />
    </>
  ),
  "trending-up": (
    <>
      <path d="m3 16 6-6 4 4 8-9" />
      <path d="M15 5h6v6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </>
  ),
  phone: (
    <path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L14.7 13l4 1.5V18a2 2 0 0 1-2 2C10 20 4 14 4 6a2 2 0 0 1 1-2Z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" />
    </>
  ),
  "file-check": (
    <>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="m9.5 14 2 2 4-4.5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M8 21h8" />
      <path d="M5 7h5M14 7h5" />
      <path d="M5 7 2.5 12a2.5 2.5 0 0 0 5 0L5 7ZM19 7l-2.5 5a2.5 2.5 0 0 0 5 0L19 7Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.3h2M11 16.3h2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="m10.8 10.8 9.2 9.2M16 15l2-2M19 18l2-2" />
    </>
  ),
  languages: (
    <>
      <path d="M3 6h9M7.5 4v2.2c0 3.6-2 6.5-4.5 6.5" />
      <path d="M4 9.5c1 2.3 3.4 3.8 6 4" />
      <path d="m13 21 4-9 4 9M14.5 18h5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 3.5 3.5L17 10l3 3" />
    </>
  ),
};

export function Icon({
  name,
  className = "size-6",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
