import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Tag,
  Box,
  Trash2
} from 'lucide-react';
import { checkMlHealth, getBrands, getCategories, predictRevenue } from '../../services/forecastService';

const SalesForecast = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);
  
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [unitPrice, setUnitPrice] = useState('');
  const [isDiscounted, setIsDiscounted] = useState(false);
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const init = async () => {
      setCheckingHealth(true);
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
        setErrorMsg('Connection error. Please check your internet connection.');
      } finally {
        setCheckingHealth(false);
        setIsLoadingOptions(false);
      }
    };
    init();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCurrentPrediction(null);
    
    if (!selectedBrand || !selectedCategory || !date || !unitPrice) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    if (parseFloat(unitPrice) < 0) {
      setErrorMsg('Unit price cannot be negative.');
      return;
    }

    setIsPredicting(true);
    try {
      const result = await predictRevenue(
        selectedBrand,
        selectedCategory,
        date,
        parseFloat(unitPrice),
        0, // lagRevenue1 defaults to 0
        0, // rollingRev7 defaults to 0
        isDiscounted ? 1 : 0
      );
      
      const newPrediction = {
        ...result,
        id: Date.now(),
        price: parseFloat(unitPrice)
      };
      
      setCurrentPrediction(newPrediction);
      setHistory(prev => [newPrediction, ...prev].slice(0, 5));
    } catch (err) {
      setErrorMsg(
        err.response?.status === 503 || err.message.includes('unavailable')
          ? 'ML server is offline. Please start the Python Flask server and try again.'
          : 'Failed to predict revenue. Please try again.'
      );
    } finally {
      setIsPredicting(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentPrediction(null);
  };

  const getInsightMessage = (revenue) => {
    if (revenue > 500) {
      return {
        text: "Strong sales expected. Consider increasing stock for this product.",
        icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700"
      };
    } else if (revenue >= 200 && revenue <= 500) {
      return {
        text: "Moderate sales expected. Current stock levels should be sufficient.",
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700"
      };
    } else {
      return {
        text: "Low sales expected. Consider running a promotion to boost demand.",
        icon: <TrendingDown className="w-5 h-5 text-amber-600" />,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700"
      };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif mb-2">Sales Revenue Forecasting</h1>
          <p className="text-gray-500 max-w-2xl">
            AI-powered predictions to help you plan stock, pricing and promotions.
          </p>
        </div>
        
        {/* Status Badge */}
        <div className="flex-shrink-0">
          {checkingHealth ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking ML Status...
            </div>
          ) : isOnline ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              ML Model: Online
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium border border-rose-200">
              <XCircle className="w-4 h-4" />
              ML Model: Offline
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {!isOnline && !checkingHealth && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 text-sm">
            ML server is offline. Please start the Python Flask server and try again.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <Box className="w-5 h-5 text-[#1D9E75]" />
             Forecast Parameters
          </h2>
          
          <form onSubmit={handlePredict} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 border"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 border"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="date"
                  className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 border"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!isOnline}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1200.00"
                  className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-[#1D9E75] focus:border-[#1D9E75] bg-gray-50 p-2.5 border"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  disabled={!isOnline}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
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
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Is Discounted?
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isOnline || isPredicting}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                isOnline && !isPredicting
                  ? 'bg-[#1D9E75] hover:bg-[#15805e] shadow-md hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                'Predict Revenue'
              )}
            </button>
          </form>
        </div>

        {/* Results & History Section */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Current Result */}
          {currentPrediction ? (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-50 opacity-50"></div>
               
               <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Predicted Revenue</h3>
               <div className="text-5xl font-bold text-gray-900 mb-6 font-serif tracking-tight">
                 ${currentPrediction.predictedRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </div>
               
               <div className="flex flex-wrap gap-4 mb-6">
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-700 border border-gray-100">
                   <span className="text-gray-500">Brand:</span> <span className="font-medium">{currentPrediction.brand}</span>
                 </div>
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-700 border border-gray-100">
                   <span className="text-gray-500">Category:</span> <span className="font-medium">{currentPrediction.subCategory}</span>
                 </div>
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-700 border border-gray-100">
                   <span className="text-gray-500">Date:</span> <span className="font-medium">{currentPrediction.date}</span>
                 </div>
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm text-gray-700 border border-gray-100">
                   <span className="text-gray-500">Price:</span> <span className="font-medium">${currentPrediction.price}</span>
                 </div>
               </div>
               
               {(() => {
                 const insight = getInsightMessage(currentPrediction.predictedRevenue);
                 return (
                   <div className={`p-4 rounded-xl flex gap-3 ${insight.bgColor} ${insight.textColor} border border-opacity-50`} style={{ borderColor: 'currentColor' }}>
                     <div className="mt-0.5">{insight.icon}</div>
                     <p className="text-sm font-medium">{insight.text}</p>
                   </div>
                 );
               })()}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <Box className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Forecast</h3>
              <p className="text-gray-500 max-w-sm">
                Enter product details securely to generate AI-powered revenue forecasts based on historical data.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Recent Predictions</h3>
                <button 
                  onClick={clearHistory}
                  className="text-sm flex items-center gap-1.5 text-gray-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product Details</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium text-right">Predicted Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.brand}</div>
                          <div className="text-xs text-gray-500">{item.subCategory}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.date}</td>
                        <td className="px-6 py-4 text-gray-600">${item.price}</td>
                        <td className="px-6 py-4 font-semibold text-right text-gray-900">
                          ${item.predictedRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SalesForecast;
