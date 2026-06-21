// MOCK DATA — w produkcji z BDOT10k / IMGW SHAPI / ISOK

type Coords = [number, number]
type Ring = Coords[]

function rectFeature(lng: number, lat: number, w: number, h: number) {
  const ring: Ring = [
    [lng,     lat],
    [lng + w, lat],
    [lng + w, lat + h],
    [lng,     lat + h],
    [lng,     lat],
  ]
  return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [ring] }, properties: {} }
}

// Generate a grid of building rectangles with slight size variation
function buildGrid(
  startLng: number, startLat: number,
  cols: number, rows: number,
  bW: number, bH: number,
  gW: number, gH: number,
  skipFn?: (c: number, r: number) => boolean,
) {
  const features = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (skipFn?.(c, r)) continue
      const lng = startLng + c * (bW + gW)
      const lat = startLat + r * (bH + gH)
      const wMod = 0.78 + ((c * 3 + r * 7) % 5) * 0.08
      const hMod = 0.72 + ((c * 5 + r * 3) % 4) * 0.07
      features.push(rectFeature(lng, lat, bW * wMod, bH * hMod))
    }
  }
  return features
}

// ── Budynki mieszkalne — Osobowice / Kozanów (MOCK) ─────────────────────────

const BUILDING_FEATURES = [
  // Blok A — gęsta zabudowa wschodnia
  ...buildGrid(16.983, 51.150, 8, 7, 0.00038, 0.00026, 0.00012, 0.00010,
    (c, r) => (c === 3 && r === 3) || (c === 6 && r === 1)),

  // Blok B — zabudowa środkowa
  ...buildGrid(16.997, 51.148, 6, 8, 0.00042, 0.00022, 0.00010, 0.00008,
    (c, r) => c === 2 && r === 5),

  // Blok C — zabudowa północna (rzadsza)
  ...buildGrid(16.979, 51.160, 5, 4, 0.00058, 0.00034, 0.00020, 0.00016,
    (c, r) => (c + r) % 5 === 0),

  // Blok D — przy rzece (gęste)
  ...buildGrid(16.991, 51.154, 7, 5, 0.00035, 0.00021, 0.00009, 0.00009,
    (c, r) => c === 4 && r === 2),

  // Blok E — wschodnia część (gęsta)
  ...buildGrid(17.010, 51.151, 7, 6, 0.00040, 0.00025, 0.00011, 0.00009),

  // Blok F — dalej na wschód
  ...buildGrid(17.025, 51.149, 5, 7, 0.00036, 0.00024, 0.00010, 0.00008,
    (c, r) => (c * 2 + r) % 7 === 0),
]

export const BUILDINGS_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: BUILDING_FEATURES,
}

// ── Zbiorniki wodne — Odra, kanał główny (MOCK) ──────────────────────────────

export const WATER_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          // Północna granica kanału głównego (od zachodu do wschodu)
          [16.920, 51.149], [16.938, 51.149], [16.952, 51.148],
          [16.965, 51.148], [16.978, 51.147], [16.991, 51.147],
          [17.005, 51.146], [17.020, 51.145], [17.035, 51.144],
          [17.050, 51.143], [17.065, 51.142], [17.082, 51.140],
          [17.096, 51.138],
          // Południowa granica kanału
          [17.096, 51.133], [17.082, 51.134], [17.065, 51.136],
          [17.050, 51.137], [17.035, 51.138], [17.020, 51.139],
          [17.005, 51.139], [16.991, 51.140], [16.978, 51.141],
          [16.965, 51.142], [16.952, 51.143], [16.938, 51.143],
          [16.920, 51.142],
          [16.920, 51.149],
        ] as Ring],
      },
      properties: {},
    },
    // Mała odnoga / starorzecze
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [17.002, 51.153], [17.018, 51.154], [17.030, 51.154],
          [17.030, 51.151], [17.018, 51.151], [17.002, 51.150],
          [17.002, 51.153],
        ] as Ring],
      },
      properties: {},
    },
  ],
}

// ── Przebieg kanału powodziowego (MOCK) ──────────────────────────────────────

export const CANAL_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [16.956, 51.108], [16.970, 51.113], [16.984, 51.119],
          [16.999, 51.124], [17.014, 51.128], [17.030, 51.131],
          [17.046, 51.132], [17.061, 51.131], [17.076, 51.128],
          [17.090, 51.123], [17.103, 51.118],
        ] as Coords[],
      },
      properties: {},
    },
  ],
}
