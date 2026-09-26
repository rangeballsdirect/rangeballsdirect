/**
 * The range. Adding, removing or reordering a ball is a data edit here —
 * `BallRange.astro` renders whatever this array contains, numbering included.
 */
export interface Ball {
  name: string;
  blurb: string;
}

export const balls: Ball[] = [
  {
    name: 'Distance Matters',
    blurb: 'Every range is different — with restrictions on flight carry for shorter range facilities or optimum ball performance where space allows',
  },
  {
    name: 'Floater',
    blurb: 'Low density core with higher compression values.',
  },
  {
    name: 'High Optic Yellow',
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
