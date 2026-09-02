// Model registry — plain data, safe to import statically without pulling three.js.
// Models from the Khronos glTF sample library, CC BY 4.0 / CC0 — credited in the footer.

export const MODELS = {
  gothicBed: {
    url: '/models/GothicBed.glb',
    label: 'Heritage Bed',
    camera: [2.9, 1.5, 3.3], target: [0, 0.5, 0], fov: 38, offset: [0, -0.55, 0],
    fabric: null, // single-material carve — finish only
    wood: {
      mode: 'tint', match: /GothicBed/i,
      options: [
        { name: 'Antique Oak', css: '#6f4f33', original: true },
        { name: 'Warm Walnut', css: '#7a5a3a', color: '#b98c60' },
        { name: 'Espresso', css: '#4a3626', color: '#8a6a4e' },
        { name: 'Noir Stain', css: '#35302c', color: '#6a625c' },
      ],
    },
  },
  glamSofa: {
    url: '/models/sofa.glb',
    label: 'Velvet Sofa',
    camera: [2.1, 1.15, 2.5], target: [0, 0.12, 0], fov: 38, offset: [0, -0.42, 0],
    fabric: {
      mode: 'variant',
      options: [
        { name: 'Champagne Velvet', css: '#d9c7a8', variant: 'Champagne' },
        { name: 'Navy Velvet', css: '#2b3a5e', variant: 'Navy' },
        { name: 'Dove Gray Velvet', css: '#8a8a8f', variant: 'Gray' },
        { name: 'Black Velvet', css: '#262626', variant: 'Black' },
        { name: 'Pale Pink Velvet', css: '#d8a8a3', variant: 'Pale Pink' },
      ],
    },
    wood: {
      mode: 'tint', match: /legs/i,
      options: [
        { name: 'Natural Oak', css: '#9a7648', color: '#9a7648' },
        { name: 'Walnut', css: '#5f4630', color: '#5f4630' },
        { name: 'Espresso', css: '#37281c', color: '#37281c' },
        { name: 'Black', css: '#1d1d1f', color: '#1d1d1f' },
      ],
    },
  },
  sheenChair: {
    url: '/models/SheenChair.glb',
    label: 'Lounge Chair',
    camera: [1.22, 0.7, 1.42], target: [0, 0.05, 0], fov: 40, offset: [0, -0.38, 0],
    fabric: {
      mode: 'variant',
      options: [
        { name: 'Mango Velvet', css: '#d98a3a', variant: 'Mango Velvet' },
        { name: 'Peacock Velvet', css: '#1f6d68', variant: 'Peacock Velvet' },
      ],
    },
    wood: null, // the variants pair their own wood
  },
  damaskChair: {
    url: '/models/ChairDamaskPurplegold.glb',
    label: 'Damask Chair',
    camera: [1.08, 0.5, 1.24], target: [0, -0.02, 0], fov: 40, offset: [0, -0.42, 0],
    fabric: {
      mode: 'reupholster', match: /fabric/i,
      options: [
        { name: 'Damask Purple & Gold', css: 'linear-gradient(135deg,#6a5085 50%,#c9a24e 50%)', original: true },
        { name: 'Royal Blue Velvet', css: '#2a3f8f', color: '#2a3f8f' },
        { name: 'Emerald Velvet', css: '#1d5546', color: '#1d5546' },
        { name: 'Ivory Silk', css: '#e6dcc3', color: '#e6dcc3' },
        { name: 'Crimson Velvet', css: '#8f2f38', color: '#8f2f38' },
      ],
    },
    wood: {
      mode: 'tint', match: /wood/i,
      options: [
        { name: 'Antique Brown', css: '#6b4a2f', original: true },
        { name: 'Mahogany', css: '#5a3026', color: '#8f5a44' },
        { name: 'Espresso', css: '#37281c', color: '#5a4636' },
        { name: 'Black Lacquer', css: '#1d1d1f', color: '#3a3a3c' },
      ],
    },
  },
  leatherSofa: {
    url: '/models/SheenWoodLeatherSofa.glb',
    label: 'Leather Sofa',
    camera: [2.3, 1.1, 2.7], target: [0, 0.15, 0], fov: 38, offset: [0, -0.45, 0],
    fabric: {
      mode: 'reupholster', match: /^Brown$/,
      options: [
        { name: 'Saddle Leather', css: '#7a4b2a', original: true },
        { name: 'Onyx Leather', css: '#25211e', color: '#25211e' },
        { name: 'Oxblood Leather', css: '#5c2b26', color: '#5c2b26' },
        { name: 'Slate Leather', css: '#4a4a4e', color: '#4a4a4e' },
      ],
    },
    wood: {
      mode: 'tint', match: /^Frame$/,
      options: [
        { name: 'Natural Frame', css: '#8a6a44', original: true },
        { name: 'Walnut', css: '#5f4630', color: '#7a5a3a' },
        { name: 'Black', css: '#1d1d1f', color: '#3a3632' },
      ],
    },
  },
};
