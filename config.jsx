/* ---- Everything you need to edit lives in this block ---- */
const CFG = {
  time: '3:00 PM – 4:00 PM (GMT+8)', // full range — keep in sync with eventStart below
  timeShort: '3:00 PM',             // for the header and sticky bar, where the range does not fit
  language: '{{LANGUAGE}}',         // e.g. 'English' — not rendered anywhere on the page today
  eventStart: '2026-09-08T15:00:00+08:00', // drives the countdown — set the real start time
  seatsTotal: 40,
  seatsTaken: 17,                   // PLACEHOLDER — set the real number of seats already booked
  formEmbedUrl: '',                 // paste your Zoho / HubSpot / Google Form embed URL here; the styled form below is used while this is empty

  /* Where registrations go. Deploy apps-script/Code.gs from inside your Google
     Sheet (Extensions > Apps Script), then paste the Web App /exec URL here and
     the same token into both files. Steps: apps-script/README.md.
     While sheetEndpoint is empty the form refuses to submit rather than showing
     a thank-you screen it cannot back up — a visitor told they are registered
     when nothing was saved is worse than one told to try again. */
  sheetEndpoint: 'https://script.google.com/macros/s/AKfycbwDqoXy4AJUzpoJduMP3NRKyedtISGvJfTAffVs8NDo_fxc5e4SlJCPtcp_WExRq8G63w/exec',
  sheetToken: '01eb65b7e88f248c1c24de0b793e101d',

  privacyUrl: '{{PRIVACY_URL}}'     // TODO — real CKP privacy policy URL; shown as link text and href in the footer
};

/* Five client stories, shown under one heading with no per-tile caption.
   Each Drive file must stay on "Anyone with the link can view" or the embed shows a
   sign-in wall. `poster` is Drive's own thumbnail for that file — no still to upload. */
const VIDEO_IDS = [
  '1Tpz7cae_YAgbOblgk2UTYZ0Uu6_0SWxb',
  '1zoBdVL-hJVQ5h2OsC7LiyI2QEGanbQ19',
  '1q4hFlZ8kvgZzI7hmcyqvthIbzXp4cx64',
  '17rPAhF_tsFmZaBjmI20xPcQGMvxO9tav',
  '1MTfGKGpKZSCi_jhOiO9koko8SEjeI7M5'
];

/* Stills are served from our own origin: Drive refuses to hotlink thumbnails to
   another site, and a third-party image on the critical path is a liability on an
   ad landing page. Refresh them with the curl in IMPORT-NOTES.md if a video changes. */
const VIDEOS = VIDEO_IDS.map((fileId, i) => ({
  id: 'ckp-story-' + (i + 1),
  url: `https://drive.google.com/file/d/${fileId}/preview`,
  poster: `assets/video-stills/story-${i + 1}.jpg`
}));

const { useState, useEffect, useRef } = React;

function useCountdown(iso) {
  const [t, setT] = useState(() => Math.max(0, new Date(iso) - Date.now()));
  useEffect(() => {
    const i = setInterval(() => setT(Math.max(0, new Date(iso) - Date.now())), 1000);
    return () => clearInterval(i);
  }, [iso]);
  const s = Math.floor(t / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
}

function Countdown() {
  const c = useCountdown(CFG.eventStart);
  const cells = [[c.d, 'Days'], [c.h, 'Hours'], [c.m, 'Minutes'], [c.s, 'Seconds']];
  return (
    <div className="cd">
      {cells.map(([n, l]) => (
        <div className="cd-cell" key={l}>
          <div className="cd-n">{String(n).padStart(2, '0')}</div>
          <div className="cd-l">{l}</div>
        </div>
      ))}
    </div>
  );
}

function SeatMeter() {
  const left = Math.max(0, CFG.seatsTotal - CFG.seatsTaken);
  return (
    <div className="seats">
      <div className="seats-top">
        <div className="seats-n"><b>{left}</b> of {CFG.seatsTotal} seats left</div>
        <div className="seats-n" style={{ color: 'var(--gray-500)' }}>20 review slots</div>
      </div>
      <div className="seat-meter" aria-hidden="true">
        {Array.from({ length: CFG.seatsTotal }, (_, i) => <i key={i} className={i < left ? 'on' : ''} />)}
      </div>
    </div>
  );
}

function Reveal({ children, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add('in');
    const t = setTimeout(show, 700); // fallback: never let content stay hidden
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { show(); io.disconnect(); } }, { threshold: .12, rootMargin: '0px 0px -40px' });
      io.observe(el);
    }
    return () => { clearTimeout(t); io && io.disconnect(); };
  }, []);
  return <Tag ref={ref} className={('rv ' + className).trim()} {...rest}>{children}</Tag>;
}

Object.assign(window, { CFG, VIDEOS, useCountdown, Countdown, SeatMeter, Reveal });
