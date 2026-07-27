function showNotify(title, text, icon, duration, gradientStart, gradientEnd, accentColor = "#ffffff") {
    const container = document.getElementById('myNotifyContainer');
    if (!container) return;

    const notify = document.createElement('div');
    notify.className = 'notify';

    notify.innerHTML = `
        <div class="header" style="color: ${accentColor}">
            <i class="material-icons">${icon}</i>
            <span class="title">${title}</span>
        </div>
        <div class="text" style="color: ${accentColor}">${text}</div>
        <div class="progress-bar">
            <div class="progress-bar-fill" style="background: ${accentColor}"></div>
        </div>
    `;

    // Применяем ваш оригинальный градиент
    if (gradientStart && gradientEnd) {
        notify.style.backgroundImage = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
    } else {
        notify.style.backgroundImage = `linear-gradient(135deg, #3c98c0, #2b6ea4)`;
    }

    container.appendChild(notify);

    const fill = notify.querySelector('.progress-bar-fill');
    setTimeout(() => {
        fill.style.transitionDuration = `${duration}s`;
        fill.style.width = '0%';
    }, 50);

    setTimeout(() => {
        notify.style.opacity = '0';
        notify.style.transform = 'translateY(-10px)';
        setTimeout(() => notify.remove(), 300);
    }, duration * 1000);
}

cef.on("game:ShowNotification", (title, text, icon, duration, gradientStart, gradientEnd, accentColor) => {
    showNotify(title, text, icon, duration, gradientStart, gradientEnd, accentColor);
});