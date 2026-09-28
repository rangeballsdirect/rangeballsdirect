/**
 * The range. Adding, removing or reordering a ball is a data edit here —
 * `BallRange.astro` renders whatever this array contains, numbering included.
 */
export interface Ball {
  name: string;
  blurb?: string;
}

export const balls: Ball[] = [
  {
    name: 'Distance Matters',
    blurb: 'Every range is different. Coefficient of restitution (COR) measures rebound at impact and is one factor in ball speed and distance. Shorter ranges may need controlled carry; longer ranges may have room for fuller flight.',
  },
  {
    name: 'Floater',
    blurb: 'Low density core with higher compression values.',
  },
  {
    name: 'High Optic Yellow',
  },
  {
    name: 'Custom Logo',
    blurb: 'Your range or course branding, printed to spec and proofed first',
  },
  {
    name: 'Limited Flight',
    blurb: "Compact range? We dial down the rebound. A low-COR ball helps keep the flight inside the space you've got.",
  },
];
