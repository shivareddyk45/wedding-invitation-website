/**
 * Wedding Invitation Website - Vijay & Rashmika
 * Authentic Interactions, Live Muhurtham Countdown, Soundtrack Player,
 * Interactive Gallery Lightbox, and RSVP Submission System.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. BACKGROUND AUDIO & SOUNDTRACK CONTROLLER
  // =========================================================================
  const audio = document.getElementById('wedding-audio');
  const musicToggleBtn = document.getElementById('music-toggle');
  let isPlaying = false;

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (playing) {
      musicToggleBtn.classList.add('playing');
      musicToggleBtn.setAttribute('aria-label', 'Pause Wedding Music');
    } else {
      musicToggleBtn.classList.remove('playing');
      musicToggleBtn.setAttribute('aria-label', 'Play Wedding Music');
    }
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        updateMusicUI(true);
      }).catch(err => {
        console.warn('Audio play request blocked or postponed:', err);
      });
    } else {
      audio.pause();
      updateMusicUI(false);
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  // =========================================================================
  // 2. OPEN INVITATION BUTTON
  // =========================================================================
  const openInvitationBtn = document.getElementById('open-invitation-btn');
  const ceremonialHero = document.getElementById('ceremonial-hero');

  if (openInvitationBtn) {
    openInvitationBtn.addEventListener('click', () => {
      // Start audio playback upon direct user gesture
      if (audio && audio.paused) {
        audio.play().then(() => updateMusicUI(true)).catch(() => {});
      }

      // Smooth scroll to main ceremonial invitation
      if (ceremonialHero) {
        ceremonialHero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // =========================================================================
  // 3. LIVE MUHURTHAM COUNTDOWN TIMER
  // =========================================================================
  const daysEl = document.getElementById('days-val');
  const hoursEl = document.getElementById('hours-val');
  const minutesEl = document.getElementById('minutes-val');
  const secondsEl = document.getElementById('seconds-val');

  // Muhurtham Target: 26 October 2026, 10:00:00 AM IST
  const muhurthamDate = new Date('2026-10-26T10:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    let distance = muhurthamDate - now;

    if (distance <= 0) {
      // If reached or past, keep celebratory zeroes
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
  // 4. MAP MODAL CONTROLLER
  // =========================================================================
  const mapModal = document.getElementById('map-modal');
  const mapModalClose = document.getElementById('map-modal-close');
  const modalEventTitle = document.getElementById('modal-event-title');
  const modalEventLoc = document.getElementById('modal-event-loc');
  const openGmapsLink = document.getElementById('open-gmaps-link');
  const viewMapBtns = document.querySelectorAll('.view-map-btn');

  function openMap(eventName, location) {
    if (modalEventTitle) modalEventTitle.textContent = `${eventName} Venue`;
    if (modalEventLoc) modalEventLoc.textContent = `${location}, Rajasthan, India`;
    if (openGmapsLink) {
      openGmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    }
    if (mapModal) {
      mapModal.classList.add('active');
      mapModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMap() {
    if (mapModal) {
      mapModal.classList.remove('active');
      mapModal.setAttribute('aria-hidden', 'true');
    }
  }

  viewMapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventName = btn.getAttribute('data-event') || 'Wedding Ceremony';
      const location = btn.getAttribute('data-location') || 'ITC Mementos, Udaipur';
      openMap(eventName, location);
    });
  });

  if (mapModalClose) {
    mapModalClose.addEventListener('click', closeMap);
  }

  if (mapModal) {
    const backdrop = mapModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeMap);
  }

  // =========================================================================
  // 5. PHOTO GALLERY LIGHTBOX SYSTEM
  // =========================================================================
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

  let currentPhotoIndex = 0;

  function showPhoto(index) {
    if (index < 0) index = galleryItems.length - 1;
    if (index >= galleryItems.length) index = 0;
    currentPhotoIndex = index;

    const item = galleryItems[index];
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';

    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
  }

  function openLightbox(index) {
    showPhoto(index);
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

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showPhoto(currentPhotoIndex + 1));

  if (lightbox) {
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
  }

  // Keyboard navigation for Lightbox & Modals
  window.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
      if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
    }
    if (mapModal && mapModal.classList.contains('active')) {
      if (e.key === 'Escape') closeMap();
    }
    if (rsvpModal && rsvpModal.classList.contains('active')) {
      if (e.key === 'Escape') closeRsvpModal();
    }
  });

  // =========================================================================
  // 6. RSVP FORM SYSTEM
  // =========================================================================
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  const guestCountInput = document.getElementById('guest-count');
  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');
  const guestCountWrapper = document.getElementById('guest-count-wrapper');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpModalClose = document.getElementById('rsvp-modal-close');
  const rsvpAckBtn = document.getElementById('rsvp-ack-btn');
  const rsvpSuccessMsg = document.getElementById('rsvp-success-msg');

  // Stepper handlers
  if (stepperMinus && guestCountInput) {
    stepperMinus.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val > 1) guestCountInput.value = val - 1;
    });
  }

  if (stepperPlus && guestCountInput) {
    stepperPlus.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val < 10) guestCountInput.value = val + 1;
    });
  }

  // Toggle guest count visibility based on attendance choice
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'regret') {
        if (guestCountWrapper) guestCountWrapper.style.display = 'none';
      } else {
        if (guestCountWrapper) guestCountWrapper.style.display = 'flex';
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
    const backdrop = rsvpModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeRsvpModal);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guest-name').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;
      const count = guestCountInput ? guestCountInput.value : 1;

      if (!guestName) return;

      if (attendance === 'attending') {
        if (rsvpSuccessMsg) {
          rsvpSuccessMsg.innerHTML = `Dearest <strong>${guestName}</strong>, your presence with ${count} guest(s) will bring immense joy to Vijay &amp; Rashmika's families! See you in Udaipur!`;
        }
      } else {
        if (rsvpSuccessMsg) {
          rsvpSuccessMsg.innerHTML = `Dearest <strong>${guestName}</strong>, thank you for letting us know. You will be dearly missed, and your warm blessings remain in our hearts!`;
        }
      }

      if (rsvpModal) {
        rsvpModal.classList.add('active');
        rsvpModal.setAttribute('aria-hidden', 'false');
      }

      rsvpForm.reset();
      if (guestCountInput) guestCountInput.value = '1';
    });
  }

  // =========================================================================
  // 7. OUR STORY VIDEO EMBED CONTROLLER
  // =========================================================================
  const playStoryBtn = document.getElementById('play-story-video');
  const videoPoster = document.getElementById('video-poster');
  const iframeTarget = document.getElementById('iframe-target');

  if (playStoryBtn && iframeTarget) {
    playStoryBtn.addEventListener('click', () => {
      // Pause background music so video audio can be enjoyed
      if (audio && !audio.paused) {
        audio.pause();
        updateMusicUI(false);
      }

      // Hide poster overlay
      if (videoPoster) videoPoster.style.display = 'none';

      // Load YouTube Manyavar Wedding video with autoplay
      // Manyavar Vijay & Rashmika Wedding commercial
      iframeTarget.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/n4p5r9jGz-4?autoplay=1&rel=0" 
          title="Vijay &amp; Rashmika's Wedding Story" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      `;
    });
  }

  // =========================================================================
  // 8. SUBTLE SCROLL REVEAL ANIMATIONS
  // =========================================================================
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.screen-section, .timeline-event, .gallery-item').forEach(el => {
    el.classList.add('reveal-on-scroll');
    revealObserver.observe(el);
  });

});
