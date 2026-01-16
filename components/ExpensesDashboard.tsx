import React, { useMemo, useState, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line, Sector } from 'recharts';
import { ExpensesAnalysisResults } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import KpiCard from './KpiCard';
import ChartCard from './ChartCard';
import { TrendingUp, TrendingDown, XCircle, ChevronsRight } from 'lucide-react';
import AggregatedExpenseTable from './AggregatedExpenseTable';


// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let displayLabel = payload[0].payload.name || label;
    if (/\d{4}-\d{2}/.test(label)) {
      const [year, month] = label.split('-');
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, 15));
      displayLabel = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-gray-800 mb-2">{displayLabel}</p>
        <div className="space-y-1">
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.stroke || pld.fill }}></span>
                <span className="text-gray-600">{pld.name || pld.dataKey}:</span>
              </div>
              <span className="font-semibold text-gray-800 ml-4">{formatCurrency(pld.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))' }}>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#333" className="text-base font-bold truncate">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" className="text-sm">
        {`${(percent * 100).toFixed(2)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
};

const ExpensesDashboard = React.forwardRef<HTMLDivElement, { results: ExpensesAnalysisResults }>(({ results }, ref) => {
    const { kpis, expensesOverTime, expensesByCategory, yearlyExpenseTrend, availableYearsForTrend, expensesByCategoryAggregated, expensesBySubcategoryAggregated, expensesByDetailAggregated } = results;

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

    const onPieClick = useCallback((_: any, index: number) => {
        setActiveIndex(prevIndex => (prevIndex === index ? null : index));
    }, []);

    const handleCategoryClick = (categoryName: string) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
        } else {
            setSelectedCategory(categoryName);
            setSelectedSubcategory(null);
        }
    };
    
    const handleSubcategoryClick = (subcategoryName: string) => {
        setSelectedSubcategory(prev => prev === subcategoryName ? null : subcategoryName);
    };

    const clearCategoryFilter = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
    };

    const clearSubcategoryFilter = () => {
        setSelectedSubcategory(null);
    };


    const filteredSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        return expensesBySubcategoryAggregated.filter(item => {
            // This assumes a relationship between subcategory and category exists in the raw data,
            // but the aggregated data doesn't have it. This will need to be handled during data processing.
            // For now, let's assume we need to filter the original data to find this relationship.
            // A better approach: The aggregation should include the parent category.
            // Let's simulate for now:
            return results.expenseDetails.some(d => d.Categoría === selectedCategory && d.Subcategoría === item.name);
        });
    }, [selectedCategory, expensesBySubcategoryAggregated, results.expenseDetails]);

    const filteredDetails = useMemo(() => {
        if (!selectedSubcategory) return [];
        return expensesByDetailAggregated.filter(item => {
            return results.expenseDetails.some(d => d.Subcategoría === selectedSubcategory && d.Detalle === item.name);
        });
    }, [selectedSubcategory, expensesByDetailAggregated, results.expenseDetails]);
    
    const timeAxisTickFormatter = (tick: string): string => {
        const date = new Date(`${tick}-15T00:00:00Z`);
        return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    };

    const PIE_COLORS = ['#0284c7', '#14b8a6', '#f97316', '#6d28d9', '#db2777', '#475569', '#0ea5e9', '#22c55e', '#8b5cf6'];
    const YEAR_COLORS = ['#0284c7', '#14b8a6', '#f97316', '#6d28d9', '#475569'];

    return (
        <div className="space-y-6" ref={ref}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Gastos" value={kpis.totalExpenses} format="currency" change={kpis.totalExpensesChange} positiveChangeIsBad />
                <KpiCard title="Gastos Operativos (OPEX)" value={kpis.opexTotal} format="currency" />
                <KpiCard title="Total Impuestos" value={kpis.taxTotal} format="currency" />
                <KpiCard title="Mes con Mayor Gasto" value={kpis.topMonth.total} format="currency" details={<span className="font-bold text-pizarro-blue-700">{kpis.topMonth.name}</span>} />
            </div>

            <ChartCard title="Evolución de Gastos Mensuales" className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={expensesOverTime} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={timeAxisTickFormatter} tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => formatNumber(v as number, true)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Ventas" name="Gastos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Comparativa Anual de Gastos" className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyExpenseTrend} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => formatNumber(v as number, true)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {availableYearsForTrend.map((year, index) => (
                            <Line key={year} type="monotone" dataKey={year} stroke={YEAR_COLORS[index % YEAR_COLORS.length]} strokeWidth={2} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
            
            <ChartCard title="Distribución de Gastos por Categoría" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" paddingAngle={3} labelLine={false} label={renderCustomizedLabel} activeIndex={activeIndex} activeShape={renderActiveShape} onClick={onPieClick}>
                            {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ position: 'relative', marginTop: '15px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis Detallado de Gastos</h3>
                <div className="flex items-center text-sm mb-4 bg-gray-50 p-2 rounded-md">
                    <button onClick={clearCategoryFilter} className="font-semibold text-pizarro-blue-600 hover:underline">Gastos Totales</button>
                    {selectedCategory && (
                        <>
                            <ChevronsRight className="w-4 h-4 text-gray-400 mx-2" />
                            <button onClick={clearSubcategoryFilter} className="font-semibold text-pizarro-blue-600 hover:underline">{selectedCategory}</button>
                        </>
                    )}
                    {selectedSubcategory && (
                        <>
                            <ChevronsRight className="w-4 h-4 text-gray-400 mx-2" />
                            <span className="font-semibold text-gray-800">{selectedSubcategory}</span>
                        </>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AggregatedExpenseTable title="Por Categoría" data={expensesByCategoryAggregated} onItemClick={handleCategoryClick} selectedItem={selectedCategory} />
                    <AggregatedExpenseTable title="Por Subcategoría" subtitle={selectedCategory || "Seleccione una categoría"} data={filteredSubcategories} onItemClick={handleSubcategoryClick} selectedItem={selectedSubcategory}/>
                    <AggregatedExpenseTable title="Por Detalle" subtitle={selectedSubcategory || "Seleccione una subcategoría"} data={filteredDetails} />
                </div>
            </div>

        </div>
    );
});

export default React.memo(ExpensesDashboard);
