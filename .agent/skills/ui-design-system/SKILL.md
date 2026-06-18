---
name: ui-design-system
description: Applies the design system guidelines including colors, typography, spacing, grid, borders, and shadows.
---

### Functional Colors

* **Blue (#025ECC) — Primary**
  * Usage: Buttons, links, active states, input focus, and selections.
  * Examples: "Submit application", "Create method", active menu items.

* **Dark Green (#014E2A) — Secondary**
  * Usage: Headers, institutional elements, charts, and KPIs.
  * Examples: Sidebar, logo, progress bars.

* **Light Green (#A3ED40) — Success**
  * Usage: Approvals, validated methods, and positive indicators.
  * Examples: "Validated" badge, completed status.
  * Restriction: Do not use as interface base color.

* **Yellow (#D9AE21) — Warning**
  * Usage: Pending reviews, alerts, and notices.
  * Examples: "Awaiting review", "Documentation required".

* **Red (#DB3016) — Error**
  * Usage: Rejections, errors, and destructive actions.
  * Examples: "Delete method", validation failure.

* **Grays — Neutrals**
  * Usage: Backgrounds, dividers, borders, text, icons, and inputs.
  * Tokens: 
    * Gray 50: `#FAFAFA`
    * Gray 100: `#F5F5F5`
    * Gray 200: `#EFEFEF`
    * Gray 300: `#D9D9D9`
    * Gray 500: `#6B7280`
    * Gray 700: `#374151`
    * Gray 900: `#111827`

### Spacing Scale

* Rule: Use multiples of 8px.
* Conversion:
  * 1 = 8px
  * 2 = 16px
  * 3 = 24px
  * 4 = 32px
  * 5 = 40px
  * 6 = 48px
  * 8 = 64px
  * 10 = 80px
  * 12 = 96px
* Applications:
  * Card padding: 24px
  * Space between cards: 24px
  * Space between sections: 48px
  * Space between title and content: 16px

### Desktop Grid

* Columns: 12
* Max-width: 1440px
* Gutter: 24px
* Margin: 32px

### Border Radius

* Inputs: 12px
* Buttons: 12px
* Cards: 20px
* Modals: 24px
* Restriction: Do not use 2px or 4px.

### Box Shadows

* Shadow 1: `box-shadow: 0 2px 8px rgba(0,0,0,.05);`
* Shadow 2: `box-shadow: 0 8px 24px rgba(0,0,0,.08);`

### Typography Hierarchy

* Fonts: Barlow (Titles), Lexend (Interface and content blocks).
* Scale (Size | Weight):
  * H1: 40px | 700
  * H2: 32px | 700
  * H3: 24px | 600
  * H4: 20px | 600
  * Body: 16px | 400
  * Small: 14px | 400
  * Labels: 12px | 500

### Design Direction

* Focus: Clarity, traceability, and trust.
* Use: Functional colors.
* Structure: Whitespace, defined cards, and typographic hierarchy.
* Alignment: Management, monitoring, and validation platforms.