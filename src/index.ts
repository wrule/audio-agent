import applescript from 'applescript';

// 设置系统音量 (0-100)
function setVolume(volume: number) {
  const script = `set volume output volume ${volume}`;
  applescript.execString(script, (err, result) => {
    if (err) console.error(err);
    else console.log('音量已设置为:', volume);
  });
}

setVolume(40);
