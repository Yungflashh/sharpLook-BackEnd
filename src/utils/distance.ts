export const haversineDistanceKm = (
  clientLat: number,
  clientLong: number,
  vendorLat: number,
  vendorLong: number
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180

  const R = 6371 // Radius of Earth in KM
  const dLat = toRadians(vendorLat - clientLat)
  const dLon = toRadians(vendorLong - clientLong)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(clientLat)) *
      Math.cos(toRadians(vendorLat)) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
