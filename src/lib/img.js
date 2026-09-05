import { IMG_SIZES } from '../data/img-sizes.js';

// Every processed photo ships a half-size sibling: name.webp / name-sm.webp.
// The small file is what phones and thumbnails actually download.
//
// The width descriptors have to be the real pixel widths, generated alongside
// the files themselves. Guessed ones are worse than none: promise a 512px file
// is 760 wide and the browser will happily hand it to a 700px slot and stretch
// it, which is most of what "the photo looks blurry" turns out to be.
const nameOf = (src) => src.slice(src.lastIndexOf('/') + 1).replace('.webp', '');

export const srcset = (src) => {
  const size = IMG_SIZES[nameOf(src)];
  const small = src.replace('.webp', '-sm.webp');
  // an unknown name means the manifest has not been rebuilt — one honest
  // candidate beats a made-up pair
  if (!size) return `${src}`;
  return `${small} ${size.sm}w, ${src} ${size.w}w`;
};

// The photograph's own shape, for anywhere that has to reserve its exact box.
// Shop The Room pins its hotspots to percentages of the picture, so if this
// were written down by hand instead of read from the file, re-importing a
// photograph at a different shape would silently move every dot on it.
export const ratio = (src) => {
  const size = IMG_SIZES[nameOf(src)];
  return size ? `${size.w} / ${size.h}` : '4 / 3';
};

// swap both attributes at once when a layer changes image mid-animation
export const setImg = (el, src) => {
  el.srcset = srcset(src);
  el.src = src;
};
