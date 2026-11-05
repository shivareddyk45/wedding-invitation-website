# Vijay & Rashmika - Traditional Wedding Invitation Website

A faithful replication of the traditional South Indian wedding invitation website for **Vijay & Rashmika**, recreated from the official reference video.

## Features

- **Traditional Aesthetic**: Warm antique parchment ivory (`#FFF1CD`), deep royal maroon (`#873A35`), and antique gold accents (`#C89B43`).
- **Authentic Artwork**:
  - Sri Sita Rama Kalyanam & South Indian temple Gopuram.
  - Royal court durbar with caparisoned elephants with raised trunks.
  - Carved stone temple architectural facade.
  - Traditional Indian peacocks perched on scalloped jharokha arches.
  - Fresh mango leaf torans and hanging marigold & lotus garlands.
- **Interactive Elements**:
  - **Hero Screen**: Opening invitation with smooth reveal CTA (`OPEN INVITATION`).
  - **Live Muhurtham Countdown**: Days, Hours, Minutes, and Seconds countdown to 26 October 2026.
  - **The Wedding Journey**: S-curved red bride *alta* (Lakshmi pada) footsteps connecting ceremony milestones with interactive **View Map** modals.
  - **Photo Gallery ("Before the Vows")**: Multi-image grid layout with full-screen lightbox modal.
  - **RSVP Form**: Interactive attendance choice, guest counter stepper, and traditional blessings confirmation dialog.
  - **Our Story**: Manyavar wedding film player with custom poster thumbnail and YouTube embed.
  - **Floating Soundtrack Player**: Circular gold dholak drum toggle button playing the authentic wedding soundtrack.

## Project Structure

```
├── index.html                   # Core semantic HTML layout
├── style.css                    # Traditional South Indian styling & animations
├── script.js                    # Countdown, music player, lightbox, RSVP logic
├── README.md                    # Documentation
└── assets/
    ├── audio/
    │   └── wedding_music.m4a    # Wedding soundtrack
    └── images/                  # High-quality illustrations, photos & SVGs
```

## How to Run

Simply open `index.html` in any modern web browser or serve locally:

```bash
# Using Python
python3 -m http.server 8000

# Or using Node.js npx serve
npx serve .
```
