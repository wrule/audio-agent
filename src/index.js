#!/usr/bin/env node
import axios from 'axios';
import express from 'express';
import notifier from 'node-notifier';
import applescript from 'applescript';
import { GlobalKeyboardListener } from 'node-global-key-listener';
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
async function inputVolume(open) {
    await setInputVolume(open ? 50 : 0);
    notify(open);
}
// 获取当前音量信息
async function info() {
    const [volume, inputVolume] = await Promise.all([
        getVolume(),
        getInputVolume(),
    ]);
    return { volume, inputVolume };
}
// 输出状态通知
function notify(active) {
    notifier.notify({
        title: `${active ? '🟢' : '🔴'} Network ${active ? 'Online' : 'Offline'}`,
        message: active ? 'Hello, there!' : 'Bye!',
    });
}
// 音频输入聚焦/失焦
async function inputFocus(focus) {
    const twinIp = process.env.AUDIO_AGENT_TWIN_IP;
    if (twinIp) {
        const { data } = await axios.get(`http://${twinIp}:${PORT}/api/input-volume?open=${focus ? 'false' : 'true'}`);
        if (data.success !== true) {
            throw new Error('disable twin failed!');
        }
    }
    await inputVolume(focus);
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
    let focus = false;
    const v = new GlobalKeyboardListener();
    v.addListener((event, down) => {
        if (event.name === 'RIGHT CTRL' && event.state === 'DOWN') {
            inputFocus(!focus).then(() => focus = !focus);
        }
    });
}
main();
