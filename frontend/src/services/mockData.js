// Initial Realistic ChargerGo Network Seed Data

export const INITIAL_STATIONS = [
  {
    id: 1,
    name: 'ChargerGo Vijay Nagar Hub',
    address: '12, Vijay Nagar Square, AB Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    latitude: 22.7533,
    longitude: 75.8937,
    operator: 'ChargerGo Express',
    openingTime: '06:00:00',
    closingTime: '23:00:00',
    status: 'ACTIVE',
    totalChargers: 4,
    availableChargers: 3,
    chargers: [
      { id: 1, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 2, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 3, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 4, chargerNumber: 'C04', chargerType: 'CHAdeMO', chargingSpeed: 'DC Fast', powerKw: 50, status: 'ACTIVE' }
    ]
  },
  {
    id: 2,
    name: 'ChargerGo Indore Supercharge Point',
    address: 'Plot 45, Scheme No. 78, Near Bombay Hospital',
    city: 'Indore',
    state: 'Madhya Pradesh',
    latitude: 22.7610,
    longitude: 75.8850,
    operator: 'ChargerGo Pro',
    openingTime: '00:00:00',
    closingTime: '23:59:00',
    status: 'ACTIVE',
    totalChargers: 6,
    availableChargers: 5,
    chargers: [
      { id: 5, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 150, status: 'ACTIVE' },
      { id: 6, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 7, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 8, chargerNumber: 'C04', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 9, chargerNumber: 'C05', chargerType: 'DC_FAST', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 10, chargerNumber: 'C06', chargerType: 'CHAdeMO', chargingSpeed: 'DC Fast', powerKw: 50, status: 'ACTIVE' }
    ]
  },
  {
    id: 3,
    name: 'ChargerGo Bhopal MP Nagar Station',
    address: 'MP Nagar Zone-II, Near DB City Mall',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    latitude: 23.2332,
    longitude: 77.4350,
    operator: 'ChargerGo Central',
    openingTime: '07:00:00',
    closingTime: '22:00:00',
    status: 'ACTIVE',
    totalChargers: 3,
    availableChargers: 2,
    chargers: [
      { id: 11, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 12, chargerNumber: 'C02', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 13, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 7.4, status: 'ACTIVE' }
    ]
  },
  {
    id: 4,
    name: 'ChargerGo Highway Express Hub',
    address: 'Indore-Ujjain Expressway, Toll Plaza Milestone 18',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    latitude: 23.0100,
    longitude: 75.8200,
    operator: 'ChargerGo Highway',
    openingTime: '00:00:00',
    closingTime: '23:59:00',
    status: 'ACTIVE',
    totalChargers: 5,
    availableChargers: 4,
    chargers: [
      { id: 14, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 150, status: 'ACTIVE' },
      { id: 15, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 16, chargerNumber: 'C03', chargerType: 'CHAdeMO', chargingSpeed: 'DC Fast', powerKw: 50, status: 'ACTIVE' },
      { id: 17, chargerNumber: 'C04', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 18, chargerNumber: 'C05', chargerType: 'DC_FAST', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' }
    ]
  },
  {
    id: 5,
    name: 'ChargerGo Bengaluru Tech Hub',
    address: 'ITPL Main Road, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9850,
    longitude: 77.7310,
    operator: 'ChargerGo Tech',
    openingTime: '06:00:00',
    closingTime: '23:00:00',
    status: 'ACTIVE',
    totalChargers: 8,
    availableChargers: 7,
    chargers: [
      { id: 19, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 150, status: 'ACTIVE' },
      { id: 20, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 21, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 22, chargerNumber: 'C04', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 23, chargerNumber: 'C05', chargerType: 'DC_FAST', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 24, chargerNumber: 'C06', chargerType: 'CHAdeMO', chargingSpeed: 'DC Fast', powerKw: 50, status: 'ACTIVE' }
    ]
  },
  {
    id: 6,
    name: 'ChargerGo Cyber City Station',
    address: 'Cyber Towers, HITEC City',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4474,
    longitude: 78.3762,
    operator: 'ChargerGo South',
    openingTime: '06:00:00',
    closingTime: '23:00:00',
    status: 'ACTIVE',
    totalChargers: 4,
    availableChargers: 3,
    chargers: [
      { id: 25, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 26, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 27, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 28, chargerNumber: 'C04', chargerType: 'DC_FAST', chargingSpeed: 'DC Ultra-Fast', powerKw: 150, status: 'ACTIVE' }
    ]
  },
  {
    id: 7,
    name: 'ChargerGo Connaught Place Hub',
    address: 'Block A, Inner Circle, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    operator: 'ChargerGo Capital',
    openingTime: '06:00:00',
    closingTime: '23:30:00',
    status: 'ACTIVE',
    totalChargers: 5,
    availableChargers: 4,
    chargers: [
      { id: 29, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 30, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Fast', powerKw: 60, status: 'ACTIVE' },
      { id: 31, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 32, chargerNumber: 'C04', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 33, chargerNumber: 'C05', chargerType: 'DC_FAST', chargingSpeed: 'DC Ultra-Fast', powerKw: 150, status: 'ACTIVE' }
    ]
  },
  {
    id: 8,
    name: 'ChargerGo Bandra Kurla Complex',
    address: 'G Block, BKC, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0657,
    longitude: 72.8687,
    operator: 'ChargerGo West',
    openingTime: '00:00:00',
    closingTime: '23:59:00',
    status: 'ACTIVE',
    totalChargers: 6,
    availableChargers: 5,
    chargers: [
      { id: 34, chargerNumber: 'C01', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 180, status: 'ACTIVE' },
      { id: 35, chargerNumber: 'C02', chargerType: 'CCS2', chargingSpeed: 'DC Ultra-Fast', powerKw: 120, status: 'ACTIVE' },
      { id: 36, chargerNumber: 'C03', chargerType: 'TYPE2', chargingSpeed: 'AC Standard', powerKw: 22, status: 'ACTIVE' },
      { id: 37, chargerNumber: 'C04', chargerType: 'CHAdeMO', chargingSpeed: 'DC Fast', powerKw: 50, status: 'ACTIVE' }
    ]
  }
];

export const generateMockSlots = (chargerId, dateStr) => {
  const slots = [];
  const times = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ];

  // Deterministic mock booked slots based on charger and date
  const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const seed = hash(`${chargerId}-${dateStr}`);

  times.forEach((t, index) => {
    const [h, m] = t.split(':').map(Number);
    let endH = h;
    let endM = m + 30;
    if (endM >= 60) {
      endH += 1;
      endM = 0;
    }
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    let status = 'AVAILABLE';
    const slotKey = (seed + index * 7) % 10;
    if (slotKey === 2 || slotKey === 5) {
      status = 'BOOKED';
    } else if (slotKey === 8 && index === 12) {
      status = 'BLOCKED';
    }

    slots.push({
      id: Number(`${chargerId}${String(index).padStart(3, '0')}`),
      chargerId: Number(chargerId),
      slotDate: dateStr,
      startTime: t,
      endTime: endTime,
      status: status
    });
  });

  return slots;
};
