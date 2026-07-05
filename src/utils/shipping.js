// Order-value based shipping.
//   subtotal >= 480  -> free
//   subtotal >= 300  -> ₹40
//   subtotal  > 0    -> ₹60
// Only ONE charge applies (the tier the order value reaches) — never summed.
export function calcShipping(subtotal) {
  const s = Number(subtotal) || 0;
  if (s <= 0) return 0;
  if (s >= 480) return 0;
  if (s >= 300) return 40;
  return 60;
}
