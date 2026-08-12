const { Button } = window.CKPDesignSystem_23ab2d;

function Head2({ a, b, className = '', style }) {
  return <h2 className={('disp h2 ' + className).trim()} style={style}>{a} <span className="tint">{b}</span></h2>;
}

function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <div className="hdr-brand">
          <img src="assets/ckp-logo.png" alt="CKP" width="411" height="411" />
          <div>
            <div className="hdr-name">Chia, Ka &amp; Partners</div>
            <div className="hdr-sub">Chartered Accountants · Kuala Lumpur</div>
          </div>
        </div>
        <div className="hdr-meta">
          <span className="eyebrow" style={{ color: 'var(--gray-500)' }}>{`8 Sep 2026 · ${CFG.timeShort}`}</span>
          <Button as="a" href="#register" size="sm">Save My Free Seat</Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onDone }) {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-l">
            <div className="hero-stack">
              <div className="chips">{['Free 60-minute webinar', '8 September 2026', CFG.time].map((t) => <span key={t}>{t}</span>)}</div>
              <h1 className="disp h1 on-dark"><span className="lead">If LHDN asked you today,</span>could you prove your company is compliant?</h1>
              <div className="hero-copy">
                <p className="hero-lede">Most owners cannot. Not because they are careless, but because 3 different people each hold one piece of the answer, and none of them hold all of it.</p>
                <p className="hero-sub">60 minutes, cameras off, nothing to prepare. You leave knowing what is covered, what to check, and what to fix first.</p>
              </div>
              <div className="hero-act">
                <Button as="a" href="#register" variant="secondary" size="lg">Save My Free Seat</Button>
                <span className="hero-act-note">Takes 30 seconds. 40 seats, then we close it.</span>
              </div>
            </div>
            <div className="hero-facts">
              <span>Free</span><span>40 seats</span><span>Cameras off</span><span>Ask your questions in the chat</span>
            </div>
          </div>
          <div className="hero-r">
            <div className="hero-r-in stack-16">
              <Countdown />
              <SeatMeter />
              <RegistrationForm id="register" onDone={onDone} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = ['Xero Platinum Partner', 'Xero Partner of the Year (Malaysia) 2025', 'Xero Advisory Partner of the Year 2025', 'Licensed company secretary', 'Chartered accountants, LLP0005573-LCA', '800+ successful clients worldwide'];
  return (
    <div className="rule-b">
      <div className="wrap trust">
        <div className="trust-badge"><img src="assets/xero-platinum-partner.png" alt="Xero Platinum Partner" width="420" height="205" /></div>
        <ul className="trust-list">{items.map((t) => <li key={t}><span>{t}</span></li>)}</ul>
      </div>
    </div>
  );
}

/* Three covered zones with two visible gaps between them. The hatched gaps do the
   arguing that Sections 01 and 02 previously made twice over in prose. */
const COVERAGE = [
  ['Your accountant', 'Works from the records you hand over'],
  ['Your company secretary', 'Files what SSM asks for'],
  ['Payroll', 'Pays EPF, SOCSO, EIS, PCB and SKBBK each month']
];

const FALLS_THROUGH = [
  '3 staff hired last month',
  'A financial year end that no longer fits',
  'Books that cannot support your tax estimate'
];

function SectionOne() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal className="quote">
          <p>“My accountant and company secretary handle all this.”</p>
        </Reveal>
        <Reveal className="s1-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,.9fr) 1.1fr', gap: 64, marginTop: 72, alignItems: 'start' }}>
          <Head2 a="They probably do." b="The real question is whether anyone sees the whole company." />
          <p className="lede" style={{ maxWidth: '46ch' }}>You hired professionals so you would not have to track every filing yourself. That was the right call. The problem is not who you hired. It is what nobody was hired to do.</p>
        </Reveal>
        <Reveal className="cover" style={{ marginTop: 48 }}>
          <div className="cover-row">
            {COVERAGE.map(([who, does], i) => (
              <React.Fragment key={who}>
                {i > 0 && <div className="cov-gap" aria-hidden="true"><span>Gap</span></div>}
                <div className="cov">
                  <span className="cov-who">{who}</span>
                  <p>{does}</p>
                  <span className="cov-tag">Covered</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="cover-foot">
            <div className="cf-label">Nobody is looking here</div>
            <ul>{FALLS_THROUGH.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </Reveal>
        <Reveal style={{ marginTop: 40 }}>
          <p className="lede strong-ink" style={{ maxWidth: '52ch' }}>When something is missed, the letter does not go to the gap between them. It goes to the company, and to the director named on the SSM register. That is you.</p>
        </Reveal>
      </div>
      <div style={{ background: 'var(--ink)', marginTop: 80 }}>
        <div className="wrap">
          <Reveal>
            <p className="lede" style={{ color: 'rgba(255,255,255,.72)', maxWidth: '48ch', padding: '52px 0 8px' }}>Most owners never say these out loud. They think them anyway:</p>
            <div className="qband">
              {[['01', 'What have I already missed?'], ['02', 'Is anyone actually watching this?'], ['03', 'If it is wrong, does it land on me?']].map(([n, q]) => (
                <div className="qrow" key={n}><div className="n">{n}</div><p className="q">{q}</p></div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 32 }}>
        <p className="lede strong-ink">You will leave this hour able to answer all 3.</p>
      </div>
    </section>
  );
}

/* From the webinar deck: the deadlines that start on incorporation day, not on the
   day the owner gets round to them. Structure, not prose — it reads in five seconds. */
const CLOCK = [
  ['Within 30 days', 'Corporate bank account, SST if applicable, and any SSM change filed'],
  ['Within 90 days', 'Tax registration, CP204, auditor and tax agent appointed, books started'],
  ['Within 18 months', 'Year end set, first accounts, first audit, first annual return'],
  ['Every month', 'EPF, SOCSO, EIS, PCB and SKBBK by the 15th, plus monthly management accounts so you know your performance and tax estimate']
];

function SectionTwo() {
  const rows = [
    ['CP204 instalment, by the 15th', '10% is added to the bill. No warning, no reminder, no appeal.'],
    ['EPF, SOCSO, EIS, PCB and SKBBK, by the 15th', 'Charges accrue every day it stays unpaid, and they do not stop.'],
    ['Employer registration, before the first hire', 'Backdated to your first employee’s day one, across all 3 funds at once.'],
    ['Books kept clean and current', 'The loan is declined. The tender closes without you.']
  ];
  return (
    <section className="sec rule-t">
      <div className="wrap">
        <Reveal className="s2-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) 1fr', gap: 64, alignItems: 'start' }}>
          <Head2 a="The biggest risk is not always bad advice." b="It is good people working from different information." />
          <p className="lede" style={{ maxWidth: '46ch' }}>Nobody here is careless. But you do not find out on the day it happens. You find out at the audit. Or when the letter arrives. By then it has been compounding for months.</p>
        </Reveal>
        <Reveal style={{ marginTop: 52 }}>
          <div className="clock-head">
            <span className="eyebrow eyebrow-block">The clock is already running</span>
            <p>It started the day SSM approved your Sdn Bhd, not the day you got round to it.</p>
          </div>
          <div className="clock">
            {CLOCK.map(([when, what]) => (
              <div key={when}><span className="when">{when}</span><p>{what}</p></div>
            ))}
          </div>
        </Reveal>
        <Reveal className="stack-32" style={{ marginTop: 56 }}>
          <h3 className="disp h2" style={{ maxWidth: '20ch' }}>By the time you notice, <span className="tint">it has already cost you.</span></h3>
          <table className="ledger">
            <thead><tr><th>Miss this</th><th>Here is what happens to you</th></tr></thead>
            <tbody>{rows.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
          </table>
          <div className="payoff">
            <b>In 60 minutes you will know which of these you have already passed, which are overdue, and which one to fix first.</b>
            <span>No chasing 3 people. No jargon. No homework afterwards.</span>
          </div>
        </Reveal>
      </div>
      <Reveal style={{ background: 'var(--ink)', borderTop: '3px solid var(--ink)', marginTop: 72, padding: '76px 0' }}>
        <div className="wrap merge">
          <div className="merge-top">
            {[
              ['Company secretary', 'SSM filings, director and shareholder changes'],
              ['The books', 'Every transaction, reconciled monthly'],
              ['Payroll', 'EPF, SOCSO, EIS, PCB and SKBBK, by the 15th']
            ].map(([t, d], i) => (
              <div className="msrc" key={t}>
                <span className="msrc-n">{'0' + (i + 1)}</span>
                <span className="msrc-t">{t}</span>
                <span className="msrc-d">{d}</span>
              </div>
            ))}
          </div>
          <svg className="merge-svg" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true">
            <path d="M16.7 0 V13 Q16.7 24 33 24 H50 V44" vectorEffect="non-scaling-stroke" />
            <path d="M50 0 V44" vectorEffect="non-scaling-stroke" />
            <path d="M83.3 0 V13 Q83.3 24 67 24 H50 V44" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="merge-into">
            <span className="mi-eyebrow">The whole company, in one place</span>
            <p className="mi-label">One connected view</p>
            <p className="mi-body">One team. One set of numbers. Every deadline visible before it arrives instead of after. That is how you answer all 3 questions yourself, in 10 seconds, without picking up the phone.</p>
            <p className="mi-sig">That is what CKP walks you through in this session.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

Object.assign(window, { Head2, Header, Hero, TrustStrip, SectionOne, SectionTwo });
