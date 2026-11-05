/**
 * Wedding Invitation Configuration File
 * Easily re-theme or customize for any wedding couple.
 */
window.WEDDING_CONFIG = {
  couple: {
    groom: {
      firstName: "Vijay",
      fullName: "Vijay Deverakonda",
      label: "SON OF",
      parents: "Deverakonda Govardhan Rao & Deverakonda Madhavi",
      portrait: "assets/images/vijay-groom-portrait-618dff4e0d.jpg"
    },
    bride: {
      firstName: "Rashmika",
      fullName: "Rashmika Mandanna",
      label: "DAUGHTER OF",
      parents: "Madan Mandanna & Suman Mandanna",
      portrait: "assets/images/rashmika-bride-portrait-c4cc91ddfb.jpg"
    }
  },
  cover: {
    label: "THE WEDDING OF",
    dateText: "26 OCTOBER 2026",
    venueText: "ITC MEMENTOS, UDAIPUR, RAJASTHAN, INDIA"
  },
  hero: {
    invocation: "|| Shree Ganeshay Namah ||",
    dateText: "Monday, October 26, 2026",
    venueLead: "at",
    venueText: "ITC MEMENTOS, UDAIPUR, RAJASTHAN, INDIA",
    video: {
      mp4Mobile: "assets/videos/hero-procession-bg-mobile.mp4",
      mp4Desktop: "assets/videos/hero-procession-bg-v2.mp4",
      poster: "assets/images/hero-poster.jpg"
    }
  },
  countdown: {
    title: "OUR MUHURTHAM IN",
    targetIso: "2026-10-26T10:00:00+05:30",
    completedMessage: "The sacred hour has arrived"
  },
  journey: {
    heading: "The Wedding Journey",
    subline: "Walk with us, function to function, to the sacred hour.",
    events: [
      {
        id: "mehendi",
        name: "Mehendi",
        date: "24th February 2026",
        time: "5:00 PM onwards",
        venue: "ITC Mementos, Udaipur",
        icon: "assets/images/event-mehendi.png",
        side: "left",
        mapQuery: "ITC Mementos, Udaipur, Rajasthan"
      },
      {
        id: "haldi",
        name: "Haldi & Sangeet",
        date: "25th February 2026",
        time: "10:48 AM",
        venue: "ITC Mementos, Udaipur",
        icon: "assets/images/event-haldi-bowl.png",
        side: "right",
        mapQuery: "ITC Mementos, Udaipur, Rajasthan"
      },
      {
        id: "telugu-wedding",
        name: "Telugu Wedding",
        date: "26th February 2026",
        time: "10:00 AM onwards",
        venue: "ITC Mementos, Udaipur",
        icon: "assets/images/event-nadaswaram.png",
        side: "left",
        mapQuery: "ITC Mementos, Udaipur, Rajasthan"
      },
      {
        id: "kodava-ceremony",
        name: "Kodava Ceremony",
        date: "26th February 2026",
        time: "Evening · 6:30 PM onwards",
        venue: "ITC Mementos, Udaipur",
        icon: "assets/images/icon_kodava_ceremony.png",
        side: "right",
        mapQuery: "ITC Mementos, Udaipur, Rajasthan"
      }
    ]
  },
  gallery: {
    heading: "Before the Vows",
    subline: "Little moments from the years that brought us here.",
    photos: [
      {
        src: "assets/images/gallery-photo-01-a7bbd013fb-22.jpeg",
        alt: "Vijay and Rashmika Wedding Floral Mandap",
        feature: true
      },
      {
        src: "assets/images/gallery-photo-02-20d69634d1-29.jpeg",
        alt: "Traditional Red Saree Walk"
      },
      {
        src: "assets/images/gallery-photo-03-1ea95d2922-23-1.jpeg",
        alt: "Laughter and Festivity"
      },
      {
        src: "assets/images/gallery-photo-04-a509bf14e8-F-1.jpg",
        alt: "Starry Gala Reception Dance"
      },
      {
        src: "assets/images/gallery-photo-05-10630c5a75-25-1.jpeg",
        alt: "Pastel Candid Smiles"
      },
      {
        src: "assets/images/gallery-photo-06-fdbc188766-34.jpeg",
        alt: "Sangeet Performance"
      },
      {
        src: "assets/images/gallery-photo-07-f42440eb83-27.jpeg",
        alt: "Varmala Garland Exchange"
      },
      {
        src: "assets/images/gallery-photo-08-83ace83b69-26.jpeg",
        alt: "Cherished Celebration Moment"
      },
      {
        src: "assets/images/gallery-photo-09-938d8ff3f5-WhatsApp-Image.jpeg",
        alt: "Joyful Candid Together"
      },
      {
        src: "assets/images/gallery-photo-10-88632f61b3-31.jpeg",
        alt: "Romantic Boat Ride on Udaipur Lake",
        feature: true
      }
    ]
  },
  rsvp: {
    heading: "Bless Us With Your Presence",
    subline: "Let us know if you can join us, so we may keep a place for you.",
    options: [
      {
        id: "attending",
        text: "With joy, we will be there",
        confirmation: "Thank you! We'll joyfully keep a place for you."
      },
      {
        id: "regret",
        text: "With regret, we cannot",
        confirmation: "Thank you for letting us know. You will be dearly missed."
      }
    ]
  },
  story: {
    heading: "OUR STORY",
    youtubeId: "xJKwD24GJtw",
    poster: "assets/images/youtube-video-thumb-maxres.jpg"
  },
  footer: {
    lead: "We await your gracious presence",
    main: "and your blessings",
    blessingTelugu: "శుభమస్తు",
    creditLead: "This invitation was crafted on MyShaadhi Link",
    creditLink: "Need one for your wedding? Click here",
    creditUrl: "https://myshaadhilink.in"
  },
  order: {
    price: "₹3,999",
    label: "ORDER NOW",
    url: "https://myshaadhilink.in"
  },
  audio: {
    src: "assets/videos/wedding-invitation-soundtrack-ybhogam-lyrical.mp3",
    fadeInDurationMs: 1500
  }
};
