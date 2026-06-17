// MOCK DATA — w produkcji z IMGW SHAPI
import type { Basin, River, Station } from '@/types'

// ── Stacje Odra — Wrocław ───────────────────────────────────────────────────
const odraSt: Station[] = [
  { id: 'odra-olawa',       name: 'Oława-miasto',        river: 'Odra', km: 230, value: 245,  severity: 'L1', trend: 'up',     thresholds: { l1: 200, l2: 380, l3: 450 }, lastUpdate: '16:40', lat: 50.9488, lng: 17.2875 },
  { id: 'odra-trestno',     name: 'Trestno',             river: 'Odra', km: 242, value: 523,  severity: 'L3', trend: 'up',     thresholds: { l1: 200, l2: 380, l3: 450 }, lastUpdate: '16:42', lat: 51.1030, lng: 17.0500 },
  { id: 'odra-szczytniki',  name: 'Szczytniki',          river: 'Odra', km: 249, value: 498,  severity: 'L3', trend: 'up',     thresholds: { l1: 200, l2: 380, l3: 450 }, lastUpdate: '16:38', lat: 51.1157, lng: 17.0208 },
  { id: 'odra-osobowice',   name: 'Osobowice',           river: 'Odra', km: 255, value: 472,  severity: 'L2', trend: 'up',     thresholds: { l1: 180, l2: 340, l3: 420 }, lastUpdate: '16:31', lat: 51.1420, lng: 16.9960 },
  { id: 'odra-srodmiescie', name: 'Śródmieście',         river: 'Odra', km: 263, value: 445,  severity: 'L2', trend: 'up',     thresholds: { l1: 180, l2: 340, l3: 420 }, lastUpdate: '16:39', lat: 51.1100, lng: 17.0300 },
  { id: 'odra-brzeg-dolny', name: 'Brzeg Dolny',         river: 'Odra', km: 270, value: 398,  severity: 'L2', trend: 'up',     thresholds: { l1: 180, l2: 340, l3: 420 }, lastUpdate: '16:28', lat: 51.2680, lng: 16.7110 },
]

// ── Stacje Bystrzyca ────────────────────────────────────────────────────────
const bystrzycaSt: Station[] = [
  { id: 'bys-kondratowice', name: 'Kondratowice', river: 'Bystrzyca', km:  0, value:  88, severity: 'L0', trend: 'stable', thresholds: { l1: 140, l2: 230, l3: 270 }, lastUpdate: '16:30', lat: 50.8350, lng: 16.9230 },
  { id: 'bys-wilkszyn',     name: 'Wilkszyn',     river: 'Bystrzyca', km:  8, value: 198, severity: 'L2', trend: 'up',    thresholds: { l1: 140, l2: 230, l3: 270 }, lastUpdate: '16:24', lat: 51.0270, lng: 16.8450 },
  { id: 'bys-jarnoltow',    name: 'Jarnołtów',    river: 'Bystrzyca', km: 18, value: 312, severity: 'L3', trend: 'up',    thresholds: { l1: 140, l2: 230, l3: 270 }, lastUpdate: '16:37', lat: 51.0820, lng: 16.8740 },
  { id: 'bys-lesnica',      name: 'Leśnica',       river: 'Bystrzyca', km: 26, value: 248, severity: 'L2', trend: 'down',  thresholds: { l1: 140, l2: 230, l3: 270 }, lastUpdate: '16:08', lat: 51.1200, lng: 16.9200 },
]

// ── Stacje Widawa ────────────────────────────────────────────────────────────
const widawaSt: Station[] = [
  { id: 'wid-szewce',       name: 'Szewce',        river: 'Widawa', km:  0, value: 142, severity: 'L1', trend: 'up',     thresholds: { l1: 80, l2: 150, l3: 200 }, lastUpdate: '16:20', lat: 51.2480, lng: 17.1990 },
  { id: 'wid-krzyzanowice', name: 'Krzyżanowice',  river: 'Widawa', km:  8, value: 188, severity: 'L3', trend: 'stable', thresholds: { l1: 80, l2: 150, l3: 200 }, lastUpdate: '16:28', lat: 51.2100, lng: 17.0750 },
  { id: 'wid-widawa-miasto',name: 'Widawa-miasto',  river: 'Widawa', km: 18, value: 165, severity: 'L2', trend: 'stable', thresholds: { l1: 80, l2: 150, l3: 200 }, lastUpdate: '16:29', lat: 51.1850, lng: 17.0560 },
  { id: 'wid-ujscie',       name: 'Ujście',         river: 'Widawa', km: 24, value: 128, severity: 'L1', trend: 'stable', thresholds: { l1: 80, l2: 150, l3: 200 }, lastUpdate: '16:10', lat: 51.1600, lng: 17.0370 },
]

// ── Stacje Ślęza ─────────────────────────────────────────────────────────────
const slezaSt: Station[] = [
  { id: 'sle-sleza',         name: 'Ślęza',                  river: 'Ślęza', km:  0, value: 112, severity: 'L0', trend: 'stable', thresholds: { l1: 130, l2: 270, l3: 300 }, lastUpdate: '16:15', lat: 50.8910, lng: 17.0880 },
  { id: 'sle-bielany',       name: 'Bielany Wrocławskie',    river: 'Ślęza', km: 14, value: 156, severity: 'L1', trend: 'stable', thresholds: { l1: 130, l2: 270, l3: 300 }, lastUpdate: '16:05', lat: 51.0430, lng: 17.0040 },
  { id: 'sle-wojszyce',      name: 'Wojszyce',               river: 'Ślęza', km: 22, value: 142, severity: 'L1', trend: 'down',   thresholds: { l1: 130, l2: 270, l3: 300 }, lastUpdate: '16:23', lat: 51.0680, lng: 17.0330 },
  { id: 'sle-ujscie',        name: 'Ujście',                  river: 'Ślęza', km: 28, value:  98, severity: 'L0', trend: 'stable', thresholds: { l1: 130, l2: 270, l3: 300 }, lastUpdate: '15:58', lat: 51.0850, lng: 17.0210 },
]

// ── Stacje Oława ─────────────────────────────────────────────────────────────
const olawaSt: Station[] = [
  { id: 'ola-zborowice',    name: 'Zborowice',   river: 'Oława', km:  0, value:  98, severity: 'L0', trend: 'stable', thresholds: { l1: 100, l2: 200, l3: 250 }, lastUpdate: '16:05', lat: 50.7500, lng: 17.2560 },
  { id: 'ola-domaniow',     name: 'Domaniów',    river: 'Oława', km: 12, value: 142, severity: 'L0', trend: 'down',   thresholds: { l1: 100, l2: 200, l3: 250 }, lastUpdate: '16:00', lat: 50.8760, lng: 17.1910 },
  { id: 'ola-olawa-miasto', name: 'Oława-miasto',river: 'Oława', km: 22, value: 185, severity: 'L1', trend: 'down',   thresholds: { l1: 100, l2: 200, l3: 250 }, lastUpdate: '15:56', lat: 50.9480, lng: 17.2740 },
  { id: 'ola-opatowice',    name: 'Opatowice',   river: 'Oława', km: 30, value: 162, severity: 'L1', trend: 'down',   thresholds: { l1: 100, l2: 200, l3: 250 }, lastUpdate: '15:50', lat: 51.0200, lng: 17.1250 },
  { id: 'ola-ujscie',       name: 'Ujście',       river: 'Oława', km: 36, value: 124, severity: 'L0', trend: 'stable', thresholds: { l1: 100, l2: 200, l3: 250 }, lastUpdate: '15:40', lat: 51.0850, lng: 17.0780 },
]

// ── Stacje Dorzecze Wisły ───────────────────────────────────────────────────
const dunajcSt: Station[] = [
  { id: 'dun-nowy-sacz',    name: 'Nowy Sącz',   river: 'Dunajec', km: 80, value: 342, severity: 'L2', trend: 'up',    thresholds: { l1: 180, l2: 260, l3: 350 }, lastUpdate: '16:41', lat: 49.6269, lng: 20.6893 },
  { id: 'dun-nowy-targ',    name: 'Nowy Targ',   river: 'Dunajec', km: 36, value: 198, severity: 'L1', trend: 'up',    thresholds: { l1: 150, l2: 240, l3: 310 }, lastUpdate: '16:30', lat: 49.4858, lng: 20.0395 },
]
const sanSt: Station[] = [
  { id: 'san-przemysl',     name: 'Przemyśl',    river: 'San',     km: 54, value: 285, severity: 'L2', trend: 'up',    thresholds: { l1: 170, l2: 240, l3: 330 }, lastUpdate: '16:28', lat: 49.7838, lng: 22.7677 },
]
const wislaSt: Station[] = [
  { id: 'wis-nowa-huta',    name: 'Nowa Huta',   river: 'Wisła',   km: 74, value: 312, severity: 'L2', trend: 'up',    thresholds: { l1: 200, l2: 280, l3: 380 }, lastUpdate: '15:40', lat: 50.0684, lng: 20.0582 },
]
const rabaSt: Station[] = [
  { id: 'rab-proskowki',    name: 'Proszówki',   river: 'Raba',    km: 12, value: 198, severity: 'L2', trend: 'up',    thresholds: { l1: 120, l2: 160, l3: 220 }, lastUpdate: '15:09', lat: 49.9440, lng: 20.4290 },
]

// ── Stacje Dorzecze Pregołu ─────────────────────────────────────────────────
const lynaSt: Station[] = [
  { id: 'lyn-olsztyn',      name: 'Olsztyn',     river: 'Łyna',    km: 28, value: 142, severity: 'L3', trend: 'up',    thresholds: { l1: 80, l2: 110, l3: 130 }, lastUpdate: '16:29', lat: 53.7784, lng: 20.4801 },
]

// ── Helper ───────────────────────────────────────────────────────────────────
function dominantStation(stations: Station[]): Station {
  return [...stations].sort((a, b) => {
    const sOrder = { L3: 4, L2: 3, L1: 2, L0: 1 }
    if (sOrder[b.severity] !== sOrder[a.severity]) return sOrder[b.severity] - sOrder[a.severity]
    return b.value - a.value
  })[0]
}

function maxSeverity(stations: Station[]) {
  const order = { L3: 4, L2: 3, L1: 2, L0: 1 } as const
  return [...stations].sort((a, b) => order[b.severity] - order[a.severity])[0].severity
}

// ── Rivers ───────────────────────────────────────────────────────────────────
const rivers: River[] = [
  { id: 'odra-wroclaw',  name: 'Odra',      displayName: 'Odra — Wrocław', basin: 'odra',    stations: odraSt },
  { id: 'bystrzyca',     name: 'Bystrzyca', displayName: 'Bystrzyca',      basin: 'odra',    stations: bystrzycaSt },
  { id: 'widawa',        name: 'Widawa',    displayName: 'Widawa',         basin: 'odra',    stations: widawaSt },
  { id: 'sleza',         name: 'Ślęza',     displayName: 'Ślęza',          basin: 'odra',    stations: slezaSt },
  { id: 'olawa',         name: 'Oława',     displayName: 'Oława',          basin: 'odra',    stations: olawaSt },
  { id: 'dunajec',       name: 'Dunajec',   displayName: 'Dunajec',        basin: 'wisla',   stations: dunajcSt },
  { id: 'san',           name: 'San',       displayName: 'San',            basin: 'wisla',   stations: sanSt },
  { id: 'wisla-krakow',  name: 'Wisła',     displayName: 'Wisła — Kraków', basin: 'wisla',   stations: wislaSt },
  { id: 'raba',          name: 'Raba',      displayName: 'Raba',           basin: 'wisla',   stations: rabaSt },
  { id: 'lyna',          name: 'Łyna',      displayName: 'Łyna',           basin: 'pregola', stations: lynaSt },
]

// ── Basins ───────────────────────────────────────────────────────────────────
export const basins: Basin[] = [
  {
    id: 'odra',
    name: 'DORZECZE ODRY',
    rivers: rivers.filter(r => r.basin === 'odra'),
    alertCount: 16,
    maxSeverity: 'L3',
  },
  {
    id: 'wisla',
    name: 'DORZECZE WISŁY',
    rivers: rivers.filter(r => r.basin === 'wisla'),
    alertCount: 12,
    maxSeverity: 'L2',
  },
  {
    id: 'pregola',
    name: 'DORZECZE PREGOŁU',
    rivers: rivers.filter(r => r.basin === 'pregola'),
    alertCount: 2,
    maxSeverity: 'L3',
  },
]

export { rivers, dominantStation, maxSeverity }
