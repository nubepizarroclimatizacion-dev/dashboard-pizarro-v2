import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { SaleRecord } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: SaleRecord[], error?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const workerCode = `
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

const REQUIRED_COLUMNS = [
  'Num Punto Venta', 'Sucursal', 'Tipo de venta', 'Tipo Comprobante', 
  'Cantidad comprobante', 'Fecha', 'Final con Impuestos', 'Sin Impuestos', 
  'Total sin descuento', 'Descuento/Recargo Financiero', 'IVA', 'Cliente', 'Vendedor'
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

self.onmessage = (e) => {
    const file = e.data;
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const data = event.target.result;
            if (!data) throw new Error("No se pudo leer el archivo.");
            
            const workbook = self.XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = self.XLSX.utils.sheet_to_json(worksheet, { defval: null });

            if (jsonData.length === 0) {
              throw new Error("El archivo está vacío o no tiene el formato correcto.");
            }

            const fileHeaders = Object.keys(jsonData[0]);
            const headerMap = {};
            const missingColumns = [];

            REQUIRED_COLUMNS.forEach(requiredCol => {
                const foundHeader = fileHeaders.find(fileHeader => fileHeader.trim().toLowerCase() === requiredCol.trim().toLowerCase());
                if (foundHeader) {
                    headerMap[requiredCol] = foundHeader;
                } else {
                    missingColumns.push(requiredCol);
                }
            });

            if (missingColumns.length > 0) {
              throw new Error(\`Faltan las siguientes columnas requeridas: \${missingColumns.join(', ')}.\`);
            }

            const parsedData = jsonData.map((row, index) => {
              let fecha = null;
              const rawDate = row[headerMap['Fecha']];

              if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
                fecha = rawDate;
              } else if (typeof rawDate === 'number' && rawDate > 0 && rawDate < 2958466) {
                const dateParts = self.XLSX.SSF.parse_date_code(rawDate);
                if (dateParts) {
                  fecha = new Date(dateParts.y, dateParts.m - 1, dateParts.d, dateParts.H, dateParts.M, dateParts.S);
                }
              }

              if (!fecha || isNaN(fecha.getTime())) {
                // Omitir fila con fecha invalida en lugar de lanzar error
                console.warn(\`Formato de fecha inválido en la fila \${index + 2}. Valor: "\${rawDate}". Omitiendo fila.\`);
                return null;
              }

              const numPuntoVenta = parseInt(String(row[headerMap['Num Punto Venta']]), 10);
              const cantidadComprobante = parseInt(String(row[headerMap['Cantidad comprobante']]), 10);
              const finalConImpuestos = parseArgentinianNumber(row[headerMap['Final con Impuestos']]);
              const sinImpuestos = parseArgentinianNumber(row[headerMap['Sin Impuestos']]);
              const totalSinDescuento = parseArgentinianNumber(row[headerMap['Total sin descuento']]);
              const descuentoRecargo = parseArgentinianNumber(row[headerMap['Descuento/Recargo Financiero']]);
              const iva = parseArgentinianNumber(row[headerMap['IVA']]);

              if (isNaN(numPuntoVenta) || isNaN(cantidadComprobante) || isNaN(finalConImpuestos) || isNaN(sinImpuestos) || isNaN(iva)) {
                console.warn(\`Valor numérico inválido en la fila \${index + 2}. Omitiendo fila.\`);
                return null;
              }
              
              const tipoVenta = String(row[headerMap['Tipo de venta']] || '').trim().toLowerCase() === 'blanco' ? 'Blanco' : 'Negro';

              return {
                'Num Punto Venta': numPuntoVenta,
                'Suc': String(row[headerMap['Sucursal']] || '').trim().toUpperCase(),
                'Tipo de venta': tipoVenta,
                'Tipo Comprobante': String(row[headerMap['Tipo Comprobante']] || ''),
                'Cantidad comprobante': cantidadComprobante,
                'Fecha': fecha,
                'Final con Impuestos': finalConImpuestos,
                'Sin Impuestos': sinImpuestos,
                'Total sin descuento': totalSinDescuento,
                'Descuento/Recargo Financiero': descuentoRecargo,
                'IVA': iva,
                'Cliente': String(row[headerMap['Cliente']] || ''),
                'Vendedor': String(row[headerMap['Vendedor']] || '').trim().toUpperCase(),
                // Mapeos internos para compatibilidad
                'Total': finalConImpuestos,
                'Cant': cantidadComprobante,
                'Tipo': tipoVenta,
              };
            }).filter(Boolean); // Filtrar filas nulas (omitidas por errores)

            self.postMessage({ success: true, data: parsedData });
        } catch (error) {
            self.postMessage({ success: false, error: error.message });
        }
    };
    reader.onerror = () => {
        self.postMessage({ success: false, error: 'No se pudo leer el archivo en el worker.' });
    };
    reader.readAsArrayBuffer(file);
};
`;

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, setIsLoading }) => {
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
        onDataLoaded([], `Error al procesar el archivo: ${error}`);
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
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  }, [onDataLoaded, setIsLoading]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-pizarro-blue-300 border-dashed rounded-lg cursor-pointer bg-pizarro-blue-50 hover:bg-pizarro-blue-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-3 text-pizarro-blue-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click para cargar</span> o arrastre y suelte
          </p>
          <p className="text-xs text-gray-500">Excel (.xlsx) o CSV</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .csv" />
      </label>
      {fileName && (
        <div className="mt-4 text-center text-gray-600">
          <p className="font-medium flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Archivo seleccionado: {fileName}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
