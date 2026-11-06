/**
 * Kalyana Mandapam - High-Fidelity Wedding Invitation Script
 * Driven by window.WEDDING_CONFIG for clean separation of data and interaction engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.WEDDING_CONFIG || {};

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (playing) {
        musicToggleBtn.classList.add('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', 'Pause Wedding Music');
      } else {
        musicToggleBtn.classList.remove('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', 'Play Wedding Music');
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
      console.warn('Audio playback postponed until explicit user gesture:', err);
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
  // 2. ENTRY CARD & SCROLL UNLOCK
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

    // Start lyrical soundtrack on user gesture with 1.5s fade-in
    fadeInAudio(config.audio?.fadeInDurationMs || 1500);

    // Play hero background video on user interaction
    ensureHeroVideoPlays();

    // Button tactile feedback
    if (openBtn) {
      openBtn.classList.add('km-entry__cta--pressed');
    }

    setTimeout(() => {
      // Crossfade out over ~850ms with subtle scale (1 -> 1.03)
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
    entryScreen.addEventListener('click', openInvitation);
  }


  // =========================================================================
  // 3. SMOOTH PARALLAX CONTROLLER
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

      // Hero durbar illustration subtle depth parallax
      if (heroDurbar && scrollY < 900) {
        heroDurbar.style.transform = `translateY(${scrollY * 0.08}px)`;
      }

      // Countdown wall image subtle parallax
      if (countdownPanel) {
        const rect = countdownPanel.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const offset = (rect.top - winH * 0.5) * 0.05;
          countdownPanel.style.transform = `translateY(${offset}px)`;
        }
      }

      // Gallery parasol gentle drift
      if (galleryParasol) {
        const rect = galleryParasol.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const offset = (rect.top - winH * 0.5) * -0.06;
          galleryParasol.style.transform = `translateY(${offset}px)`;
        }
      }

      // Footer art slight parallax on entry
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
  // 4. UNIFIED SCROLL REVEALS
  // =========================================================================
  const revealSelectors = [
    '.km-section-head',
    '.km-couple__unit',
    '.km-couple__divider',
    '.km-countdown__stage',
    '.km-events__stop',
    '.km-toranam-wrap',
    '.km-gallery__parasol',
    '.km-gallery__cell',
    '.km-video__wall',
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
  // 5. LIVE MUHURTHAM COUNTDOWN (DIGIT FLIP ANIMATION)
  // =========================================================================
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  const countdownGrid = document.getElementById('countdown-grid');
  const countdownCompleteMsg = document.getElementById('countdown-complete-msg');

  const targetDateStr = config.countdown?.targetIso || '2026-10-26T10:00:00+05:30';
  const muhurthamDate = new Date(targetDateStr).getTime();

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
    const distance = muhurthamDate - now;

    if (distance <= 0) {
      if (countdownGrid) countdownGrid.style.display = 'none';
      if (countdownCompleteMsg) countdownCompleteMsg.style.display = 'block';
      return;
    }

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
  // 6. THE WEDDING JOURNEY (SCROLL-DRIVEN WALKING TRANSITION)
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
    const endPt = { x: 200, y: 1240 };
    const curvePoints = [startPt, ...anchors, endPt];

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
          yPct: (footY / 1260) * 100,
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
      const walkDist = 1260; // stage height
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

  // Venue Map Modal Controller
  const mapModal = document.getElementById('map-modal');
  const mapModalClose = document.getElementById('map-modal-close');
  const mapEventTitle = document.getElementById('map-event-title');
  const mapEventLoc = document.getElementById('map-event-loc');
  const externalMapsBtn = document.getElementById('external-maps-btn');
  const mapButtons = document.querySelectorAll('.km-events__map');

  function openMapModal(eventName, location) {
    if (mapEventTitle) mapEventTitle.textContent = `${eventName} Venue`;
    if (mapEventLoc) mapEventLoc.textContent = `${location}, Rajasthan, India`;
    if (externalMapsBtn) {
      externalMapsBtn.href = `https://maps.google.com/?q=${encodeURIComponent(location + ', Rajasthan')}`;
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

  mapButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventName = btn.getAttribute('data-event') || 'Ceremony';
      const location = btn.getAttribute('data-location') || 'ITC Mementos, Udaipur';
      openMapModal(eventName, location);
    });
  });

  if (mapModalClose) mapModalClose.addEventListener('click', closeMapModal);
  if (mapModal) {
    const backdrop = mapModal.querySelector('.km-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeMapModal);
  }


  // =========================================================================
  // 7. BEFORE THE VOWS (PHOTO GALLERY & SWIPE LIGHTBOX)
  // =========================================================================
  const galleryCells = document.querySelectorAll('.km-gallery__cell');
  if (galleryCells.length > 0) {
    const galleryObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    galleryCells.forEach((cell, idx) => {
      cell.style.transitionDelay = `${(idx % 4) * 90}ms`;
      galleryObserver.observe(cell);
    });
  }

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxTouchArea = document.getElementById('lightbox-touch-area');

  const photos = Array.from(galleryCells).map(cell => {
    const img = cell.querySelector('.km-gallery__img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : 'Wedding Photograph'
    };
  });

  let currentPhotoIdx = 0;
  let isSwitchingPhoto = false;

  function showPhoto(idx, direction = 0) {
    if (photos.length === 0) return;
    if (idx < 0) idx = photos.length - 1;
    if (idx >= photos.length) idx = 0;
    currentPhotoIdx = idx;

    const current = photos[idx];
    if (!lightboxImg) return;

    // Direct update if lightbox is not currently open
    if (!lightbox || !lightbox.classList.contains('active')) {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = `${current.alt} (${idx + 1} of ${photos.length})`;
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
        lightboxImg.alt = current.alt;
        if (lightboxCaption) {
          lightboxCaption.textContent = `${current.alt} (${idx + 1} of ${photos.length})`;
        }
        lightboxImg.style.opacity = '1';
        setTimeout(() => {
          isSwitchingPhoto = false;
          lightboxImg.style.transition = '';
        }, 160);
      }, 140);
      return;
    }

    // Directional slide
    const outX = direction > 0 ? -24 : 24;
    const inX = -outX;

    lightboxImg.style.transition = 'opacity 0.18s var(--km-ease-reveal), transform 0.18s var(--km-ease-reveal)';
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = `translateX(${outX}px) scale(0.97)`;

    setTimeout(() => {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = `${current.alt} (${idx + 1} of ${photos.length})`;
      }
      lightboxImg.style.transition = 'none';
      lightboxImg.style.transform = `translateX(${inX}px) scale(0.97)`;

      void lightboxImg.offsetWidth; // Force layout

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

  // Mobile Swipe Gestures on Lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightboxTouchArea) {
    lightboxTouchArea.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxTouchArea.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        showPhoto(currentPhotoIdx - 1, -1); // Swipe right -> prev
      } else {
        showPhoto(currentPhotoIdx + 1, 1); // Swipe left -> next
      }
    }
  }


  // =========================================================================
  // 8. BLESS US WITH YOUR PRESENCE (RSVP SYSTEM)
  // =========================================================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const rsvpRadios = document.querySelectorAll('input[name="attendance"]');
  const rsvpSubmitBtn = document.getElementById('rsvp-submit-btn');
  const rsvpStatusMsg = document.getElementById('rsvp-status-message');
  const rsvpStatusText = document.getElementById('rsvp-status-text');

  // Extract guest name from ?to= query param (e.g. ?to=Guest)
  const urlParams = new URLSearchParams(window.location.search);
  const guestParamName = urlParams.get('to') ? decodeURIComponent(urlParams.get('to')).trim() : 'Guest';

  // Enable submit button once a decision is chosen
  rsvpRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (rsvpSubmitBtn) {
        rsvpSubmitBtn.disabled = false;
      }
    });
  });

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selected = document.querySelector('input[name="attendance"]:checked');
      if (!selected) return;

      const attendance = selected.value;
      const payload = {
        guest: guestParamName,
        attendance: attendance,
        timestamp: new Date().toISOString()
      };

      // Stub API call and log response
      console.log('[RSVP Submitted to /api/rsvp]:', payload);

      // Disable inputs to prevent multiple submissions
      rsvpRadios.forEach(r => r.disabled = true);
      if (rsvpSubmitBtn) {
        rsvpSubmitBtn.disabled = true;
        rsvpSubmitBtn.style.display = 'none';
      }

      // Display customized success state
      if (rsvpStatusMsg && rsvpStatusText) {
        if (attendance === 'attending') {
          rsvpStatusText.innerHTML = `Dearest <strong>${escapeHtml(guestParamName)}</strong>, thank you! We will joyfully keep a place for you in Udaipur!`;
        } else {
          rsvpStatusText.innerHTML = `Dearest <strong>${escapeHtml(guestParamName)}</strong>, thank you for letting us know. You will be dearly missed, and your warm blessings remain in our hearts.`;
        }
        rsvpStatusMsg.style.display = 'block';
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  // =========================================================================
  // 9. OUR STORY & WEDDING FILM YOUTUBE EMBED
  // =========================================================================
  const playFilmBtn = document.getElementById('play-wedding-film-btn');
  const posterStage = document.getElementById('video-poster-stage');
  const iframeSlot = document.getElementById('video-iframe-slot');

  const youtubeId = config.story?.youtubeId || 'xJKwD24GJtw';

  if (playFilmBtn && iframeSlot) {
    playFilmBtn.addEventListener('click', () => {
      // Pause background lyrical music
      pauseAudio();

      // Fade out poster thumbnail
      if (posterStage) {
        posterStage.style.transition = 'opacity 0.3s ease';
        posterStage.style.opacity = '0';
        setTimeout(() => {
          posterStage.style.display = 'none';
        }, 300);
      }

      // Load YouTube embed with smooth fade-in
      iframeSlot.style.opacity = '0';
      iframeSlot.style.transition = 'opacity 0.35s ease';
      iframeSlot.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&modestbranding=1&rel=0&playsinline=1" 
          title="Nageshwar Reddy &amp; Neeraja Wedding Story" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen 
          style="width: 100%; height: 100%; border: 0; border-radius: 4px;">
        </iframe>
      `;
      requestAnimationFrame(() => {
        iframeSlot.style.opacity = '1';
      });
    });
  }


  // =========================================================================
  // 10. GLOBAL KEYBOARD NAVIGATION
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
