/** Identifiers reserved for local Apple reference demonstrations. */
export const digitalAppleDemoSlugs = ['apple-intelligence-review', 'final-cut-pro-review', 'logic-pro-review', 'pixelmator-pro-review', 'keynote-review'] as const
export const localAppleDemoSlugs = ['homeview-review', 'iphone-duo-review', 'apple-tv-4k-review', 'siri-ai-review', 'creator-studio-review', ...digitalAppleDemoSlugs] as const
export const isLocalAppleDemo = (slug: string) => (localAppleDemoSlugs as readonly string[]).includes(slug)
export const isDigitalAppleDemo = (slug: string) => (digitalAppleDemoSlugs as readonly string[]).includes(slug)
