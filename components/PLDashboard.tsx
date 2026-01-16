// components/PLDashboard.tsx
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Cell, ComposedChart } from 'recharts';
import { PLAnalysisResults } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import KpiCard from './KpiCard';
import ChartCard from './ChartCard';
import { Minus, Equal, TrendingUp, TrendingDown, DollarSign, Percent, BarChart2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    let displayLabel = payload[0].payload.name || label;
    if (/\d{4}-\d{2}/.test(label)) {
        const [year, month] = label.split('-');
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, 15));
        displayLabel = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    }
    
    const dataPoint = payload[0].payload;

    return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
            <p className="font-bold text-gray-800 mb-2">{displayLabel}</p>
            <div className="space-y-1">
                {payload.map((pld: any, index: number) => {
                    const isRO = pld.dataKey === 'Resultado Operativo';
                    const value = pld.value;
                    const color = isRO ? (value >= 0 ? '#22c55e' : '#ef4444') : (pld.stroke || pld.fill);

                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                                <span className="text-gray-600">{pld.name === 'Ventas Netas' ? 'Ingresos' : pld.name}:</span>
                            </div>
                            <span className="font-semibold text-gray-800 ml-4">
                                {formatCurrency(pld.value)}
                            </span>
                        </div>
                    );
                })}

                <div className="pt-2 mt-2 border-t border-gray-100 space-y-1 text-xs">
                     <div className="flex justify-between text-gray-600">
                        <span>(-) CMV:</span>
                        <span>{formatCurrency(-dataPoint.CMV)}</span>
                    </div>
                     <div className="flex justify-between text-gray-600">
                        <span>(-) Gastos Totales:</span>
                        <span>{formatCurrency(-dataPoint['Gastos Totales'])}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PLDashboard = React.forwardRef<HTMLDivElement, { results: PLAnalysisResults }>(({ results }, ref) => {
    const { kpis, plTable, monthlyChartData } = results;
    
    const timeAxisTickFormatter = (tick: string): string => {
        const date = new Date(`${tick}-15T00:00:00Z`);
        return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    };

    const totalEgresos = kpis.cmv + kpis.totalExpenses;
    const resultadoEsPositivo = kpis.ebit >= 0;

    return (
        <div className="space-y-8" ref={ref}>

            {/* --- Main Visual Formula --- */}
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                {/* Ingresos */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 text-center flex-grow md:flex-grow-0 min-w-[280px]">
                    <h3 className="text-lg font-semibold text-gray-600">Ingresos Totales</h3>
                    <p className="text-4xl font-bold text-green-600 my-2 truncate" title={formatCurrency(kpis.adjustedNetSales)}>
                        {formatCurrency(kpis.adjustedNetSales)}
                    </p>
                    <p className="text-sm text-gray-500">Ventas Netas Ajustadas</p>
                </div>

                <Minus className="w-10 h-10 text-gray-400 flex-shrink-0" />

                {/* Egresos */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-500 text-center flex-grow md:flex-grow-0 min-w-[280px]">
                    <h3 className="text-lg font-semibold text-gray-600">Egresos Totales</h3>
                    <p className="text-4xl font-bold text-red-600 my-2 truncate" title={formatCurrency(totalEgresos)}>
                        {formatCurrency(totalEgresos)}
                    </p>
                     <p className="text-sm text-gray-500">CMV + Gastos</p>
                </div>
                
                <Equal className="w-10 h-10 text-gray-400 flex-shrink-0" />

                {/* Resultado */}
                <div className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${resultadoEsPositivo ? 'border-pizarro-blue-600' : 'border-gray-500'} text-center flex-grow md:flex-grow-0 min-w-[280px]`}>
                    <h3 className="text-lg font-semibold text-gray-600">Resultado Operativo</h3>
                     <p className={`text-4xl font-bold ${resultadoEsPositivo ? 'text-pizarro-blue-700' : 'text-gray-600'} my-2 truncate`} title={formatCurrency(kpis.ebit)}>
                        {formatCurrency(kpis.ebit)}
                    </p>
                    <p className="text-sm text-gray-500">EBIT</p>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <KpiCard 
                    title="Margen Bruto" 
                    value={kpis.grossMargin} 
                    format="currency" 
                    change={kpis.grossMarginTrend}
                    details={
                        <div className="text-center text-xs space-y-1">
                            <p className="font-semibold text-gray-600">(Ingresos - CMV)</p>
                            {kpis.grossMargin >= 0 ? (
                                <span className="font-bold text-green-600">Ganancia</span>
                            ) : (
                                <span className="font-bold text-red-600">Pérdida</span>
                            )}
                        </div>
                    }
                />
                <KpiCard 
                    title="% Margen Bruto" 
                    value={kpis.grossMarginPercentage} 
                    format="percentage" 
                    details={
                         <p className="text-center text-xs text-gray-500">Rentabilidad sobre ventas después de costos.</p>
                    }
                />
                <KpiCard 
                    title="Margen Operativo" 
                    value={kpis.ebit} 
                    format="currency" 
                    change={kpis.ebitTrend} 
                    details={
                         <div className="text-center text-xs space-y-1">
                            <p className="font-semibold text-gray-600">(Margen Bruto - Gastos)</p>
                            {kpis.ebit >= 0 ? (
                                <span className="font-bold text-green-600">Ganancia</span>
                            ) : (
                                <span className="font-bold text-red-600">Pérdida</span>
                            )}
                        </div>
                    }
                />
                <KpiCard 
                    title="% Margen Neto" 
                    value={kpis.netMarginPercentage} 
                    format="percentage" 
                    details={
                        <div className="text-center text-xs space-y-1">
                            <p className="text-gray-500">Rentabilidad final del negocio.</p>
                            <div className="pt-1 border-t mt-1">
                                Resultado Neto: <span className="font-bold">{formatCurrency(kpis.netIncome)}</span>
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" /> Detalle de Ingresos
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Ventas Netas</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(kpis.netSales)}</span>
                        </li>
                         <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Ingresos Financieros (Recargos)</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(kpis.financialIncome)}</span>
                        </li>
                         <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Descuentos Otorgados</span>
                            <span className="font-semibold text-red-600">{formatCurrency(kpis.discountsGranted)}</span>
                        </li>
                        <li className="flex justify-between items-center text-lg pt-3 border-t font-bold">
                            <span>Ventas Netas Ajustadas</span>
                            <span>{formatCurrency(kpis.adjustedNetSales)}</span>
                        </li>
                    </ul>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-red-500" /> Detalle de Egresos
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Costo de Mercadería Vendida (CMV)</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(kpis.cmv)}</span>
                        </li>
                         <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Gastos Operativos</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(kpis.operatingExpenses)}</span>
                        </li>
                         <li className="flex justify-between items-center text-md">
                            <span className="text-gray-600">Sueldos y Cargas Sociales</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(kpis.salaries)}</span>
                        </li>
                         <li className="flex justify-between items-center text-lg pt-3 border-t font-bold">
                            <span>Egresos Totales</span>
                            <span>{formatCurrency(totalEgresos)}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Charts Section */}
             <div className="grid grid-cols-1 gap-6">
                <ChartCard title="Evolución de Resultados" className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={timeAxisTickFormatter} />
                            <YAxis tickFormatter={(val) => formatNumber(val, true)} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Ventas Netas" name="Ingresos" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="Margen Bruto" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 8 }} dot={false} />
                            <Bar dataKey="Resultado Operativo" name="Resultado Operativo" barSize={20}>
                                {monthlyChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry['Resultado Operativo'] >= 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>
             </div>
             
             {/* --- Detailed P&L Table --- */}
            <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Estado de Resultados Detallado</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 w-1/2">Concepto</th>
                                <th className="px-4 py-2 text-right font-semibold text-gray-600">Monto</th>
                                <th className="px-4 py-2 text-right font-semibold text-gray-600">% s/ Ventas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {plTable.map((item, index) => {
                                const amountColor = item.amount < 0 && !item.isTitle && !item.isSubtotal ? 'text-red-600' : 'text-gray-900';
                                const rowClasses = `
                                    ${item.isSubtotal ? 'font-bold bg-gray-100' : ''}
                                    ${item.isTitle && item.isSubtotal ? 'text-lg' : ''}
                                `;
                                return (
                                    <tr key={index} className={rowClasses}>
                                        <td className={`px-4 py-2 ${item.isSubtotal || item.isTitle ? 'font-bold' : ''} text-gray-900`}>
                                            {item.concept}
                                        </td>
                                        <td className={`px-4 py-2 text-right tabular-nums ${amountColor}`}>
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-gray-600">
                                            {item.percentageOfSales !== null ? `${item.percentageOfSales.toFixed(2)}%` : '---'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default PLDashboard;