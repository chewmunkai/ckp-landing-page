const { Button: Btn, Accordion, Badge } = window.CKPDesignSystem_23ab2d;

const DECISIONS = [
  ['01', 'Whether your structure still fits', 'Sdn Bhd, Enterprise and LLP compared in ringgit, for a business your size.'],
  ['02', 'Every deadline, off your memory', 'The 30-day, 90-day and 18-month deadlines laid out, so nothing rests on remembering.'],
  ['03', 'The cheapest legal way to pay yourself', 'Salary, director’s fee or dividend, and what each one actually costs you.'],
  ['04', 'How to hire without backdated bills', 'The registrations that must happen before your first hire, in the right order.'],
  ['05', 'Whether your books would survive a request', 'A loan application, tax estimate, audit or tender. Would your records hold up?'],
  ['06', 'A second pair of eyes on your numbers', 'A private 30-minute session with the CKP team, using your own numbers. No obligation, no pitch. 20 slots, because that is how many the team can personally take.']
];

function SectionThree() {
  return (
    <section className="sec rule-t">
      <div className="wrap">
        <Reveal className="stack-32" style={{ marginBottom: 56 }}>
          <Badge tone="outline" style={{ alignSelf: 'flex-start' }}>What you leave with</Badge>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.05fr) 1fr', gap: 64, alignItems: 'end' }} className="s3-grid">
            <Head2 a="1 hour. 6 answers" b="you can act on the same week." />
            <p className="body" style={{ maxWidth: '44ch' }}>Not an accounting lecture. 6 decisions only you can make, and what each one costs you if you make it late.</p>
          </div>
        </Reveal>
        <Reveal className="dgrid">
          {DECISIONS.map(([n, t, d]) => (
            <div className={'dcell' + (n === '06' ? ' dcell--em' : '')} key={n}>
              <div className="num">{n}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const CREDS = [
  'CA(M), ACCA, HRDF Certified Trainer',
  'Co-founded Chia, Ka & Partners in 2015; now serves 800+ successful clients worldwide',
  'Former Mazars auditor covering public-listed companies across property, shipping and FMCG',
  'Deep experience in due diligence and acquisition advisory across oil and gas, manufacturing and logistics',
  'Co-author of Why Breakeven; featured by The Star, Xero Asia and ISCA',
  'Regional alliance with OA Group in Singapore, advising across Malaysia, Singapore, Hong Kong and China'
];

function SectionFour() {
  // null = showing the poster; a number = that story is playing inline on the stage
  const [playing, setPlaying] = React.useState(null);
  const shown = playing === null ? 0 : playing;
  return (
    <section className="sec rule-t">
      <div className="wrap">
        <Reveal className="stack-32" style={{ marginBottom: 64 }}>
          <Badge tone="outline" style={{ alignSelf: 'flex-start' }}>Who is teaching</Badge>
          <Head2 a="Learn from someone who sees these issues" b="inside real Malaysian businesses every week." style={{ maxWidth: '22ch' }} />
        </Reveal>
        <Reveal className="jgrid">
          <div className="jphoto"><img src="assets/jeremy-chia.png" alt="Jeremy Chia, Managing Partner, Chia, Ka &amp; Partners" width="719" height="1080" /></div>
          <div className="stack-32">
            <div>
              <h3 className="jname">Jeremy Chia</h3>
              <p className="jrole">Managing Partner, Chia, Ka &amp; Partners</p>
            </div>
            <p className="lede" style={{ maxWidth: '52ch' }}>Jeremy has been inside Malaysian SME books since 2015. He knows which mistakes cost the most, which ones are still quietly fixable, and how to tell the difference in one sitting.</p>
            <ul className="creds">{CREDS.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </Reveal>
        <Reveal style={{ marginTop: 96 }}>
          <div className="vwrap">
            <div className="vstage">
              {playing === null ? (
                <button type="button" className="vposter" onClick={() => setPlaying(0)}
                  aria-label="Play the first client story">
                  <img src={VIDEOS[0].poster} alt="" width="500" height="889" />
                  <span className="vplay"></span>
                </button>
              ) : (
                <iframe key={playing} src={VIDEOS[playing].url} title={`Client story ${playing + 1}`}
                  allow="autoplay; fullscreen" allowFullScreen></iframe>
              )}
            </div>
            <div className="vside">
              <h3 className="disp h2" style={{ fontSize: 'clamp(24px,2.2vw,32px)' }}>Businesses we’ve helped <span className="tint">in the past.</span></h3>
              <p className="body" style={{ maxWidth: '40ch' }}>5 owners. No scripts. What changed once one team could see the whole company instead of a slice of it.</p>
              <div className="vstrip">
                {VIDEOS.map((v, i) => (
                  <button type="button" key={v.id} onClick={() => setPlaying(i)}
                    className={'vthumb' + (shown === i ? ' on' : '')}
                    aria-pressed={shown === i}
                    aria-label={`Play client story ${i + 1} of ${VIDEOS.length}`}>
                    <img src={v.poster} alt="" loading="lazy" width="500" height="889" />
                    <span className="vplay vplay--sm"></span>
                  </button>
                ))}
              </div>
              <div className="vcta">
                <p className="vcta-stat"><b>800+</b> successful clients worldwide.</p>
                <Btn as="a" href="#register" size="md">Save My Free Seat</Btn>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  { q: 'Is this going to turn into a 1-hour sales pitch?', a: 'No. It is 52 minutes of teaching and 8 minutes on what CKP does, and we tell you when that part starts so you can judge it for yourself. Everything taught works with the accountant and company secretary you already have. You do not need to hire us to use any of it.' },
  { q: 'I already have an accountant. Will this conflict with them?', a: 'No. Nobody is being replaced and nobody is being blamed. This is about the owner-level decisions no adviser can make on your behalf, and about getting everyone who supports your company working from the same picture. Bring your accountant. Bring whoever runs your payroll. It works better when they hear it too.' },
  { q: 'Can I ask about my own company without discussing it publicly?', a: 'Yes. Cameras stay off for everyone and your questions go into the chat, not onto the screen. For anything you would rather not type at all, the CKP team holds private 30-minute sessions after the webinar. That conversation stays between you and CKP. You can also message Xin Lei on +60 12-862 7298 or Carissa on +60 12-985 3980 at any time.' },
  { q: 'What if I cannot attend live?', a: 'Come live if you can. The Q&A is the part a recording cannot give you, because that is where your own situation gets answered. If the date genuinely does not work, register anyway and CKP will invite you to the next one.' }
];

function SectionFive() {
  return (
    <section className="sec rule-t">
      <div className="wrap wrap--narrow">
        <Reveal className="stack-32">
          <Badge tone="outline" style={{ alignSelf: 'flex-start' }}>Before you register</Badge>
          <Head2 a="The questions owners" b="usually ask us first." style={{ maxWidth: '20ch' }} />
          <Accordion items={FAQS} defaultOpen={-1} />
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA({ onDone }) {
  const left = Math.max(0, CFG.seatsTotal - CFG.seatsTaken);
  return (
    <section className="final sec" id="register-2-anchor">
      <div className="wrap final-grid">
        <div className="final-left">
          <span className="final-eyebrow">Still unsure this is for you?</span>
          <h2 className="disp final-h2">
            <span className="fh-a">Your company may already be fine.</span>
            <span className="fh-b">You deserve to know, not assume.</span>
          </h2>
          <p className="final-lede">Swap “I think everything should be okay” for knowing. Your structure, your deadlines, your payroll, your books.</p>
          <div className="final-meta">
            <span>Free</span>
            <span>8 September 2026</span>
            <span>{CFG.time}</span>
            <span>Online</span>
          </div>
          <div className="final-meta">
            <span className="fm-live"><i />{left} of {CFG.seatsTotal} seats left</span>
            <span>20 private review slots</span>
          </div>
          <p className="final-note">60 minutes now, or an unknown bill later. That is the whole trade.</p>
          <p className="final-small">Built for owners and directors. Bring whoever handles your books, payroll or compliance if you want everyone aligned.</p>
        </div>
        <RegistrationForm id="register-2" onDone={onDone} />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div className="stack-16">
            <div className="ftr-badge"><img src="assets/xero-platinum-partner.png" alt="Xero Platinum Partner" width="420" height="205" /></div>
            <p style={{ margin: 0, maxWidth: '34ch', fontSize: 14 }}>Chia, Ka &amp; Partners is a Xero Platinum Partner. Learn more at <a href="https://www.xero.com" target="_blank" rel="noopener">xero.com</a></p>
          </div>
          <div>
            <p className="ftr-name">Chia, Ka &amp; Partners PLT (LLP0005573-LCA)</p>
            <div className="ftr-contacts">
              <span>Questions before the day?</span>
              <a href="https://wa.me/60128627298" target="_blank" rel="noopener">Xin Lei · +60 12-862 7298</a>
              <a href="https://wa.me/60129853980" target="_blank" rel="noopener">Carissa · +60 12-985 3980</a>
            </div>
            <p style={{ margin: 0, lineHeight: 1.7 }}>Level 16-03A, Menara MBMR, 1 Jalan Syed Putra, 58000 Kuala Lumpur<br />+603-9212 7856 · <a href="mailto:enquiry@ckpartners.com.my">enquiry@ckpartners.com.my</a>
              {/* Only render once a real URL is set — an unresolved placeholder would
                  ship a dead link, which is worse than omitting the line. */}
              {/^https?:\/\//.test(CFG.privacyUrl) && (
                <React.Fragment><br />Privacy policy: <a href={CFG.privacyUrl}>{CFG.privacyUrl}</a></React.Fragment>
              )}
            </p>
          </div>
          <div><Btn as="a" href="#register" variant="inverse" size="md">Save My Free Seat</Btn></div>
        </div>
        <div className="ftr-bottom">
          <span>Page by Edge Point Solutions Sdn Bhd</span>
          <span>{`8 September 2026 · ${CFG.time} · Online`}</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { SectionThree, SectionFour, SectionFive, FinalCTA, Footer });
