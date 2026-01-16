import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { StockRecord } from '../types';

interface StockFileUploadProps {
  onDataLoaded: (data: StockRecord[], error?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const workerCode = `
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

const REQUIRED_COLUMNS = [
  'Fecha', 'Mes', 'Año', 'Rubro productos', 'Costo sin imp en $', 'Suc',
  'Cotizacion Dolar Sistema', 'Cotizacion Dolar Oficial', 'Valorizado en USD SISTEMA',
  'Valorizado en USD OFICIAL', 'Valorizado en $ a dolar oficial'
];

const parseArgentinianNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const sanitized = value.trim().replace(/\\./g, '').replace(',', '.');
        if (sanitized === '') return NaN;
        return parseFloat(sanitized);
    }
    return NaN;
};

const parseDate = (rawDate, rowIndex, fieldName) => {
    let fecha = null;
    if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
        fecha = rawDate;
    } else if (typeof rawDate === 'number' && rawDate > 0 && rawDate < 2958466) {
        const dateParts = self.XLSX.SSF.parse_date_code(rawDate);
        if (dateParts) fecha = new Date(dateParts.y, dateParts.m - 1, dateParts.d, dateParts.H, dateParts.M, dateParts.S);
    }
    if (!fecha || isNaN(fecha.getTime())) {
        throw new Error(\`Formato de fecha inválido para '\${fieldName}' en la fila \${rowIndex + 2}.\`);
    }
    return fecha;
};

self.onmessage = (e) => {
    const file = e.data;
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const data = event.target.result;
            const workbook = self.XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = self.XLSX.utils.sheet_to_json(worksheet, { defval: null });

            if (jsonData.length === 0) throw new Error("El archivo de Stock está vacío.");

            const fileHeaders = Object.keys(jsonData[0]);
            const headerMap = {};
            const missingColumns = [];

            REQUIRED_COLUMNS.forEach(requiredCol => {
                const foundHeader = fileHeaders.find(h => h.trim().toLowerCase() === requiredCol.trim().toLowerCase());
                if (foundHeader) headerMap[requiredCol] = foundHeader;
                else missingColumns.push(requiredCol);
            });

            if (missingColumns.length > 0) {
              throw new Error(\`Faltan columnas requeridas: \${missingColumns.join(', ')}.\`);
            }

            const parsedData = jsonData.map((row, index) => {
                const fecha = parseDate(row[headerMap['Fecha']], index, 'Fecha');
                const numberFields = [
                    'Costo sin imp en $', 'Cotizacion Dolar Sistema', 'Cotizacion Dolar Oficial',
                    'Valorizado en USD SISTEMA', 'Valorizado en USD OFICIAL', 'Valorizado en $ a dolar oficial'
                ];
              
                const parsedNumbers = {};
                for (const field of numberFields) {
                    const value = parseArgentinianNumber(row[headerMap[field]]);
                    if (isNaN(value)) {
                        throw new Error(\`Valor numérico inválido para '\${field}' en la fila \${index + 2}.\`);
                    }
                    parsedNumbers[field] = value;
                }

                return {
                    'Fecha': fecha,
                    'Año': fecha.getFullYear(),
                    'Mes': fecha.getMonth() + 1,
                    'Rubro productos': String(row[headerMap['Rubro productos']] || 'N/A').trim(),
                    'Suc': String(row[headerMap['Suc']] || 'N/A').trim().toUpperCase(),
                    ...parsedNumbers
                };
            });

            self.postMessage({ success: true, data: parsedData });
        } catch (error) {
            self.postMessage({ success: false, error: error.message });
        }
    };
    reader.onerror = () => self.postMessage({ success: false, error: 'No se pudo leer el archivo en el worker.' });
    reader.readAsArrayBuffer(file);
};
`;

const StockFileUpload: React.FC<StockFileUploadProps> = ({ onDataLoaded, setIsLoading }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
        const { success, data, error } = e.data;
        if (success) {
            onDataLoaded(data);
        } else {
            setFileName(null);
            onDataLoaded([], `Error al procesar archivo de Stock: ${error}`);
        }
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
    };

    worker.onerror = (e) => {
        setFileName(null);
        onDataLoaded([], `Ocurrió un error inesperado en el worker: ${e.message}`);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
    };

    worker.postMessage(file);
    event.target.value = '';
  }, [onDataLoaded, setIsLoading]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label htmlFor="stock-dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-pizarro-blue-300 border-dashed rounded-lg cursor-pointer bg-pizarro-blue-50 hover:bg-pizarro-blue-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-3 text-pizarro-blue-500" />
          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para cargar</span> o arrastre</p>
          <p className="text-xs text-gray-500">Excel (.xlsx) o CSV</p>
        </div>
        <input id="stock-dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .csv" />
      </label>
      {fileName && (
        <div className="mt-4 text-center text-gray-600">
          <p className="font-medium flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Archivo seleccionado: {fileName}</p>
        </div>
      )}
    </div>
  );
};

export default StockFileUpload;