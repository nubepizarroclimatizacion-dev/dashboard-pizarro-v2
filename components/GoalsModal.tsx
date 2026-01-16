import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Target, UploadCloud, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SalesGoal } from '../types';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: SalesGoal[];
  setGoals: React.Dispatch<React.SetStateAction<SalesGoal[]>>;
  months: { name: string; num: number }[];
}

const REQUIRED_GOAL_COLUMNS = ['Sucursal', 'Fecha', 'Año', 'Mes', 'Venta final con impuestos', 'Objetivo de ventas'];

const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, setGoals, months }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const monthNameMap = useMemo(() => {
    const map = new Map<string, number>();
    months.forEach(m => map.set(m.name.toLowerCase(), m.num));
    return map;
  }, [months]);

  useEffect(() => {
    if (isOpen) {
      setImportError(null);
      setImportSuccess(null);
      setIsImporting(false);
    }
  }, [isOpen]);

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) throw new Error("El archivo está vacío.");

      const fileHeaders = Object.keys(jsonData[0]);
      const headerMap: { [key: string]: string } = {};
      const missingColumns: string[] = [];

      REQUIRED_GOAL_COLUMNS.forEach(col => {
        const found = fileHeaders.find(h => h.trim().toLowerCase() === col.toLowerCase());
        if (found) headerMap[col] = found;
        else missingColumns.push(col);
      });

      if (missingColumns.length > 0) throw new Error(`Faltan las columnas: ${missingColumns.join(', ')}`);

      const importedGoals: SalesGoal[] = jsonData.map((row, index) => {
        const branch = String(row[headerMap['Sucursal']] || '').trim().toUpperCase();
        const year = parseInt(row[headerMap['Año']], 10);
        const goalAmount = parseFloat(String(row[headerMap['Objetivo de ventas']] || '0').replace(',', '.'));
        const actualAmount = parseFloat(String(row[headerMap['Venta final con impuestos']] || '0').replace(',', '.'));
        
        const rawMonth = row[headerMap['Mes']];
        let month: number | undefined;

        if (typeof rawMonth === 'number') {
            month = rawMonth;
        } else if (typeof rawMonth === 'string') {
            month = monthNameMap.get(rawMonth.trim().toLowerCase());
        }

        if (!branch) throw new Error(`Falta la sucursal en la fila ${index + 2}.`);
        if (isNaN(year) || year < 2000 || year > 2100) throw new Error(`Formato de año inválido en la fila ${index + 2}.`);
        if (month === undefined || isNaN(month) || month < 1 || month > 12) throw new Error(`Formato de mes inválido en la fila ${index + 2}. Use un número (1-12) o el nombre completo (ej. "Enero").`);
        if (isNaN(goalAmount) || goalAmount < 0) throw new Error(`Monto de 'Objetivo de ventas' inválido en la fila ${index + 2}.`);
        if (isNaN(actualAmount)) throw new Error(`Monto de 'Venta final con impuestos' inválido en la fila ${index + 2}.`);

        return {
          id: `${branch}-${year}-${month}`,
          branch, year, month, goalAmount, actualAmount
        };
      });

      setGoals(currentGoals => {
          const goalsMap = new Map(currentGoals.map(g => [g.id, g]));
          importedGoals.forEach(g => goalsMap.set(g.id, g));
          return Array.from(goalsMap.values());
      });

      setImportSuccess(`${importedGoals.length} objetivos importados/actualizados correctamente.`);

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setImportError(`Error al importar: ${message}`);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  }, [setGoals, monthNameMap]);


  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Target className="mr-2 text-pizarro-blue-600"/>
            Importar Objetivos de Venta
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <main className="p-6">
             <h3 className="text-md font-semibold text-gray-700 mb-2">Importar desde Archivo</h3>
             <p className="text-sm text-gray-500 mb-3">Sube un archivo Excel o CSV con las columnas: <code className="text-xs bg-gray-100 p-1 rounded">Sucursal</code>, <code className="text-xs bg-gray-100 p-1 rounded">Fecha</code>, <code className="text-xs bg-gray-100 p-1 rounded">Año</code>, <code className="text-xs bg-gray-100 p-1 rounded">Mes</code>, <code className="text-xs bg-gray-100 p-1 rounded">Venta final con impuestos</code>, <code className="text-xs bg-gray-100 p-1 rounded">Objetivo de ventas</code>.</p>
             <label className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isImporting ? 'bg-gray-100 border-gray-300' : 'border-pizarro-blue-400 bg-pizarro-blue-50 hover:bg-pizarro-blue-100'}`}>
                {isImporting ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 text-pizarro-blue-600 animate-spin" />
                        <span className="text-pizarro-blue-700 font-medium">Importando...</span>
                    </>
                ) : (
                    <>
                        <UploadCloud className="w-5 h-5 mr-2 text-pizarro-blue-600" />
                        <span className="text-pizarro-blue-700 font-medium">Seleccionar archivo para importar</span>
                    </>
                )}
                 <input type="file" className="hidden" onChange={handleFileImport} accept=".xlsx, .csv" disabled={isImporting} />
             </label>
            {importError && <p className="text-red-600 text-sm mt-2">{importError}</p>}
            {importSuccess && <p className="text-green-600 text-sm mt-2">{importSuccess}</p>}
        </main>

        <footer className="p-4 bg-gray-50 border-t border-gray-200 mt-auto text-right">
            <button
                onClick={onClose}
                className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pizarro-blue-600 hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500"
            >
                Cerrar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default GoalsModal;
