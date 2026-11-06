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
  // 6. THE WEDDING JOURNEY (YATRA TIMELINE & FOOTPRINTS)
  // =========================================================================
  const footprints = document.querySelectorAll('.km-footstep');
  const eventStops = document.querySelectorAll('.km-events__stop');

  if (footprints.length > 0 || eventStops.length > 0) {
    const journeyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    footprints.forEach((foot, i) => {
      foot.style.transitionDelay = `${i * 100}ms`;
      journeyObserver.observe(foot);
    });

    eventStops.forEach(stop => journeyObserver.observe(stop));
  }

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
