#!/usr/bin/env node
import robot from 'robotjs';
import notifier from 'node-notifier';
import applescript from 'applescript';

// 获取当前系统输出音量（[0 - 100]）
function getVolume() {
  return new Promise<number>((resolve, reject) => {
    const script = `output volume of (get volume settings)`;
    applescript.execString(script, (error: Error, result: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(Math.floor(result));
    });
  });
}

// 设置当前系统输出音量（[0 - 100]）
function setVolume(volume: number) {
  return new Promise<void>((resolve, reject) => {
    if (volume > 100) {
      volume = 100;
    }
    if (volume < 0) {
      volume = 0;
    }
    volume = Math.floor(volume);
    const script = `set volume output volume ${volume}`;
    applescript.execString(script, (error: Error) => {
      if (error) {
        reject(error);
        return;
      }
      getVolume().then((currentVolume) => {
        if (currentVolume === volume) {
          resolve();
        } else {
          reject('CurrentVolume Error');
        }
      }).catch((error) => reject(error));
    });
  });
}

// 获取当前系统输入音量（[0 - 100]）
function getInputVolume() {
  return new Promise<number>((resolve, reject) => {
    const script = `input volume of (get volume settings)`;
    applescript.execString(script, (error: Error, result: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(Math.floor(result));
    });
  });
}

// 设置当前系统输入音量（[0 - 100]）
function setInputVolume(volume: number) {
  return new Promise<void>((resolve, reject) => {
    if (volume > 100) {
      volume = 100;
    }
    if (volume < 0) {
      volume = 0;
    }
    volume = Math.floor(volume);
    const script = `set volume input volume ${volume}`;
    applescript.execString(script, (error: Error) => {
      if (error) {
        reject(error);
        return;
      }
      getInputVolume().then((currentInputVolume) => {
        if (currentInputVolume === volume) {
          resolve();
        } else {
          reject('CurrentInputVolume Error');
        }
      }).catch((error) => reject(error));
    });
  });
}

// 输出状态通知
function notify(active: boolean) {
  notifier.notify({
    title: `${active ? '🟢' : '🔴'} Agent ${active ? 'Online' : 'Offline'}`,
    message: active ? 'Hello, there!' : 'Bye!',
  });
}

class AudioAgent {
  private active = false;

  private async getFocus() {
    await setInputVolume(50);
    await setVolume(50);
    notify(true);
  }

  private async loseFocus() {
    await setInputVolume(0);
    await setVolume(40);
    notify(false);
  }

  public async CheckActive() {
    try {
      const pos = robot.getMousePos();
      const isActive = pos.x !== 0 && pos.y !== 0;
      if (isActive !== this.active) {
        await (isActive ? this.getFocus() : this.loseFocus());
        this.active = isActive;
      }
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      this.CheckActive();
    }, 250);
  }
}

function main() {
  const agent = new AudioAgent();
  agent.CheckActive();
}

main();
