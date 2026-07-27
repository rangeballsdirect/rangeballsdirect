export const site = {
  name: 'RangeBallsDirect',
  /** Rendered as two-tone: `RangeBalls` in white, `Direct` in the accent. */
  nameParts: ['RangeBalls', 'Direct'] as const,
  tagline: 'Range balls sourced direct. Inspected in person, delivered across Europe.',
  description:
    'We vet golf ball factories in mainland China in person, then import and deliver range balls to driving ranges and golf courses across Europe.',
  email: 'hello@rangeballsdirect.com',
  /**
   * Where the enquiry form posts. FormSubmit needs no account or key, but stays
   * inert until someone at `email` clicks its one-time activation link.
   * Swap for a Formspree URL, serverless function or CRM webhook as needed.
   */
  formEndpoint: 'https://formsubmit.co/hello@rangeballsdirect.com',
  formEndpointAjax: 'https://formsubmit.co/ajax/hello@rangeballsdirect.com',
};

export const nav = [
  { label: 'The range', href: '#range' },
  { label: 'Quality control', href: '#quality' },
  { label: 'Delivery', href: '#delivery' },
  { label: 'About', href: '#enquiry' },
] as const;

export const hero = {
  eyebrow: 'Sourced in China · Inspected in person · Delivered in Europe',
  headline: ['Range balls,', 'sourced direct'] as const,
  body: 'We vet the factories in mainland China in person, then import and deliver to driving ranges and golf courses right across Europe. One contact. No guesswork.',
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
