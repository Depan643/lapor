
export enum AlatTangkap {
  JTB = 'JTB',
  JJB = 'JJB',
  GillNet = 'GillNet',
  PurseSeine = 'Purse Seine'
}

export enum LokasiBongkar {
  DermagaBaru = 'Dermaga Baru',
  DermagaEkorKuning = 'Dermaga Ekor Kuning',
  DermagaDepanTPI = 'Dermaga Depan TPI',
  DermagaJongor = 'Dermaga Jongor'
}

export enum ReportType {
  Aktifitas = 'aktifitas',
  Hasil = 'hasil'
}

export enum FishCategory {
  Ikan = 'ikan',
  Cumi = 'cumi'
}

export interface WeighingData {
  cumi: number;
  sotong: number;
  ikan: number;
  gurita: number;
  buyer: string;
  enumerator: string;
  status?: 'lanjut' | 'selesai' | '';
}

export interface ReportData {
  reportDate: string;
  reportType: ReportType;
  fishCategory: FishCategory;
  shipName: string;
  gt: string;
  noTanda: string;
  suffix: string;
  owner: string;
  alatTangkap: AlatTangkap;
  arrivalDate: string;
  tripDuration: string;
  unloadingDate: string;
  unloadingTime: string;
  unloadingLocation: string;
  dailyReports: WeighingData[];
  dominantFish: string;
  notes: string;
}
