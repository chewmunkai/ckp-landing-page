const { Input, Select, Button } = window.CKPDesignSystem_23ab2d;

/* Qualifying questions. Wording follows the client's question sheet; only
   "Sdn. Bhd." is normalised to "Sdn Bhd" to match the rest of the page. */
const Q_STAGE = [
  'Not yet incorporated',
  'Sole Proprietorship or Enterprise',
  'Sdn Bhd — incorporated less than 2 years',
  'Sdn Bhd — incorporated 2 years or more'
];

const Q_WORRY = [
  'Not sure whether my company is fully compliant',
  'Keeping up with SSM & statutory requirements',
  'Tax compliance & LHDN matters',
  'Accounting records & financial statements',
  'Payroll & HR compliance',
  'Missing deadlines or getting penalties',
  'Not sure what I need to comply with',
  'Other'
];

const Q_FIRM = [
  'Yes — accounting & company secretary',
  'Yes — accounting only',
  'Yes — company secretary only',
  'No — handled internally',
  'No — currently looking for a service provider'
];

const Q_CONFIDENCE = [
  'Very confident — everything is under control',
  'Quite confident — but there may be some gaps',
  'Not very confident — I am not sure what we are missing',
  'Not confident at all — I need help understanding the requirements'
];

const Q_AREAS = [
  'Company statutory compliance',
  'Accounting & financial reporting',
  'Tax compliance',
  'Payroll & HR compliance',
  'Annual filing & SSM requirements',
  'What business owners should monitor themselves',
  'All of the above'
];

const ALL_AREAS = 'All of the above';

function RegistrationForm({ id, onDone }) {
  // Ten fields in one column reads as a wall and kills conversion, so the contact
  // details are asked first and the qualifying questions only after that commitment.
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState('');
  const [worry, setWorry] = React.useState('');
  const [areas, setAreas] = React.useState([]);
  const [showAreas, setShowAreas] = React.useState(false);
  const [err, setErr] = React.useState('');
  const formRef = React.useRef(null);

  const needsDirector = role === 'Manager' || role === 'Staff';
  const needsOther = worry === 'Other';

  if (CFG.formEmbedUrl) {
    return (
      <div id={id} className="formcard" style={{ padding: 0 }}>
        <iframe src={CFG.formEmbedUrl} title="Webinar registration" style={{ width: '100%', height: 720, border: 0, display: 'block' }}></iframe>
      </div>
    );
  }

  const val = (name) => {
    const el = formRef.current && formRef.current.elements[name];
    return el ? String(el.value || '').trim() : '';
  };

  const toggleArea = (a) => {
    setErr('');
    setAreas((prev) => {
      if (a === ALL_AREAS) return prev.includes(ALL_AREAS) ? [] : [ALL_AREAS];
      const next = prev.filter((x) => x !== ALL_AREAS);
      return next.includes(a) ? next.filter((x) => x !== a) : next.concat(a);
    });
  };

  const goToQuestions = () => {
    if (!val('name')) return setErr('Please add your name.');
    if (!val('whatsapp')) return setErr('Please add your WhatsApp number, that is where the link goes.');
    if (!val('company')) return setErr('Please add your company name.');
    if (!role) return setErr('Please choose your role.');
    if (needsDirector && !val('director')) return setErr('Please add the name you are registering for.');
    setErr('');
    setStep(2);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!val('stage')) return setErr('Please choose the stage your business is at.');
    if (!worry) return setErr('Please choose your biggest compliance worry.');
    if (needsOther && !val('worryOther')) return setErr('Please tell us what the worry is.');
    if (!val('firm')) return setErr('Please tell us whether you work with a firm already.');
    if (!val('confidence')) return setErr('Please choose how confident you feel.');
    setErr('');
    onDone && onDone();
  };

  return (
    <form id={id} ref={formRef} className="formcard" onSubmit={submit} noValidate>
      <div className="form-head">
        <p className="form-title">Your free seat</p>
        <p className="form-when">{`8 Sep 2026 · ${CFG.time} · Online`}</p>
      </div>

      <div className="form-body">
        <div className="fsteps">
          <span className="fstep-bars" aria-hidden="true">
            <i className="on" />
            <i className={step === 2 ? 'on' : ''} />
          </span>
          <span className="fstep-label">
            Step {step} of 2 · {step === 1 ? 'Your details' : 'So we can tailor the hour'}
          </span>
        </div>

        {/* Step 1 is kept mounted so its values survive the trip to step 2 */}
        <div className="fstack" hidden={step !== 1}>
          {/* the two short fields share a row — on its own each wasted half the card */}
          <div className="frow">
            {/* short placeholders: these two fields are half-width and longer ones truncate */}
            <Input id={`${id}-name`} label="Name" name="name" placeholder="Full name" />
            <Input id={`${id}-company`} label="Company" name="company" placeholder="Sdn Bhd" />
          </div>
          <Input id={`${id}-whatsapp`} label="WhatsApp number" name="whatsapp" prefix="+60"
            hint="Your joining link is sent here." placeholder="12 345 6789" />
          <Select id={`${id}-role`} label="Your role" name="role" placeholder="Select one" value={role}
            onChange={(e) => { setRole(e.target.value); setErr(''); }}
            options={['Owner', 'Director', 'Manager', 'Staff']} />
          {needsDirector && (
            <Input id={`${id}-director`} label="Who are you registering on behalf of?" name="director"
              hint="So we can address the session to the right person."
              placeholder="Director's name" />
          )}
        </div>

        <div className="fstack" hidden={step !== 2}>
          <Select id={`${id}-stage`} label="What stage is your business at?" name="stage"
            placeholder="Select one" options={Q_STAGE} />
          <Select id={`${id}-worry`} label="Your biggest compliance worry right now" name="worry"
            placeholder="Select one" value={worry}
            onChange={(e) => { setWorry(e.target.value); setErr(''); }}
            options={Q_WORRY} />
          {needsOther && (
            <Input id={`${id}-worryOther`} name="worryOther" label="Tell us what it is"
              placeholder="In a few words" />
          )}
          <Select id={`${id}-firm`} label="Already using an accounting firm?"
            name="firm" placeholder="Select one" options={Q_FIRM} />
          <Select id={`${id}-confidence`} label="How compliant do you feel today?"
            name="confidence" placeholder="Select one" options={Q_CONFIDENCE} />

          {/* Optional, and 7 chips cost ~300px — so it stays folded until asked for */}
          <fieldset className="chipset">
            <button type="button" className="chip-toggle" aria-expanded={showAreas}
              onClick={() => setShowAreas((v) => !v)}>
              <span>{showAreas ? '–' : '+'}</span>
              Areas you want covered
              <em>{areas.length ? `${areas.length} picked` : 'Optional'}</em>
            </button>
            {showAreas && (
              <div className="chipwrap">
                {Q_AREAS.map((a) => (
                  <button type="button" key={a} onClick={() => toggleArea(a)}
                    className={'chip' + (areas.includes(a) ? ' on' : '')} aria-pressed={areas.includes(a)}>
                    {a}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="areas" value={areas.join(' | ')} />
          </fieldset>
        </div>

        {err && <p className="form-err" role="alert">{err}</p>}

        <div className="form-foot">
          {step === 1 ? (
            <Button type="button" block size="lg" onClick={goToQuestions}>Continue</Button>
          ) : (
            <React.Fragment>
              <Button block size="lg">Save My Free Seat</Button>
              <button type="button" className="fback" onClick={() => { setErr(''); setStep(1); }}>
                Back to your details
              </button>
            </React.Fragment>
          )}
          <p className="form-note">
            {step === 1
              ? 'Takes 30 seconds. 2 short steps, then you are in.'
              : 'Your joining link and 1 reminder. Nothing else, ever.'}
          </p>
        </div>
      </div>
    </form>
  );
}

function ThankYou() {
  return (
    <div className="ty">
      <div className="ty-card">
        <div className="stack-32">
          <div className="stack-16">
            <span className="eyebrow eyebrow-block" style={{ alignSelf: 'flex-start' }}>Registration confirmed</span>
            <h1 className="disp h1" style={{ fontSize: 'clamp(38px,4vw,56px)' }}>You’re registered.</h1>
            <p className="lede measure">CKP will send your joining link to your WhatsApp, and 1 reminder the day before. Nothing else.</p>
          </div>
          <div className="stack-24" style={{ borderTop: '3px solid var(--ink)', paddingTop: 32 }}>
            <p className="body strong-ink" style={{ margin: 0 }}>2 minutes now makes the hour worth far more to you:</p>
            <div className="ty-step">
              <b>01</b>
              <p className="body" style={{ margin: 0 }}>Reply to that WhatsApp with the one thing about your company you feel least certain about. 1 sentence is enough. Jeremy reads every reply before the webinar and builds the most common ones straight into the session, so you get your answer without having to ask in front of anyone.</p>
            </div>
            <div className="ty-step">
              <b>02</b>
              <p className="body" style={{ margin: 0 }}>If you would like the free 30-minute private review, say so in the same reply. 20 slots, first come.</p>
            </div>
          </div>
          <p className="disp h3" style={{ color: 'var(--ckp-crimson)' }}>See you on 8 September.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RegistrationForm, ThankYou });
