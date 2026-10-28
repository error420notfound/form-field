# form+field — Product detail page design

Status: design specification for a future implementation · 27 October 2026  
Scope: reusable product-story layouts and a local HomeView demonstration. This document does not implement a page, change the CMS or establish product facts.

Local prototype: run `npm run seed:homeview -w apps/cms` with Node 24 from the repository root, then open `/products/homeview-review` in the development storefront. The command creates a review record and local CMS media only when the slug is absent; it preserves an existing record. The source images must be present at the supplied Downloads path. The prototype and its tagged media are excluded from anonymous production access and must not be deployed as public Apple content.

## Intent and reference

A product page should help a visitor understand what an object is, how it works, why its design matters and what they need to know next. Give each idea a distinct visual treatment and enough space to register. The [Apple iMac page](https://www.apple.com/in/imac/) is a reference for its progression from introduction and highlights to a closer look and deeper thematic chapters, its changes in scale and its optional detail overlays. It is not a template to copy literally.

Keep the form+field wordmark, Faculty Glyphic display type, Geist body type, existing theme tokens, neutral shell and restrained brand accent as defined in `ecomm-design.md`. Use product photography, colour and content to distinguish a story. Do not copy Apple's navigation, branding, marketing copy or distinctive visual styling into form+field's own products. Show only supported claims, and distinguish illustrative artwork from a confirmed product design.

## Reference audit: HomeView screenshot

The attached screenshot is a static, downscaled reference. Its overall composition is visible, but fine text, control labels, mobile layouts and interactions cannot be verified. The supplied RTF supports prototype content; it does not establish screenshot behavior.

| Visible observation | Shortcoming in this specification | Change |
| --- | --- | --- |
| Hero, highlights and a large closer-look stage precede the story. | The gallery does not describe an inline viewer. | Specify a viewer separately from image expansion. |
| Themed chapters combine introductions, large imagery, supporting copy and compact callouts. | Variations read as single blocks. | Compose richer chapters around a primary variation. |
| Display faces appear in a large composite, alongside isolated product views and close-ups. | The example relies on individual images and repeated splits. | Add a static mosaic and vary image scale. |
| Faces, assistant, daily help, sound, communication, connected home and privacy have distinct passages. | Several are missing or optional in the example. | Add source-mapped chapters and conditions. |
| Related content, shopping information and questions appear near the end. | The example jumps to practical details and a next step. | Specify optional related content and FAQ; omit shopping promotions from the non-purchasable demo. |
| Selection controls and buttons are visible. | Their actions are not verifiable in a still image. | Treat all interactions below as proposals, not observed Apple behavior. |

## Page sequence

| Stage | Purpose and treatment | Action |
| --- | --- | --- |
| Product navigation | Compact sticky bar below the site header: product name and links to existing major sections. Keep the global navigation visible and understated. | Link to a truthful next step; hide links to sections that do not exist. |
| Hero | Product name, concise category or headline, short supporting copy and an expansive image. Let the product keep its proportions and reserve room around it. | Availability or purchase action only when supported by the product state. |
| Highlights | A short visual introduction, typically 2–4 image-led cards. Each card introduces one distinct, evidenced idea. | Optional labelled button opens the corresponding detail modal. |
| Closer look | A contained gallery of genuinely distinct supplied views, finishes or contexts, with descriptive captions. | Select or expand an image; do not imply a crop is another product view. |
| Product chapters | Sequence the four variations below around the product's actual functions, design and context. Each chapter owns one theme. | Optional “Explore [topic]” button when there is meaningful additional content. |
| Practical information | Present supplied specifications, compatibility, care and included items as readable labelled facts. Explain relevant limits near a claim. | No empty specification rows or invented facts. |
| Next step | Real product: reflect the existing eligibility, inventory and pricing policy. Prototype: explain that it is a local demonstration and offer a route back to Objects. | Never offer a simulated purchase for a non-purchasable prototype. |

Omit a stage when its content does not exist. A short, well-supported page is preferable to repeated cards or speculative features. On a longer page, alternate image scale, alignment and surface rather than repeating the same two-column chapter. At least two different chapter variations should be used when a product has enough suitable material.

## Four editorial chapter variations

All variations accept a heading and concise body copy, optional section label, relevant media with alt text and optional caption, and an optional detail-modal action. Use a single H1 for the page, H2 for chapters and H3 for cards or subordinate topics. Keep text selectable and outside the image; images must not be the sole source of essential information.

### 1. Wide visual

**Use:** establish a setting, show the whole object or introduce a major feature. Place a short heading and paragraph above or beside a wide, dominant image. On desktop, use a generous content-width image with a restrained caption; on mobile, stack text and image and use an uncropped or carefully focal-pointed rendition. Do not crop a meaningful object or control. An optional callout row can follow the image when it adds substantiated facts.

### 2. Image and text split

**Use:** explain a particular interaction, form or use in context. On desktop, put one image and a readable text column side by side; alternate image side across non-adjacent chapters. Use a wider image column when the image contains relevant detail. On mobile, place heading and explanatory text before the image in reading order, regardless of desktop alignment. Use a detail button only when the dialog adds information beyond the visible copy.

### 3. Paired feature cards

**Use:** compare or introduce two related but distinct capabilities or contexts. Place two large cards side by side on desktop and stack them on mobile. Each card has its own image, short heading, one or two sentences and optional topic-specific modal button. Images should be independently meaningful; if only one image or feature is available, use a different variation instead of duplicating a card. Preserve legible text by placing it on a solid surface or in a clear area of the image.

### 4. Detail with callouts

**Use:** explain design, components, compatibility or practical information grounded in supplied evidence. Pair one contained detail image with a short introduction and up to three concise callouts; place labels and values in a readable list, not only over the image. On desktop, align the list beside or below the image; on mobile, stack it beneath the image. An optional modal may contain a larger image and the complete explanation or conditions. Avoid decorative hotspots that obscure the product or require hover.

A chapter can combine an introductory label, heading and paragraph with one primary variation, followed by supporting text, a detail image, up to three source-backed callouts and an optional detail control. The four variations describe the dominant composition, not a limit of one block per chapter. Avoid nested card grids. Vary whitespace, alignment and image scale only where content supports them.

## Shared patterns and behaviour

### Hero, highlights and gallery

- The hero image uses `object-fit: contain` where needed to keep the object intact. A lifestyle image may use a controlled cover crop if the object and context remain visible at each breakpoint. Reserve intrinsic image dimensions to reduce layout shift; prioritise the hero image and lazy-load later media.
- Highlight cards are introductions, not a substitute for full chapters. If a card opens a dialog, make the button's accessible name identify its topic, such as “Explore HomeView design”; do not make an unlabelled plus icon the only cue.
- Gallery controls identify the selected view and support keyboard activation. Only expose previous/next and position information when there are multiple images. Reuse the existing `Gallery` dialog where its behavior and image data fit; extend or replace it only if the required gallery cannot be expressed accessibly.
- Every informative image has an accurate description; decorative duplicates use empty alt text. Captions state when an image is illustrative. A missing image should produce a text-led layout, not a broken image or invented substitute.

### Proposed viewer, carousel and supporting patterns

- **Closer-look viewer:** show a large contained image with labelled view selectors alongside it on desktop and below it on mobile. Selection changes the inline image and caption; offer a separate expand button only when a larger view adds value. Each view corresponds to a real supplied image with its own alt text. Omit selectors for a single image and omit the viewer if there is no image. Mark the current view without relying on colour.
- **Highlights carousel:** when cards exceed the available width, use a manually controlled horizontal list with labelled previous and next buttons, visible focus, an announced position and touch scrolling. Do not auto-advance. Show a static list without redundant controls when cards fit, and keep essential content readable without JavaScript.
- **Image mosaic:** present one supplied composite as a static image or arrange genuinely separate images in a responsive grid. Describe a composite accurately; do not invent individual selectors or animations from a flattened image. A single image can replace the grid.
- **Supporting callouts:** place a concise row or stack of labelled, source-backed facts near the relevant visual. Stack on mobile and keep essential qualifications visible.
- **Privacy panel:** use a contained, high-contrast surface with a heading and a source-backed explanation. Add a detail button only if further material exists; do not overstate privacy or security properties.
- **Related content:** show explicitly supplied, relevant objects or editorial links; omit the section if none exist. A local Apple demonstration may show Apple Home Collection as contextual editorial content labelled as separate accessories, without a purchase link or presenting it as a form+field product.
- **FAQ:** use only supported questions and answers. Use native disclosures or accessible accordion buttons with expanded state, associated panels, visible focus and keyboard activation. Permit multiple answers open; do not hide essential conditions exclusively inside answers. Stack full-width rows on mobile and omit the section without supported answers.

### Callouts and modal details

A callout is a short, source-backed fact and optional supporting explanation. Put qualifications beside the claim or provide an explicit nearby link to them; a modal must not hide a limitation needed to understand the visible claim. Do not fabricate numbers, specifications, compatibility or material properties.

Use a real button for each modal trigger and give it a descriptive text label. Each dialog has a visible title, concise explanatory text, any relevant image and its alt text, and a labelled close button. When opened, move focus into the dialog and contain it there; close with Escape or the close control and return focus to the trigger. Prevent background interaction while open and allow the dialog content to scroll independently on small screens. Keep essential story content available on the page without JavaScript; modal-only detail must not be required to understand the main claim. Use subtle transitions only; disable nonessential animation and smooth scrolling when reduced motion is requested.

### Responsive and accessibility requirements

Use the existing page gutters and theme tokens, with fluid heading sizes and restrained paragraph widths. At narrow widths, stack content in logical reading order, keep controls comfortably tappable, preserve visible focus and prevent horizontal page overflow. Anchor destinations must clear both sticky bars at increased text size. Check text and controls against their actual surfaces for WCAG AA contrast, including text on imagery, modal surfaces and focus indicators. Never rely on colour alone to indicate a selected image or state. Test keyboard-only navigation, screen-reader names and captions, 200% text zoom, reduced motion and no-JavaScript reading.

## CMS and implementation direction

The present product model supplies `name`, `descriptor`, `shortDescription`, `description`, `gallery`, `story` chapters (`chapterId`, `heading`, `copy`, optional `media`), `features`, practical fields, related objects and purchase state. Existing media records supply alt text, placeholder status and image metadata. These fields support a basic hero, gallery, text-and-image chapter and practical information; they do not currently express an ordered mix of the four variants, multi-image cards, callouts or modal content.

A later implementation should introduce an **optional ordered section collection** within the product content model. Each section selects one of the four variants and contains its applicable heading, copy, media, cards, callouts and optional modal content. Use media relationships rather than hard-coded file paths and keep descriptive alt text with the media. Render only populated and appropriate fields. Design and validate any schema migration and generated types when implementation is authorised; this specification changes no API or schema.

For products without the new sections, retain the current `story` rendering and existing description/features fallback. Preserve current published-content filtering, theme resolution, related-object selection and purchase policy. The PourFrame review page must remain labelled as illustrative and non-purchasable. A local asset file alone is not a CMS media record: a future CMS-backed prototype must separately create or attach media and a review record through the project's established local workflow.

## Worked example: HomeView local demonstration

**Status and provenance:** HomeView is an Apple product presented here solely as a local, non-purchasable design demonstration, not a form+field product. The supplied RTF, `Meet Apple HomeView, a new way to enjoy entertainment, stay connected, and manage the home.rtf`, is a press-release-style source dated 13 October 2026. Its statements are sample source material, not independently verified facts. All image filenames below are in `/Users/hs108/Downloads/Media-of-Apple-HomeView-261013/` and are supplied Apple imagery. Do not publish or redistribute them without appropriate rights. Do not reproduce the release wholesale; write concise, attributed prototype copy and retain material conditions.

Show a clear “Local demonstration · Apple HomeView” notice near the hero and in the concluding section. Do not display a price, purchase action, launch date or order availability. The next step links back to Objects. The following is an example sequence, not a requirement to use every supplied asset.

| Order and purpose | Pattern and supplied image(s) | Source and proposed content / controls |
| --- | --- | --- |
| Hero | Apple-HomeView-lineup-261013.jpg | **HomeView. A shared screen for the home.** Source: introduction. Show the local-demo notice and a story link, with no purchase action. |
| Highlights | Apple-HomeView-user-recognition-261013.jpg; Apple-HomeView-Apple-Podcasts-Lyrics-Apple-Music-261013.jpg; Apple-HomeView-home-touch-261013.jpg | Introduce personalisation, entertainment and home controls. A manual carousel and topic-labelled detail buttons are proposed, not verified screenshot behavior. |
| Closer look | Apple-HomeView-screen-angles-261013.jpg; Apple-HomeView-rear-USB-C-port-261013.jpg; Apple-HomeView-wall-mounted-261013.jpg | Proposed inline viewer: label the angle, rear connection and **separate wall-mounted model**. Do not imply the tabletop model itself mounts to the wall. |
| Overview | Wide visual: Apple-HomeView-lineup-261013.jpg or Apple-HomeView-lifestyle-living-room-261013.jpg | Source: introduction and “Elegantly Designed for Any Space.” Introduce display, entertainment and home context using a heading, dominant visual and supporting text. |
| Display faces and personalisation | Wide visual / static mosaic: Apple-HomeView-collection-of-faces-261013.jpg; Apple-HomeView-user-recognition-261013.jpg | Sources: “Faces for Every Style” and “A Personalised Experience for Each User in the Home.” The faces file is one flattened composite, not individual interactive faces. The source describes recognition of up to six people; setup and multiuser support require a compatible iPhone or iPad with current software. **Explore personalisation** can explain paired-device and recognition conditions for personal content. |
| Siri AI | Image and text split: Apple-HomeView-Siri-AI-app-261013.jpg; optional Apple-HomeView-Apple-Intelligence-broad-world-knowledge-261013.jpg and Apple-HomeView-Apple-Intelligence-personal-context-261013.jpg | Source: “Featuring Siri AI, Powered by Apple Intelligence,” footnote 2. Describe broad knowledge and personal context separately. State language and regional limits, beta status, and the paired compatible Apple Intelligence-enabled iPhone or iPad needed for personal-context requests; usage limits may apply. **Explore Siri AI** can expand on this. |
| Everyday assistance | Paired cards: Apple-HomeView-Cooking-261013.jpg and Apple-HomeView-Timer-261013.jpg; contextual image Apple-HomeView-lifestyle-kitchen-261013.jpg | Source: “Connecting Users to What Matters Most.” Present cooking assistance and timers as distinct examples, with supporting text and optional **Explore everyday help**. The images do not demonstrate a working simulation. |
| Sound and design | Detail with callouts: Apple-HomeView-custom-engineered-acoustic-system-261013.jpg; Apple-HomeView-screen-angles-261013.jpg or Apple-HomeView-color-family-261013.jpg | Sources: “Rich Entertainment Anywhere in the Home” and “Elegantly Designed for Any Space.” Explain the tabletop acoustic system and tilting display. **Explore sound** distinguishes the wall model's audio; **Explore design** explains the separate wall model and mounts. |
| Communication | Image and text split: Apple-HomeView-FaceTime-Center-Stage-261013.jpg | Source: “Connecting Users to What Matters Most.” Describe FaceTime and Center Stage; both participants need FaceTime-enabled devices and Wi-Fi. **Explore calling** offers source-backed detail. |
| Connected home | Wide visual / detail: Apple-HomeView-home-touch-261013.jpg; optional Apple-HomeView-wall-mounted-261013.jpg | Source: “The Ultimate Smart Home Dashboard.” Explain touch and voice control with compatible, separately sold accessories. Some camera features require compatible devices and an eligible iCloud+ plan. **Explore home controls** provides qualified detail. |
| Privacy | Privacy panel; optional Apple-HomeView-user-recognition-261013.jpg | Source: “Private and Secure by Design,” footnote 10. Summarise the described protection and conditions for displaying personal content. Keep conditions visible; **Explore privacy** can add detail without overstating guarantees. |
| Related context | Apple-Home-Collection-lineup-261013.jpg | Source: “The Ultimate Smart Home Dashboard,” footnotes 8–9. Optional editorial card identifies separately sold Apple Home Collection accessories and compatibility requirements. No product listing or simulated purchase. |
| Practical information and questions | Source-backed facts and FAQ; no image required | Answer supported questions about tabletop versus wall model, compatible setup devices and accessory requirements. Keep qualifications near relevant claims and in answers. Omit unsupported shopping benefits, pricing and dates. |
| Next step | Text close | Repeat the local-demo notice and offer **Explore objects**. No checkout, inventory, order or notification action. |

The screenshot's shopping and promotional modules are observations, not requirements for this demonstration. The source also says some services require subscriptions or are region-limited; include those qualifications wherever such services are described. Paraphrase the supplied RTF and label its claims as unverified source material. Do not infer product claims solely from an image.

## Future implementation acceptance

1. A populated product can render a coherent sequence with at least two distinct chapter variations; missing optional fields do not create empty cards, controls or broken images.
2. HomeView's prototype uses the mapped local assets and source-supported descriptions, labels the demonstration and cannot be added to the bag. Existing products continue to render and follow the current purchase policy.
3. At desktop and mobile widths, inspect the hero, every chapter, crops, sticky anchor offsets and modal scrolling. Test carousel, inline viewer, image expansion, FAQ controls, each modal trigger, focus return, Escape and keyboard traversal; verify reduced motion, zoom and contrast.
4. Run the repository checks and purchase-policy tests, and separately report browser and device checks. Document any claims or asset rights that remain unverified before any public release.
