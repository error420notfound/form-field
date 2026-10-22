# form+field — Ecommerce Design Direction

> Familiar desires, made tangible. An expressive catalogue of objects, with room to understand each one.

Version: 1.0 · 22 October 2026  
Status: Design specification for local implementation and iteration.  
Working brand: **form+field**. Preserve this spelling and casing.  
Scope: Homepage, object index, product stories, purchasing UI, cart, checkout appearance, support, responsive behaviour, tokens, imagery, iconography, and motion.

## 1. Authority and decision status

This document translates the owner's brief into a coherent storefront system. It is a design specification, not evidence that the frontend, CMS, payments, stock control, or product features have been implemented.

**Confirmed by the owner:** story-led product presentation; catalogue homepage inspired by the browsing structure of apple.com; 4–10 products; quiet and observational writing; bold typography and energetic motion; Faculty Glyphic as the main expressive typeface; Geist for other text; Geist Mono and Pixel where useful; rounded Keyline duotone icons; neutral brand palette; Chroma colours within product stories; product pages whose entire interface adopts their theme; shadcn/ui for the frontend; public-domain or appropriately licensed placeholder images; a faint but readable “Designed by HS108 in India.” credit.

**Proposed defaults in this document:** exact type sizes, spacing, radii, navigation labels, component recipes, animation timings, theme boundaries, and content structures. These give implementation a consistent starting point and may be refined through rendered review.

**Still unspecified:** final product names except PourFrame, prices, specifications, stock model, fulfilment times, shipping regions, returns terms, final product imagery, and final colour assignments. Keep these as explicit draft data. Never manufacture business facts to complete a layout.

When instructions conflict, follow the owner's latest explicit decision, then this document's confirmed decisions, then proposed defaults. Upstream component defaults do not override the visual direction.

## 2. Purpose and character

form+field makes objects that respond to an already familiar desire: a small irritation resolved, an interaction made more natural, or a capability that feels overdue. The store should help people recognise that desire and understand the resulting object.

The catalogue includes lighting, a macro keypad, a thermal printer, PourFrame, and related physical or electronic designs. Their relationship comes from the care of the decisions behind them, rather than a single product category.

The first encounter should answer: what is this object, where does it fit in daily life, and why might I want to look closer? The product page then earns the detail.

The character is expressive, precise, tactile, curious, and technically credible. Large typography and decisive motion provide energy. Warm surfaces, quiet prose, and generous space provide composure. Avoid importing SaaS sales patterns simply because the expression has some technology-startup energy.

### Reference synthesis

| Reference | Retain | Translate for form+field |
|---|---|---|
| Aplós / DESIGN.md | Restraint, tonal layering, deliberate spacing | Give objects and their materials room; use Faculty Glyphic for our own identity |
| AYOCIN / DESIGN-2.md | Sculptural product staging, scale contrast, sparse annotation | Let product stories alternate atmosphere, action, and precise explanation |
| Wise / DESIGN-3.md | Graphic confidence, strong scale changes, distinct colour environments | Use colour as a product's environment; keep the shared catalogue neutral |
| Apple homepage, as requested | A browsable sequence of substantial product features and paired modules | Make several objects immediately discoverable and link each to its story |

References inform principles and page structure. Do not reproduce another brand's assets, wording, fixed measurements, or distinctive page composition.

## 3. Experience architecture

### Global shell

Proposed navigation: **Objects · About · Support · Bag**. Use the wordmark as the home link. “Objects” opens the complete index. Omit search and filtering until the assortment creates a real need; ten products can remain directly browsable.

Desktop header: 64px high, sticky, opaque theme surface, fine bottom rule. Mobile: 56px high, wordmark, Bag, and a labelled menu control. The mobile menu opens only on request. Keep a skip link and clear focus indication. Do not hide the header in response to scroll in the first implementation.

The HS108 credit belongs in the footer and optionally beside an About-page colophon. Set it in Geist at 12–13px with accessible secondary contrast. “Faint” means low emphasis, not unreadable opacity. Do not turn it into an endorsement or certification badge.

### Homepage: catalogue with editorial weight

| Sequence | Composition | Content and action |
|---|---|---|
| Header | Neutral shared shell | Brand, navigation, Bag |
| Lead object | Broad product stage, generous headline, clear object identity | Product name, short plain description, image, “Explore [product]” |
| Second object | Another substantial feature with a different composition | Product name and a distinct reason to consider it |
| Paired objects | Two equal-width modules on desktop; stacked on mobile | One object per module, concise copy, visible story link |
| Remaining catalogue | Further paired or broad features as appropriate for 4–10 objects | Give every published object an obvious route to its page |
| Small brand note | One short paragraph; quieter than the products | Explain what connects the collection; link to About |
| Footer | Navigation, support and policy links, HS108 credit | Practical destinations, understated brand presence |

Lead with an actual object rather than an abstract manifesto. A product name alone needs a plain category descriptor when the name is unfamiliar. Do not hide the assortment in a rotating hero. Use independently browsable sections, not a mandatory cinematic sequence.

Use two broad features followed by paired modules as a starting composition, not an inflexible requirement. For four products, one broad lead followed by a pair and one broad closing feature may be better. Editorial priority sets the sequence; it must not imply unverified sales popularity.

The homepage shell and editorial panel surfaces remain mineral ivory / neutral. Additional Chroma hues belong to a product's story or its contained story preview. A contained colour stage must not recolour the homepage header or unrelated objects. Real product colours can naturally appear in imagery.

The primary action is the product-story link. A secondary “Choose options” link may jump to the purchase section of that product page when purchasing is available. No unsolicited newsletter modals, discount overlays, countdowns, exit prompts, or autoplay hero carousels.

### Objects index

Provide a compact alternative to the homepage: every object, its image, name, plain descriptor, and real price / availability when supplied. Use a 2–3 column desktop grid and a 1–2 column mobile layout depending on readable content width. This is a useful navigation surface alongside the editorial homepage. Do not invent categories to populate filters.

### Product story

| Chapter | Visitor's question | Required treatment |
|---|---|---|
| Introduction | What is it? | Name, category, concise description, product stage, visible purchase route |
| Observation | What familiar situation led to it? | A short, concrete observation; avoid exaggerated problem statements |
| Response | What does the object change? | Show a real interaction or mechanism, supported by brief copy |
| Details | Why these decisions? | Close-ups, materials, controls, proportions, and verifiable design reasoning |
| In use | How does it fit into my life? | Context, dimensions, handling, workflow, compatibility where relevant |
| Practical facts | What must I know? | Specifications, limitations, included items, power / connectivity / care as applicable |
| Purchase | What am I choosing and paying? | Options, price, availability, delivery and returns information, action |
| Related object | What else is relevant? | At most two genuinely related objects with clear links |

Adapt chapters to the product. A floor lamp may need light distribution and room scale; a keypad may need control mapping and connectivity. These are content prompts, not asserted features. A short story with strong evidence is preferable to padded sections.

Show real starting price and availability near the introduction when available. Keep the primary purchase route accessible without reading every chapter. A compact product bar can offer Overview, Details, Specifications, and Choose options; on narrow screens simplify to name + action. Anchor destinations must account for both sticky bars.

### About and support

About explains the approach through observations and real examples. Keep studio information subordinate to form+field. Support provides product-specific guides, setup, care, downloads where supplied, contact information, and clear policy links. Never fabricate service promises or unsupported downloads.

## 4. Voice and writing

Write quietly and observationally. Notice the behaviour, then explain the decision. Use concrete nouns, short sentences, and the amount of detail the object deserves. Product names and descriptive headlines can be expressive; instructions and purchasing labels must be literal.

Illustrative voice samples, requiring product validation before publication:

- “Some actions deserve a key of their own.”
- “Light, where the evening settles.”
- “A thought can leave the screen.”

These are draft editorial lines, not final product claims. Pair poetic wording with a plain object description. Do not attribute a quote to Naoto Fukasawa or imply that he endorses the work. His relevance in the brief is an influence on the design outlook.

Avoid superlatives, startup hype, fabricated metrics, invented testimonials, false scarcity, and assertions that nobody else has considered a similar idea. Explain the actual design decision rather than declaring the object revolutionary.

Use descriptive actions: “Explore PourFrame”, “View specifications”, “Choose options”, “Add to bag”, “Continue to checkout”. Use one consistent term, **Bag**, throughout the public interface. A developer may use cart terminology internally.

## 5. Colour foundations

### Default brand palette

| Foundation | Value | Role |
|---|---|---|
| Mineral ivory | `#EAE7DF` | Default page canvas |
| Soft paper | `#F5F2EC` | Raised or contained neutral surfaces; proposed supporting colour |
| Near-black | `#242421` | Main text, strong rules, default primary button |
| Industrial grey | `#65645E` | Secondary copy on ivory; proposed supporting colour |
| Vermilion | `#E34727` | Brand punctuation, large graphic detail, selected decorative emphasis |
| Fine rule | `#C8C4BA` | Decorative separators; proposed supporting colour |

Calculated sRGB contrast examples: near-black on ivory approximately 12.59:1; industrial grey on ivory 4.80:1; vermilion on ivory 3.27:1. Vermilion against near-black is approximately 3.85:1 and white against vermilion 4.04:1. Consequently, the base vermilion must not be the default fill behind small button text or the default colour of small text on ivory. Use the near-black / ivory primary button pair. Test every product theme independently.

Fine rules are decorative. Inputs and essential control boundaries need a stronger token with sufficient contrast against the surrounding surface. Never assume a decorative border token is suitable for a field boundary.

### Colour hierarchy

Foundation values → semantic roles → component variants → states. Components consume roles such as background, foreground, primary, border, and ring. They do not directly import a particular hue JSON or scatter literal hex values through markup.

A colour can be a large storytelling field without being a safe text or button colour. Brand accents, product accents, and error / success signals have distinct jobs. A blue product theme must not make every blue element informational; a red product theme must not make all red surfaces appear erroneous.

## 6. Chroma and product themes

Source: [chroma-catalogue](https://github.com/error420notfound/chroma-catalogue). Inspected snapshot: `c38bfa6b311a95788fb2f39bafb71323885a3010`.

Verified structure: `data/scales/`, `data/engineered/`, `data/index.json`, and TypeScript types under `src/types/`. `ColorValue` contains required hex and OKLCH values plus optional Display-P3. Scales contain steps 50, 100–900, and 950. Engineered hues can optionally reference a related scale. No product-to-palette assignment is implied by the catalogue.

Verified candidate entries, offered as palette material rather than final assignments:

| Catalogue ID | File | Stored hex |
|---|---|---|
| `engineered-diode-blue` | `data/engineered/diode-blue.json` | `#006CFF` |
| `engineered-acid-yellow` | `data/engineered/acid-yellow.json` | `#DFFF00` |
| `engineered-international-orange` | `data/engineered/international-orange.json` | `#FF4F00` |

Begin with the stored sRGB hex as the deterministic visual baseline. Before using alternative OKLCH or P3 representations, validate that they reproduce the intended colour and contrast; stored parallel representations are not a guarantee of equivalence. A catalogue `textColor: "auto"` setting is an instruction to calculate a foreground, not an accessibility result. Retain source IDs and the source revision with each resolved theme.

Resolve approved colour entries at build time or sync them into a pinned local snapshot. Do not fetch the GitHub default branch for each visitor. A failed lookup should use the neutral theme and report an editorial validation error, rather than inventing a hue.

### Theme scope and lifecycle

| Location | Theme behaviour |
|---|---|
| Homepage / Objects / About / Support | Default neutral shell; product colour confined to its own story preview |
| Product page | Product theme at the document root: canvas, header, product bar, footer, buttons, links, fields, icons, focus and overlays |
| Bag drawer opened on a product page | Inherits that page's theme, including portalled content |
| Standalone Bag / Checkout | Neutral shared theme, useful for mixed-product orders |
| Another product page | New product theme, same component structure and semantics |
| Returning home | Restore the neutral theme immediately |

Resolve the initial root theme during HTML rendering so direct links never flash an unrelated palette. If using client navigation, update and clean up the root theme on every route change, including back / forward navigation. A transition may interpolate decorative backgrounds, but text, controls, and focus colours should switch atomically as a tested pair.

Use `<html data-theme="…">` or an equivalent document-root contract so overlays mounted beneath `body` inherit the current values. A wrapper around only the story is insufficient. Keep theme values as explicit static CSS or validated tokens; CMS content selects an approved theme ID rather than injecting arbitrary CSS.

Every theme must define the full semantic set, including page/surface text, secondary text, primary and secondary actions, muted surfaces, borders, control borders, focus, icon layers, destructive states, success and warning treatment. Keep typography, radii, control heights, navigation order, and action labels consistent across themes.

A product theme may use a saturated accent against tinted neutrals or dark surfaces. It need not fill every square pixel with a strong hue. Object imagery remains colour-accurate and must not be hue-rotated to match the interface. UI theme is distinct from a physical product finish: changing a finish must not silently change price, imagery, or theme unless that relationship is explicitly configured.

## 7. Typography

The requested “Faculty Glyph” is interpreted as **Faculty Glyphic**, the published family name. Its supplied regular style is weight 400. Use genuine font files and `font-synthesis: none`; do not manufacture bold or italic styles. The requested bold typography means strong scale, clear contrast, decisive line breaks, and assured placement.

| Family | Role | Rules |
|---|---|---|
| Faculty Glyphic | Primary display, product names, editorial section headings, provisional text wordmark | Weight 400; generous optical space around distinctive forms; not a compressed grotesque |
| Geist | Body, navigation, buttons, forms, descriptions, support and purchase information | 400 body, 500 controls, 600 emphasis; keep prices and currency readable |
| Geist Mono | Model labels, dimensions, compact technical values, occasional chapter numbers | 400–500; preserve units; tabular numerals where appropriate |
| Geist Pixel | Optional brief expressive detail or a product-specific digital moment | One chosen cut; use sparingly; never essential instructions, price, forms or long copy |

### Proposed responsive scale

| Role | Family / weight | Mobile | Desktop | Leading / tracking |
|---|---|---|---|---|
| Hero display | Faculty Glyphic 400 | 44–64px | 88–144px | 1.02 / -0.025em |
| Section display | Faculty Glyphic 400 | 32–44px | 56–80px | 1.06 / -0.02em |
| Product module title | Faculty Glyphic 400 | 28–36px | 40–56px | 1.10 / -0.015em |
| Small heading | Geist 600 | 20–24px | 24–28px | 1.25 / -0.01em |
| Body | Geist 400 | 16px | 18px | 1.5 / normal |
| UI | Geist 500 | 14px | 14px | 1.3 / normal |
| Technical label | Geist Mono 400 | 12–13px | 13px | 1.4 / normal |
| Caption / credit | Geist 400 | 12–13px | 13px | 1.45 / normal |

Use fluid `clamp()` values between sizes, not viewport-wide text scaling. Choose line breaks with actual product names. Do not force one unbroken heading or clip letters to achieve a specimen effect. Body text width: roughly 45–68 characters. Critical purchase information uses at least the body or UI scale, not faint microtype.

Self-host suitable webfont files with licence notices retained. Preload only the necessary above-the-fold fonts; load Mono / Pixel only when used. Maintain a readable fallback and test missing glyphs, Indian rupee symbols, numerals and units. Wordmark rendering is provisional until a final identity exists.

## 8. Layout, spacing and surfaces

| Property | Proposed default |
|---|---|
| Base spacing unit | 4px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px |
| Content max-width | 1440px |
| Reading column | 680px maximum |
| Page gutters | 16px small; 24px medium; 40px large |
| Grid | 4 mobile / 8 tablet / 12 desktop columns |
| Grid gap | 16px mobile; 24px desktop |
| Story section padding | 48–64px mobile; 80–128px desktop |
| Controls | 44px minimum height; 48px for main purchase action |
| Button / field radius | 6px |
| Contained panel radius | 12px |
| Product stage radius | 0px full bleed; 12px when inset |
| Circular control radius | 50%, only for square icon controls |

Proposed composition ranges: below 640px, single-column stories; 640–1023px, selective pairs; 1024px and above, full desktop composition. These are layout starting points, not device detection. Let content determine when a pair must stack.

Alternate broad object stages, paired modules, detail crops and quiet text. Maintain a shared alignment system. Do not turn every chapter into a bordered card. Full-bleed imagery can exceed content max-width; copy and controls remain within readable gutters.

Surfaces communicate hierarchy through colour and space. Cards are flat. Use a subtle shadow only where a floating overlay needs separation. Backdrop blur is optional and local; keep the header opaque by default. Avoid decorative glass panels, glow around controls, and shadows that become part of the product rendering.

## 9. Keyline iconography

Use [Keyline Icons](https://keylineicons.com/), **rounded corners + duotone** as the default. The library distinguishes duotone from two-tone; select its actual duotone variant. Bind the detail and body layers to theme roles rather than leaving the exported grey / black values hardcoded.

| Role | Token | Behaviour |
|---|---|---|
| Detail / identifying layer | `--icon-detail` | Strong contrast, usually current foreground |
| Body / secondary layer | `--icon-body` | Approved theme tint; decorative where low contrast |
| On a filled primary action | Component foreground roles | Keep the whole icon readable against the button fill |

Use a small local adapter or owned SVG source to map colours and variants. Verify actual library exports before writing imports. Do not assume an unsupported two-colour prop exists. If a drawing lacks duotone, retain the rounded stroke fallback from the same family.

Default icon drawings: 20px in controls, 24px for standalone utility actions; 16px only where legible in dense labels. Maintain a 44px interaction target even when the drawing is smaller. Components control icon sizing. Decorative icons are hidden from assistive technology; icon-only buttons have explicit accessible names. No emoji or mixed icon families for standard UI.

## 10. Frontend UI foundation: Astro + shadcn/ui

Use **shadcn/ui** as the frontend UI component foundation. Use its owned component source, established interaction patterns, and semantic variants. Apply form+field tokens centrally so the result carries the brand's typography, geometry, icons, and product themes.

Astro provides page structure and rendered editorial content. Use the React integration for interactive shadcn components, and Tailwind where the adopted shadcn setup requires it. This is an ecommerce frontend decision; it does not change unrelated library/editor projects. Payload remains the CMS. Keep payments deferred as previously agreed. This document authorises design specification, not installation, repository restructuring or deployment.

Use static Astro markup for ordinary narrative sections and simple navigation. Hydrate interactive groups where needed. Related controls must share a functioning React context / island; do not split a dialog trigger from its content across disconnected islands. Persistent Bag state must have an explicit shared state boundary across header and purchasing controls. Do not hydrate the entire site solely to render static text.

### Component mapping and recipes

| Need | Foundation | form+field treatment |
|---|---|---|
| Primary action | Button, default variant | Theme primary fill / foreground, Geist 500, 6px radius, 44–48px height |
| Secondary action | Button, outline / secondary variant | Theme surface and control border; no competing accent fill |
| Story navigation | Semantic anchor, shared link styling | Explicit object destination; no nested button / anchor |
| Mobile navigation / Bag overlay | Sheet or suitable Drawer | Theme surface, title, close action, correct focus and scroll handling |
| Product choices | RadioGroup or ToggleGroup as appropriate | Labelled finish / option values; selected and unavailable states |
| Quantity | Shared control composed with Button and numeric input | Label, minimum / maximum from real rules, usable keyboard controls |
| Details / support | Accordion | Informative heading, visible expansion control, themed separators |
| Specifications | Table | Label / value, units, logical reading order; narrow-screen adaptation |
| Forms | FieldGroup, Field, Input, Textarea, Select where needed | Persistent labels, field help, inline errors, 44px controls |
| Image expansion | Dialog | Titled gallery, captions, keyboard controls, clear close action |
| Availability | Badge | Literal text plus optional icon; never invented stock urgency |
| Feedback | Alert, Sonner where appropriate | Inline persistent problem messages; short nonblocking confirmations |
| Loading / empty state | Skeleton, Spinner, Empty | Preserve layout, clear text, no unnecessary shimmer |

Use the official shadcn registry for core components. Add only components needed by the design. Preserve the project's existing primitive base and configuration when implementing. Read current component documentation before using its APIs. Do not assume a particular preset, base library, version or import alias.

Central component variants own visual styling. At call sites, use classes mainly for layout. Replace upstream decorative icons and control glyphs with the approved Keyline treatment without removing accessible behaviour. Custom story compositions remain purpose-built; they do not need a Card wrapper just because Card is available.

### Complete component state contract

| State | Required behaviour |
|---|---|
| Default | Readable theme pair; clear control purpose |
| Hover | Subtle surface or foreground change; available on pointer devices only |
| Focus-visible | 2px high-contrast ring, 3px offset; not clipped or obscured by sticky UI |
| Pressed / selected | Persistent border, indicator and semantics; colour is supporting evidence |
| Disabled / unavailable | Native / accessible disabled behaviour plus reason where needed; no hover promise |
| Loading | Immediate acknowledgement; text retained with spinner; prevent duplicate submission |
| Error | Inline explanation, retained user input, actionable recovery |
| Success | Confirmation in place or a polite live announcement; no forced celebration |

## 11. Purchasing, Bag and checkout appearance

The purchase block contains product identity, selected option, real price, taxes / shipping disclosure as applicable, availability, delivery expectations, included items, returns access, quantity and action. Missing facts remain visibly editorial placeholders in local review and block a production-ready claim.

Add to bag preserves the selected variant and quantity, updates Bag count, and announces the result without forcing a modal open. The visitor can deliberately open Bag or continue exploring. Show enough information to confirm what was selected.

Bag displays item name, thumbnail, variant, quantity, price, removal, subtotal, any known charges and clear checkout action. Never imply a final payable total before unresolved charges are calculated. Removing or updating an item gives immediate feedback and supports error recovery. Empty Bag links to Objects.

Checkout appearance follows the neutral theme and Geist-based functional typography. Provide a guest path as the proposed default; do not introduce an account wall without an established need. Use address fields, delivery choices, summary and payment status in logical groups. Preserve entered data on validation errors. Terms, delivery and returns access remain visible.

For the current local phase, mark checkout as a demonstration and clearly state that no payment or order is submitted. Do not show a successful purchase merely because a demo button was pressed. Reserve confirmation design for a genuine backend-confirmed order, or a conspicuously labelled demo state. Never simulate a trusted payment-provider screen as a live transaction.

## 12. Motion direction

Motion should feel energetic through a few decisive moments: a large title settling into place, an object changing scale, a feature being demonstrated, or a story handing over to the next chapter. Static reading intervals are part of the rhythm. Essential identity and controls are present on first render.

Proposed tools: CSS for basic feedback; GSAP for coordinated product-story sequences. Use GSAP only when coordination earns the dependency. Pinning is optional, limited to one meaningful demonstration at a time, and must never make the reader complete a sequence to reach purchasing information.

| Event | Start → end | Timing / trigger | Reduced motion / fallback |
|---|---|---|---|
| Lead image entry | Translate Y 24px, scale 1.03 → rest | 650–850ms, once after media readiness; identity and links already visible | Static final image |
| Editorial title | Whole block Y 16px → rest | 450–650ms, on first viewport entry | Immediate final title |
| Detail chapter | Image scale 1.03 → 1; caption already readable | 500–700ms once, visible intersection | Static crop and caption |
| Product demonstration | Two or more verified physical / UI states | Explicit user input; timings fitted to behaviour | Still sequence with labels and accessible controls |
| Button feedback | Surface change; optional arrow shift 2px | 120–180ms, hover / press | Immediate state change |
| Sheet / Drawer | Translate from opening edge → rest | 220–300ms on user request; actions remain responsive | Immediate open / close |
| Theme change | Decorative surface transition only | Up to 250ms after navigation; functional pairs switch together | Immediate theme switch |

Use an easing such as `cubic-bezier(0.22, 1, 0.36, 1)` for entrances and a shorter ease-out for feedback. Avoid letter-by-letter reading delays, bouncing purchase controls, cursor followers, auto-scrolling, looping marquees, mandatory video intros, and forced horizontal storytelling.

Use `prefers-reduced-motion`, visible video controls, posters and readable no-script content. Any automatically moving content that persists must offer pause controls. Essential text must not start at opacity zero unless enhancement setup guarantees a visible fallback. Clean up observers and animation timelines on navigation.

## 13. Imagery and placeholder policy

At this stage, use public-domain / CC0 images first. Other free commercial-use assets are acceptable only when the actual licence permits the intended use and its conditions are met; “free to view” is insufficient. Keep attribution where required. Image search results are leads, not licence evidence.

This specification does not bundle or select image files. Every asset used during implementation must have a recorded source page, author where known, licence URL, download date, local path, attribution requirement and role. Prefer stable local assets to hotlinks or random-image endpoints.

| Role | Suitable temporary content | Restriction |
|---|---|---|
| Atmosphere | Quiet interiors, light, material studies, coffee preparation, desk contexts | Must not imply a product capability or included accessory |
| Product-stage composition | A clearly labelled category reference or neutral silhouette | Do not present another manufacturer's object as form+field's actual design |
| Technical mechanism | Owner-provided diagram / render or explicitly labelled conceptual diagram | Do not invent dimensions, internals, compatibility or performance |

When an object is represented by unrelated imagery, label it “Illustrative placeholder” in the local preview with concise readable text. Use descriptive alt text appropriate to its real role, or empty alt for purely decorative atmosphere. Keep the distinction clear in any shared preview.

Art-direct crops for negative space, material detail and coherent light. Product pages may adopt distinct colour environments; photography should remain materially believable. Never force a floor lamp, keypad, printer and scale into identical crops just to regularise cards.

Provide separate mobile crops / focal points, reserve image dimensions, serve responsive sizes, load the lead asset promptly and defer lower-page media. Video needs a poster and must never be the sole explanation of a feature.

## 14. Responsive and accessible behaviour

Recompose rather than shrinking the desktop. Stack paired modules in editorial order. Keep product names, descriptions and links visible outside image crops. On mobile, shorten decorative stages before reducing text or hiding material information.

Test at 360, 390, 768, 1024 and 1440px widths, plus 320px for reflow. Support 200% text zoom, longer product names, touch, keyboard and reduced motion. No page-level horizontal overflow; wide technical data may use a clearly contained scroll region only when necessary.

Target WCAG 2.2 AA for the rendered implementation: normal text contrast at least 4.5:1, large text at least 3:1, essential non-text indicators at least 3:1 against adjacent colours. Test focus on each actual surface. Do not use low-opacity secondary text without measuring the composited result.

Keep one meaningful h1, logical heading levels, landmarks, descriptive links and labelled controls. Galleries and overlays need titles, escape behaviour, keyboard support and correct focus restoration. Accordions expose state. Bag feedback uses a polite live region. No meaning depends only on hue, motion or hover.

Sticky UI must not obscure content, focused controls or final purchase actions. Account for mobile safe areas and the on-screen keyboard. Keep focus outlines visible. Product-theme changes must preserve every accessibility requirement, including error and disabled-state clarity.

## 15. Starter semantic CSS contract

This is a proposed token contract, not a complete stylesheet. It defines the neutral baseline. Product themes override the same roles at the document root after contrast review. Connect these roles to the installed shadcn / Tailwind configuration rather than duplicating a second colour system.

```css
:root {
  --ff-ivory: #eae7df;
  --ff-paper: #f5f2ec;
  --ff-ink: #242421;
  --ff-grey: #65645e;
  --ff-vermilion: #e34727;
  --ff-rule: #c8c4ba;

  --font-display: 'Faculty Glyphic', Georgia, serif;
  --font-body: 'Geist', system-ui, sans-serif;
  --font-technical: 'Geist Mono', ui-monospace, monospace;
  /* Bind --font-pixel to the actual selected Geist Pixel cut when loaded. */

  --background: var(--ff-ivory);
  --foreground: var(--ff-ink);
  --card: var(--ff-paper);
  --card-foreground: var(--ff-ink);
  --popover: var(--ff-paper);
  --popover-foreground: var(--ff-ink);
  --primary: var(--ff-ink);
  --primary-foreground: var(--ff-ivory);
  --secondary: var(--ff-paper);
  --secondary-foreground: var(--ff-ink);
  --muted: var(--ff-paper);
  --muted-foreground: var(--ff-grey);
  /* shadcn accent is an interaction surface, not the brand vermilion. */
  --accent: #dedad1;
  --accent-foreground: var(--ff-ink);
  --border: var(--ff-rule);
  --input: var(--ff-grey);
  --ring: var(--ff-ink);
  --destructive: #a52b19;
  --destructive-foreground: #ffffff;
  --success: #285d38;
  --warning: #765000;

  --brand-accent: var(--ff-vermilion);
  --product-accent: var(--brand-accent);
  --icon-detail: var(--foreground);
  --icon-body: #a9a59b;
  --control-border: var(--input);
  --radius: 0.375rem;
  --page-max: 90rem;
  --reading-max: 42.5rem;
  --page-gutter: clamp(1rem, 3vw, 2.5rem);
  --story-space: clamp(3rem, 7vw, 8rem);
  --duration-feedback: 160ms;
  --duration-panel: 260ms;
  --duration-story: 700ms;
  --ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
}

html { font-synthesis: none; }
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
}
.ff-display {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.75rem, 8vw, 9rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
}
```

Brand and product accents are intentionally separate from shadcn's `--accent` role, which often represents menu / hover surfaces. A CSS variable reference to `--foreground` follows the current theme; no component needs to know whether that theme is blue, yellow or neutral. Product themes must override derived colours such as `--accent`, `--icon-body`, and status treatments as well as the headline palette.

## 16. Content contract for the CMS and frontend

Proposed fields below describe the design's needs; they do not assert an existing Payload schema.

| Group | Required content |
|---|---|
| Identity | Stable ID, slug, name, plain category descriptor, short introduction |
| Catalogue | Publication status, editorial order, homepage module size, preview media and crop |
| Theme | Approved theme ID; resolved Chroma references and source revision in theme configuration |
| Story | Ordered chapters with stable IDs, headings, copy, media and optional verified feature details |
| Media | Local source, alt / decorative role, focal points, dimensions, provenance, placeholder flag |
| Specifications | Label, value, unit where relevant, source / verification status |
| Commerce | Variant IDs, actual option values, price / currency, availability, purchase eligibility, fulfilment disclosures |
| Practical information | Included items, setup, care, compatibility, delivery and returns links where supplied |

Keep story publication and purchase eligibility independent so an object can have a truthful story while sales remain unavailable. If important content is missing, omit an optional module or expose a clearly marked local placeholder. Do not generate fictional specifications to satisfy a schema.

## 17. Implementation review criteria

- First viewport identifies the featured object and gives a clear story link.
- All 4–10 published objects are discoverable; no object depends on waiting for a carousel.
- Product pages reveal the observation, response and meaningful design decisions with factual support.
- Faculty Glyphic leads the visual identity; Geist carries reading and controls; Mono / Pixel remain purposeful.
- Keyline icons use rounded duotone artwork and current theme colours, including upstream component glyphs.
- shadcn owns functional UI foundations; central tokens own appearance; static story markup stays lightweight.
- Product themes reach the full shell and portalled UI, load correctly on direct entry, and reset after navigation.
- Purchase details remain accessible throughout the story; the current demo cannot masquerade as a live checkout.
- Placeholder imagery has asset-level provenance and is not mistaken for actual form+field product photography.
- Keyboard, touch, zoom, narrow layouts, contrast, no-script reading and reduced motion are checked in the rendered site.
- No unsolicited promotional popups, unsupported claims, fabricated proof or invented urgency appear.

This document was checked for alignment with the supplied brief and internal token / behaviour consistency. Base contrast pairs were calculated. A written specification does not establish that a rendered site passes accessibility, performance, or interaction checks.

## 18. Source notes

Owner-supplied reference documents: DESIGN.md (Aplós), DESIGN-2.md (AYOCIN), DESIGN-3.md (Wise Design), studied as style references. Their inferred measurements and extracted implementation snippets are not adopted as requirements.

External references checked on 22 October 2026:

- [Faculty Glyphic source and licence](https://github.com/DylanYoungKoto/FacultyGlyphic)
- [Faculty Glyphic published metadata](https://github.com/google/fonts/blob/main/ofl/facultyglyphic/METADATA.pb) — regular 400 style; published family name.
- [Geist family](https://vercel.com/font) — Sans, Mono and Pixel family references.
- [Keyline Icons](https://keylineicons.com/) — rounded / sharp corners and distinct duotone / two-tone styles; verify individual coverage during implementation.
- [shadcn/ui with Astro](https://ui.shadcn.com/docs/installation/astro)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [Chroma snapshot](https://github.com/error420notfound/chroma-catalogue/tree/c38bfa6b311a95788fb2f39bafb71323885a3010) — README, types, repository structure and the three candidate hue files listed above were inspected.

The supplied Apple-informed web design skill informed hierarchy, agency, accessibility, responsive composition and motion fallbacks. Exact layout values and commerce recipes here are form+field proposals, not Apple requirements.
