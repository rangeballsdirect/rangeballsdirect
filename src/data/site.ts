export const site = {
  name: 'RangeBallsDirect',
  chineseNameParts: ['高尔夫练习球', '直供'] as const,
  /** Rendered as two-tone: `RangeBalls` in white, `Direct` in the accent. */
  nameParts: ['RangeBalls', 'Direct'] as const,
  tagline: 'Range balls sourced direct. Inspected in person, delivered across Europe.',
  description:
    'We vet golf ball factories in mainland China in person, then import and deliver range balls to driving ranges and golf courses across Europe.',
  email: 'carl@rangeballsdirect.com',
  /** Prefills the subject line of the enquiry mailto. */
  enquirySubject: 'Range ball enquiry',
};

/**
 * Footer credit. Anchor text is branded with a light descriptor. Do not add
 * rel="nofollow" — the link is an editorial credit, not paid placement.
 */
export const credit = {
  prefix: 'Web design by',
  name: 'Lucent Digital Studio',
  url: 'https://www.lucentdigital.co.uk/',
  title: 'Lucent Digital Studio — web design, Leeds',
};

export const nav = [
  { label: 'Your options', href: '#range' },
  { label: 'Quality control', href: '#quality' },
  { label: 'Buying', href: '#delivery' },
] as const;

export const hero = {
  headline: ['Our Range Balls,', 'Our Networks'] as const,
  body: "We have built relationships with multiple golf ball manufacturing plants, giving us reliable access to quality driving range balls, competitive pricing and consistent supply for our customers.",
  stats: [
    {
      figure: 'The start',
      note: "Before it's a ball, before it's a slug, it's chemistry.",
      coreFormula: '(C₄H₆)ₙ, C₆H₆O₄Zn, ZnO and C₁₈H₂₂O₂',
      coverMaterials: 'E/MAA–Zn/Na, TiO₂, BaSO₄ and HALS',
      accent: true,
    },
    { figure: 'Production', note: 'From raw materials to finished ball, quality checks at key stages keep the production run on spec.', coreFormula: null, coverMaterials: null },
    { figure: 'Delivery & Shipping', note: 'From ball plant to port, port to port, then delivered direct to your range.', coreFormula: null, coverMaterials: null },
  ],
};

export const countries = [
  'United Kingdom', 'Ireland', 'Germany', 'France',
  'Spain', 'Netherlands', 'Sweden', 'Denmark',
];

export const buying = {
  heading: 'Your range-ball partner',
  intro: 'You deal directly with our PGA professional, who has spent 30 years working on driving ranges. Together, we look at the ball you need now, how you manage the balls already on your range and what the next order should look like.',
  options: [
    {
      title: 'A ball procurement plan',
      note: 'We can map out quantities, ball specification and replenishment over time, with branding and delivery timing built around how your range operates.',
    },
    {
      title: 'Payment & terms',
      note: 'Payment options can be discussed as part of the proposal. Any arrangement depends on agreed terms, confirmed in writing before you commit.',
    },
  ],
};
