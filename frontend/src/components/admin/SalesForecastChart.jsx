import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { 
  Download, Loader2, ArrowUpRight, ArrowDownRight, Activity, Calendar, Box, DollarSign, Tag, TrendingUp
} from 'lucide-react';
import { getBrands, getCategories, predictRevenue, checkMlHealth } from '../../services/forecastService';

const SalesForecastChart = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Form State
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isDiscounted, setIsDiscounted] = useState(false);
  
  // Forecast State
  const [isPredicting, setIsPredicting] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const healthStatus = await checkMlHealth();
        setIsOnline(healthStatus);
        
        if (healthStatus) {
          const [brandsData, categoriesData] = await Promise.all([
            getBrands(),
            getCategories()
          ]);
          setBrands(brandsData || []);
          setCategories(categoriesData || []);
        }
      } catch (err) {
        setIsOnline(false);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    init();
  }, []);

  const generateForecast = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!selectedBrand || !selectedCategory || !unitPrice) {
      setErrorMsg('Please select a brand, category, and enter a unit price.');
      return;
    }

    if (parseFloat(unitPrice) < 0) {
      setErrorMsg('Unit price cannot be negative.');
      return;
    }

    setIsPredicting(true);
    setForecastData([]);

    try {
      const today = new Date();
      const promises = [];
      const dates = [];

      // Generate next 7 days
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];
        dates.push(dateStr);
        
        promises.push(
          predictRevenue(
            selectedBrand,
            selectedCategory,
            dateStr,
            parseFloat(unitPrice),
            0,
            0,
            isDiscounted ? 1 : 0
          )
        );
      }

      const results = await Promise.all(promises);
      
      const chartData = results.map((result, index) => {
        // Create user-friendly date for x-axis
        const dateObj = new Date(dates[index]);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

        return {
          date: dates[index],
          label: `${dayName} ${shortDate}`,
          revenue: parseFloat(result.predictedRevenue.toFixed(2))
        };
      });

      setForecastData(chartData);

    } catch (err) {
      setErrorMsg('Failed to generate 7-day forecast. Please ensure ML offline is running.');
    } finally {
      setIsPredicting(false);
    }
  };

  const downloadCSV = () => {
    if (forecastData.length === 0) return;

    const headers = ['Date', 'Brand', 'Category', 'Unit Price', 'Is Discounted', 'Predicted Revenue ($)'];
    const csvRows = [headers.join(',')];

    forecastData.forEach(item => {
      csvRows.push([
        item.date,
        `"${selectedBrand}"`,
        `"${selectedCategory}"`,
        unitPrice,
        isDiscounted ? 'Yes' : 'No',
        item.revenue
      ].join(','));
    });

    const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = `forecast_${selectedBrand.replace(/\s+/g, '_')}_7_days.csv`;
    link.click();
  };

  // Calculate stats
  const highest = forecastData.length > 0 ? [...forecastData].sort((a, b) => b.revenue - a.revenue)[0] : null;
  const lowest = forecastData.length > 0 ? [...forecastData].sort((a, b) => a.revenue - b.revenue)[0] : null;
  const average = forecastData.length > 0 
    ? (forecastData.reduce((acc, curr) => acc + curr.revenue, 0) / forecastData.length) 
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif flex items-center gap-3">
            7-Day Revenue Trends
            {forecastData.length > 0 && <TrendingUp className="w-8 h-8 text-[#1D9E75]" />}
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Visualize the projected week-ahead revenue curve for your product line.
          </p>
        </div>
        
        {forecastData.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#1D9E75] transition-all font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-rose-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-4 md:items-end w-full">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Box className="w-4 h-4 text-gray-400" /> Brand
          </label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 min-h-[42px] border"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            disabled={!isOnline || isLoadingOptions}
          >
            <option value="">Select a brand</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Box className="w-4 h-4 text-gray-400" /> Category
          </label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 min-h-[42px] border"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={!isOnline || isLoadingOptions}
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" /> Price
          </label>
          <input 
            type="number"
            min="0"
            step="0.01"
            placeholder="Unit Price"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 min-h-[42px] border"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            disabled={!isOnline}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center">
          <label className="flex items-center gap-2 cursor-pointer h-[42px] px-2">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isDiscounted}
                onChange={(e) => setIsDiscounted(e.target.checked)}
                disabled={!isOnline}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isDiscounted ? 'bg-[#1D9E75]' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isDiscounted ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Tag className="w-4 h-4 text-gray-500" /> Discount
            </span>
          </label>
        </div>

        <button
          onClick={generateForecast}
          disabled={!isOnline || isPredicting}
          className={`w-full md:w-auto whitespace-nowrap py-2.5 px-6 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all h-[42px] ${
            isOnline && !isPredicting
              ? 'bg-[#1D9E75] hover:bg-[#15805e] shadow-md'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isPredicting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</>
          ) : (
            'Generate 7-Day Forecast'
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {forecastData.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowUpRight className="w-16 h-16 text-[#1D9E75]" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Highest Day</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">${highest.revenue.toLocaleString()}</h3>
              <p className="text-sm text-[#1D9E75] font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {highest.label}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowDownRight className="w-16 h-16 text-rose-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Lowest Day</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">${lowest.revenue.toLocaleString()}</h3>
              <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {lowest.label}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 bg-emerald-50/30 p-6 relative overflow-hidden group border-b-4 border-b-[#1D9E75]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-16 h-16 text-[#1D9E75]" />
              </div>
              <p className="text-sm font-medium text-[#15805e] mb-1">7-Day Average</p>
              <h3 className="text-3xl font-bold text-[#1D9E75] mb-2">${average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
              <p className="text-sm text-[#15805e] opacity-80 font-medium">
                Per day predicted
              </p>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
               Revenue Curve <span className="text-gray-400 font-normal text-sm ml-2">Next 7 Days</span>
            </h3>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 13 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 13 }}
                    tickFormatter={(value) => `$${value}`}
                    width={80}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      fontWeight: 500
                    }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelStyle={{ color: '#6b7280', marginBottom: 4 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1D9E75" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, fill: '#1D9E75', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Empty State */}
      {(!forecastData || forecastData.length === 0) && !isPredicting && (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Forecast Data Yet</h3>
          <p className="text-gray-500 max-w-sm">
            Select a brand, category, and price above, then click "Generate 7-Day Forecast" to visualize the projected revenue.
          </p>
        </div>
      )}

    </div>
  );
};

export default SalesForecastChart;
