const { Input, Select, Button } = window.CKPDesignSystem_23ab2d;

function RegistrationForm({ id, onDone, tone = 'light' }) {
  const [role, setRole] = React.useState('');
  const [err, setErr] = React.useState('');
  const needsDirector = role === 'Manager' || role === 'Staff';

  if (CFG.formEmbedUrl) {
    return (
      <div id={id} className="formcard" style={{ padding: 0 }}>
        <iframe src={CFG.formEmbedUrl} title="Webinar registration" style={{ width: '100%', height: 720, border: 0, display: 'block' }}></iframe>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (needsDirector && !String(f.get('director') || '').trim()) { setErr('Please add the name.'); return; }
    setErr('');
    onDone && onDone();
  };

  return (
    <form id={id} className="formcard" onSubmit={submit} noValidate>
      <div className="form-head">
        <p className="form-title">Your free seat</p>
        <p className="form-when">{`8 Sep 2026 · ${CFG.time} · Online`}</p>
      </div>
      <div className="form-body">
        <div className="stack-16">
          {/* ids are namespaced per form — this renders twice, and without a prefix
              every <label for> in the second copy points at the first copy's field */}
          <Input id={`${id}-name`} label="Name" name="name" placeholder="Your full name" />
          <Input id={`${id}-email`} label="Business email" name="email" type="email" placeholder="you@company.com.my" />
          <Input id={`${id}-whatsapp`} label="WhatsApp number" name="whatsapp" prefix="+60" placeholder="12 345 6789" />
          <Input id={`${id}-company`} label="Company name" name="company" placeholder="Company Sdn Bhd" />
          <Select id={`${id}-role`} label="Your role" name="role" placeholder="Select one" value={role}
            onChange={(e) => setRole(e.target.value)}
            options={['Owner', 'Director', 'Manager', 'Staff']} />
          {needsDirector && (
            <Input id={`${id}-director`} label="Who are you registering on behalf of?" name="director"
              hint="So we can address the session to the right person."
              error={err || undefined}
              placeholder="Director's name" />
          )}
          <Select id={`${id}-clarity`} label="What would you most like clarity on?" name="clarity" placeholder="Select one"
            options={['Choosing or converting to Sdn Bhd', 'Getting my books properly organised', 'Payroll, EPF and hiring', 'Checking whether anything has been missed', 'Something else']} />
        </div>
        <div className="form-foot">
          <Button block size="lg">Save My Free Seat</Button>
          <p className="form-note">Your joining link and one reminder. Nothing else, ever.</p>
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
            <p className="lede measure">CKP will email your joining link and one reminder the day before. Check your junk folder if you do not see it in your inbox.</p>
          </div>
          <div className="stack-24" style={{ borderTop: '3px solid var(--ink)', paddingTop: 32 }}>
            <p className="body strong-ink" style={{ margin: 0 }}>Two minutes now makes the hour worth far more to you:</p>
            <div className="ty-step">
              <b>01</b>
              <p className="body" style={{ margin: 0 }}>Reply to the email with the one thing about your company you feel least certain about. One sentence is enough. Jeremy reads every reply before the webinar and builds the most common ones straight into the session, so you get your answer without having to ask in front of anyone.</p>
            </div>
            <div className="ty-step">
              <b>02</b>
              <p className="body" style={{ margin: 0 }}>If you would like the free 30-minute private review, mention it in the same reply. Twenty slots are available on a first-come basis.</p>
            </div>
          </div>
          <p className="disp h3" style={{ color: 'var(--ckp-crimson)' }}>See you on 8 September.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RegistrationForm, ThankYou });
