/**
 * Kalyana Mandapam - Authentic Wedding Invitation Script
 * For Vijay Deverakonda & Rashmika Mandanna
 * Recreated with authentic audio toggle, live countdown, modal viewers,
 * video streaming embed, and RSVP handling.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. BACKGROUND AUDIO & SOUNDTRACK CONTROLLER (km-bell)
  // =========================================================================
  const audio = document.getElementById('wedding-audio');
  const musicToggleBtn = document.getElementById('music-toggle');
  const musicIconImg = document.getElementById('music-icon-img');
  let isPlaying = false;

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (playing) {
      if (musicToggleBtn) {
        musicToggleBtn.classList.add('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', 'Pause Wedding Music');
      }
      if (musicIconImg) {
        musicIconImg.src = 'assets/icons/km-audio-on.png';
      }
    } else {
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('km-bell--playing');
        musicToggleBtn.setAttribute('aria-label', 'Play Wedding Music');
      }
      if (musicIconImg) {
        musicIconImg.src = 'assets/icons/km-audio-off.png';
      }
    }
  }

  function playAudio() {
    if (!audio) return;
    audio.play().then(() => {
      updateMusicUI(true);
    }).catch(err => {
      console.warn('Audio play auto-policy postponed:', err);
      updateMusicUI(false);
    });
  }

  function pauseAudio() {
    if (!audio) return;
    audio.pause();
    updateMusicUI(false);
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      playAudio();
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

  // Handle audio events
  if (audio) {
    audio.addEventListener('play', () => updateMusicUI(true));
    audio.addEventListener('pause', () => updateMusicUI(false));
  }


  // =========================================================================
  // 2. OPENING INVITATION HERO SCREEN (km-entry) & PERSISTENT BAR
  // =========================================================================
  const entryScreen = document.getElementById('km-entry-screen');
  const openBtn = document.getElementById('km-open-btn');
  const ceremonialHero = document.getElementById('ceremonial-hero');
  const persistentBar = document.getElementById('km-persistent-bar');

  function showPersistentBar() {
    if (persistentBar) {
      persistentBar.classList.add('km-persistent-bar--visible');
    }
  }

  function openInvitation() {
    if (!entryScreen || entryScreen.classList.contains('km-entry--closing')) return;

    // Start lyrical audio on user gesture
    playAudio();

    // Trigger flower bloom exit transition
    entryScreen.classList.add('km-entry--closing');

    // Reveal persistent bottom bar (Order Now & Audio Bell)
    showPersistentBar();

    setTimeout(() => {
      entryScreen.style.display = 'none';
    }, 850);

    // Smooth scroll to ceremonial hero
    if (ceremonialHero) {
      ceremonialHero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // If entry screen is dismissed or scrolled, ensure persistent bar shows
  if (!entryScreen || entryScreen.style.display === 'none') {
    showPersistentBar();
  }

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  // Clicking anywhere on the entry screen also unlocks the card
  if (entryScreen) {
    entryScreen.addEventListener('click', openInvitation);
  }


  // =========================================================================
  // 3. ARCHITECTURAL LIVE MUHURTHAM COUNTDOWN
  // =========================================================================
  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  // Muhurtham Target: 26 October 2026, 10:00:00 AM IST
  const muhurthamDate = new Date('2026-10-26T10:00:00+05:30').getTime();

  function updateCountdown() {
    const now = Date.now();
    const distance = muhurthamDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // =========================================================================
  // 4. WEDDING JOURNEY VENUE MAP MODAL
  // =========================================================================
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
  // 5. FULLSCREEN PHOTO GALLERY LIGHTBOX SYSTEM
  // =========================================================================
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryCells = Array.from(document.querySelectorAll('.km-gallery__cell'));

  // Build photo catalog
  const photos = galleryCells.map(cell => {
    const img = cell.querySelector('.km-gallery__img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : 'Wedding Photograph'
    };
  });

  let currentPhotoIdx = 0;

  function showPhoto(idx) {
    if (photos.length === 0) return;
    if (idx < 0) idx = photos.length - 1;
    if (idx >= photos.length) idx = 0;
    currentPhotoIdx = idx;

    const current = photos[idx];
    if (lightboxImg) {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = `${current.alt} (${idx + 1} of ${photos.length})`;
    }
  }

  function openLightbox(idx) {
    showPhoto(idx);
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
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showPhoto(currentPhotoIdx - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showPhoto(currentPhotoIdx + 1));

  if (lightbox) {
    const backdrop = lightbox.querySelector('.km-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
  }


  // =========================================================================
  // 6. RSVP FORM SYSTEM & STEPPER
  // =========================================================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const guestCountInput = document.getElementById('rsvp-guest-count');
  const stepperDec = document.getElementById('stepper-dec');
  const stepperInc = document.getElementById('stepper-inc');
  const guestCounterWrap = document.getElementById('rsvp-guest-counter-wrap');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpModalClose = document.getElementById('rsvp-modal-close');
  const rsvpAckBtn = document.getElementById('rsvp-ack-btn');
  const rsvpSuccessText = document.getElementById('rsvp-success-text');

  // Stepper buttons
  if (stepperDec && guestCountInput) {
    stepperDec.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val > 1) guestCountInput.value = val - 1;
    });
  }

  if (stepperInc && guestCountInput) {
    stepperInc.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val < 10) guestCountInput.value = val + 1;
    });
  }

  // Hide guest count if attending with regret
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'regret') {
        if (guestCounterWrap) guestCounterWrap.style.display = 'none';
      } else {
        if (guestCounterWrap) guestCounterWrap.style.display = 'flex';
      }
    });
  });

  function closeRsvpModal() {
    if (rsvpModal) {
      rsvpModal.classList.remove('active');
      rsvpModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (rsvpModalClose) rsvpModalClose.addEventListener('click', closeRsvpModal);
  if (rsvpAckBtn) rsvpAckBtn.addEventListener('click', closeRsvpModal);
  if (rsvpModal) {
    const backdrop = rsvpModal.querySelector('.km-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeRsvpModal);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestNameInput = document.getElementById('rsvp-name');
      const guestName = guestNameInput ? guestNameInput.value.trim() : 'Honoured Guest';
      const checkedAttendance = document.querySelector('input[name="attendance"]:checked');
      const attendance = checkedAttendance ? checkedAttendance.value : 'attending';
      const count = guestCountInput ? guestCountInput.value : 1;

      if (!guestName) return;

      if (attendance === 'attending') {
        if (rsvpSuccessText) {
          rsvpSuccessText.innerHTML = `Dearest <strong>${escapeHtml(guestName)}</strong>, your gracious presence with <strong>${count}</strong> guest(s) will bring immense joy to Vijay &amp; Rashmika's families! See you in Udaipur!`;
        }
      } else {
        if (rsvpSuccessText) {
          rsvpSuccessText.innerHTML = `Dearest <strong>${escapeHtml(guestName)}</strong>, thank you for letting us know. You will be dearly missed, and your warm blessings remain forever in our hearts!`;
        }
      }

      if (rsvpModal) {
        rsvpModal.classList.add('active');
        rsvpModal.setAttribute('aria-hidden', 'false');
      }

      rsvpForm.reset();
      if (guestCountInput) guestCountInput.value = '1';
      if (guestCounterWrap) guestCounterWrap.style.display = 'flex';
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  // =========================================================================
  // 7. OUR STORY & WEDDING FILM YOUTUBE EMBED
  // =========================================================================
  const playFilmBtn = document.getElementById('play-wedding-film-btn');
  const posterStage = document.getElementById('video-poster-stage');
  const iframeSlot = document.getElementById('video-iframe-slot');

  if (playFilmBtn && iframeSlot) {
    playFilmBtn.addEventListener('click', () => {
      // Pause background soundtrack
      pauseAudio();

      // Hide poster image
      if (posterStage) posterStage.style.display = 'none';

      // Load official YouTube Manyavar Wedding film (ID: xJKwD24GJtw)
      iframeSlot.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/xJKwD24GJtw?autoplay=1&rel=0&playsinline=1" 
          title="Vijay Deverakonda &amp; Rashmika Mandanna Wedding Story" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen 
          style="width: 100%; height: 100%; border: 0; border-radius: 4px;">
        </iframe>
      `;
    });
  }


  // =========================================================================
  // 8. GLOBAL ESCAPE & KEYBOARD NAVIGATION
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPhoto(currentPhotoIdx - 1);
      if (e.key === 'ArrowRight') showPhoto(currentPhotoIdx + 1);
    }
    if (mapModal && mapModal.classList.contains('active')) {
      if (e.key === 'Escape') closeMapModal();
    }
    if (rsvpModal && rsvpModal.classList.contains('active')) {
      if (e.key === 'Escape') closeRsvpModal();
    }
  });


  // =========================================================================
  // 9. SUBTLE SCROLL REVEAL ANIMATIONS
  // =========================================================================
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('km-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.km-section, .km-couple__unit, .km-events__stop, .km-gallery__cell').forEach(el => {
      el.classList.add('km-reveal');
      revealObserver.observe(el);
    });
  }

});
