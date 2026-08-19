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

/* The field renders a +60 prefix, so people type "012-345 6789", "12 345 6789"
   and "+60 12 345 6789" interchangeably. All three have to land in the sheet as
   the same dialable number, because this is the only way CKP can reach anyone
   who registers. */
function normaliseMY(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('60')) digits = digits.slice(2);
  digits = digits.replace(/^0+/, '');
  return digits ? '+60' + digits : '';
}

/* Every Malaysian mobile is 01X-XXXXXXX, so after the country code and the
   leading zero it starts with 1 and runs 9-10 digits. Deliberately loose: a
   real number wrongly rejected costs a registration, a typo caught later costs
   a WhatsApp message. */
function validMY(raw) {
  return /^1\d{8,9}$/.test(normaliseMY(raw).slice(3));
}

/* Which ad produced this registration. Without it every lead in the sheet looks
   identical and there is no way to tell a cheap campaign from an expensive one. */
function adSource() {
  const p = new URLSearchParams(location.search);
  return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    .map((k) => (p.get(k) ? k + '=' + p.get(k) : ''))
    .filter(Boolean)
    .join(' | ');
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'r-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function RegistrationForm({ id, onDone }) {
  // Ten fields in one column reads as a wall and kills conversion, so the contact
  // details are asked first and the qualifying questions only after that commitment.
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState('');
  const [worry, setWorry] = React.useState('');
  const [areas, setAreas] = React.useState([]);
  const [err, setErr] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const formRef = React.useRef(null);
  /* Stable for the life of the form, so pressing the button again after a
     timeout retries the same registration instead of creating a second one.
     The Apps Script drops a repeat of an id it has already written. */
  const submissionId = React.useRef(newId());

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
    if (!val('email')) return setErr('Please add your email — your Zoom link is sent there.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) return setErr('That email does not look right — please check it, your Zoom link depends on it.');
    if (!val('whatsapp')) return setErr('Please add your WhatsApp number, for the day-before reminder.');
    if (!validMY(val('whatsapp'))) return setErr('That does not look like a Malaysian mobile number. It should start 01 and be the number that has WhatsApp on it.');
    if (!val('company')) return setErr('Please add your company name.');
    if (!role) return setErr('Please choose your role.');
    setErr('');
    /* Custom, not a standard event, so it never competes with
       CompleteRegistration for optimisation. It exists to answer one question:
       of the people who start the form, how many die on the second step. */
    if (window.fbq) fbq('trackCustom', 'RegistrationStep2');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!val('stage')) return setErr('Please choose the stage your business is at.');
    if (!worry) return setErr('Please choose your biggest compliance worry.');
    if (needsOther && !val('worryOther')) return setErr('Please tell us what the worry is.');
    if (!val('firm')) return setErr('Please tell us whether you work with a firm already.');
    if (!val('confidence')) return setErr('Please choose how confident you feel.');

    /* No endpoint means nothing can be saved. Show the failure rather than the
       thank-you screen: telling someone they have a seat when no record of them
       exists is the one outcome worse than asking them to try again. */
    if (!CFG.sheetEndpoint) {
      console.error('CFG.sheetEndpoint is empty — the registration was not saved. See apps-script/README.md.');
      return setErr('Registration is not connected yet. Please WhatsApp +603-9212 7856 or email enquiry@ckpartners.com.my and CKP will hold your seat.');
    }

    setErr('');
    setSending(true);

    const payload = {
      token: CFG.sheetToken,
      submissionId: submissionId.current,
      name: val('name'),
      company: val('company'),
      email: val('email').trim().toLowerCase(),
      whatsapp: normaliseMY(val('whatsapp')),
      role,
      stage: val('stage'),
      worry,
      worryOther: needsOther ? val('worryOther') : '',
      firm: val('firm'),
      confidence: val('confidence'),
      areas: areas.join(' | '),
      source: adSource(),
      referrer: document.referrer || '',
      website: val('website') // honeypot: always empty for a human
    };

    /* Apps Script Web Apps do not answer CORS preflight. Sending JSON under a
       text/plain content type keeps this a "simple" request so the browser never
       sends the OPTIONS, and the redirect Apps Script answers with carries the
       Access-Control-Allow-Origin the response needs. Switching this to
       application/json is the classic way to break it. */
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    try {
      const res = await fetch(CFG.sheetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: ctrl.signal
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'HTTP ' + res.status);

      /* Conversion fires here and nowhere else — after the row is confirmed
         written. Firing it on button click instead would report registrations
         Meta then optimises towards, while the sheet stays empty.
         No name or phone is sent: Meta gets the fact of a registration, not the
         person. eventID is the submission id, so if a Conversions API feed is
         added later the two sides deduplicate instead of double-counting. */
      if (window.fbq) {
        fbq('track', 'CompleteRegistration',
          { content_name: 'CKP webinar 8 Sep 2026', currency: 'MYR', value: 0 },
          { eventID: submissionId.current });
      }

      onDone && onDone(); // only now is the seat actually recorded
    } catch (err2) {
      console.error('Registration failed:', err2);
      setSending(false);
      setErr('That did not save — please check your connection and press the button again. If it keeps failing, WhatsApp +603-9212 7856 and CKP will hold your seat.');
    } finally {
      clearTimeout(timer);
    }
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
          <Input id={`${id}-email`} label="Email" name="email" type="email"
            hint="Your Zoom link and calendar invite are sent here." placeholder="you@company.com" />
          <Input id={`${id}-whatsapp`} label="WhatsApp number" name="whatsapp" prefix="+60"
            hint="For the reminder the day before." placeholder="12 345 6789" />
          <Select id={`${id}-role`} label="Your role" name="role" placeholder="Select one" value={role}
            onChange={(e) => { setRole(e.target.value); setErr(''); }}
            options={['Owner', 'Director', 'Manager', 'Staff']} />
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

          <fieldset className="chipset">
            <legend>Which area would you most like to understand better? <span>Pick any that apply</span></legend>
            <div className="chipwrap">
              {Q_AREAS.map((a) => (
                <button type="button" key={a} onClick={() => toggleArea(a)}
                  className={'chip' + (areas.includes(a) ? ' on' : '')} aria-pressed={areas.includes(a)}>
                  {a}
                </button>
              ))}
            </div>
            <input type="hidden" name="areas" value={areas.join(' | ')} />
          </fieldset>
        </div>

        {/* Honeypot. Positioned off-screen rather than display:none, which the
            better bots skip. No human sees or tabs into it, so anything that
            arrives with it filled is discarded server-side. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

        {err && <p className="form-err" role="alert">{err}</p>}

        <div className="form-foot">
          {step === 1 ? (
            <Button type="button" block size="lg" onClick={goToQuestions}>Continue</Button>
          ) : (
            <React.Fragment>
              <Button block size="lg" disabled={sending}>
                {sending ? 'Saving your seat…' : 'Save My Free Seat'}
              </Button>
              <button type="button" className="fback" disabled={sending}
                onClick={() => { setErr(''); setStep(1); }}>
                Back to your details
              </button>
            </React.Fragment>
          )}
          <p className="form-note">
            {step === 1
              ? 'Takes 30 seconds. 2 short steps, then you are in.'
              : 'Your Zoom link by email, 1 WhatsApp reminder. Nothing else, ever.'}
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
            <p className="lede measure">Your Zoom link and calendar invite are on their way to your email. Check spam if they hide. CKP will WhatsApp you 1 reminder the day before. Nothing else.</p>
          </div>
          <div className="stack-24" style={{ borderTop: '3px solid var(--ink)', paddingTop: 32 }}>
            <p className="body strong-ink" style={{ margin: 0 }}>2 minutes now makes the hour worth far more to you:</p>
            <div className="ty-step">
              <b>01</b>
              <p className="body" style={{ margin: 0 }}>Reply to your confirmation email with the one thing about your company you feel least certain about. 1 sentence is enough. Jeremy reads every reply before the webinar and builds the most common ones straight into the session, so you get your answer without having to ask in front of anyone.</p>
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
