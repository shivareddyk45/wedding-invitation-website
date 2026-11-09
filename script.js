/**
 * Kalyana Mandapam - High-Fidelity Wedding Invitation Script
 * Driven exclusively by window.WEDDING_DATA (src/data/wedding.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.WEDDING_DATA || window.WEDDING_CONFIG || {};

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Active language state ('en' or 'te')
  let currentLang = localStorage.getItem('wedding_lang') || 'en';
  if (currentLang !== 'en' && currentLang !== 'te') currentLang = 'en';

  // =========================================================================
  // 1. BACKGROUND AUDIO & SOUNDTRACK CONTROLLER
  // =========================================================================
  const audio = document.getElementById('wedding-audio');
  const musicToggleBtn = document.getElementById('music-toggle');
  const musicIconImg = document.getElementById('music-icon-img');
  const persistentBar = document.getElementById('km-persistent-bar');

  let audioFadeInterval = null;
  let wasPlayingBeforeHidden = false;

  function getStoredAudioPref() {
    return localStorage.getItem('wedding_audio_enabled');
  }

  function setStoredAudioPref(enabled) {
    localStorage.setItem('wedding_audio_enabled', enabled ? 'true' : 'false');
  }

  function updateMusicUI(playing) {
    if (musicToggleBtn) {
      const strings = data.i18n?.[currentLang] || {};
      if (playing) {
        musicToggleBtn.classList.add('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', strings.muteSoundtrack || 'Mute Soundtrack');
      } else {
        musicToggleBtn.classList.remove('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', strings.playSoundtrack || 'Play Soundtrack');
      }
    }
    if (musicIconImg) {
      musicIconImg.src = 'assets/images/dholak_icon.svg';
    }
  }

  function fadeInAudio(durationMs = 1500) {
    if (!audio) return;
    clearInterval(audioFadeInterval);
    audio.volume = 0;
    audio.play().then(() => {
      updateMusicUI(true);
      setStoredAudioPref(true);
      const stepTime = 50;
      const stepVol = 1 / (durationMs / stepTime);
      audioFadeInterval = setInterval(() => {
        if (audio.volume + stepVol >= 1) {
          audio.volume = 1;
          clearInterval(audioFadeInterval);
        } else {
          audio.volume += stepVol;
        }
      }, stepTime);
    }).catch(err => {
      console.warn('Audio playback postponed until user gesture:', err);
      updateMusicUI(false);
    });
  }

  function pauseAudio() {
    if (!audio) return;
    clearInterval(audioFadeInterval);
    audio.pause();
    updateMusicUI(false);
    setStoredAudioPref(false);
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      fadeInAudio(1000);
    } else {
      pauseAudio();
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  // Pause audio when browser tab is hidden, resume if it was active
  document.addEventListener('visibilitychange', () => {
    if (!audio) return;
    if (document.visibilityState === 'hidden') {
      if (!audio.paused) {
        wasPlayingBeforeHidden = true;
        audio.pause();
        updateMusicUI(false);
      } else {
        wasPlayingBeforeHidden = false;
      }
    } else if (document.visibilityState === 'visible' && wasPlayingBeforeHidden) {
      audio.play().then(() => updateMusicUI(true)).catch(() => {});
    }
  });


  // =========================================================================
  // 2. PERSONALIZED GUEST GREETING (?to=Name)
  // =========================================================================
  function initPersonalizedGreeting() {
    const greetingEl = document.getElementById('entry-guest-greeting');
    if (!greetingEl) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rawTo = urlParams.get('to');
      if (!rawTo) return;

      const trimmed = decodeURIComponent(rawTo).trim();
      // Ignore empty or "Guest" / "guest"
      if (!trimmed || trimmed.toLowerCase() === 'guest') return;

      // Sanitise: max 40 characters, pure textContent only
      const safeName = trimmed.slice(0, 40);
      const prefix = currentLang === 'te' ? 'ప్రియమైన' : 'Dear';
      greetingEl.textContent = `${prefix} ${safeName},`;
      greetingEl.style.display = 'block';
    } catch (err) {
      console.warn('Could not parse guest greeting:', err);
    }
  }

  initPersonalizedGreeting();


  // =========================================================================
  // 3. ENTRY CARD & SCROLL UNLOCK
  // =========================================================================
  const entryScreen = document.getElementById('km-entry-screen');
  const openBtn = document.getElementById('km-open-btn');
  const ceremonialHero = document.getElementById('ceremonial-hero');
  const heroVideo = document.getElementById('hero-procession-video');

  function ensureHeroVideoPlays() {
    if (!heroVideo) return;
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  ensureHeroVideoPlays();
  document.addEventListener('touchstart', ensureHeroVideoPlays, { once: true, passive: true });
  document.addEventListener('click', ensureHeroVideoPlays, { once: true, passive: true });

  function openInvitation() {
    if (!entryScreen || entryScreen.classList.contains('km-entry--closing')) return;

    // Start lyrical soundtrack on user gesture with fade-in
    fadeInAudio(data.audio?.fadeInDurationMs || 1500);

    // Play hero background video on user interaction
    ensureHeroVideoPlays();

    // Button tactile feedback
    if (openBtn) {
      openBtn.classList.add('km-entry__cta--pressed');
    }

    setTimeout(() => {
      // Crossfade out over ~850ms with subtle scale
      entryScreen.classList.add('km-entry--closing');

      // Trigger hero content entrance simultaneously
      if (ceremonialHero) {
        ceremonialHero.classList.add('km-hero--active');
      }

      // Unlock scrolling
      document.body.classList.remove('km-no-scroll');

      // Reveal floating audio controller
      if (persistentBar) {
        persistentBar.classList.add('km-persistent-bar--visible');
      }

      setTimeout(() => {
        entryScreen.style.display = 'none';
      }, 850);

      // Smooth scroll to ceremonial hero
      if (ceremonialHero) {
        ceremonialHero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, prefersReducedMotion ? 0 : 120);
  }

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  if (entryScreen) {
    entryScreen.addEventListener('click', (e) => {
      // Don't trigger if clicked on an anchor or interactive child
      if (e.target.closest('a, button')) return;
      openInvitation();
    });
  }


  // =========================================================================
  // 4. PARALLAX CONTROLLER
  // =========================================================================
  if (!prefersReducedMotion) {
    const heroDurbar = document.querySelector('.km-hero__durbar-wrap');
    const countdownPanel = document.querySelector('.km-countdown__panel');
    const galleryParasol = document.querySelector('.km-gallery__parasol');
    const footerArt = document.querySelector('.km-footer__art');

    let ticking = false;

    function getScrollTop() {
      const frame = document.querySelector('.site-outer-frame');
      if (frame && frame.scrollTop > 0) return frame.scrollTop;
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    function updateParallax() {
      const scrollY = getScrollTop();
      const winH = window.innerHeight;

      if (heroDurbar && scrollY < 900) {
        heroDurbar.style.transform = `translateY(${scrollY * 0.08}px)`;
      }

      if (countdownPanel) {
        const rect = countdownPanel.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const offset = (rect.top - winH * 0.5) * 0.05;
          countdownPanel.style.transform = `translateY(${offset}px)`;
        }
      }

      if (galleryParasol) {
        const rect = galleryParasol.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const offset = (rect.top - winH * 0.5) * -0.06;
          galleryParasol.style.transform = `translateY(${offset}px)`;
        }
      }

      if (footerArt) {
        const rect = footerArt.getBoundingClientRect();
        if (rect.top < winH) {
          const offset = (rect.top - winH * 0.5) * 0.04;
          footerArt.style.transform = `translateY(${offset}px)`;
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }

    const outerFrame = document.querySelector('.site-outer-frame');
    if (outerFrame) outerFrame.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  // =========================================================================
  // 5. UNIFIED SCROLL REVEALS
  // =========================================================================
  const revealSelectors = [
    '.km-section-head',
    '.km-couple__unit',
    '.km-couple__divider',
    '.km-countdown__stage',
    '.km-toranam-wrap',
    '.km-gallery__parasol',
    '.km-gallery__cell',
    '.km-footer'
  ];

  const revealElements = document.querySelectorAll(revealSelectors.join(', '));
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  // =========================================================================
  // 6. LIVE MUHURTHAM COUNTDOWN (TABULAR NUMERALS & MULTI-STATE)
  // =========================================================================
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  const countdownGrid = document.getElementById('countdown-grid');
  const countdownCompleteMsg = document.getElementById('countdown-complete-msg');
  const countdownSacredText = document.getElementById('countdown-sacred-text');

  const muhurthamTimestamp = data.getConfirmedCountdownTarget
    ? data.getConfirmedCountdownTarget()
    : new Date('2026-12-03T00:00:00+05:30').getTime();

  // One day in milliseconds for day-of window
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let prevValues = { days: '', hours: '', minutes: '', seconds: '' };

  function animateDigitChange(element, newVal, key) {
    if (!element) return;
    if (prevValues[key] !== newVal) {
      element.classList.add('digit-flip');
      setTimeout(() => {
        element.textContent = newVal;
        element.classList.remove('digit-flip');
      }, 140);
      prevValues[key] = newVal;
    }
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = muhurthamTimestamp - now;
    const strings = data.i18n?.[currentLang] || {};

    // State 1: Day of the wedding (within the 24 hours of wedding day)
    if (distance <= 0 && Math.abs(distance) < ONE_DAY_MS) {
      if (countdownGrid) countdownGrid.style.display = 'none';
      if (countdownCompleteMsg) {
        countdownCompleteMsg.style.display = 'block';
        if (countdownSacredText) {
          countdownSacredText.textContent = strings.countdownToday || 'Today is the day! We celebrate with love and gratitude.';
        }
      }
      return;
    }

    // State 2: Past the wedding
    if (distance <= -ONE_DAY_MS) {
      if (countdownGrid) countdownGrid.style.display = 'none';
      if (countdownCompleteMsg) {
        countdownCompleteMsg.style.display = 'block';
        if (countdownSacredText) {
          countdownSacredText.textContent = strings.countdownPast || 'Thank you for celebrating with us and sharing your blessings.';
        }
      }
      return;
    }

    // State 3: Upcoming live countdown
    if (countdownGrid) countdownGrid.style.display = 'block';
    if (countdownCompleteMsg) countdownCompleteMsg.style.display = 'none';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    animateDigitChange(daysEl, String(days).padStart(2, '0'), 'days');
    animateDigitChange(hoursEl, String(hours).padStart(2, '0'), 'hours');
    animateDigitChange(minutesEl, String(minutes).padStart(2, '0'), 'minutes');
    animateDigitChange(secondsEl, String(seconds).padStart(2, '0'), 'seconds');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // =========================================================================
  // 7. THE WEDDING JOURNEY (SCROLL-DRIVEN WALKING TRANSITION)
  // =========================================================================
  function initWeddingJourneyWalk() {
    const section = document.getElementById('wedding-journey');
    if (!section) return;

    const stage = section.querySelector('.km-events__stage');
    const path = section.querySelector('.km-events__path');
    const feetLayer = section.querySelector('.km-events__feet-layer');
    const rows = Array.from(section.querySelectorAll('.km-events__row'));
    const head = section.querySelector('.km-events__head');
    const outerFrame = document.querySelector('.site-outer-frame');

    if (!stage || !path || !feetLayer || rows.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Path geometry setup
    const anchors = [
      { id: 0, x: 116, y: 200, side: 'left' },
      { id: 1, x: 284, y: 500, side: 'right' },
      { id: 2, x: 116, y: 800, side: 'left' },
      { id: 3, x: 284, y: 1100, side: 'right' }
    ];

    const startPt = { x: 200, y: 30 };
    const curvePoints = [startPt, ...anchors];

    let d = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
    for (let i = 1; i < curvePoints.length; i++) {
      const p0 = curvePoints[i - 1];
      const p1 = curvePoints[i];
      const midY = (p0.y + p1.y) / 2;
      d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }
    path.setAttribute('d', d);

    // 2. Programmatic step generation along path
    const totalLen = path.getTotalLength();
    const stepSpacing = 36;
    const stepsData = [];
    const anchorStepIndices = [5, 13, 20, 27]; // fallback defaults
    const closestDistances = [Infinity, Infinity, Infinity, Infinity];

    let footCounter = 0;
    for (let s = 10; s <= totalLen - 10; s += stepSpacing) {
      const pt = path.getPointAtLength(s);

      // Check distance to each event anchor
      let nearIcon = false;
      anchors.forEach(a => {
        const dist = Math.hypot(pt.x - a.x, pt.y - a.y);
        if (dist < 38) nearIcon = true; // stops ~10px short of 56px icon
        if (dist < closestDistances[a.id]) {
          closestDistances[a.id] = dist;
          anchorStepIndices[a.id] = footCounter;
        }
      });

      if (!nearIcon) {
        const nextPt = path.getPointAtLength(Math.min(s + 1, totalLen));
        let dx = nextPt.x - pt.x;
        let dy = nextPt.y - pt.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        const side = (footCounter % 2 === 0) ? 'left' : 'right';
        const offset = 8 * (side === 'left' ? -1 : 1);
        const footX = pt.x + dy * offset;
        const footY = pt.y - dx * offset;

        stepsData.push({
          index: footCounter,
          side,
          xPct: (footX / 400) * 100,
          yPct: (footY / 1200) * 100,
          angle: angle
        });
        footCounter++;
      }
    }

    // Populate DOM footsteps
    feetLayer.innerHTML = '';
    const footElements = stepsData.map(st => {
      const img = document.createElement('img');
      img.src = st.side === 'left' ? 'assets/images/yatra-foot-left.png' : 'assets/images/yatra-foot-right.png';
      img.alt = '';
      img.className = `km-events__foot km-events__foot--${st.side}`;
      img.style.left = `${st.xPct.toFixed(2)}%`;
      img.style.top = `${st.yPct.toFixed(2)}%`;
      img.style.setProperty('--target-rot', `${st.angle.toFixed(1)}deg`);
      feetLayer.appendChild(img);
      return img;
    });

    // Event rows metadata
    const eventRowsData = rows.map((row, i) => {
      const anchorIdx = anchorStepIndices[i] !== undefined ? anchorStepIndices[i] : (i + 1) * 7;
      const triggerStep = Math.max(0, anchorIdx - 3);
      const medallion = row.querySelector('.km-events__medallion');
      const title = row.querySelector('.km-events__name');
      const when = row.querySelector('.km-events__when');
      const venue = row.querySelector('.km-events__venue');
      const mapBtn = row.querySelector('.km-events__map');
      const isOdd = row.classList.contains('km-events__row--odd');
      const side = isOdd ? 'left' : 'right';
      return { row, triggerStep, medallion, title, when, venue, mapBtn, side };
    });

    // Reduced motion shortcut
    if (prefersReducedMotion) {
      if (head) head.classList.add('km-in-view');
      footElements.forEach(f => {
        f.style.setProperty('--step-opacity', '0.85');
        f.style.setProperty('--step-scale', '1');
      });
      eventRowsData.forEach(ev => {
        if (ev.medallion) {
          ev.medallion.style.setProperty('--medallion-opacity', '1');
          ev.medallion.style.setProperty('--medallion-scale', '1');
        }
        ['title', 'when', 'venue', 'mapBtn'].forEach(k => {
          if (ev[k]) {
            ev[k].style.setProperty(`--${k}-opacity`, '1');
            ev[k].style.setProperty(`--${k}-tx`, '0px');
          }
        });
      });
      return;
    }

    // 3. Render state function (pure function of walkProgress 0..1)
    const totalSteps = stepsData.length;

    function renderWalk(walkProgress) {
      const currentStepFloat = walkProgress * (totalSteps + 1.2) - 0.4;

      // Update footsteps
      for (let k = 0; k < totalSteps; k++) {
        const diff = currentStepFloat - k;
        const el = footElements[k];
        if (diff < 0) {
          el.style.setProperty('--step-opacity', '0');
          el.style.setProperty('--step-scale', '0.6');
          el.style.setProperty('--step-glow', 'none');
        } else if (diff <= 1.5) {
          const t = diff / 1.5;
          const overshoot = Math.sin(t * Math.PI) * 0.08;
          const scale = 0.6 + 0.4 * t + overshoot;
          const opacity = Math.min(0.95, t * 1.2);
          const glow = Math.max(0, 1 - t) * 0.8;
          el.style.setProperty('--step-opacity', opacity.toFixed(2));
          el.style.setProperty('--step-scale', scale.toFixed(3));
          el.style.setProperty('--step-glow', glow > 0.05 ? `drop-shadow(0 0 6px rgba(201, 147, 47, ${glow.toFixed(2)}))` : 'none');
        } else {
          const isLatest = diff <= 2.6;
          el.style.setProperty('--step-opacity', isLatest ? '0.95' : '0.82');
          el.style.setProperty('--step-scale', '1');
          el.style.setProperty('--step-glow', 'none');
        }
      }

      // Update event rows
      for (let i = 0; i < eventRowsData.length; i++) {
        const ev = eventRowsData[i];
        const eventDiff = currentStepFloat - ev.triggerStep;

        if (eventDiff < 0) {
          if (ev.medallion) {
            ev.medallion.style.setProperty('--medallion-opacity', '0');
            ev.medallion.style.setProperty('--medallion-scale', '0.7');
          }
          const initTx = ev.side === 'left' ? '-20px' : '20px';
          if (ev.title) { ev.title.style.setProperty('--title-opacity', '0'); ev.title.style.setProperty('--title-tx', initTx); }
          if (ev.when) { ev.when.style.setProperty('--when-opacity', '0'); ev.when.style.setProperty('--when-tx', initTx); }
          if (ev.venue) { ev.venue.style.setProperty('--venue-opacity', '0'); ev.venue.style.setProperty('--venue-tx', initTx); }
          if (ev.mapBtn) { ev.mapBtn.style.setProperty('--map-opacity', '0'); ev.mapBtn.style.setProperty('--map-tx', initTx); }
        } else {
          // Icon pops in with slight spring
          const p = Math.min(1, eventDiff / 1.6);
          const spring = p < 1 ? Math.sin(p * Math.PI) * 0.08 : 0;
          const medScale = Math.min(1.08, 0.7 + 0.3 * p + spring);
          if (ev.medallion) {
            ev.medallion.style.setProperty('--medallion-opacity', Math.min(1, p * 1.5).toFixed(2));
            ev.medallion.style.setProperty('--medallion-scale', medScale.toFixed(3));
          }

          // Staggered text (title, date, venue, map button)
          const items = [
            { el: ev.title, key: 'title', delay: 0.12 },
            { el: ev.when, key: 'when', delay: 0.24 },
            { el: ev.venue, key: 'venue', delay: 0.36 },
            { el: ev.mapBtn, key: 'map', delay: 0.48 }
          ];

          items.forEach(it => {
            if (it.el) {
              const itemP = Math.min(1, Math.max(0, (eventDiff - it.delay) / 0.9));
              const eased = 1 - Math.pow(1 - itemP, 3);
              const tx = (1 - eased) * (ev.side === 'left' ? -20 : 20);
              it.el.style.setProperty(`--${it.key}-opacity`, itemP.toFixed(2));
              it.el.style.setProperty(`--${it.key}-tx`, `${tx.toFixed(1)}px`);
            }
          });
        }
      }
    }

    // 4. Scroll tracking with damped scrub
    let currentProgress = 0;
    let targetProgress = 0;
    let isTicking = false;

    function onScrollCheck() {
      const scroller = (outerFrame && outerFrame.scrollHeight > outerFrame.clientHeight) ? outerFrame : window;
      const vh = scroller === window ? window.innerHeight : scroller.clientHeight;

      const rect = stage.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      // Heading reveal
      if (sectionRect.top < vh * 0.85 && head) {
        head.classList.add('km-in-view');
      }

      // Map scroll to walk progress
      const walkStart = vh * 0.68;
      const walkDist = 1200; // stage height
      const raw = (walkStart - rect.top) / walkDist;
      targetProgress = Math.min(1, Math.max(0, raw));

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(scrubTick);
      }
    }

    function scrubTick() {
      const delta = targetProgress - currentProgress;
      if (Math.abs(delta) > 0.0006) {
        currentProgress += delta * 0.15;
        renderWalk(currentProgress);
        requestAnimationFrame(scrubTick);
      } else {
        currentProgress = targetProgress;
        renderWalk(currentProgress);
        isTicking = false;
      }
    }

    // Attach listeners
    if (outerFrame) outerFrame.addEventListener('scroll', onScrollCheck, { passive: true });
    window.addEventListener('scroll', onScrollCheck, { passive: true });
    window.addEventListener('resize', onScrollCheck, { passive: true });

    // Enable interactive styling and run initial check
    section.classList.add('km-events--interactive');
    renderWalk(0);
    onScrollCheck();
  }

  initWeddingJourneyWalk();

  // Attach map buttons in Journey
  const mapButtons = document.querySelectorAll('.km-events__map');
  mapButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventName = btn.getAttribute('data-event') || 'Ceremony';
      const location = btn.getAttribute('data-location') || 'DJ USTHAV MAHAL, BHAVANIPURAM, VIJAYAWADA';
      openMapModal(eventName, location);
    });
  });


  // =========================================================================
  // 8. VENUE MAP MODAL CONTROLLER
  // =========================================================================
  const mapModal = document.getElementById('map-modal');
  const mapModalClose = document.getElementById('map-modal-close');
  const mapEventTitle = document.getElementById('map-event-title');
  const mapEventLoc = document.getElementById('map-event-loc');
  const mapModalIframe = document.getElementById('map-modal-iframe');
  const externalMapsBtn = document.getElementById('external-maps-btn');
  const directionsMapsBtn = document.getElementById('directions-maps-btn');

  function openMapModal(eventName, location) {
    const venueData = data.venue || {};
    const titleText = eventName ? `${eventName} Venue` : (data.i18n?.[currentLang]?.ceremonyVenue || 'Ceremony Venue');
    const locText = location || venueData.fullTextUppercase;

    if (mapEventTitle) mapEventTitle.textContent = titleText;
    if (mapEventLoc) mapEventLoc.textContent = locText;

    const encodedLoc = encodeURIComponent(locText);
    if (mapModalIframe) {
      mapModalIframe.src = `https://maps.google.com/maps?q=${encodedLoc}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    if (externalMapsBtn) {
      externalMapsBtn.href = `https://maps.google.com/?q=${encodedLoc}`;
    }
    if (directionsMapsBtn) {
      directionsMapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodedLoc}`;
    }

    if (mapModal) {
      mapModal.classList.add('active');
      mapModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMapModal() {
    if (mapModal) {
      mapModal.classList.remove('active');
      mapModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (mapModalClose) mapModalClose.addEventListener('click', closeMapModal);
  if (mapModal) {
    const backdrop = mapModal.querySelector('.km-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeMapModal);
  }


  // =========================================================================
  // 9. PHOTO GALLERY LIGHTBOX (SWIPE & KEYBOARD)
  // =========================================================================
  const galleryCells = document.querySelectorAll('.km-gallery__cell');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxTouchArea = document.getElementById('lightbox-touch-area');

  const galleryItems = (data.gallery?.photos && data.gallery.photos.length > 0)
    ? data.gallery.photos
    : Array.from(galleryCells).map(cell => {
      const img = cell.querySelector('.km-gallery__img');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : 'Wedding Photograph',
        captionEn: img ? img.getAttribute('alt') : '',
        captionTe: img ? img.getAttribute('alt') : ''
      };
    });

  let currentPhotoIdx = 0;
  let isSwitchingPhoto = false;

  function showPhoto(idx, direction = 0) {
    if (galleryItems.length === 0) return;
    if (idx < 0) idx = galleryItems.length - 1;
    if (idx >= galleryItems.length) idx = 0;
    currentPhotoIdx = idx;

    const current = galleryItems[idx];
    const captionText = currentLang === 'te' ? (current.captionTe || current.alt) : (current.captionEn || current.alt);

    if (!lightboxImg) return;

    if (!lightbox || !lightbox.classList.contains('active')) {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt || 'Wedding Photograph';
      if (lightboxCaption) {
        lightboxCaption.textContent = `${captionText} (${idx + 1} of ${galleryItems.length})`;
      }
      return;
    }

    if (isSwitchingPhoto) return;
    isSwitchingPhoto = true;

    if (prefersReducedMotion || direction === 0) {
      lightboxImg.style.transition = 'opacity 0.16s ease';
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = current.src;
        lightboxImg.alt = current.alt || 'Wedding Photograph';
        if (lightboxCaption) {
          lightboxCaption.textContent = `${captionText} (${idx + 1} of ${galleryItems.length})`;
        }
        lightboxImg.style.opacity = '1';
        setTimeout(() => {
          isSwitchingPhoto = false;
          lightboxImg.style.transition = '';
        }, 160);
      }, 140);
      return;
    }

    const outX = direction > 0 ? -24 : 24;
    const inX = -outX;

    lightboxImg.style.transition = 'opacity 0.18s var(--km-ease-reveal), transform 0.18s var(--km-ease-reveal)';
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = `translateX(${outX}px) scale(0.97)`;

    setTimeout(() => {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt || 'Wedding Photograph';
      if (lightboxCaption) {
        lightboxCaption.textContent = `${captionText} (${idx + 1} of ${galleryItems.length})`;
      }
      lightboxImg.style.transition = 'none';
      lightboxImg.style.transform = `translateX(${inX}px) scale(0.97)`;

      void lightboxImg.offsetWidth;

      lightboxImg.style.transition = 'opacity 0.22s var(--km-ease-reveal), transform 0.22s var(--km-ease-reveal)';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'translateX(0) scale(1)';

      setTimeout(() => {
        isSwitchingPhoto = false;
        lightboxImg.style.transition = '';
        lightboxImg.style.transform = '';
      }, 230);
    }, 170);
  }

  function openLightbox(idx) {
    showPhoto(idx, 0);
    if (lightbox) {
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  galleryCells.forEach((cell, idx) => {
    cell.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showPhoto(currentPhotoIdx - 1, -1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showPhoto(currentPhotoIdx + 1, 1));

  if (lightbox) {
    const backdrop = lightbox.querySelector('.km-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
  }

  // Mobile Swipe Gestures
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightboxTouchArea) {
    lightboxTouchArea.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxTouchArea.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          showPhoto(currentPhotoIdx - 1, -1);
        } else {
          showPhoto(currentPhotoIdx + 1, 1);
        }
      }
    }, { passive: true });
  }


  // =========================================================================
  // 10. ADD TO CALENDAR (.ICS & GOOGLE CALENDAR)
  // =========================================================================
  function downloadIcsFile() {
    // 3 December 2026: 09:00 AM IST to 01:00 PM IST (03:30 to 07:30 UTC)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kalyana Mandapam//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:wedding-nageshwar-neeraja-20261203@wedding-invitation',
      'DTSTAMP:20261109T000000Z',
      'DTSTART:20261203T033000Z',
      'DTEND:20261203T183000Z',
      'SUMMARY:Wedding of Nageshwar Reddy & Neeraja',
      'DESCRIPTION:We joyfully invite you to celebrate the sacred wedding of Nageshwar Reddy and Neeraja at DJ Usthav Mahal, Bhavanipuram, Vijayawada. Your presence and blessings mean the world to us.',
      'LOCATION:DJ Usthav Mahal, Bhavanipuram, Vijayawada, Andhra Pradesh, India',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding-nageshwar-neeraja.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(currentLang === 'te' ? 'క్యాలెండర్ ఈవెంట్ డౌన్‌లోడ్ చేయబడింది!' : 'Calendar invite downloaded!');
  }

  const footerCalBtn = document.getElementById('footer-cal-btn');
  if (footerCalBtn) {
    footerCalBtn.addEventListener('click', downloadIcsFile);
  }


  // =========================================================================
  // 11. SHARE INVITATION (WEB SHARE API WITH WHATSAPP/COPY FALLBACK)
  // =========================================================================
  const footerShareBtn = document.getElementById('footer-share-btn');
  const toastEl = document.getElementById('km-toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('km-toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('km-toast--visible');
    }, 3200);
  }

  function shareInvitation() {
    const shareData = {
      title: data.share?.title || 'Wedding Invitation of Nageshwar Reddy & Neeraja',
      text: (currentLang === 'te' ? data.share?.textTe : data.share?.text) ||
            'Nageshwar Reddy & Neeraja invite you to celebrate their wedding on Thursday, 3 December 2026 at DJ Usthav Mahal, Bhavanipuram, Vijayawada.',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        if (err.name !== 'AbortError') {
          fallbackShare(shareData);
        }
      });
    } else {
      fallbackShare(shareData);
    }
  }

  function fallbackShare(shareData) {
    // Copy link to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url).then(() => {
        showToast(currentLang === 'te' ? 'ఆహ్వాన లింక్ కాపీ చేయబడింది!' : 'Invitation link copied to clipboard!');
      }).catch(() => {
        openWhatsAppShare(shareData);
      });
    } else {
      openWhatsAppShare(shareData);
    }
  }

  function openWhatsAppShare(shareData) {
    const text = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  if (footerShareBtn) {
    footerShareBtn.addEventListener('click', shareInvitation);
  }


  // =========================================================================
  // 12. BILINGUAL LANGUAGE SWITCHER (EN <-> TE)
  // Persists in localStorage and updates all DOM text dynamically
  // =========================================================================
  const langToggleBtn = document.getElementById('lang-toggle-btn');

  function updateLanguage(newLang) {
    currentLang = newLang;
    localStorage.setItem('wedding_lang', newLang);
    document.documentElement.lang = newLang;

    // Update Language Pill UI
    if (langToggleBtn) {
      langToggleBtn.setAttribute('data-lang', newLang);
      const optEn = langToggleBtn.querySelector('[data-lang-opt="en"]');
      const optTe = langToggleBtn.querySelector('[data-lang-opt="te"]');
      if (optEn) optEn.classList.toggle('km-lang-toggle__opt--active', newLang === 'en');
      if (optTe) optTe.classList.toggle('km-lang-toggle__opt--active', newLang === 'te');
    }

    const dict = data.i18n?.[newLang] || {};

    // 1. Skip link
    const skipLink = document.getElementById('skip-link');
    if (skipLink && dict.skipLink) skipLink.textContent = dict.skipLink;

    // 2. Personalized greeting
    initPersonalizedGreeting();

    // 3. Entry screen
    const entryLabel = document.getElementById('entry-label');
    if (entryLabel) entryLabel.textContent = dict.theWeddingOf || 'THE WEDDING OF';

    const entryDate = document.getElementById('entry-date');
    if (entryDate) entryDate.textContent = data.formatDateUppercase(data.weddingDate.dateISO, newLang);

    const entryOpenText = document.getElementById('entry-open-text');
    if (entryOpenText && dict.openInvitation) entryOpenText.textContent = dict.openInvitation;

    // 4. Hero section
    const heroInvocation = document.getElementById('hero-invocation');
    if (heroInvocation) {
      heroInvocation.textContent = newLang === 'te' ? data.hero.invocationTe : data.hero.invocationEn;
    }

    const heroDate = document.getElementById('hero-date');
    if (heroDate) {
      heroDate.textContent = data.formatDate(data.weddingDate.dateISO, newLang);
    }

    const heroVenueLead = document.getElementById('hero-venue-lead');
    if (heroVenueLead) {
      heroVenueLead.textContent = newLang === 'te' ? data.hero.venueLeadTe : data.hero.venueLeadEn;
    }

    // 5. The Couple section
    const coupleHeading = document.getElementById('couple-heading');
    if (coupleHeading) coupleHeading.textContent = newLang === 'te' ? 'వధూవరులు' : 'The Couple';

    const coupleSubline = document.getElementById('couple-subline');
    if (coupleSubline) {
      coupleSubline.textContent = newLang === 'te'
        ? 'రెండు కుటుంబాలు, ఎన్నో ఆశీస్సులు, ఒక మధుర బంధం.'
        : 'Two families, many blessings, one timeless celebration.';
    }

    const groomLabel = document.getElementById('groom-label');
    if (groomLabel) groomLabel.textContent = data.couple.groom.label[newLang] || 'SON OF';

    const groomParents = document.getElementById('groom-parents');
    if (groomParents) {
      if (newLang === 'te' && data.couple.groom.parentsTe) {
        groomParents.innerHTML = `<span class="km-couple__parent-line">${data.couple.groom.parentsTe}</span>`;
      } else {
        groomParents.innerHTML = `
          <span class="km-couple__parent-line">Kalagotla Bramha Reddy</span>
          <span class="km-couple__parent-line">&amp; Vijaya</span>
        `;
      }
    }

    const brideLabel = document.getElementById('bride-label');
    if (brideLabel) brideLabel.textContent = data.couple.bride.label[newLang] || 'DAUGHTER OF';

    const brideParents = document.getElementById('bride-parents');
    if (brideParents) {
      if (newLang === 'te' && data.couple.bride.parentsTe) {
        brideParents.innerHTML = `<span class="km-couple__parent-line">${data.couple.bride.parentsTe}</span>`;
      } else {
        brideParents.innerHTML = `
          <span class="km-couple__parent-line">Yaddala Shiva Reddy</span>
          <span class="km-couple__parent-line">&amp; Adi Lakshmi</span>
        `;
      }
    }

    // 6. Countdown section
    updateCountdown();

    // 7. Journey section (Page 5 restored)
    const journeyHeading = document.getElementById('journey-heading');
    if (journeyHeading) journeyHeading.textContent = newLang === 'te' ? data.journey.headingTe : data.journey.headingEn;

    const journeySubline = document.getElementById('journey-subline');
    if (journeySubline) journeySubline.textContent = newLang === 'te' ? data.journey.sublineTe : data.journey.sublineEn;

    // 8. Gallery section
    const galleryHeading = document.getElementById('gallery-heading');
    if (galleryHeading) galleryHeading.textContent = newLang === 'te' ? data.gallery.headingTe : data.gallery.headingEn;

    const gallerySubline = document.getElementById('gallery-subline');
    if (gallerySubline) gallerySubline.textContent = newLang === 'te' ? data.gallery.sublineTe : data.gallery.sublineEn;

    // 9. Footer section
    const footerLead = document.getElementById('footer-lead');
    if (footerLead && dict.footerGreetingLead) footerLead.textContent = dict.footerGreetingLead;

    const footerMain = document.getElementById('footer-main');
    if (footerMain && dict.footerGreetingMain) footerMain.textContent = dict.footerGreetingMain;

    const footerCalText = document.getElementById('footer-cal-text');
    if (footerCalText && dict.addToCalendar) footerCalText.textContent = dict.addToCalendar;

    const footerShareText = document.getElementById('footer-share-text');
    if (footerShareText && dict.shareInvitation) footerShareText.textContent = dict.shareInvitation;

    const footerFamilyLead = document.getElementById('footer-family-lead');
    if (footerFamilyLead && dict.footerFamilyLead) footerFamilyLead.textContent = dict.footerFamilyLead;

    const footerFamilyNames = document.getElementById('footer-family-names');
    if (footerFamilyNames && dict.footerFamilyNames) footerFamilyNames.textContent = dict.footerFamilyNames;

    // 10. Map Modal buttons
    const mapModalOpenMaps = document.getElementById('map-modal-open-maps');
    if (mapModalOpenMaps && dict.openInGoogleMaps) mapModalOpenMaps.textContent = dict.openInGoogleMaps;

    const mapModalGetDirections = document.getElementById('map-modal-get-directions');
    if (mapModalGetDirections && dict.getDirections) mapModalGetDirections.textContent = dict.getDirections;

    // 11. Audio button
    if (audio) {
      updateMusicUI(!audio.paused);
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'te' : 'en';
      updateLanguage(nextLang);
    });
  }

  // Initial language setup if saved as 'te' or passed via ?lang=te
  const urlLangParam = new URLSearchParams(window.location.search).get('lang');
  if (urlLangParam === 'te' || (!urlLangParam && currentLang === 'te')) {
    updateLanguage('te');
  } else if (urlLangParam === 'en') {
    updateLanguage('en');
  }

  // Deep-linking / automated preview support (?skipEntry=1&section=wedding-journey)
  const urlParams = new URLSearchParams(window.location.search);
  const skipEntryParam = urlParams.get('skipEntry') === 'true' || urlParams.get('skipEntry') === '1';
  const sectionParam = urlParams.get('section');

  if (skipEntryParam || sectionParam) {
    if (entryScreen) entryScreen.style.display = 'none';
    document.body.classList.remove('km-no-scroll');
    if (persistentBar) persistentBar.classList.add('km-persistent-bar--visible');
    if (ceremonialHero) ceremonialHero.classList.add('km-hero--active');

    if (sectionParam) {
      const targetSec = document.getElementById(sectionParam) || document.getElementById(sectionParam.replace(/^#/, ''));
      if (targetSec) {
        setTimeout(() => {
          targetSec.scrollIntoView({ behavior: 'instant', block: 'start' });
          targetSec.classList.add('in-view');
        }, 50);
      }
    }
  }


  // =========================================================================
  // 13. GLOBAL KEYBOARD NAVIGATION
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPhoto(currentPhotoIdx - 1, -1);
      if (e.key === 'ArrowRight') showPhoto(currentPhotoIdx + 1, 1);
    }
    if (mapModal && mapModal.classList.contains('active')) {
      if (e.key === 'Escape') closeMapModal();
    }
  });

});
