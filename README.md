# Nageshwar Reddy & Neeraja - Traditional Wedding Invitation Website

A traditional South Indian wedding invitation website for **Nageshwar Reddy & Neeraja**, celebrating their wedding on **Thursday, 3 December 2026** at **DJ Usthav Mahal, Bhavanipuram, Vijayawada**.

## Features

- **Traditional Aesthetic**: Warm antique parchment ivory (`#FFF1CD`), deep royal maroon (`#873A35`), and antique gold accents (`#C89B43`).
- **Authentic Sacred Artwork**:
  - Traditional gold line-art Lord Vinayaka (Ganesha) seated on a sacred lotus.
  - Sri Sita Rama Kalyanam & South Indian temple Gopuram.
  - Royal court durbar with caparisoned elephants with raised trunks.
  - Carved stone temple architectural facade.
  - Traditional Indian peacocks perched on scalloped jharokha arches.
  - Fresh mango leaf torans and hanging marigold & lotus garlands.
- **Interactive Elements**:
  - **Hero Screen**: Opening ceremonial invitation with smooth reveal CTA (`OPEN INVITATION`).
  - **Live Muhurtham Countdown**: Dynamic countdown to Thursday, 3 December 2026 (IST).
  - **The Wedding Journey**: Scroll-driven walking footsteps connecting ceremony milestones with interactive **View Map** modals.
  - **Photo Gallery ("Before the Vows")**: Responsive grid layout with accessible full-screen lightbox modal.
  - **Add to Calendar & Share**: Client-side `.ics` generator, Google Calendar links, and native Web Share API with WhatsApp fallback.
  - **Bilingual Support (EN / తెలుగు)**: Seamless language switcher supporting English and Telugu.
  - **Floating Soundtrack Player**: Accessible music toggle playing the authentic wedding soundtrack.

## Project Structure

```
├── index.html                   # Core semantic HTML layout
├── style.css                    # Traditional South Indian styling & responsive layout
├── script.js                    # Interaction engine (journey walk, audio, calendar, lightbox, share)
├── src/data/wedding.js          # Centralized wedding data and content configuration
├── README.md                    # Documentation
└── assets/
    ├── audio/                   # Wedding soundtrack
    ├── banners/                 # High-resolution entry and footer cards
    └── images/                  # Authentic illustrations, photos & SVGs
```

## How to Run

Open `index.html` in any modern web browser or serve locally:

```bash
# Using Python
python3 -m http.server 8000
```
