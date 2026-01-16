
import React, { useState, useMemo } from 'react';
import { 
  AlatTangkap, 
  LokasiBongkar, 
  ReportType, 
  FishCategory, 
  ReportData, 
  WeighingData 
} from './types';
import { generateReportText, parseReportText } from './utils';
import Input from './components/Input';

const App: React.FC = () => {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [data, setData] = useState<ReportData>({
    reportDate: getToday(),
    reportType: ReportType.Aktifitas,
    fishCategory: FishCategory.Ikan,
    shipName: '',
    gt: '',
    noTanda: '',
    suffix: '',
    owner: '-',
    alatTangkap: AlatTangkap.JTB,
    arrivalDate: getToday(),
    tripDuration: '-',
    unloadingDate: getToday(), // Default tanggal sekarang
    unloadingTime: '05.00',
    unloadingLocation: LokasiBongkar.TPI_Tegalsari, // Default lokasi bongkar yang umum
    dailyReports: [
      { cumi: 0, sotong: 0, ikan: 0, gurita: 0, buyer: '', enumerator: '', status: 'lanjut' }
    ],
    dominantFish: '',
    notes: ''
  });

  const [copySuccess, setCopySuccess] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  const handleInputChange = (field: keyof ReportData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDailyReportChange = (index: number, field: keyof WeighingData, value: any) => {
    const updated = [...data.dailyReports];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, dailyReports: updated }));
  };

  const addDailyReport = () => {
    setData(prev => ({
      ...prev,
      dailyReports: [...prev.dailyReports, { cumi: 0, sotong: 0, ikan: 0, gurita: 0, buyer: '', enumerator: '', status: 'lanjut' }]
    }));
  };

  const removeDailyReport = (index: number) => {
    if (data.dailyReports.length > 1) {
      const updated = data.dailyReports.filter((_, i) => i !== index);
      setData(prev => ({ ...prev, dailyReports: updated }));
    }
  };

  const handleSmartPaste = () => {
    if (!pastedText.trim()) return;
    const parsedData = parseReportText(pastedText);
    if (parsedData) {
      // Selalu pastikan Tgl Bongkar adalah hari ini jika diinginkan, 
      // tapi biasanya paste mengikuti data lama. Namun user meminta "otomatis sekarang".
      // Kita prioritaskan hari ini jika parsing tidak menemukan tanggal yang valid atau tetap overwrite.
      setData(prev => ({ 
        ...prev, 
        ...parsedData as ReportData,
        unloadingDate: (parsedData as ReportData).unloadingDate || getToday()
      }));
      setPasteFeedback('Data berhasil diterapkan!');
      setPastedText('');
      setTimeout(() => setPasteFeedback(null), 3000);
    } else {
      setPasteFeedback('Gagal mengenali format teks.');
      setTimeout(() => setPasteFeedback(null), 3000);
    }
  };

  const reportText = useMemo(() => generateReportText(data), [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, limit: number = 10) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, limit);
    return val;
  };

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '').slice(0, 5);
    return val;
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-blue-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚢 Pelaporan Tegalsari
          </h1>
          <p className="text-blue-100 text-sm">Generator Laporan Penimbangan Ikan & Cumi</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-indigo-900 flex items-center gap-2 uppercase tracking-wider">
              ✨ Smart Paste (Isi Otomatis)
            </h2>
            <p className="text-xs text-indigo-700">Tempelkan teks laporan sebelumnya di bawah ini untuk mengisi formulir secara otomatis.</p>
            <textarea 
              className="w-full h-24 p-3 text-xs font-mono rounded-lg border-indigo-200 border bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Tempel laporan di sini..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <button 
                onClick={handleSmartPaste}
                disabled={!pastedText.trim()}
                className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                🪄 Terapkan Data
              </button>
              {pasteFeedback && (
                <span className={`text-xs font-bold ${pasteFeedback.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>
                  {pasteFeedback}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Informasi Umum</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tgl Laporan" 
                type="date" 
                value={data.reportDate} 
                onChange={(e) => handleInputChange('reportDate', e.target.value)} 
              />
              <Input 
                label="Jenis Laporan" 
                options={Object.values(ReportType)} 
                value={data.reportType} 
                onChange={(e) => handleInputChange('reportType', e.target.value)} 
              />
            </div>
            <Input 
              label="Kategori Ikan" 
              options={Object.values(FishCategory)} 
              value={data.fishCategory} 
              onChange={(e) => handleInputChange('fishCategory', e.target.value)} 
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Data Kapal</h2>
            <Input 
              label="Nama Kapal (KM.)" 
              placeholder="Contoh: CHRISNA" 
              value={data.shipName} 
              onChange={(e) => handleInputChange('shipName', e.target.value.toUpperCase())} 
            />
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Tanda Selar</label>
              <div className="grid grid-cols-3 gap-2">
                <Input 
                  label="GT" 
                  placeholder="80" 
                  value={data.gt} 
                  onChange={(e) => handleInputChange('gt', handleNumberInput(e, 3))} 
                />
                <Input 
                  label="No" 
                  placeholder="3875" 
                  value={data.noTanda} 
                  onChange={(e) => handleInputChange('noTanda', handleNumberInput(e, 4))} 
                />
                <Input 
                  label="Suffix" 
                  placeholder="Ft" 
                  value={data.suffix} 
                  onChange={(e) => handleInputChange('suffix', e.target.value.slice(0, 2))} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Pemilik" 
                placeholder="-" 
                value={data.owner} 
                onChange={(e) => handleInputChange('owner', e.target.value)} 
              />
              <Input 
                label="Alat Tangkap" 
                options={Object.values(AlatTangkap)} 
                value={data.alatTangkap} 
                onChange={(e) => handleInputChange('alatTangkap', e.target.value)} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Detail Operasional</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tgl Masuk" 
                type="date" 
                value={data.arrivalDate} 
                onChange={(e) => handleInputChange('arrivalDate', e.target.value)} 
              />
              <Input 
                label="Lama Trip" 
                suffix="Hari" 
                value={data.tripDuration} 
                onChange={(e) => handleInputChange('tripDuration', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tgl Bongkar" 
                type="date" 
                value={data.unloadingDate} 
                onChange={(e) => handleInputChange('unloadingDate', e.target.value)} 
              />
              <Input 
                label="Jam Bongkar (Pukul)" 
                suffix="WIB" 
                placeholder="11.30" 
                value={data.unloadingTime} 
                onChange={(e) => handleInputChange('unloadingTime', handleTimeInput(e))} 
              />
            </div>
            <Input 
              label="Lokasi Bongkar" 
              options={Object.values(LokasiBongkar)} 
              value={data.unloadingLocation} 
              onChange={(e) => handleInputChange('unloadingLocation', e.target.value)} 
            />
          </div>

          {data.dailyReports.map((report, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100 space-y-4 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-blue-800">Bongkar Hari ke-{idx + 1}</h2>
                <div className="flex gap-4">
                  {idx === data.dailyReports.length - 1 && (
                    <div className="flex items-center gap-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
                       <select 
                        value={report.status || ''} 
                        onChange={(e) => handleDailyReportChange(idx, 'status', e.target.value)}
                        className="text-xs border rounded p-1 font-semibold text-blue-600 bg-blue-50"
                       >
                         <option value="">(Tanpa Status)</option>
                         <option value="lanjut">Lanjut</option>
                         <option value="selesai">Selesai</option>
                       </select>
                    </div>
                  )}
                  {data.dailyReports.length > 1 && (
                    <button 
                      onClick={() => removeDailyReport(idx)}
                      className="text-red-500 text-xs font-semibold hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cumi" suffix="kg" value={report.cumi} onChange={(e) => handleDailyReportChange(idx, 'cumi', Number(handleNumberInput(e, 8)))} />
                <Input label="Sotong" suffix="kg" value={report.sotong} onChange={(e) => handleDailyReportChange(idx, 'sotong', Number(handleNumberInput(e, 8)))} />
                <Input label="Ikan" suffix="kg" value={report.ikan} onChange={(e) => handleDailyReportChange(idx, 'ikan', Number(handleNumberInput(e, 8)))} />
                <Input label="Gurita" suffix="kg" value={report.gurita} onChange={(e) => handleDailyReportChange(idx, 'gurita', Number(handleNumberInput(e, 8)))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Buyer (PT)" 
                  placeholder="ZHW" 
                  value={report.buyer} 
                  onChange={(e) => handleDailyReportChange(idx, 'buyer', e.target.value.toUpperCase())} 
                />
                <Input 
                  label="Enumerator" 
                  placeholder="Nama Enumerator" 
                  value={report.enumerator} 
                  onChange={(e) => handleDailyReportChange(idx, 'enumerator', e.target.value)} 
                />
              </div>
            </div>
          ))}

          <button 
            onClick={addDailyReport}
            className="w-full py-3 border-2 border-dashed border-blue-400 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            ➕ Tambah Hari Bongkar
          </button>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
             <Input 
                label="Ikan Dominan" 
                placeholder="sotong, kurisi" 
                value={data.dominantFish} 
                onChange={(e) => handleInputChange('dominantFish', e.target.value)} 
              />
              <Input 
                label="Keterangan" 
                type="textarea" 
                value={data.notes} 
                onChange={(e) => handleInputChange('notes', e.target.value)} 
              />
          </div>
        </div>

        <div className="lg:sticky lg:top-4 h-fit">
          <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Preview Laporan
              </h3>
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  copySuccess ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                {copySuccess ? '✓ Tersalin' : '📋 Salin Teks'}
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
              {reportText}
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
             <p className="text-xs text-yellow-800">
               <strong>Tips:</strong> Gunakan status (lanjut/selesai) untuk menandai progres bongkaran. Lokasi Bongkar sekarang lebih fleksibel dan Nama Enumerator akan terbaca meskipun diisi tanda hubung (-).
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
