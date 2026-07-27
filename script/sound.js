let audioInstances = new Map();

function playSound(filename, volume = 100, loop = false) {
    let audio = new Audio("sfx/" + filename);
    audio.volume = volume / 100;
    audio.loop = loop;
    audio.play();
    audioInstances.set(filename, audio);
}

function stopSound(filename) {
    if (audioInstances.has(filename)) {
        let audio = audioInstances.get(filename);
        audio.pause();
        audio.currentTime = 0;
        audioInstances.delete(filename);
    }
}

function stopAllSounds() {
    audioInstances.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    audioInstances.clear();
}

function setVolume(filename, volume) {
    if (audioInstances.has(filename)) {
        audioInstances.get(filename).volume = volume / 100;
    }
}


cef.on("playSound", (filename, volume, loop) => {
    playSound(filename, volume, loop);
});
cef.on("stopSound", (filename) => {
    stopSound(filename);
});
cef.on("setVolume", (filename, volume) => {
    setVolume(filename, volume);
});
cef.on("stopAllSounds", () => {
    stopAllSounds();
});