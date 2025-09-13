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

// 开关当前系统声音
function volume(open: boolean) {
  return setVolume(open ? 50 : 0);
}

async function main() {
  await volume(true);
}

main();
