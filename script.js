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
    if (!audio.src && audio.dataset.audioSrc) {
      audio.src = audio.dataset.audioSrc;
      audio.load();
    }
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
    if (!heroVideo.poster && heroVideo.dataset.poster) {
      heroVideo.poster = heroVideo.dataset.poster;
    }
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSaveData = conn && (conn.saveData || /2g/.test(conn.effectiveType));
    if (isSaveData) return;

    if (!heroVideo.src && heroVideo.dataset.videoSrc) {
      heroVideo.src = heroVideo.dataset.videoSrc;
      heroVideo.load();
    }
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  function openInvitation() {
    if (!entryScreen || entryScreen.classList.contains('km-entry--closing')) return;

    // Reveal underlying invitation frame instantly before crossfade
    const outerFrame = document.querySelector('.site-outer-frame');
    if (outerFrame) {
      outerFrame.classList.remove('site-outer-frame--pre-tap');
    }

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

  if ('IntersectionObserver' in window) {
    const journeySection = document.getElementById('wedding-journey');
    if (journeySection) {
      const journeyObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            initWeddingJourneyWalk();
            obs.disconnect();
          }
        });
      }, { rootMargin: '300px 0px' });
      journeyObserver.observe(journeySection);
    } else {
      initWeddingJourneyWalk();
    }
  } else {
    initWeddingJourneyWalk();
  }

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
  // =========================================================================
  // 10. ADD TO CALENDAR (RFC 5545 .ICS & DIRECT GOOGLE CALENDAR)
  // =========================================================================
  /**
   * IMPORTANT NOTE ON REMINDERS:
   * Google Calendar template URLs (https://calendar.google.com/calendar/render?...)
   * do NOT support reminder/notification parameters via URL; the user's personal
   * Google Calendar default notifications will apply.
   * The guaranteed 1-day reminder is provided via the RFC 5545 .ics VALARM trigger.
   */

  let activeCalendarEventId = 'wedding';
  let calendarTriggerElement = null;

  /**
   * Platform detection for calendar options:
   * - 'in-app': In-app browsers (WhatsApp, Instagram, Facebook, Snapchat, etc.)
   * - 'apple-safari': iOS Safari and macOS Safari
   * - 'android': Android devices
   * - 'desktop-or-other': Windows, Chrome/Firefox on desktop or iOS, etc.
   */
  function detectCalendarPlatform() {
    const ua = navigator.userAgent || '';
    const vendor = navigator.vendor || '';

    // In-app browsers (WhatsApp, Instagram, Facebook, Snapchat, Messenger, etc.)
    const isInApp = /(FBAN|FBAV|Instagram|WhatsApp|Snapchat|Line|MicroMessenger|TikTok|Twitter|FB_IAB|FB4A|IAB)/i.test(ua);
    if (isInApp) {
      return 'in-app';
    }

    // iOS check (including iPadOS desktop emulation)
    const isIOS = /(iPhone|iPad|iPod)/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIOSThirdParty = isIOS && /(CriOS|FxiOS|EdgiOS)/i.test(ua);

    // Android check
    const isAndroid = /Android/i.test(ua);

    // macOS Safari check (Safari in UA, Apple in vendor, NOT Chrome, NOT Chromium, NOT Android)
    const isMacOSSafari = /Macintosh|Mac OS X/i.test(ua) && !isIOS && /Safari/i.test(ua) && /Apple/i.test(vendor) && !/Chrome|Chromium|Edg|OPR/i.test(ua);

    const isIOSSafari = isIOS && !isIOSThirdParty;

    if (isIOSSafari || isMacOSSafari) {
      return 'apple-safari';
    }
    if (isAndroid) {
      return 'android';
    }
    return 'desktop-or-other';
  }

  function renderCalendarModal(eventId) {
    eventId = eventId || activeCalendarEventId || 'wedding';
    activeCalendarEventId = eventId;

    const data = window.WEDDING_DATA || {};
    const dict = (data.i18n && data.i18n[currentLang]) ? data.i18n[currentLang] : {};
    const helper = window.CALENDAR_HELPER;

    const resolved = helper ? helper.getResolvedEvent(data, eventId) : {
      title: 'Wedding of Nageshwar Reddy & Neeraja',
      dateISO: '2026-12-03',
      venue: 'DJ Usthav Mahal, Bhavanipuram, Vijayawada'
    };

    // --- Modal title ---
    const modalTitleEl = document.getElementById('calendar-modal-title');
    if (modalTitleEl) modalTitleEl.textContent = dict.calModalTitle || 'Add to your calendar';

    // --- Subtitle: derived from config (date · venue), never hardcoded ---
    const subtitleEl = document.getElementById('calendar-modal-subtitle');
    if (subtitleEl) {
      const venue = resolved.venue || (data.venue && data.venue.fullText) || 'DJ Usthav Mahal, Bhavanipuram, Vijayawada';
      const dateFormatted = (data.formatDate && resolved.dateISO && resolved.dateISO !== 'TODO_CONFIRM')
        ? data.formatDate(resolved.dateISO, currentLang)
        : (currentLang === 'te' ? 'గురువారం, 3 డిసెంబర్ 2026' : 'Thursday, 3 December 2026');
      subtitleEl.textContent = dateFormatted + ' \u00b7 ' + venue;
    }

    const optionsContainer = document.getElementById('calendar-options-container');
    const inAppHint = document.getElementById('calendar-inapp-hint');
    const inAppText = document.getElementById('calendar-inapp-text');
    const copyLinkText = document.getElementById('calendar-copy-link-text');
    const platformHint = document.getElementById('calendar-platform-hint');

    // Update in-app notice text
    if (inAppText) inAppText.textContent = dict.calInAppNotice || 'Open this invitation in your phone\u2019s browser (\u22ee menu \u203a Open in browser) to use the option with the reminder.';
    if (copyLinkText) copyLinkText.textContent = dict.calCopyLink || 'Copy Link';

    const icsUrl = `/api/calendar.ics?event=${encodeURIComponent(eventId)}`;
    // Google Calendar template URL — reminder cannot be set via URL (limitation noted in calendar-helper.js)
    const googleUrl = helper ? helper.generateGoogleUrl(data, eventId) : '#';

    const platform = detectCalendarPlatform();

    // Bell SVG for inline use
    const bellSvg = `<svg class="km-cal-desc__bell" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;

    // Option A: Apple Calendar / Outlook (.ics hosted link)
    const appleOptionHtml = `
      <a href="${icsUrl}" class="km-cal-option km-cal-option--ics" id="cal-option-apple" data-cal-type="ics">
        <div class="km-cal-option__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="km-cal-option__content">
          <div class="km-cal-option__title-row">
            <span class="km-cal-option__title">${dict.calAppleOutlook || 'Apple Calendar / Outlook'}</span>
            ${platform === 'apple-safari' ? `<span class="km-cal-badge">${dict.calRecommended || 'Recommended'}</span>` : ''}
          </div>
          <span class="km-cal-option__desc">${bellSvg} ${dict.calAppleOutlookSub || 'Includes a reminder 1 day before'}</span>
        </div>
        <svg class="km-cal-option__arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
    `;

    // Option B: Google Calendar (direct link)
    const googleOptionHtml = `
      <div class="km-cal-option-wrap">
        <a href="${googleUrl}" target="_blank" rel="noopener" class="km-cal-option km-cal-option--google" id="cal-option-google" data-cal-type="google">
          <div class="km-cal-option__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="9" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
          </div>
          <div class="km-cal-option__content">
            <div class="km-cal-option__title-row">
              <span class="km-cal-option__title">${dict.calGoogle || 'Google Calendar'}</span>
              ${platform !== 'apple-safari' && platform !== 'in-app' ? `<span class="km-cal-badge">${dict.calRecommended || 'Recommended'}</span>` : ''}
            </div>
            <span class="km-cal-option__desc">${dict.calGoogleSub || 'Opens Google Calendar with the event filled in'}</span>
          </div>
          <svg class="km-cal-option__arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
        <p class="km-cal-google-tip">${bellSvg} ${dict.calGoogleTip || 'Tip: after saving, open the event and tap \u2018Add notification\u2019 to set a reminder 1 day before.'}</p>
      </div>
    `;

    if (!optionsContainer) return;

    if (platform === 'in-app') {
      // In-app webviews: show ONLY Google + amber in-app notice. No .ics option.
      optionsContainer.innerHTML = googleOptionHtml;
      if (inAppHint) inAppHint.style.display = 'flex';
      if (platformHint) platformHint.style.display = 'none';
    } else if (platform === 'apple-safari') {
      // iOS / macOS Safari: .ics first (Recommended — opens native sheet, includes reminder)
      optionsContainer.innerHTML = appleOptionHtml + googleOptionHtml;
      if (inAppHint) inAppHint.style.display = 'none';
      if (platformHint) {
        platformHint.textContent = dict.calPlatformHintIOS || 'Tap \u2018Add to Calendar\u2019 on the next screen. The reminder is already included.';
        platformHint.style.display = 'block';
      }
    } else if (platform === 'android') {
      // Android: Google first (Recommended)
      optionsContainer.innerHTML = googleOptionHtml + appleOptionHtml;
      if (inAppHint) inAppHint.style.display = 'none';
      if (platformHint) {
        platformHint.textContent = dict.calPlatformHintAndroid || 'Google Calendar is recommended. Add the notification after saving to get a reminder.';
        platformHint.style.display = 'block';
      }
    } else {
      // Desktop / other: Google first (Recommended)
      optionsContainer.innerHTML = googleOptionHtml + appleOptionHtml;
      if (inAppHint) inAppHint.style.display = 'none';
      if (platformHint) {
        platformHint.textContent = dict.calPlatformHintDesktop || 'Use Google Calendar, or download the file and open it in Outlook\u202for Apple Calendar for the built-in reminder.';
        platformHint.style.display = 'block';
      }
    }

    // Attach distinct non-blocking feedback toasts per option type
    const optionLinks = optionsContainer.querySelectorAll('.km-cal-option');
    optionLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        const calType = link.getAttribute('data-cal-type');
        if (calType === 'ics') {
          showToast(dict.calOpeningIcs || 'Opening your calendar\u2026 A reminder 1 day before is included.');
        } else {
          showToast(dict.calOpeningGoogle || 'Opening Google Calendar\u2026 Don\u2019t forget to add a reminder.');
        }
        // Auto-close modal (non-blocking, after gesture completes)
        setTimeout(closeCalendarModal, 400);
      });
    });
  }

  function openCalendarModal(eventId, triggerBtn) {
    calendarTriggerElement = triggerBtn || document.getElementById('footer-cal-btn');
    renderCalendarModal(eventId);
    const modal = document.getElementById('calendar-modal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      // Focus close button or first interactive link for accessibility
      const firstFocusable = modal.querySelector('button, a');
      if (firstFocusable) firstFocusable.focus();
    }
  }

  function closeCalendarModal() {
    const modal = document.getElementById('calendar-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      if (calendarTriggerElement) {
        calendarTriggerElement.focus();
      }
    }
  }

  const calModalClose = document.getElementById('calendar-modal-close');
  if (calModalClose) {
    calModalClose.addEventListener('click', closeCalendarModal);
  }

  const calModalBackdrop = document.getElementById('calendar-modal-backdrop');
  if (calModalBackdrop) {
    calModalBackdrop.addEventListener('click', closeCalendarModal);
  }

  // Keyboard accessibility: Escape closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const calModal = document.getElementById('calendar-modal');
      if (calModal && calModal.classList.contains('active')) {
        closeCalendarModal();
      }
    }
  });

  // In-App browser copy link button
  const calendarCopyBtn = document.getElementById('calendar-copy-link-btn');
  if (calendarCopyBtn) {
    calendarCopyBtn.addEventListener('click', function () {
      const data = window.WEDDING_DATA || {};
      const dict = (data.i18n && data.i18n[currentLang]) ? data.i18n[currentLang] : {};
      const copyUrl = data?.meta?.url || window.location.href;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyUrl).then(function () {
          const copyTextEl = document.getElementById('calendar-copy-link-text');
          if (copyTextEl) copyTextEl.textContent = dict.calLinkCopied || 'Link copied!';
          showToast(dict.calLinkCopied || 'Link copied!');
          setTimeout(function () {
            if (copyTextEl) copyTextEl.textContent = dict.calCopyLink || 'Copy Link';
          }, 2000);
        }).catch(function () {
          showToast('URL: ' + copyUrl);
        });
      } else {
        showToast('URL: ' + copyUrl);
      }
    });
  }

  const footerCalBtn = document.getElementById('footer-cal-btn');
  if (footerCalBtn) {
    footerCalBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openCalendarModal('wedding', footerCalBtn);
    });
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
    }, 4000);
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
  // Client-side translation dictionary with data-i18n attributes
  // =========================================================================
  const translations = {
    en: {
      invitationTop: "|| Shree Ganeshay Namah ||",
      weddingTitle: "THE WEDDING OF",
      groomName: "Nageshwar Reddy",
      brideName: "Neeraja",
      heroDate: "Thursday, December 3, 2026",
      heroVenue: "DJ USTHAV MAHAL, BHAVANIPURAM,<br>VIJAYAWADA",

      coupleTitle: "The Couple",
      coupleSubtitle: "Two families, many blessings, one timeless celebration.",
      sonOf: "SON OF",
      groomParents: "Kalagotla Bramha Reddy & Vijaya",
      daughterOf: "DAUGHTER OF",
      brideParents: "Yaddala Shiva Reddy & Adi Lakshmi",

      journeyTitle: "The Wedding Journey",
      journeySubtitle: "Walk with us, function to function, to the sacred hour.",
      mehendiTitle: "Mehendi",
      mehendiTime: "24th February 2026 · 5:00 PM onwards",
      haldiTitle: "Haldi & Sangeet",
      haldiTime: "25th February 2026 · 10:48 AM",
      teluguWeddingTitle: "Telugu Wedding",
      teluguWeddingTime: "26th February 2026 · 10:00 AM onwards",
      kodavaTitle: "Kodava Ceremony",
      kodavaTime: "26th February 2026 — Evening · 6:30 PM onwards",
      venueAddress: "DJ USTHAV MAHAL, BHAVANIPURAM, VIJAYAWADA",

      countdownToday: "Today is the day! We celebrate with love and gratitude.",
      galleryTitle: "Before the Vows",
      gallerySubtitle: "Little moments from the years that brought us here.",

      footerPresence: "We await your gracious presence",
      footerBlessings: "and your blessings",
      blessingWord: "శుభమస్తు",
      withRegards: "With Love & Regards,",
      familySign: "Kalagotla Family",

      mapVenueTitle: "Ceremony Venue",
      openMaps: "Open in Google Maps",
      getDirections: "Get Directions",
      addCalendar: "Add to your calendar"
    },
    te: {
      invitationTop: "|| శ్రీ గణేశాయ నమః ||",
      weddingTitle: "వివాహ ఆహ్వాన మహోత్సవం",
      groomName: "నాగేశ్వర్ రెడ్డి",
      brideName: "నీరజ",
      heroDate: "గురువారం, డిసెంబర్ 3, 2026",
      heroVenue: "డి.జె. ఉత్సవ్ మహల్, భవానీపురం,<br>విజయవాడ",

      coupleTitle: "వధూవరులు",
      coupleSubtitle: "రెండు కుటుంబాల ఆత్మీయ కలయిక... పెద్దల ఆశీస్సులు... కలకాలం నిలిచే వేడుక.",
      sonOf: "సుపుత్రుడు",
      groomParents: "శ్రీమతి కలగోట్ల విజయ మరియు శ్రీ కలగోట్ల బ్రహ్మారెడ్డి",
      daughterOf: "సుపుత్రిక",
      brideParents: "శ్రీమతి యద్దల ఆదిలక్ష్మి మరియు శ్రీ యద్దల శివారెడ్డి",

      journeyTitle: "వివాహ వేడుకల వివరాలు",
      journeySubtitle: "ప్రతి శుభ ఘడియలో మాతో కలిసి ఆనందించండి.",
      mehendiTitle: "మెహందీ",
      mehendiTime: "2026 ఫిబ్రవరి 24 · సాయంత్రం 5:00 గంటల నుండి",
      haldiTitle: "హల్దీ & సంగీత్",
      haldiTime: "2026 ఫిబ్రవరి 25 · ఉదయం 10:48 గంటలకు",
      teluguWeddingTitle: "తెలుగు వివాహం",
      teluguWeddingTime: "2026 ఫిబ్రవరి 26 · ఉదయం 10:00 గంటల నుండి",
      kodavaTitle: "కొడవ సాంప్రదాయ వేడుక",
      kodavaTime: "2026 ఫిబ్రవరి 26 · సాయంత్రం 6:30 గంటల నుండి",
      venueAddress: "డి.జె. ఉత్సవ్ మహల్, భవానీపురం, విజయవాడ",

      countdownToday: "ఈ రోజే ఆ శుభదినం! ప్రేమతో, కృతజ్ఞతలతో వేడుక చేసుకుంటున్నాం.",
      galleryTitle: "సప్తపదికి ముందు",
      gallerySubtitle: "మమ్మల్ని ఈ పవిత్ర బంధం వైపు నడిపించిన కొన్ని మధుర జ్ఞాపకాలు.",

      footerPresence: "మీ రాకయే మాకు ఆనందదాయకం",
      footerBlessings: "మీ ఆశీస్సులే మాకు శ్రీరామరక్ష",
      blessingWord: "శుభమస్తు",
      withRegards: "ప్రేమాభిమానాలతో,",
      familySign: "కలగోట్ల కుటుంబ సభ్యులు, బంధుమిత్రులు",

      mapVenueTitle: "కళ్యాణ వేదిక",
      openMaps: "గూగుల్ మ్యాప్స్లో చూడండి",
      getDirections: "దారి కనుగొనండి",
      addCalendar: "క్యాలెండర్కు జోడించండి"
    }
  };

  function applyTranslations(lang) {
    const dict = translations[lang] || translations.en;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (val !== undefined) {
        el.innerHTML = val;
      }
    });
  }

  function updateLanguage(newLang) {
    currentLang = newLang;
    localStorage.setItem('wedding_lang', newLang);
    document.documentElement.lang = newLang;

    // Toggle .lang-te class on body for Telugu script line-height protection
    if (newLang === 'te') {
      document.body.classList.add('lang-te');
    } else {
      document.body.classList.remove('lang-te');
    }

    // Apply translations to all tagged data-i18n elements
    applyTranslations(newLang);

    // Keep dynamic components and metadata in sync
    initPersonalizedGreeting();
    updateCountdown();

    const entryDate = document.getElementById('entry-date');
    if (entryDate && data.formatDateUppercase) {
      entryDate.textContent = data.formatDateUppercase(data.weddingDate?.dateISO, newLang);
    }

    const entryOpenText = document.getElementById('entry-open-text');
    if (entryOpenText) {
      entryOpenText.textContent = newLang === 'te' ? 'ఆహ్వాన పత్రికను తెరవండి' : 'OPEN INVITATION';
    }

    const heroVenueLead = document.getElementById('hero-venue-lead');
    if (heroVenueLead) {
      heroVenueLead.textContent = newLang === 'te' ? (data.hero?.venueLeadTe || 'కళ్యాణ వేదిక:') : (data.hero?.venueLeadEn || 'at');
    }

    // Re-render calendar modal options for updated language
    if (typeof renderCalendarModal === 'function') {
      renderCalendarModal(activeCalendarEventId || 'wedding');
    }

    if (audio) {
      updateMusicUI(!audio.paused);
    }
  }

  // On page load, initialize language (default: 'en', or 'te' via ?lang=te)
  const urlLangParam = new URLSearchParams(window.location.search).get('lang');
  const initialLang = urlLangParam === 'te' ? 'te' : 'en';
  updateLanguage(initialLang);

  // Deep-linking / automated preview support (?skipEntry=1&section=wedding-journey)
  const urlParams = new URLSearchParams(window.location.search);
  const skipEntryParam = urlParams.get('skipEntry') === 'true' || urlParams.get('skipEntry') === '1';
  const sectionParam = urlParams.get('section');

  if (skipEntryParam || sectionParam) {
    const outerFrame = document.querySelector('.site-outer-frame');
    if (outerFrame) outerFrame.classList.remove('site-outer-frame--pre-tap');
    if (entryScreen) entryScreen.style.display = 'none';
    document.body.classList.remove('km-no-scroll');
    if (persistentBar) persistentBar.classList.add('km-persistent-bar--visible');
    if (ceremonialHero) ceremonialHero.classList.add('km-hero--active');
    ensureHeroVideoPlays();

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
