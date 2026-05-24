/* All SVG icons match the updated mockup exactly.
   Each icon using a gradient carries its own <defs> block
   so url(#id) references resolve regardless of DOM context. */

const YoutubeIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#FF0000"/>
    <path d="M21 18.5 35 26 21 33.5V18.5Z" fill="#fff"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#010101"/>
    <path d="M33.5 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#fff"/>
    <path d="M33.5 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#EE1D52" opacity=".55"/>
    <path d="M29.1 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#69C9D0" opacity=".55"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <defs>
      <linearGradient id="plat-ig" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#f9ce34"/>
        <stop offset="32%"  stopColor="#ee2a7b"/>
        <stop offset="68%"  stopColor="#6228d7"/>
        <stop offset="100%" stopColor="#4f5bd5"/>
      </linearGradient>
    </defs>
    <rect width="52" height="52" rx="14" fill="url(#plat-ig)"/>
    <rect x="11" y="11" width="30" height="30" rx="9" stroke="#fff" strokeWidth="3.5"/>
    <circle cx="26" cy="26" r="8" stroke="#fff" strokeWidth="3.5"/>
    <circle cx="37" cy="15" r="2.2" fill="#fff"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#1877F2"/>
    <path d="M33 26h-5v14h-5V26h-3v-5h3v-3c0-4 2-6.5 6-6.5 1.7 0 3.5.3 3.5.3V17h-2c-2 0-2.5 1-2.5 2.5V21h4.5L33 26Z" fill="#fff"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#25D366"/>
    <path d="M26 12a14 14 0 0 0-12 21L12 40l7.2-2A14 14 0 1 0 26 12Zm7.8 19.3c-.3.9-1.8 1.7-2.5 1.8-.7.1-1.5.1-2.4-.2-.6-.2-1.3-.4-2.3-.8-4-1.8-6.6-5.9-6.8-6.2-.2-.3-1.7-2.2-1.7-4.2 0-2 1-3 1.4-3.4.4-.4.8-.5 1.1-.5h.8c.2 0 .5-.1.9.7.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .7-.1.3-.2.5-.4.7l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2 2.5 1.4 1.2 2.6 1.6 3 1.8.4.1.6.1.9-.1.2-.2 1-1.1 1.2-1.5.3-.4.5-.3.9-.2.4.1 2.3 1 2.7 1.3.4.2.7.3.8.5.1.2.1 1.1-.2 2Z" fill="#fff"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#229ED9"/>
    <path d="M38.7 14.2 33.6 36c-.3 1.4-1.2 1.7-2.4 1.1l-6.7-4.9-3.2 3.1c-.4.4-.7.7-1.4.7l.5-7 13-11.6c.6-.5-.1-.8-.9-.3L13.6 26.1l-6.5-2c-1.4-.4-1.4-1.4.3-2l23.5-9c1.2-.4 2.2.3 1.8 3.1Z" fill="#fff"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#000"/>
    <path d="M10 11h10.5l8 11.3L37.5 11H43L31.5 24.5 44 41H33.5l-8.8-12.4L15 41H9.5L21.5 27 10 11Zm4 2.5 20 26h4.5L18.5 13.5H14Z" fill="#fff"/>
  </svg>
);

const MapsIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="#0a1628"/>
    <path d="M26 11a10 10 0 0 0-8 16l8 14 8-14a10 10 0 0 0-8-16Zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="#EA4335"/>
    <path d="M26 11a10 10 0 0 1 8 16l-3 5.3A10 10 0 0 0 26 11Z" fill="#FBBC04"/>
    <path d="M22 27l-4 6.5A10 10 0 0 1 16 21l4.5 4.2L22 27Z" fill="#34A853"/>
  </svg>
);

const CustomIcon = () => (
  <svg viewBox="0 0 52 52" fill="none">
    <defs>
      <linearGradient id="plat-cu" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect width="52" height="52" rx="14" fill="#071228"/>
    <path d="M21 31a6 6 0 0 1 0-8.5l4.5-4.5a6 6 0 0 1 8.5 8.5l-1.5 1.5" stroke="url(#plat-cu)" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M31 21a6 6 0 0 1 0 8.5l-4.5 4.5a6 6 0 0 1-8.5-8.5l1.5-1.5" stroke="url(#plat-cu)" strokeWidth="3.5" strokeLinecap="round"/>
  </svg>
);

const platforms = [
  { Icon: YoutubeIcon,  name: "YouTube",     desc: "Channels, videos & creators"      },
  { Icon: TikTokIcon,   name: "TikTok",      desc: "Profiles & creator campaigns"      },
  { Icon: InstagramIcon,name: "Instagram",    desc: "Profiles, posts & stories"         },
  { Icon: FacebookIcon, name: "Facebook",     desc: "Pages, groups & profiles"          },
  { Icon: WhatsAppIcon, name: "WhatsApp",     desc: "Chats & number links"              },
  { Icon: TelegramIcon, name: "Telegram",     desc: "Channels & group links"            },
  { Icon: TwitterIcon,  name: "X / Twitter",  desc: "Posts, profiles & threads"         },
  { Icon: MapsIcon,     name: "Google Maps",  desc: "Directions & locations"            },
  { Icon: CustomIcon,   name: "Custom URL",   desc: "Any app URI scheme"                },
];

export function PlatformsSection() {
  return (
    <section className="section section--alt" id="platforms" aria-labelledby="platforms-heading">
      <div className="container">
        <span className="section-kicker">Supported Platforms</span>
        <h2 className="section-h2" id="platforms-heading">
          Deep Links for <span className="grad-text">Every App</span>
        </h2>
        <p className="section-sub">
          From social creators to local businesses. Generate a smart deep link for any platform in seconds. Each link automatically routes users into the correct native app, or falls back gracefully to the web.
        </p>

        <div className="platforms-grid" role="list" aria-label="Supported platforms">
          {platforms.map(({ Icon, name, desc }) => (
            <article className="platform-card" role="listitem" key={name}>
              <div className="platform-card__icon" aria-hidden="true">
                <Icon />
              </div>
              <strong className="platform-card__name">{name}</strong>
              <p className="platform-card__desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
