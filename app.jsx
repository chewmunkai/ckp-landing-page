function StickyCTA() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const check = () => {
      const hero = document.querySelector('.hero');
      const past = hero ? hero.getBoundingClientRect().bottom < 80 : false;
      const forms = ['register', 'register-2'].map((id) => document.getElementById(id)).filter(Boolean);
      const formVisible = forms.some((f) => { const r = f.getBoundingClientRect(); return r.top < window.innerHeight - 40 && r.bottom > 60; });
      setShow(past && !formVisible);
    };
    check();
    const opts = { passive: true, capture: true };
    document.addEventListener('scroll', check, opts);
    window.addEventListener('resize', check);
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(check, { threshold: [0, .12, 1] });
      [document.querySelector('.hero'), document.getElementById('register'), document.getElementById('register-2')].filter(Boolean).forEach((el) => io.observe(el));
    }
    return () => { document.removeEventListener('scroll', check, opts); window.removeEventListener('resize', check); io && io.disconnect(); };
  }, []);
  const c = useCountdown(CFG.eventStart);
  const left = Math.max(0, CFG.seatsTotal - CFG.seatsTaken);
  const { Button } = window.CKPDesignSystem_23ab2d;
  return (
    <div className={'sticky' + (show ? ' show' : '')}>
      <div className="wrap sticky-in">
        <div>
          <div className="sticky-txt">{`Free webinar · 8 September 2026 · ${CFG.time}`}</div>
          {/* the inner spans drop away on a phone, leaving "27d 22h to go · 23 seats left" */}
          <div className="sticky-sub mono-fig">
            {c.d}d {String(c.h).padStart(2, '0')}h<span className="s-min"> {String(c.m).padStart(2, '0')}m</span> to go · {left}<span className="s-of"> of {CFG.seatsTotal}</span> seats left
          </div>
        </div>
        <Button as="a" href="#register" size="md">Save My Free Seat</Button>
      </div>
    </div>
  );
}

function App() {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { if (done) window.scrollTo({ top: 0 }); }, [done]);
  if (done) return <ThankYou />;
  const finish = () => setDone(true);
  return (
    <React.Fragment>
      <Header />
      <main>
        <Hero onDone={finish} />
        <TrustStrip />
        <SectionOne />
        <SectionTwo />
        <SectionThree />
        <SectionFour />
        <SectionFive />
        <FinalCTA onDone={finish} />
      </main>
      <Footer />
      <StickyCTA />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
