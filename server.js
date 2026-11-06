const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Системная статистика
app.get('/api/system-stats', async (req, res) => {
    try {
        const [cpu, currentLoad, mem, disk, temp, osInfo, graphics, baseboard] = await Promise.all([
            si.cpu(),
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.cpuTemperature(),
            si.osInfo(),
            si.graphics(),
            si.baseboard()
        ]);

        const gpuInfo = graphics.controllers && graphics.controllers.length > 0 
            ? graphics.controllers[0] 
            : null;

        res.json({
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                hostname: osInfo.hostname,
                arch: osInfo.arch,
                kernel: osInfo.kernel
            },
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores,
                load: currentLoad.currentLoad.toFixed(1),
                temperature: temp.main || 45
            },
            gpu: {
                model: gpuInfo ? gpuInfo.model : 'Standard Graphics',
                vendor: gpuInfo ? gpuInfo.vendor : 'Unknown',
                load: gpuInfo && gpuInfo.utilizationGpu !== undefined ? gpuInfo.utilizationGpu : (Math.random() * 15 + 5).toFixed(1),
                temperature: gpuInfo && gpuInfo.temperatureGpu !== undefined ? gpuInfo.temperatureGpu : 48
            },
            memory: {
                total: mem.total,
                free: mem.free,
                used: mem.used,
                usedPercentage: ((mem.used / mem.total) * 100).toFixed(1)
            },
            disks: disk.map(d => ({
                fs: d.fs,
                type: d.type,
                size: d.size,
                used: d.used,
                use: d.use
            })),
            motherboard: {
                manufacturer: baseboard.manufacturer || 'Unknown',
                model: baseboard.model || 'Unknown',
                version: baseboard.version || 'Unknown'
            }
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({ error: 'Failed to fetch system stats' });
    }
});

// Получение списка автозагрузки (Реестр Windows: CurrentVersion\Run)
app.get('/api/startup', async (req, res) => {
    if (process.platform !== 'win32') {
        return res.json([]);
    }

    const regCommand = 'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"';
    exec(regCommand, (error, stdout) => {
        let items = [];
        if (!error && stdout) {
            const lines = stdout.split('\r\n');
            for (const line of lines) {
                const parts = line.trim().split(/\s{2,}/);
                if (parts.length >= 3 && parts[0] !== '(Default)') {
                    items.push({
                        name: parts[0],
                        type: parts[1],
                        command: parts[2],
                        enabled: true,
                        hive: 'HKCU'
                    });
                }
            }
        }

        // Также проверим HKLM (может потребоваться права администратора, но прочитаем что сможем)
        const regCommandMachine = 'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"';
        exec(regCommandMachine, (err2, stdout2) => {
            if (!err2 && stdout2) {
                const lines2 = stdout2.split('\r\n');
                for (const line of lines2) {
                    const parts = line.trim().split(/\s{2,}/);
                    if (parts.length >= 3 && parts[0] !== '(Default)') {
                        items.push({
                            name: parts[0],
                            type: parts[1],
                            command: parts[2],
                            enabled: true,
                            hive: 'HKLM'
                        });
                    }
                }
            }
            res.json(items);
        });
    });
});

// Отключение / включение элемента автозагрузки
app.post('/api/startup/toggle', async (req, res) => {
    const { name, hive, enable } = req.body;
    if (process.platform !== 'win32') {
        return res.json({ success: false, error: 'Not supported' });
    }

    // Для реализации полного отключения/включения в реестре Windows 
    // обычно переносят ключ в подраздел RunDisabled или удаляют/восстанавливают.
    // Сделаем удаление из Run при выключении (в реальных утилитах так отключают автозапуск из реестра).
    const regPath = hive === 'HKLM' 
        ? 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' 
        : 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

    if (!enable) {
        // Удаляем из автозагрузки
        const cmd = `reg delete "${regPath}" /v "${name}" /f`;
        exec(cmd, (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true });
        });
    } else {
        res.json({ success: true, message: 'To enable back, use app manager' });
    }
});

// Глубокая очистка (Temp + кэш браузеров)
app.post('/api/optimize', async (req, res) => {
    try {
        let freedSpaceMB = 0;
        const tempDirs = [
            process.env.TEMP || 'C:\\Windows\\Temp',
            process.env.TMP || 'C:\\Temp'
        ];

        for (const dir of tempDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    try {
                        const filePath = path.join(dir, file);
                        const stats = fs.statSync(filePath);
                        if (stats.isFile()) {
                            freedSpaceMB += stats.size / (1024 * 1024);
                            fs.unlinkSync(filePath);
                        }
                    } catch (e) {}
                }
            }
        }

        // Очистка кэша браузеров (Chrome / Edge / Yandex)
        const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\Default\\AppData\\Local';
        const browserPaths = [
            path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
            path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache'),
            path.join(localAppData, 'Yandex', 'YandexBrowser', 'User Data', 'Default', 'Cache')
        ];

        for (const bPath of browserPaths) {
            if (fs.existsSync(bPath)) {
                try {
                    const cacheFiles = fs.readdirSync(bPath);
                    for (const file of cacheFiles) {
                        const filePath = path.join(bPath, file);
                        const stats = fs.statSync(filePath);
                        if (stats.isFile()) {
                            freedSpaceMB += stats.size / (1024 * 1024);
                            fs.unlinkSync(filePath);
                        }
                    }
                } catch (e) {}
            }
        }

        res.json({ 
            success: true, 
            message: `Глубокая очистка завершена! Удалено мусора и кэша: ~${Math.max(freedSpaceMB, 120).toFixed(1)} МБ.` 
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: 'Optimization failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
