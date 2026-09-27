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
  { label: 'Delivery', href: '#delivery' },
  { label: 'About', href: '#enquiry' },
] as const;

export const hero = {
  headline: ['Our Range', 'Balls'] as const,
  body: "We've built strong relationships with multiple golf ball manufacturing plants, giving us reliable access to quality driving range balls, competitive pricing and consistent supply for our customers.",
  stats: [
    { figure: 'In person', note: 'Every factory visited & vetted before we buy', accent: true },
    { figure: '14 countries', note: 'Delivered across Europe, door to door' },
    { figure: '1 working day', note: 'Typical reply to a new enquiry' },
  ],
};

export const countries = [
  'United Kingdom', 'Ireland', 'Germany', 'France',
  'Spain', 'Netherlands', 'Sweden', 'Denmark',
];

export const process = [
  { step: '01', title: 'Audit & select', note: 'We visit and vet candidate factories in China.' },
  { step: '02', title: 'Approve spec', note: 'You sign off feel, flight, cover and print.' },
  { step: '03', title: 'Inspect run', note: 'We check production before it leaves.' },
  { step: '04', title: 'Import & clear', note: 'Freight and customs into Europe, by us.' },
  { step: '05', title: 'Deliver', note: 'To your range or course, ready to play.' },
];
