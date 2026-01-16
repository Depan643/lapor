
import { ReportData, ReportType, FishCategory, AlatTangkap, WeighingData } from './types';

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const formatIndonesianDateSimple = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${monthName} ${year}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

const indonesianMonths: Record<string, string> = {
  'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
  'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
};

const parseIndonesianDate = (text: string): string => {
  if (!text) return new Date().toISOString().split('T')[0];
  const cleanText = text.replace(/\*/g, '').replace(/_/g, '').trim();
  const regex = /(\d+)\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/i;
  const match = cleanText.match(regex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = indonesianMonths[match[2].toLowerCase()];
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
};

const parseWeight = (match: RegExpMatchArray | null): number => {
  if (!match) return 0;
  const val = match[1].replace(/\*/g, '').replace(/_/g, '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(val) || 0;
};

export const parseReportText = (text: string): Partial<ReportData> | null => {
  try {
    const data: Partial<ReportData> = {};
    
    // 1. Jenis Laporan
    const reportTypeMatch = text.match(/Izin melaporkan \*(.*?)\s+penimbangan/i);
    if (reportTypeMatch) {
      const val = reportTypeMatch[1].toLowerCase();
      data.reportType = val.includes('aktifitas') ? ReportType.Aktifitas : ReportType.Hasil;
    }

    // 2. Tanggal Laporan
    const reportDateMatch = text.match(/\*\w+,\s+(\d+\s+\w+\s+\d{4})\s*:\*/i);
    if (reportDateMatch) {
      data.reportDate = parseIndonesianDate(reportDateMatch[1]);
    }

    // 3. Nama Kapal
    const shipNameMatch = text.match(/\*?KM\.\s*([^*:\n\r]*)\*?/i);
    if (shipNameMatch) data.shipName = shipNameMatch[1].trim().toUpperCase();

    // 4. Ukuran / Tanda Selar
    const sizingMatch = text.match(/GT\.\s*(\d+).*?No\.?\s*(\d+)\s*[\/\\-]\s*(\w+)/i);
    if (sizingMatch) {
      data.gt = sizingMatch[1];
      data.noTanda = sizingMatch[2];
      data.suffix = sizingMatch[3];
    }

    const ownerMatch = text.match(/Pemilik\s*:\s*\*?(.*?)\*?(\n|$)/i);
    if (ownerMatch) data.owner = ownerMatch[1].replace(/\*/g, '').trim();

    const gearMatch = text.match(/Alat Tangkap\s*:\s*\*?(.*?)\*?(\n|$)/i);
    if (gearMatch) {
      const val = gearMatch[1].replace(/\*/g, '').trim();
      const found = Object.values(AlatTangkap).find(v => v.toLowerCase() === val.toLowerCase());
      if (found) data.alatTangkap = found;
    }

    const arrivalMatch = text.match(/Tgl Masuk\s*:\s*\*?(.*?)\*?(\n|$)/i);
    if (arrivalMatch) data.arrivalDate = parseIndonesianDate(arrivalMatch[1]);

    const tripMatch = text.match(/Lama Trip\s*:\s*\*?(.*?) Hari\*?/i);
    if (tripMatch) data.tripDuration = tripMatch[1].trim();

    // 5. Tgl & Jam Bongkar
    const unloadMatch = text.match(/Tgl & Jam Bongkar\s*:\s*\*?(?:.*?, )?(\d+\s+\w+\s+\d{4})\s*Pukul\s*(.*?)\s*WIB\*?/i);
    if (unloadMatch) {
      data.unloadingDate = parseIndonesianDate(unloadMatch[1]);
      data.unloadingTime = unloadMatch[2].replace(/\.$/, '').trim();
    }

    // 6. Lokasi Bongkar (Mendukung segala teks)
    const locationMatch = text.match(/Lokasi Bongkar\s*:\s*\*?(.*?)\*?(\n|$)/i);
    if (locationMatch) {
      data.unloadingLocation = locationMatch[1].replace(/\*/g, '').trim();
    }

    const dailySections = text.split(/Bongkar hari ke\s*:\s*/i).slice(1);
    let hasCumi = false;
    let hasIkan = false;

    if (dailySections.length > 0) {
      const dailyReports: WeighingData[] = dailySections.map((section) => {
        const cumiMatch = section.match(/Cumi\s*:\s*\*?([\d\.,\s]+)\s*kg\*?/i);
        const sotongMatch = section.match(/Sotong\s*:\s*\*?([\d\.,\s]+)\s*kg\*?/i);
        const ikanMatch = section.match(/Ikan\s*:\s*\*?([\d\.,\s]+)\s*kg\*?/i);
        const guritaMatch = section.match(/Gurita\s*:\s*\*?([\d\.,\s]+)\s*kg\*?/i);
        const buyerMatch = section.match(/PT\s*:\s*(.*?)(\n|$)/i);
        const statusMatch = section.match(/\((lanjut|selesai)\)/i);

        const cVal = parseWeight(cumiMatch);
        const sVal = parseWeight(sotongMatch);
        const iVal = parseWeight(ikanMatch);
        const gVal = parseWeight(guritaMatch);

        if (cVal > 0 || sVal > 0) hasCumi = true;
        if (iVal > 0 || gVal > 0) hasIkan = true;

        return {
          cumi: cVal,
          sotong: sVal,
          ikan: iVal,
          gurita: gVal,
          buyer: buyerMatch ? buyerMatch[1].trim() : '',
          enumerator: '',
          status: statusMatch ? (statusMatch[1].toLowerCase() as 'lanjut' | 'selesai') : ''
        };
      });

      data.fishCategory = hasCumi || hasIkan ? FishCategory.Ikan : FishCategory.Ikan;

      // 7. Perbaikan Parsing Nama Enumerator (Format: - (H1) Nama atau - (H1) -)
      // Regex global untuk mencari (H[angka])
      const lines = text.split('\n');
      lines.forEach((line) => {
        const hMatch = line.match(/\(H(\d+)\)\s*(.*)/i);
        if (hMatch) {
          const index = parseInt(hMatch[1]) - 1;
          if (dailyReports[index]) {
            let name = hMatch[2].replace(/\*/g, '').trim();
            // Jika nama hanya tanda hubung tunggal, bersihkan
            if (name === '-' || name === '') {
              dailyReports[index].enumerator = '';
            } else {
              // Jika formatnya "Nama Kapal -", bersihkan tanda hubung di akhir
              name = name.replace(/^-+\s*|\s*-+$/g, '').trim();
              dailyReports[index].enumerator = name;
            }
          }
        }
      });

      data.dailyReports = dailyReports;
    }

    const dominantMatch = text.match(/Ikan Dominan\s*:\s*\*?(.*?)\*?(\n|$)/i);
    if (dominantMatch) data.dominantFish = dominantMatch[1].replace(/\*/g, '').trim();

    const notesMatch = text.match(/Keterangan\s*:\s*(.*?)(\n|$)/i);
    if (notesMatch) data.notes = notesMatch[1].trim();

    return data;
  } catch (e) {
    console.error("Error parsing report", e);
    return null;
  }
};

export const generateReportText = (data: ReportData): string => {
  const reportDateFormatted = formatIndonesianDate(data.reportDate);
  const totalWeight = data.dailyReports.reduce((acc, curr) => {
    return acc + curr.cumi + curr.sotong + curr.ikan + curr.gurita;
  }, 0);

  let text = `Assalamualaikum wr wb\n`;
  text += `Izin melaporkan *${data.reportType} penimbangan ${data.fishCategory}* di Pelabuhan Tegalsari.\n`;
  text += `*${reportDateFormatted}:*\n\n`;
  text += `*KM. ${data.shipName.toUpperCase()}*\n`;
  text += `- Ukuran : *GT. ${data.gt} No.${data.noTanda}/${data.suffix}*\n`;
  text += `- Pemilik : *${data.owner || '-'}*\n`;
  text += `- Alat Tangkap : *${data.alatTangkap}*\n`;
  text += `- Tgl Masuk : *${formatIndonesianDateSimple(data.arrivalDate)}*\n`;
  text += `- Lama Trip : *${data.tripDuration || '-'} Hari*\n`;
  text += `- Tgl & Jam Bongkar : *${formatIndonesianDate(data.unloadingDate)} Pukul ${data.unloadingTime || '00'}. WIB*\n`;
  text += `- Lokasi Bongkar : *${data.unloadingLocation}*\n`;

  data.dailyReports.forEach((report, index) => {
    const isLastDay = index === data.dailyReports.length - 1;
    const statusText = (isLastDay && report.status) ? ` (${report.status})` : '';
    
    text += `- Bongkar hari ke : *${index + 1}${statusText}*\n`;
    if (report.cumi > 0) text += `     - Cumi : *${formatNumber(report.cumi)} kg*\n`;
    if (report.sotong > 0) text += `     - Sotong : *${formatNumber(report.sotong)} kg*\n`;
    if (report.ikan > 0) text += `     - Ikan : *${formatNumber(report.ikan)} kg*\n`;
    if (report.gurita > 0) text += `     - Gurita : *${formatNumber(report.gurita)} kg*\n`;
    text += `     - PT : ${report.buyer || '-'}\n`;
  });

  text += `- Volume Produksi : \n`;
  text += `     - PIPP : *${formatNumber(totalWeight)} kg*\n`;
  text += `     - LPS : Belum LPS\n`;
  text += `- Ikan Dominan : *${data.dominantFish || '-'}*\n`;
  text += `- Nilai (PNBP) LPS : -\n`;
  text += `- Nama Enumerator :\n`;
  
  data.dailyReports.forEach((report, index) => {
    const displayName = report.enumerator || '-';
    text += `       *- (H${index + 1}) ${displayName}*\n`;
  });

  text += `- Nama Kapal Titipan : -\n`;
  text += `- Jenis Kapal Angkut : -\n`;
  text += `- ⁠Keterangan: ${data.notes || '-'}\n\n`;
  text += `Terima Kasih`;

  return text;
};
