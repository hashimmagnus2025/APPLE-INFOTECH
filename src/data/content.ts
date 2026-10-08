/**
 * All site copy lives here so it can be swapped for real client content.
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │ PLACEHOLDER NOTICE                                                 │
 * │ No company facts were supplied for this demo. Services, copy and   │
 * │ every statistic below are strategic placeholders — to be replaced  │
 * │ with Apple Infotech's real content before launch. Nothing here is  │
 * │ a claim about the company's history, clients or results.           │
 * └────────────────────────────────────────────────────────────────────┘
 */

export const brand = {
  name: 'Apple Infotech',
  tagline: 'We Ensure Better ROI',
  year: new Date().getFullYear(),
}

export const nav = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Why Us', href: '#why' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  eyebrow: 'Enterprise Technology Partner',
  lines: ['Technology', 'That Creates', 'Better ROI.'],
  statement:
    'Technology chosen, shaped and delivered around one question — what does it return to your business?',
  cta: 'Discover how',
}

export const about = {
  label: 'About',
  statement: 'Technology should not just work. It should create impact.',
  body: 'Every system, platform and process we touch is held to a simple standard: it has to make the business measurably better. We start with the outcome and work backwards — to the right technology, the right team and the right way to deliver.',
  principles: [
    { k: '01', t: 'Outcome first' },
    { k: '02', t: 'Engineered with precision' },
    { k: '03', t: 'Delivered with accountability' },
  ],
}

export const roi = {
  label: 'The measure',
  intro: ['We ensure', 'better'],
  steps: [
    {
      key: 'technology',
      title: 'Technology',
      text: 'The right systems — chosen for the business, not the brochure.',
    },
    {
      key: 'efficiency',
      title: 'Efficiency',
      text: 'Less friction. Fewer hand-offs. Decisions made faster.',
    },
    {
      key: 'business',
      title: 'Business',
      text: 'Technology shaped around how the organisation actually operates.',
    },
    {
      key: 'growth',
      title: 'Growth',
      text: 'Capacity to scale without ever starting over.',
    },
  ],
  result: {
    key: 'roi',
    title: 'ROI',
    text: 'The measure that matters. Every engagement is built to answer to it.',
  },
}

export const services = {
  label: 'Services',
  title: ['What we', 'do for you'],
  items: [
    {
      id: 'technology',
      title: 'Technology Solutions',
      text: 'Platforms, software and infrastructure chosen for fit and built for longevity — not for novelty.',
      tags: ['Architecture', 'Engineering', 'Integration'],
      fig: 'Layered stack',
    },
    {
      id: 'transformation',
      title: 'Digital Transformation',
      text: 'Turning manual, fragmented operations into connected, measurable ones.',
      tags: ['Process', 'Automation', 'Data'],
      fig: 'Order from noise',
    },
    {
      id: 'business',
      title: 'Business Solutions',
      text: 'Technology shaped around the way your business actually makes its money.',
      tags: ['Strategy', 'Operations', 'Insight'],
      fig: 'Compounding return',
    },
    {
      id: 'it',
      title: 'IT Services',
      text: 'Dependable day-to-day technology operations, so your teams can focus on the work that matters.',
      tags: ['Support', 'Security', 'Infrastructure'],
      fig: 'Continuous watch',
    },
    {
      id: 'enterprise',
      title: 'Enterprise Solutions',
      text: 'Scalable systems for organisations where complexity is the starting point, not the exception.',
      tags: ['Scale', 'Governance', 'Resilience'],
      fig: 'Connected network',
    },
  ],
}

export const solutions = {
  label: 'Solutions',
  panels: [
    { word: 'Solutions', kicker: 'Where it begins', text: 'Built around outcomes, not around tools.' },
    { word: 'Technology', kicker: 'The foundation', text: 'The right tools, selected for the job. Nothing decorative.' },
    { word: 'Efficiency', kicker: 'The multiplier', text: 'Fewer steps. Faster decisions. Less waste between idea and result.' },
    { word: 'Innovation', kicker: 'The edge', text: 'New capability introduced only where it earns its keep.' },
    { word: 'Growth', kicker: 'The result', text: 'Foundations that scale with the business instead of against it.' },
  ],
}

/** value: null renders as a [XX] placeholder until the client supplies real figures. */
export const stats: { value: number | null; suffix: string; label: string; note: string }[] = [
  { value: null, suffix: '+', label: 'Projects Delivered', note: 'To be supplied' },
  { value: null, suffix: '+', label: 'Years of Experience', note: 'To be supplied' },
  { value: null, suffix: '+', label: 'Clients Served', note: 'To be supplied' },
  { value: null, suffix: '%', label: 'Client Satisfaction', note: 'To be supplied' },
]

export const why = {
  label: 'Why Apple Infotech',
  title: ['Why', 'Apple Infotech?'],
  lead: 'Four principles the work is held to.',
  items: [
    { n: '01', t: 'Business Understanding', d: 'We begin with how your business makes money — then choose the technology to serve it.' },
    { n: '02', t: 'Technology Expertise', d: 'Practical engineering capability across the modern stack, applied with restraint.' },
    { n: '03', t: 'Reliable Delivery', d: 'Clear plans, honest timelines, and work that ships when we say it will.' },
    { n: '04', t: 'ROI-Focused Approach', d: 'Every decision is weighed against the return it creates for you.' },
  ],
}

export const cta = {
  lines: ['Ready to Create', 'Better ROI?'],
  text: "Let's build something that moves your business forward.",
  button: 'Start a Conversation',
  marquee: 'Better ROI',
}

export const footer = {
  statement: 'Technology that creates better ROI.',
  contact: [
    { k: 'Email', v: '[ email address ]', href: '#contact' },
    { k: 'Phone', v: '[ phone number ]', href: '#contact' },
    { k: 'Office', v: '[ office address ]', href: '#contact' },
  ],
  social: [
    { label: 'LinkedIn', href: '#' },
    { label: 'X', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
}

export const stats_meta = {
  label: 'In numbers',
  title: ['Proof,', 'not promises.'],
  note: 'Figures shown as [XX] are placeholders — to be replaced with verified company data.',
}
