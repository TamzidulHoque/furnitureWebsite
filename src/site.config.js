// ─────────────────────────────────────────────────────────────
//  All contact / link data lives HERE and only here.
//  Edit these values and the whole site updates.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Heaven Furniture Mart',
  tagline: 'Designed. Crafted. Customized.',
  phoneDisplay: '+880 1960-481983',
  phoneHref: 'tel:+8801960481983',
  whatsappNumber: '8801960481983', // digits only, no "+"
  email: 'heavenfurnituremart@gmail.com',
  address: 'Agrabad Access Road, Opposite of RAK Ceramics, Chattogram, Bangladesh',
  addressShort: 'Agrabad Access Road, Chattogram',
  social: {
    facebook: 'https://facebook.com/HeavenFurnitureMart',
    instagram: 'https://instagram.com/heaven_furniture_ltd',
    youtube: 'https://youtube.com/@HeavenFurnitureMart',
  },
  md: 'Abul Kalam Bhuiyan',
  founded: 2020,
};

export const waLink = (text) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const WA_DEFAULT = waLink(
  `Hello ${SITE.name}! I would like a free design consultation.`
);
