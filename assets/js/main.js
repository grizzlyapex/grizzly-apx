// header scroll state
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:.18});
  revealEls.forEach(el=>io.observe(el));

  // language switch — EN / FR / AR
  const i18nEls = document.querySelectorAll('[data-ar][data-en]');
  const langSwitch = document.getElementById('langSwitch');
  const langButtons = langSwitch.querySelectorAll('button[data-lang]');
  function setLang(lang){
    const html = document.documentElement;
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
    langButtons.forEach(b=> b.classList.toggle('active', b.dataset.lang === lang));
    i18nEls.forEach(el=>{ el.textContent = el.dataset[lang] || el.dataset.en; });
  }
  langButtons.forEach(btn=>{
    btn.addEventListener('click', ()=> setLang(btn.dataset.lang));
  });

  // mobile burger -> simple toggle of nav links as a stacked panel
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.querySelector('nav.links');
  burger.addEventListener('click', ()=>{
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? 'none' : 'flex';
    navLinks.style.position = 'fixed';
    navLinks.style.top = '68px';
    navLinks.style.insetInlineEnd = '24px';
    navLinks.style.insetInlineStart = '24px';
    navLinks.style.flexDirection = 'column';
    navLinks.style.background = '#fff';
    navLinks.style.padding = '20px 24px';
    navLinks.style.borderRadius = '14px';
    navLinks.style.boxShadow = '0 10px 40px rgba(0,0,0,.12)';
    navLinks.style.gap = '18px';
  });
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    if(window.innerWidth<=860) navLinks.style.display='none';
  }));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progressBar.style.transform = `scaleX(${Math.min(Math.max(scrolled,0),1)})`;
  }, {passive:true});

  // ===== CUSTOM CURSOR =====
  if (isFinePointer && !prefersReduced) {
    document.body.classList.add('has-cursor');
    const dot = document.createElement('div'); dot.className='cursor-dot';
    const ring = document.createElement('div'); ring.className='cursor-ring';
    const claw = document.createElement('div'); claw.className='cursor-claw';
    claw.innerHTML = `<svg viewBox="0 0 100 100"><path d="M10 90 C30 65 38 40 30 10"/><path d="M35 92 C58 66 66 38 55 5"/><path d="M60 92 C82 68 88 42 78 12"/></svg>`;
    document.body.append(dot, ring, claw);

    let mx=0,my=0, rx=0,ry=0;
    window.addEventListener('mousemove', e=>{
      mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px';
      claw.style.left=mx+'px'; claw.style.top=my+'px';
    });
    function ringLoop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    const hoverTargets = 'a, button, .btn, .service-card, .faq-q';
    document.addEventListener('mouseover', e=>{
      if(e.target.closest(hoverTargets)){ ring.classList.add('hover'); claw.classList.add('hover'); }
    });
    document.addEventListener('mouseout', e=>{
      if(e.target.closest(hoverTargets)){ ring.classList.remove('hover'); claw.classList.remove('hover'); }
    });
  }

  // ===== MAGNETIC BUTTONS =====
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.btn').forEach(btn=>{
      btn.style.willChange = 'transform';
      btn.addEventListener('mousemove', e=>{
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width/2;
        const relY = e.clientY - r.top - r.height/2;
        const strength = 0.35;
        btn.style.transform = `translate(${relX*strength}px, ${relY*strength}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
    });
  }

  // ===== ANIMATED NUMBER COUNTERS =====
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const io3 = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          io3.unobserve(en.target);
          const dur = prefersReduced ? 0 : 1200;
          const start = performance.now();
          function tick(now){
            const p = dur === 0 ? 1 : Math.min((now-start)/dur, 1);
            const eased = 1 - Math.pow(1-p, 3);
            const val = Math.round(target*eased);
            el.textContent = (target % 1 !== 0 ? (target*eased).toFixed(1) : val) + suffix;
            if(p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
          }
          requestAnimationFrame(tick);
        }
      });
    }, {threshold:.5});
    io3.observe(el);
  });

  // ===== HERO PARALLAX =====
  const hero = document.querySelector('.hero');
  if (hero && isFinePointer && !prefersReduced) {
    const clawHero = hero.querySelector('.claw-hero');
    const heroText = hero.querySelector('.wrap');
    hero.addEventListener('mousemove', e=>{
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5;
      const py = (e.clientY - r.top)/r.height - 0.5;
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      const flip = isRtl ? ' scaleX(-1)' : '';
      if(clawHero) clawHero.style.transform = `translateY(calc(-50% + ${py*-18}px)) translateX(${px*-14}px)${flip}`;
      if(heroText) heroText.style.transform = `translate(${px*-8}px, ${py*-6}px)`;
    });
    hero.addEventListener('mouseleave', ()=>{
      if(clawHero) clawHero.style.transform = '';
      if(heroText) heroText.style.transform = '';
    });
  }

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-q').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(o=>{
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!wasOpen){
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
