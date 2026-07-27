cef.on("game:fadeScreen", (status) => {
    const blackout = document.getElementById('blackout');
    if (status) {
        blackout.classList.add('visible');

        setTimeout(() => {
            cef.emit("game:requestTeleport");
            console.log("Запрос на телепортацию отправлен");
        }, 1500);
    } else {
        blackout.classList.remove('visible');
    }
});


document.addEventListener('keyup', (event) => {
    cef.emit("game:KeyReleased", event.keyCode);
    console.log(`Клавиша отпущена: ${event.key} (ID: ${event.keyCode}, Code: ${event.code})`);
});