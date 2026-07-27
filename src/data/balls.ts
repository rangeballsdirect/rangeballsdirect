/**
 * The range. Adding, removing or reordering a ball is a data edit here —
 * `BallRange.astro` renders whatever this array contains and the enquiry form
 * picks the name up from the row's `data-ball` attribute.
 */
export interface Ball {
  name: string;
  blurb: string;
}

export const balls: Ball[] = [
  {
    name: 'Distance',
    blurb: 'Hard-wearing 2-piece Surlyn — high-traffic tee lines & ball machines',
  },
  {
    name: 'Tour Flight',
    blurb: 'Softer feel and truer flight for premium ranges and coaching bays',
  },
  {
    name: 'Floater',
    blurb: 'Buoyant construction for water ranges and floating-target retrieval',
  },
  {
    name: 'Hi-Vis Colour',
    blurb: 'High-visibility optic shades that hold up in low light and winter play',
  },
  {
    name: 'Custom Logo',
    blurb: 'Your range or course branding, printed to spec and proofed first',
  },
  {
    name: 'Limited Flight',
    blurb: 'Restricted distance for compact ranges and shorter practice fields',
  },
];
