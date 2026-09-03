// Every processed photo ships a half-size sibling: name.webp / name-sm.webp.
// The small file is what phones and thumbnails actually download.
export const srcset = (src) => `${src.replace('.webp', '-sm.webp')} 520w, ${src} 1100w`;

// swap both attributes at once when a layer changes image mid-animation
export const setImg = (el, src) => {
  el.srcset = srcset(src);
  el.src = src;
};
