import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from './payload.config'

if (process.env.NODE_ENV === 'production') throw new Error('HomeView is a local development demonstration only.')
const source = '/Users/hs108/Downloads/Media-of-Apple-HomeView-261013'
const images = {
  lineup: ['Apple-HomeView-lineup-261013.jpg', 'Five HomeView devices showing different screens'],
  recognition: ['Apple-HomeView-user-recognition-261013.jpg', 'HomeView screen with personalised apps and family avatars'],
  faces: ['Apple-HomeView-collection-of-faces-261013.jpg', 'A composite showing a collection of HomeView display faces'],
  siri: ['Apple-HomeView-Siri-AI-app-261013.jpg', 'HomeView and iPhone displaying an example Siri response'],
  cooking: ['Apple-HomeView-Cooking-261013.jpg', 'HomeView displaying a soup recipe'],
  timer: ['Apple-HomeView-Timer-261013.jpg', 'HomeView displaying a timer'],
  sound: ['Apple-HomeView-custom-engineered-acoustic-system-261013.jpg', 'Close-up of HomeView screen and speaker base'],
  angle: ['Apple-HomeView-screen-angles-261013.jpg', 'Side views showing the angle of the tabletop HomeView screen'],
  rear: ['Apple-HomeView-rear-USB-C-port-261013.jpg', 'Rear view of the tabletop HomeView and its cable'],
  wall: ['Apple-HomeView-wall-mounted-261013.jpg', 'A separate wall-mounted HomeView model'],
  call: ['Apple-HomeView-FaceTime-Center-Stage-261013.jpg', 'HomeView displaying a FaceTime call'],
  home: ['Apple-HomeView-home-touch-261013.jpg', 'HomeView displaying home controls'],
  living: ['Apple-HomeView-lifestyle-living-room-261013.jpg', 'HomeView on a table in a living room'],
  music: ['Apple-HomeView-Apple-Podcasts-Lyrics-Apple-Music-261013.jpg', 'HomeView devices showing music and podcast screens'],
  collection: ['Apple-Home-Collection-lineup-261013.jpg', 'Separate smart home accessories from the Apple Home Collection'],
} as const
const payload = await getPayload({ config })
try {
  const existing = (await payload.find({ collection: 'products', where: { slug: { equals: 'homeview-review' } }, limit: 1 })).docs[0]
  if (existing) {
    payload.logger.info('HomeView already exists; preserving its content and media.')
  } else {
    const ids: Record<string, number> = {}
    for (const [key, [filename, alt]] of Object.entries(images)) {
      const name = `local-homeview-${key}.webp`
      let asset = (await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1 })).docs[0]
      if (!asset) {
        const data = await sharp(await fs.readFile(path.join(source, filename))).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
        asset = await payload.create({ collection: 'media', data: { alt, author: 'Apple', role: 'local-homeview-demo', sourcePage: 'Supplied HomeView press material; local demonstration only', attribution: 'Apple · local demonstration', placeholder: false }, file: { data, mimetype: 'image/webp', name, size: data.length } })
      }
      ids[key] = asset.id
    }
    await payload.create({ collection: 'products', data: {
      name: 'HomeView', slug: 'homeview-review', descriptor: 'A shared screen for the home', shortDescription: 'A local demonstration inspired by Apple HomeView.', description: 'A prototype story based on supplied Apple press material.', themeId: 'neutral', currency: 'INR', price: null, availability: 'unavailable', purchaseEligible: false, reviewOnly: true, demo: true, featured: false, editorialOrder: 999, gallery: [ids.lineup, ids.angle, ids.rear, ids.wall], _status: 'published',
      pdpSections: [
        { sectionId: 'overview', variant: 'wide', label: 'Overview', heading: 'A little more at home.', copy: 'Entertainment, connection and smart home controls come together on a shared screen, as described in the supplied Apple material.', media: ids.living },
        { sectionId: 'faces', variant: 'wide', label: 'Personalisation', heading: 'A face for every moment.', copy: 'Choose from a collection of display faces, including photos and information at a glance. The supplied material describes recognition for up to six people. Setup and multiuser support require a compatible iPhone or iPad with current software.', media: ids.faces, caption: 'A single composite showing examples of display faces.', modalLabel: 'Explore personalisation', modalCopy: 'The supplied material describes personalised Home Screens for up to six people. Personal content appears when the enrolled person is recognised and their paired iPhone or iPad is present and recently unlocked, subject to the conditions described in the source.' },
        { sectionId: 'siri', variant: 'split', label: 'Siri AI', heading: 'A little help, close at hand.', copy: 'The supplied material describes Siri AI answering questions and helping with everyday requests. Personal-context requests require a paired Apple Intelligence-enabled iPhone or iPad. Siri AI is described as beta, with language, regional and usage limits.', media: ids.siri, modalLabel: 'Explore Siri AI', modalCopy: 'The source describes broad world knowledge and personal-context requests separately. Personal context requires a compatible paired device with Siri AI enabled and a supported language. Some features are subject to regional availability and daily usage limits.' },
        { sectionId: 'everyday', variant: 'paired', label: 'Everyday assistance', heading: 'Room for the everyday.', copy: 'The source describes help in the kitchen, from recipes to hands-free timers.', cards: [{ heading: 'A recipe in view.', copy: 'Follow step-by-step cooking guidance.', media: ids.cooking }, { heading: 'Time, at a glance.', copy: 'Keep an eye on a timer while your hands are busy.', media: ids.timer }] },
        { sectionId: 'sound', variant: 'detail', label: 'Sound and design', heading: 'Made to be seen. And heard.', copy: 'The tabletop design pairs a tilting display with a speaker base. The supplied brief describes a custom acoustic system for music and more; subscriptions and regional limitations may apply.', media: ids.sound, callouts: [{ heading: '7-inch display', copy: 'The size stated in the supplied material.' }, { heading: 'A tilting screen', copy: 'A hinge connects the screen to the tabletop speaker base.' }, { heading: 'A separate wall model', copy: 'The wall-mounted version uses a different audio configuration.' }], modalLabel: 'Explore sound and design', modalCopy: 'The source describes two full-range display drivers, a down-firing woofer and passive radiators in the tabletop model. The separate wall-mounted model uses two drivers tuned for on-wall placement. Mounts are separate and installation depends on the chosen mount.' },
        { sectionId: 'connection', variant: 'split', label: 'Connection', heading: 'A little closer, even apart.', copy: 'The supplied material describes FaceTime with Center Stage for conversations around the home. Both participants need a FaceTime-enabled device and Wi-Fi.', media: ids.call, modalLabel: 'Explore calling', modalCopy: 'FaceTime and Center Stage are described as keeping participants in view as they move. A FaceTime-enabled device for each participant and a Wi-Fi connection are required.' },
        { sectionId: 'home', variant: 'wide', label: 'Connected home', heading: 'Everything in its place.', copy: 'The source describes touch and voice control of compatible smart-home accessories. Compatible HomeKit or Matter accessories are required and sold separately; some camera features require compatible devices and an eligible iCloud+ plan.', media: ids.home, modalLabel: 'Explore home controls', modalCopy: 'The source describes controls for compatible lights, thermostats, locks and cameras. Smart-home accessories are sold separately. Some video features require compatible devices and an eligible iCloud+ subscription.' },
        { sectionId: 'privacy', variant: 'detail', label: 'Privacy', heading: 'Personal, by design.', copy: 'The supplied material describes safeguards for a shared device. Personal content is shown when an enrolled user is recognised and their paired device is present and recently unlocked, subject to the source’s conditions.', media: ids.recognition, modalLabel: 'Explore privacy', modalCopy: 'The brief describes protected processing for camera and microphone data and conditions for access to personal content. Paired-device connectivity and recent unlock conditions apply; consult the source for the full qualifications.' },
      ],
    } })
    payload.logger.info('Created local HomeView review product and media.')
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await payload.destroy()
}
// Payload leaves background handles active in this local CLI; all writes and cleanup are complete.
process.exit(process.exitCode || 0)
