import express from 'express';
import applescript from 'applescript';
const PORT = 43991;
// 获取当前系统输出音量（[0 - 100]）
function getVolume() {
    return new Promise((resolve, reject) => {
        const script = `output volume of (get volume settings)`;
        applescript.execString(script, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(Math.floor(result));
        });
    });
}
// 设置当前系统输出音量（[0 - 100]）
function setVolume(volume) {
    return new Promise((resolve, reject) => {
        if (volume > 100) {
            volume = 100;
        }
        if (volume < 0) {
            volume = 0;
        }
        volume = Math.floor(volume);
        const script = `set volume output volume ${volume}`;
        applescript.execString(script, (error) => {
            if (error) {
                reject(error);
                return;
            }
            getVolume().then((currentVolume) => {
                if (currentVolume === volume) {
                    resolve();
                }
                else {
                    reject('CurrentVolume Error');
                }
            }).catch((error) => reject(error));
        });
    });
}
// 开关当前系统声音
function volume(open) {
    return setVolume(open ? 50 : 0);
}
// 获取当前系统输入音量（[0 - 100]）
function getInputVolume() {
    return new Promise((resolve, reject) => {
        const script = `input volume of (get volume settings)`;
        applescript.execString(script, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(Math.floor(result));
        });
    });
}
// 设置当前系统输入音量（[0 - 100]）
function setInputVolume(volume) {
    return new Promise((resolve, reject) => {
        if (volume > 100) {
            volume = 100;
        }
        if (volume < 0) {
            volume = 0;
        }
        volume = Math.floor(volume);
        const script = `set volume input volume ${volume}`;
        applescript.execString(script, (error) => {
            if (error) {
                reject(error);
                return;
            }
            getInputVolume().then((currentInputVolume) => {
                if (currentInputVolume === volume) {
                    resolve();
                }
                else {
                    reject('CurrentInputVolume Error');
                }
            }).catch((error) => reject(error));
        });
    });
}
// 开关当前麦克风
function inputVolume(open) {
    return setInputVolume(open ? 50 : 0);
}
// 获取当前音量信息
async function info() {
    const [volume, inputVolume] = await Promise.all([
        getVolume(),
        getInputVolume(),
    ]);
    return { volume, inputVolume };
}
async function main() {
    const app = express();
    app.get('/api/info', async (req, res) => {
        res.json({ success: true, object: { name: 'audio-agent', ...(await info()) } });
    });
    app.get('/api/volume', async (req, res) => {
        const open = req.query.open?.toLowerCase() === 'true';
        await volume(open);
        res.json({ success: true });
    });
    app.get('/api/input-volume', async (req, res) => {
        const open = req.query.open?.toLowerCase() === 'true';
        await inputVolume(open);
        res.json({ success: true });
    });
    app.listen(PORT, () => {
        console.log(`🔊 Audio agent server is running on http://localhost:${PORT}/api/info`);
    });
}
main();
