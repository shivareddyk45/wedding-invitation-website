/**
 * Centralized Wedding Invitation Data & Configuration
 * Single Source of Truth for:
 * - Couple details & confirmed parents
 * - Dates, times, and timezone
 * - Venue, map links, and embeds
 * - Events (enabled & placeholders)
 * - Photo gallery
 * - Bilingual translations (English & Telugu)
 * - Derived Intl formatters
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WEDDING_DATA = factory();
    // Maintain backwards compatibility for any legacy config readers
    root.WEDDING_CONFIG = root.WEDDING_DATA;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TIMEZONE = 'Asia/Kolkata';

  const venue = {
    name: 'DJ Usthav Mahal',
    area: 'Bhavanipuram',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    country: 'India',
    fullText: 'DJ Usthav Mahal, Bhavanipuram, Vijayawada',
    fullTextUppercase: 'DJ USTHAV MAHAL, BHAVANIPURAM, VIJAYAWADA',
    mapsQuery: 'DJ Usthav Mahal, Bhavanipuram, Vijayawada',
    mapsUrl: 'https://maps.google.com/?q=DJ+Usthav+Mahal,+Bhavanipuram,+Vijayawada',
    embedUrl: 'https://maps.google.com/maps?q=DJ+Usthav+Mahal,+Bhavanipuram,+Vijayawada&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=DJ+Usthav+Mahal,+Bhavanipuram,+Vijayawada'
  };

  const WEDDING_DATA = {
    meta: {
      title: 'Nageshwar Reddy & Neeraja Wedding Invitation | Thursday, 3 December 2026',
      titleTe: 'నాగేశ్వర్ రెడ్డి & నీరజ కళ్యాణ ఆహ్వాన పత్రిక | గురువారం, 3 డిసెంబర్ 2026',
      description: 'Nageshwar Reddy & Neeraja invite you to celebrate their wedding on Thursday, 3 December 2026 at DJ Usthav Mahal, Bhavanipuram, Vijayawada.',
      descriptionTe: 'నాగేశ్వర్ రెడ్డి మరియు నీరజల వివాహ మహోత్సవానికి మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము. వేదిక: డిజె ఉత్సవ్ మహల్, భవానీపురం, విజయవాడ.',
      url: 'https://wedding-invitation-website-x854.vercel.app/',
      themeColor: '#FBE9B7',
      ogImage: 'https://wedding-invitation-website-x854.vercel.app/assets/banners/og-homepage-banner.png'
    },

    couple: {
      groom: {
        firstName: 'Nageshwar Reddy',
        fullName: 'Nageshwar Reddy',
        label: {
          en: 'SON OF',
          te: 'కుమారుడు'
        },
        parents: 'Kalagotla Bramha Reddy & Vijaya',
        parentsTe: 'కళాగోట్ల బ్రహ్మారెడ్డి & విజయ',
        portrait: 'assets/images/groom-portrait.jpg'
      },
      bride: {
        firstName: 'Neeraja',
        fullName: 'Neeraja',
        label: {
          en: 'DAUGHTER OF',
          te: 'కుమార్తె'
        },
        parents: 'Yaddala Shiva Reddy & Adi Lakshmi',
        parentsTe: 'యద్దాల శివారెడ్డి & ఆదిలక్ష్మి',
        portrait: 'assets/images/bride-portrait.jpg'
      }
    },

    weddingDate: {
      dateISO: '2026-12-03',
      startISO: '2026-12-03T00:00:00+05:30',
      time: 'TODO_CONFIRM',
      timeZone: TIMEZONE
    },

    venue: venue,

    // Backward-compatible cover/hero properties for initial card templates
    cover: {
      label: 'THE WEDDING OF',
      groom: 'Nageshwar Reddy',
      bride: 'Neeraja',
      dateISO: '2026-12-03',
      venueText: venue.fullTextUppercase
    },

    hero: {
      invocationEn: '|| Shree Ganeshay Namah ||',
      invocationTe: '|| శ్రీ గణేశాయ నమః ||',
      groom: 'Nageshwar Reddy',
      bride: 'Neeraja',
      dateISO: '2026-12-03',
      venueLeadEn: 'at',
      venueLeadTe: 'వేదిక:',
      venueText: venue.fullTextUppercase,
      video: {
        mp4Mobile: 'assets/videos/hero-procession-bg-mobile.mp4',
        mp4Desktop: 'assets/videos/hero-procession-bg-v2.mp4',
        poster: 'assets/images/hero-poster.jpg'
      }
    },

    countdown: {
      targetIso: '2026-12-03T00:00:00+05:30',
      titleEn: 'OUR MUHURTHAM IN',
      titleTe: 'మా ముహూర్తం'
    },

    journey: {
      headingEn: 'The Wedding Journey',
      headingTe: 'కళ్యాణ వేడుకలు',
      sublineEn: 'Walk with us, function to function, to the sacred hour.',
      sublineTe: 'పవిత్ర ముహూర్తం వైపు మా వేడుకలలో మాతో కలిసి అడుగులు వేయండి.',
      events: [
        {
          id: 'wedding',
          title: {
            en: 'Wedding',
            te: 'కళ్యాణం'
          },
          dateISO: '2026-12-03',
          startISO: '2026-12-03T00:00:00+05:30',
          endISO: '2026-12-03T23:59:59+05:30',
          time: 'TODO_CONFIRM',
          venueRef: venue,
          icon: 'assets/images/event-saptapadi.png',
          enabled: true
        },
        // Placeholders for future functions (show only once confirmed date & time are added)
        {
          id: 'mehendi',
          title: {
            en: 'Mehendi',
            te: 'మెహందీ'
          },
          dateISO: 'TODO_CONFIRM',
          startISO: 'TODO_CONFIRM',
          endISO: 'TODO_CONFIRM',
          time: 'TODO_CONFIRM',
          venueRef: venue,
          icon: 'assets/images/event-mehendi.png',
          enabled: false
        },
        {
          id: 'haldi',
          title: {
            en: 'Haldi',
            te: 'పసుపు వేడుక'
          },
          dateISO: 'TODO_CONFIRM',
          startISO: 'TODO_CONFIRM',
          endISO: 'TODO_CONFIRM',
          time: 'TODO_CONFIRM',
          venueRef: venue,
          icon: 'assets/images/event-haldi-bowl.png',
          enabled: false
        },
        {
          id: 'sangeet',
          title: {
            en: 'Sangeet',
            te: 'సంగీత్'
          },
          dateISO: 'TODO_CONFIRM',
          startISO: 'TODO_CONFIRM',
          endISO: 'TODO_CONFIRM',
          time: 'TODO_CONFIRM',
          venueRef: venue,
          icon: 'assets/images/dholak_icon.svg',
          enabled: false
        },
        {
          id: 'reception',
          title: {
            en: 'Reception',
            te: 'వివాహ విందు'
          },
          dateISO: 'TODO_CONFIRM',
          startISO: 'TODO_CONFIRM',
          endISO: 'TODO_CONFIRM',
          time: 'TODO_CONFIRM',
          venueRef: venue,
          icon: 'assets/images/event-nadaswaram.png',
          enabled: false
        }
      ]
    },

    gallery: {
      headingEn: 'Before the Vows',
      headingTe: 'వివాహానికి ముందు',
      sublineEn: 'Little moments from the years that brought us here.',
      sublineTe: 'మా ప్రయాణంలోని అందమైన మధుర జ్ఞాపకాలు.',
      photos: [
        { src: 'assets/images/gallery-01.jpg', alt: 'Wedding floral mandap celebration', captionEn: 'Sacred Floral Mandap', captionTe: 'కళ్యాణ మండపం', feature: true },
        { src: 'assets/images/gallery-02.jpg', alt: 'Traditional saree celebration walk', captionEn: 'Ceremonial Walk', captionTe: 'సంప్రదాయ నడక' },
        { src: 'assets/images/gallery-03.jpg', alt: 'Celebration smiles and laughter', captionEn: 'Smiles & Festivity', captionTe: 'చిరునవ్వులు, వేడుకలు' },
        { src: 'assets/images/gallery-04.jpg', alt: 'Evening reception gala moments', captionEn: 'Evening Gala', captionTe: 'సంధ్యా వేడుక' },
        { src: 'assets/images/gallery-05.jpg', alt: 'Candid warm portraits', captionEn: 'Candid Radiance', captionTe: 'మధుర క్షణాలు' },
        { src: 'assets/images/gallery-06.jpg', alt: 'Traditional musical sangeet celebration', captionEn: 'Celebration Beats', captionTe: 'సంగీత వేడుక' },
        { src: 'assets/images/gallery-07.jpg', alt: 'Sacred garland exchange ritual', captionEn: 'Garland Exchange', captionTe: 'వరమాల మహోత్సవం' },
        { src: 'assets/images/gallery-08.jpg', alt: 'Traditional festive blessings', captionEn: 'Cherished Blessings', captionTe: 'ఆశీర్వాదాలు' },
        { src: 'assets/images/gallery-09.jpg', alt: 'Joyful candid together moment', captionEn: 'Together in Joy', captionTe: 'ఆనంద క్షణాలు' },
        { src: 'assets/images/gallery-10.jpg', alt: 'Serene sunset celebration', captionEn: 'Serene Reflections', captionTe: 'ప్రశాంత సంధ్య', feature: true }
      ]
    },

    audio: {
      src: 'assets/audio/wedding_music.m4a',
      fadeInDurationMs: 1500
    },

    share: {
      title: 'Wedding Invitation of Nageshwar Reddy & Neeraja',
      text: 'Nageshwar Reddy & Neeraja invite you to celebrate their wedding on Thursday, 3 December 2026 at DJ Usthav Mahal, Bhavanipuram, Vijayawada. Please join us and shower your blessings!',
      textTe: 'నాగేశ్వర్ రెడ్డి మరియు నీరజల వివాహ మహోత్సవానికి మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము. వేదిక: డిజె ఉత్సవ్ మహల్, భవానీపురం, విజయవాడ. మీ ఆశీస్సులు అందించండి!',
      url: 'https://wedding-invitation-website-x854.vercel.app/'
    },

    i18n: {
      en: {
        openInvitation: 'OPEN INVITATION',
        dearGuest: 'Dear',
        theWeddingOf: 'THE WEDDING OF',
        viewMap: 'VIEW MAP',
        openInGoogleMaps: 'Open in Google Maps',
        getDirections: 'Get Directions',
        close: 'Close',
        ceremonyVenue: 'Ceremony Venue',
        addToCalendar: 'Add to Calendar',
        shareInvitation: 'Share Invitation',
        soundtrack: 'Wedding Soundtrack',
        muteSoundtrack: 'Mute Soundtrack',
        playSoundtrack: 'Play Soundtrack',
        countdownDays: 'DAYS',
        countdownHours: 'HOURS',
        countdownMinutes: 'MINUTES',
        countdownSeconds: 'SECONDS',
        countdownToday: 'Today is the day! We celebrate with love and gratitude.',
        countdownPast: 'Thank you for celebrating with us and sharing your blessings.',
        footerGreetingLead: 'We await your gracious presence',
        footerGreetingMain: 'and your blessings',
        footerFamilyLead: 'With Love & Regards,',
        footerFamilyNames: 'Kalagotla Family',
        skipLink: 'Skip to invitation content',
        calModalTitle: 'Add to your calendar',
        calAppleOutlook: 'Apple Calendar / Outlook',
        calAppleOutlookSub: 'Includes a reminder 1 day before',
        calAppleOutlookBell: 'Reminder 1 day before is included',
        calGoogle: 'Google Calendar',
        calGoogleSub: 'Opens Google Calendar with the event filled in',
        calGoogleTip: 'Tip: after saving, open the event and tap \u2018Add notification\u2019 to set a reminder 1 day before.',
        calRecommended: 'Recommended',
        calPlatformHintIOS: 'Tap \u2018Add to Calendar\u2019 on the next screen. The reminder is already included.',
        calPlatformHintAndroid: 'Google Calendar is recommended. Add the notification after saving to get a reminder.',
        calPlatformHintDesktop: 'Use Google Calendar, or download the file and open it in Outlook\u202fand Apple Calendar for the built-in reminder.',
        calInAppNotice: 'Open this invitation in your phone\u2019s browser (\u22ee menu \u203a Open in browser) to use the option with the reminder.',
        calCopyLink: 'Copy Link',
        calLinkCopied: 'Link copied!',
        calOpeningIcs: 'Opening your calendar\u2026 A reminder 1 day before is included.',
        calOpeningGoogle: 'Opening Google Calendar\u2026 Don\u2019t forget to add a reminder.'
      },
      te: {
        openInvitation: 'ఆహ్వానం తెరవండి',
        dearGuest: 'ప్రియమైన',
        theWeddingOf: 'వివాహ ఆహ్వానం',
        viewMap: 'మ్యాప్ చూడండి',
        openInGoogleMaps: 'గూగుల్ మ్యాప్స్‌లో తెరవండి',
        getDirections: 'రూట్ మ్యాప్',
        close: 'మూసివేయి',
        ceremonyVenue: 'కళ్యాణ వేదిక',
        addToCalendar: 'క్యాలెండర్‌కు జోడించండి',
        shareInvitation: 'ఆహ్వానాన్ని షేర్ చేయండి',
        soundtrack: 'సంగీతం',
        muteSoundtrack: 'సంగీతం ఆపండి',
        playSoundtrack: 'సంగీతం ప్రారంభించండి',
        countdownDays: 'రోజులు',
        countdownHours: 'గంటలు',
        countdownMinutes: 'నిమిషాలు',
        countdownSeconds: 'సెకన్లు',
        countdownToday: 'ఈ రోజే శుభదినం! మీ ఆశీస్సులు మాకు అందించండి.',
        countdownPast: 'మాతో వేడుక జరుపుకున్నందుకు మీ అందరికీ హృదయపూర్వక ధన్యవాదాలు.',
        footerGreetingLead: 'మీ రాక మాకెంతో సంతోషం',
        footerGreetingMain: 'మీ ఆశీస్సులే మాకు రక్ష',
        footerFamilyLead: 'ప్రేమతో & గౌరవంతో,',
        footerFamilyNames: 'కళాగోట్ల కుటుంబం',
        skipLink: 'ముఖ్య విషయాలకు వెళ్లండి',
        calModalTitle: 'మీ క్యాలెండర్‌కు జోడించండి',
        calAppleOutlook: 'ఆపిల్ క్యాలెండర్ / ఔట్లుక్',
        calAppleOutlookSub: '1 రోజు ముందు రిమైండర్ ఉంటుంది',
        calAppleOutlookBell: '1 రోజు ముందు రిమైండర్ చేర్చబడింది',
        calGoogle: 'గూగుల్ క్యాలెండర్',
        calGoogleSub: 'ఈవెంట్ వివరాలతో గూగుల్ క్యాలెండర్ తెరవబడుతుంది',
        calGoogleTip: 'సూచన: సేవ్ చేసిన తర్వాత, ఈవెంట్ తెరిచి \u2018నోటిఫికేషన్ జోడించు\u2019 నొక్కి 1 రోజు ముందు రిమైండర్ సెట్ చేయండి.',
        calRecommended: 'సిఫార్సు చేయబడింది',
        calPlatformHintIOS: '\u2018క్యాలెండర్‌కు జోడించు\u2019 నొక్కండి. రిమైండర్ ఇప్పటికే చేర్చబడింది.',
        calPlatformHintAndroid: 'గూగుల్ క్యాలెండర్ సిఫార్సు చేయబడింది. రిమైండర్ కోసం సేవ్ చేసిన తర్వాత నోటిఫికేషన్ జోడించండి.',
        calPlatformHintDesktop: 'గూగుల్ క్యాలెండర్ ఉపయోగించండి, లేదా ఫైల్ డౌన్‌లోడ్ చేసి Outlook లేదా Apple Calendarలో తెరవండి.',
        calInAppNotice: 'రిమైండర్ ఎంపిక ఉపయోగించడానికి మీ ఫోన్ బ్రౌజర్‌లో తెరవండి (\u22ee మెనూ \u203a బ్రౌజర్‌లో తెరవు).',
        calCopyLink: 'లింక్ కాపీ చేయండి',
        calLinkCopied: 'లింక్ కాపీ చేయబడింది!',
        calOpeningIcs: 'మీ క్యాలెండర్ తెరవబడుతోంది\u2026 1 రోజు ముందు రిమైండర్ చేర్చబడింది.',
        calOpeningGoogle: 'గూగుల్ క్యాలెండర్ తెరవబడుతోంది\u2026 రిమైండర్ జోడించడం మర్చిపోవద్దు.'
      }
    },

    // Date & Time Utility Methods
    formatDate: function (isoString, lang = 'en') {
      if (!isoString || isoString === 'TODO_CONFIRM') return '';
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';

      if (lang === 'te') {
        const weekday = new Intl.DateTimeFormat('te-IN', { timeZone: TIMEZONE, weekday: 'long' }).format(date);
        const day = new Intl.DateTimeFormat('te-IN', { timeZone: TIMEZONE, day: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('te-IN', { timeZone: TIMEZONE, month: 'long' }).format(date);
        const year = new Intl.DateTimeFormat('te-IN', { timeZone: TIMEZONE, year: 'numeric' }).format(date);
        return `${weekday}, ${day} ${month} ${year}`;
      }

      const weekday = new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, weekday: 'long' }).format(date);
      const day = new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, day: 'numeric' }).format(date);
      const month = new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, month: 'long' }).format(date);
      const year = new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, year: 'numeric' }).format(date);
      return `${weekday}, ${month} ${day}, ${year}`;
    },

    formatDateUppercase: function (isoString, lang = 'en') {
      const formatted = this.formatDate(isoString, lang);
      return formatted ? formatted.toUpperCase() : '';
    },

    getConfirmedCountdownTarget: function () {
      if (this.weddingDate.time === 'TODO_CONFIRM') {
        console.warn('[WEDDING_DATA] Wedding start time is TODO_CONFIRM. Using 00:00:00 IST on 3 Dec 2026 as countdown target.');
        return new Date('2026-12-03T00:00:00+05:30').getTime();
      }
      return new Date(this.weddingDate.startISO).getTime();
    },

    getEnabledEvents: function () {
      return this.journey.events.filter(function (e) {
        return e.enabled === true;
      });
    }
  };

  return WEDDING_DATA;
});
