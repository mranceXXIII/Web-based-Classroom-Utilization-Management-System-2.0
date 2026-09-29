# DESIGN: UI Standards & Design System

> **Purpose:** Document the visual identity, design tokens, and component styling rules for this project. Tier-3 template, filled in for this project from the RSU brand revision of 2026-09-29.

_Last updated: September 29, 2026_

---

## 1. Brand Source & Visual Identity

The UI follows the Romblon State University brand (rsu.edu.ph, "The Green University") and the official RSU seal shipped in this repository (`rsuLogo.png`):

- **Primary brand color:** seal ring green `#3D9B8A` (derived from the official RSU seal artwork shipped in the repo).
- **Secondary accent:** seal gold `#EDC94F` (the gear teeth in the seal).
- **University tagline:** "The Green University" (rsu.edu.ph). The Cajidiocan campus motto "Serving with Honor and Excellence!" stays in the footer.
- **Founding year:** Est. 1915 (shown on the seal and on rsu.edu.ph).

---

## 2. Design Tokens

| Token | Value | Use |
| :--- | :--- | :--- |
| rsu-green | `#3D9B8A` | Primary buttons, banner bar, radio accents |
| rsu-green-dark | `#2E7A6C` | Button hover, footer bar, title system bar |
| rsu-green-deep | `#1F5A50` | Headings, inline h2 colors, link accents |
| rsu-gold | `#EDC94F` | Secondary buttons (Create Account), tagline text |
| rsu-gold-dark | `#D4B13A` | Secondary button hover |
| tint | `#EAF4F1` | Page background (replaces the pink gradient) |
| surface | `#FFFFFF`, cards use `rgba(255, 255, 255, 0.92)` | Card surfaces |
| ink | `#15241F` | Text on gold surfaces |
| input-border | `#9FC9BC` | Input and select borders |
| shadow | `0 4px 14px rgba(21, 36, 31, 0.18)` | Card shadows |

---

## 3. Typography

- **Font family:** Poppins, sans-serif. Loaded once in `rsuHeader.php` through Google Fonts (weights 300 to 700) and in `facultyRegister.php`. Poppins was already in use in the Admin module, so no new library enters the stack.
- **Scale:** banner h1 at 2.4vw (5vw under 600px viewports), card headings inherit the h2 defaults, form labels inherit.

---

## 4. Component Styling Rules

- **Cards:** white surface, 8px radius, 6px solid rsu-green top border, soft shadow. Apply to login containers and registration forms.
- **Primary buttons (Login, Register, Submit):** rsu-green background, white text, 6px radius, rsu-green-dark on hover.
- **Secondary buttons (Create Account, Back):** gold background with ink text on login pages, or tint background with rsu-green-deep text and a 1px rsu-green border on registration pages.
- **Inputs and selects:** 1.5px solid input-border, 8 to 10px radius, rsu-green border color on focus with `outline: none`.
- **Banners:** rsu-green background with white text. The RSU seal image sits on a white circular backdrop. The tagline renders in rsu-gold and hides under 600px viewports.
- **Status badges (dashboards):** keep the existing red, green, and blue status colors. They encode room state, not brand.

---

## 5. Accessibility & Constraints

- The Student radio input now uses a `<label for="studRadio">` element (accessibility fix from the revision).
- Keep `accent-color` for radios and checkboxes.
- Do not introduce a CSS build pipeline or a framework migration inside small fixes (per `context/RULES.md`). Pages keep inline `<style>` blocks and CDN Bootstrap and jQuery.