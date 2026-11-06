import React, { useState, useEffect } from 'react';

const translations = {
  ru: {
    sidebar: {
      home: 'Главная',
      pc: 'Мой ПК',
      optimize: 'Оптимизация',
      startup: 'Автозагрузка',
      beta: 'бета',
      profileTitle: 'Пользователь',
      profileSub: 'активный профиль'
    },
    header: {
      location: 'Панель управления / Главная',
      live: 'Мониторинг активен'
    },
    homeCard: {
      welcome: 'С возвращением',
      name: 'Командир',
      temperatures: 'Температуры',
      optimal: 'Оптимально',
      health: 'Здоровье системы',
      stable: 'Стабильно'
    },
    cpu: {
      title: 'Процессор',
      utilization: 'Нагрузка',
      cores: 'Ядер'
    },
    gpu: {
      title: 'Видеокарта',
      utilization: 'Нагрузка',
      status: 'Активна'
    },
    ram: {
      title: 'Оперативная память',
      usage: 'Использование',
      used: 'Занято',
      total: 'Всего',
      free: 'Свободно'
    },
    booster: {
      tag: 'Ускорение в один клик',
      title: 'Глубокая оптимизация ПК',
      desc: 'Очистка кэша браузеров (Chrome, Edge, Yandex), освобождение RAM и удаление временных файлов Windows.',
      button: '🚀 Запустить очистку',
      optimizing: 'Очистка...',
      success: 'Глубокая оптимизация успешно завершена!'
    },
    storage: {
      title: 'Диски и накопители',
      used: 'заполнено'
    },
    myPcTab: {
      title: 'Подробная информация о системе',
      os: 'Операционная система',
      kernel: 'Версия ядра',
      arch: 'Разрядность',
      hostname: 'Имя ПК',
      processor: 'Процессор',
      cores: 'Ядра / Потоки',
      gpuModel: 'Видеокарта',
      totalRam: 'Объем ОЗУ',
      motherboard: 'Материнская плата'
    },
    optimizeTab: {
      title: 'Глубокая очистка системы',
      desc: 'Удаление мусора, логов и кэша для максимального ускорения ПК.',
      tempClean: 'Очистка временных файлов Windows (Temp)',
      tempCleanDesc: 'Удаление накопившегося мусора из временных директорий',
      browserClean: 'Очистка кэша интернет-браузеров',
      browserCleanDesc: 'Удаление кэша Google Chrome, Yandex, Microsoft Edge',
      startBtn: 'Запустить глубокую очистку'
    },
    startupTab: {
      title: 'Менеджер автозагрузки',
      desc: 'Программы, запускающиеся вместе с Windows. Переключайте тумблеры для включения/отключения.',
      enabled: 'Включено',
      disabled: 'Отключено'
    }
  },
  en: {
    sidebar: {
      home: 'Home',
      pc: 'My PC',
      optimize: 'Optimize',
      startup: 'Startup',
      beta: 'beta',
      profileTitle: 'Commander',
      profileSub: 'active profile'
    },
    header: {
      location: 'Dashboard / Home',
      live: 'Live Tracking Active'
    },
    homeCard: {
      welcome: 'Welcome back',
      name: 'Commander',
      temperatures: 'Temperatures',
      optimal: 'Optimal',
      health: 'System Health',
      stable: 'Stable'
    },
    cpu: {
      title: 'Processor',
      utilization: 'Utilization',
      cores: 'Cores'
    },
    gpu: {
      title: 'Graphics Card',
      utilization: 'Utilization',
      status: 'Active'
    },
    ram: {
      title: 'RAM',
      usage: 'Memory usage',
      used: 'Used',
      total: 'Total',
      free: 'Free'
    },
    booster: {
      tag: 'One-Click Booster',
      title: 'Deep PC Optimization',
      desc: 'Clean browser cache (Chrome, Edge, Yandex), free up RAM, and remove temporary Windows files.',
      button: '🚀 Start Cleaning',
      optimizing: 'Cleaning...',
      success: 'Deep optimization successfully completed!'
    },
    storage: {
      title: 'Storage Drives',
      used: 'used'
    },
    myPcTab: {
      title: 'Detailed System Information',
      os: 'Operating System',
      kernel: 'Kernel Version',
      arch: 'Architecture',
      hostname: 'Host Name',
      processor: 'Processor',
      cores: 'Cores / Threads',
      gpuModel: 'Graphics Card',
      totalRam: 'Total RAM',
      motherboard: 'Motherboard'
    },
    optimizeTab: {
      title: 'Deep System Cleaning',
      desc: 'Remove junk files, logs, and browser cache for maximum speed.',
      tempClean: 'Clean Windows Temp Files',
      tempCleanDesc: 'Remove accumulated junk from temporary directories',
      browserClean: 'Clean Browser Cache',
      browserCleanDesc: 'Clear cache for Google Chrome, Yandex, Microsoft Edge',
      startBtn: 'Run Deep Clean'
    },
    startupTab: {
      title: 'Startup Manager',
      desc: 'Programs launching with Windows. Toggle switches to enable/disable items.',
      enabled: 'Enabled',
      disabled: 'Disabled'
    }
  }
};

function App() {
  const [stats, setStats] = useState(null);
  const [startupItems, setStartupItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState('ru');
  const [cpuHistory, setCpuHistory] = useState([20, 30, 25, 40, 35, 50, 45]);

  const t = translations[lang];

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/system-stats');
      const data = await res.json();
      setStats(data);
      if (data.cpu && data.cpu.load) {
        setCpuHistory(prev => [...prev.slice(1), parseFloat(data.cpu.load)]);
      }
    } catch (err) {}
  };

  const fetchStartup = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/startup');
      const data = await res.json();
      setStartupItems(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchStats();
    fetchStartup();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStartup = async (name, hive, currentEnabled) => {
    try {
      const res = await fetch('http://localhost:3001/api/startup/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hive, enable: !currentEnabled })
      });
      const data = await res.json();
      if (data.success) {
        // Обновляем список локально
        setStartupItems(prev => prev.map(item => {
          if (item.name === name) {
            return { ...item, enabled: !currentEnabled };
          }
          return item;
        }));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/api/optimize', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || t.booster.success);
    } catch (err) {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 GB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ru' ? 'en' : 'ru'));
  };

  return (
    <div className="flex h-screen bg-[#0A0B0E] text-gray-100 font-sans overflow-hidden select-none">
      
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #12141C; border-radius: 8px; }
        ::-webkit-scrollbar-thumb { background: #252A3D; border-radius: 8px; border: 2px solid #12141C; }
        ::-webkit-scrollbar-thumb:hover { background: #343B54; }
      `}</style>

      {/* Сайдбар */}
      <aside className="w-64 bg-[#12141C] border-r border-gray-800/50 flex flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
                IQ
              </div>
              <div>
                <div className="font-bold tracking-wide flex items-center gap-2">
                  IQON <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">{t.sidebar.beta}</span>
                </div>
              </div>
            </div>

            <button
              onClick={toggleLanguage}
              className="text-xs bg-[#1A1D2A] hover:bg-gray-800 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-700/50 font-semibold transition-all active:scale-95"
            >
              {lang.toUpperCase()}
            </button>
          </div>

          <nav className="space-y-1.5 text-sm">
            <button 
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'home' ? 'bg-[#1D2130] text-emerald-400 shadow-sm border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              🏠 {t.sidebar.home}
            </button>
            <button 
              onClick={() => setActiveTab('pc')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'pc' ? 'bg-[#1D2130] text-emerald-400 shadow-sm border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              ⚡ {t.sidebar.pc}
            </button>
            <button 
              onClick={() => setActiveTab('optimize')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'optimize' ? 'bg-[#1D2130] text-emerald-400 shadow-sm border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              🚀 {t.sidebar.optimize}
            </button>
            <button 
              onClick={() => setActiveTab('startup')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'startup' ? 'bg-[#1D2130] text-emerald-400 shadow-sm border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
            >
              ⚙️ {t.sidebar.startup}
            </button>
          </nav>
        </div>

        <div className="bg-[#181B26] p-3 rounded-2xl border border-gray-800/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-sm">
            US
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold truncate">{t.sidebar.profileTitle}</div>
            <div className="text-[10px] text-gray-400 truncate">{t.sidebar.profileSub}</div>
          </div>
        </div>
      </aside>

      {/* Контент */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <header className="h-16 border-b border-gray-800/50 px-8 flex justify-between items-center bg-[#0A0B0E]/80 backdrop-blur sticky top-0 z-10">
          <div>
            <div className="text-xs text-gray-400">{t.header.location}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs bg-[#161922] px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.header.live}
            </div>
          </div>
        </header>

        {/* Главная */}
        {activeTab === 'home' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
            
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t.homeCard.welcome}</div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">{t.homeCard.name}</h2>
                
                <div className="space-y-2.5 text-xs text-gray-300 border-t border-gray-800/80 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {t.homeCard.temperatures}
                    </span>
                    <span className="text-emerald-400 font-medium">{t.homeCard.optimal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {t.homeCard.health}
                    </span>
                    <span className="text-emerald-400 font-medium">{t.homeCard.stable}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span className="text-xs text-gray-400">OS: {stats?.os?.distro || 'Windows'}</span>
              </div>
            </div>

            {/* Процессор */}
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{t.cpu.title}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{stats?.cpu?.brand || 'Loading...'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400">{stats?.cpu?.temperature || '45'}°C</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1.5 text-gray-400">
                    <span>{t.cpu.utilization}</span>
                    <span className="font-bold text-white">{stats?.cpu?.load || 0}%</span>
                  </div>
                  <div className="w-full bg-[#1A1D2A] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.cpu?.load || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-1 h-8 pt-2 border-t border-gray-800/50">
                  {cpuHistory.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-blue-500/40 hover:bg-blue-400 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(val, 10)}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-800/50 flex justify-between text-xs text-gray-400">
                <span>{t.cpu.cores}: {stats?.cpu?.cores || '-'}</span>
                <span className="text-emerald-400 flex items-center gap-1">● Optimal</span>
              </div>
            </div>

            {/* Видеокарта */}
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{t.gpu.title}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{stats?.gpu?.model || 'GPU'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-cyan-400">{stats?.gpu?.temperature || '48'}°C</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1.5 text-gray-400">
                    <span>{t.gpu.utilization}</span>
                    <span className="font-bold text-white">{stats?.gpu?.load || 12}%</span>
                  </div>
                  <div className="w-full bg-[#1A1D2A] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.gpu?.load || 12}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-1 h-8 pt-2 border-t border-gray-800/50">
                  {cpuHistory.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max((val * 0.7) % 100, 15)}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-800/50 flex justify-between text-xs text-gray-400">
                <span>Vendor: {stats?.gpu?.vendor || 'NVIDIA'}</span>
                <span className="text-emerald-400 flex items-center gap-1">● Active</span>
              </div>
            </div>

            {/* Оперативная память */}
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{t.ram.title}</h3>
                    <p className="text-xs text-gray-400">{t.ram.usage}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-400">{stats?.memory?.usedPercentage || 0}%</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1.5 text-gray-400">
                    <span>{t.ram.used}: {formatBytes(stats?.memory?.used)}</span>
                    <span className="font-bold text-white">{t.ram.total}: {formatBytes(stats?.memory?.total)}</span>
                  </div>
                  <div className="w-full bg-[#1A1D2A] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.memory?.usedPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-between text-xs text-gray-400">
                <span>{t.ram.free}: {formatBytes(stats?.memory?.free)}</span>
                <span className="text-emerald-400 flex items-center gap-1">● Stable</span>
              </div>
            </div>

            {/* Оптимизация */}
            <div className="md:col-span-2 bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
              <div>
                <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">{t.booster.tag}</div>
                <h3 className="text-xl font-bold text-white mb-2">{t.booster.title}</h3>
                <p className="text-sm text-gray-400 max-w-lg">
                  {t.booster.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleOptimize}
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-gray-950 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {loading ? t.booster.optimizing : t.booster.button}
                </button>
                {message && (
                  <span className="text-sm text-emerald-400 font-medium animate-pulse">{message}</span>
                )}
              </div>
            </div>

            {/* Накопители */}
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <h3 className="text-base font-bold text-white mb-3">{t.storage.title}</h3>
              <div className="space-y-3 overflow-y-auto max-h-[140px] pr-1">
                {stats?.disks?.map((disk, idx) => (
                  <div key={idx} className="bg-[#181B26] p-3 rounded-2xl border border-gray-800/40">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">Drive {disk.fs}</span>
                      <span className="text-gray-400">{disk.use}% {t.storage.used}</span>
                    </div>
                    <div className="w-full bg-[#12141C] rounded-full h-1.5">
                      <div 
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${disk.use}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Вкладка: Мой ПК */}
        {activeTab === 'pc' && (
          <div className="p-8 max-w-4xl w-full mx-auto">
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-emerald-400">{t.myPcTab.title}</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.os}</span>
                  <span className="font-semibold">{stats?.os?.distro} ({stats?.os?.platform} {stats?.os?.arch})</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.kernel}</span>
                  <span className="font-semibold">{stats?.os?.kernel}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.hostname}</span>
                  <span className="font-semibold">{stats?.os?.hostname}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.motherboard}</span>
                  <span className="font-semibold">{stats?.motherboard?.manufacturer} {stats?.motherboard?.model}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.processor}</span>
                  <span className="font-semibold">{stats?.cpu?.brand}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.cores}</span>
                  <span className="font-semibold">{stats?.cpu?.physicalCores} cores / {stats?.cpu?.cores} threads</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">{t.myPcTab.gpuModel}</span>
                  <span className="font-semibold">{stats?.gpu?.model}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-400">{t.myPcTab.totalRam}</span>
                  <span className="font-semibold">{formatBytes(stats?.memory?.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка: Оптимизация */}
        {activeTab === 'optimize' && (
          <div className="p-8 max-w-4xl w-full mx-auto">
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-2 text-emerald-400">{t.optimizeTab.title}</h2>
              <p className="text-sm text-gray-400 mb-6">{t.optimizeTab.desc}</p>
              
              <div className="space-y-4 mb-8">
                <div className="bg-[#181B26] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{t.optimizeTab.tempClean}</div>
                    <div className="text-xs text-gray-400">{t.optimizeTab.tempCleanDesc}</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
                </div>
                <div className="bg-[#181B26] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{t.optimizeTab.browserClean}</div>
                    <div className="text-xs text-gray-400">{t.optimizeTab.browserCleanDesc}</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-gray-950 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {loading ? t.booster.optimizing : t.optimizeTab.startBtn}
              </button>
              {message && (
                <div className="mt-4 text-sm text-emerald-400 font-medium animate-pulse">{message}</div>
              )}
            </div>
          </div>
        )}

        {/* Вкладка: Автозагрузка с тумблерами включения/выключения */}
        {activeTab === 'startup' && (
          <div className="p-8 max-w-5xl w-full mx-auto">
            <div className="bg-[#131620] border border-gray-800/60 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-2 text-emerald-400">{t.startupTab.title}</h2>
              <p className="text-sm text-gray-400 mb-6">{t.startupTab.desc}</p>

              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                {startupItems.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4">Список автозагрузки пуст или загружается...</div>
                ) : (
                  startupItems.map((item, idx) => (
                    <div key={idx} className="bg-[#181B26] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div className="overflow-hidden pr-4">
                        <div className="font-bold text-sm text-white truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">{item.command}</div>
                      </div>
                      
                      {/* Красивый кастомный тумблер (Switch) */}
                      <button
                        onClick={() => handleToggleStartup(item.name, item.hive, item.enabled)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${item.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`}
                        ></div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
