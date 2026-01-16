// services/api.ts
import { saveData as saveToDb, loadAllData as loadFromDb } from './db';
import { SaleRecord, PurchaseRecord, ExpenseRecord, HRRecord, StockRecord, DataKey } from '../types';

const DATA_KEYS: DataKey[] = ['sales', 'purchases', 'expenses', 'hr', 'stock'];

/**
 * Carga todos los conjuntos de datos desde el almacenamiento local (IndexedDB)
 * e informa el progreso a través de un callback.
 * @param onProgress - Callback que se ejecuta después de cargar cada conjunto de datos.
 */
export const loadAllData = async (
    onProgress: (key: DataKey, data: any[]) => void
): Promise<{
    sales?: SaleRecord[];
    purchases?: PurchaseRecord[];
    expenses?: ExpenseRecord[];
    hr?: HRRecord[];
    stock?: StockRecord[];
}> => {
    try {
        const result = await loadFromDb();
        
        // Simula el progreso para mantener la compatibilidad con la UI
        for (const key of DATA_KEYS) {
            const data = result[key as DataKey] || [];
            onProgress(key as DataKey, data);
        }

        return result as {
            sales?: SaleRecord[];
            purchases?: PurchaseRecord[];
            expenses?: ExpenseRecord[];
            hr?: HRRecord[];
            stock?: StockRecord[];
        };
    } catch (error) {
        console.error("Error al cargar datos desde IndexedDB:", error);
        throw new Error("No se pudo leer la base de datos local.");
    }
};


/**
 * Guarda un conjunto de datos en el almacenamiento local (IndexedDB).
 * @param key - El identificador del conjunto de datos (por ejemplo, 'sales').
 * @param data - El array de registros a guardar.
 * @param onProgress - Callback opcional para reportar el progreso.
 */
export const saveData = async (
    key: DataKey,
    data: any[],
    onProgress?: (message: string) => void
): Promise<void> => {
    try {
        onProgress?.(`Guardando ${data.length.toLocaleString('es-AR')} registros de ${key} localmente...`);
        await saveToDb(key, data);
        onProgress?.('Guardado local completado.');
    } catch (error) {
        console.error(`Error al guardar datos de ${key} en IndexedDB:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`No se pudieron guardar los datos localmente. Error: ${errorMessage}`);
    }
};
