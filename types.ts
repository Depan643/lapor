
export enum AlatTangkap {
  JTB = 'JTB',
  JJB = 'JJB',
  GillNet = 'GillNet',
  PurseSeine = 'Purse Seine'
}

export enum LokasiBongkar {
  DermagaJongor = 'Dermaga Jongor',
  PPP_Tegalsari = 'PPP Tegalsari',
  TPI_Tegalsari = 'TPI Tegalsari',
  KolamPelabuhan = 'Kolam Pelabuhan'
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
  unloadingLocation: string; // Diubah menjadi string agar fleksibel
  dailyReports: WeighingData[];
  dominantFish: string;
  notes: string;
}
