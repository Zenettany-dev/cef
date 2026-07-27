let state = {
    speed: 0,
    maxSpeed: 300,
    fuelValue: 100,
    fuelCapacity: 100,
    strength: 1000,
    mileage: 0,
};

const speedValue = document.querySelector('.speed-value');
const mileageValue = document.querySelector('.mileage-value');
const arrowAnchor = document.querySelector('.arrow__anchor');
const indicators = document.querySelectorAll('.scale__indicators .indicator');
const fuelBar = document.querySelector('.fuel-bar .bar');
const strengthBar = document.querySelector('.strength-bar .bar');

function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function drawCircleProgressBar(canvas, progress, angle, strokeWidth, strokeColor, progressColor, clockwise = false) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const startAngle = Math.PI * 1.5;
    const maxAngle = (Math.PI * 2 * angle) / 360;
    const progressAngle = (maxAngle * progress) / 100;

    ctx.clearRect(0, 0, size, size);

    // Background stroke
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, startAngle + maxAngle, clockwise);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Progress stroke
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, startAngle + progressAngle, clockwise);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = progressColor;
    ctx.stroke();
}

function updateSpeedometer() {
    // Update Speed Value
    speedValue.textContent = Math.round(state.speed);

    // Update Mileage
    mileageValue.textContent = String(Math.round(state.mileage)).padStart(6, '0');

    // Update Speed Scale
    const rotation = map(state.speed, 0, state.maxSpeed, 0, 158);
    arrowAnchor.style.transform = `rotate(${rotation}deg)`;

    // Update Indicators
    const step = state.maxSpeed / 24;
    const fullIndicators = Math.floor(state.speed / step) - 1;
    const partialIndicator = (state.speed % step) / step;
    indicators.forEach((indicator, index) => {
        if (index <= fullIndicators) {
            indicator.style.opacity = 1;
        } else if (index === fullIndicators + 1) {
            indicator.style.opacity = partialIndicator;
        } else {
            indicator.style.opacity = 0;
        }
    });

    // Update Fuel Bar
    const fuelProgress = (state.fuelValue / state.fuelCapacity) * 100;
    drawCircleProgressBar(fuelBar, fuelProgress, 48, 5, 'rgba(255, 255, 255, 0.3)', '#F3BE00', false);

    // Update Strength Bar
    const strengthProgress = map(state.strength, 333, 1000, 0, 100);
    drawCircleProgressBar(strengthBar, strengthProgress, 32, 5, 'rgba(255, 255, 255, 0.3)', '#FFFFFF', false);

}
updateSpeedometer();

function updateBar(type, value) {
    if (type === 'fuel') {
        state.fuelValue = Math.max(0, Math.min(value, state.fuelCapacity)); // Ограничение от 0 до fuelCapacity
        const fuelProgress = (state.fuelValue / state.fuelCapacity) * 100;
        drawCircleProgressBar(fuelBar, fuelProgress, 48, 5, 'rgba(255, 255, 255, 0.3)', '#F3BE00', false);
    } else if (type === 'strength') {
        state.strength = Math.max(333, Math.min(value, 1000)); // Ограничение от 333 до 1000
        const strengthProgress = map(state.strength, 333, 1000, 0, 100);
        drawCircleProgressBar(strengthBar, strengthProgress, 32, 5, 'rgba(255, 255, 255, 0.3)', '#FFFFFF', false);
    }
}

function toggleSpeedometer(f) {
    const speedometer = document.querySelector('.speedometer');
    if (f == 1) {
        speedometer.style.display = 'block';
    } else {
        speedometer.style.display = 'none';
    }

}

cef.on("game:ToggleSpeedometer", (o) => {
    toggleSpeedometer(o);
});

cef.on("game:SetSpeedFuel", (o) => {
    updateBar('fuel', o);
});

cef.on("game:SetSpeedHealth", (o) => {
    updateBar('strength', o);
});

cef.on("game:SetSpeedMileage", (o) => {
    state.mileage = o;
    updateSpeedometer();
});

cef.on("game:SetSpeedEngine", (o) => {
    const engineIndicator = document.querySelector('.engine-indicator .icon');
    o ? engineIndicator.style.background = '#69da67' : engineIndicator.style.background = '#ffffff80'
    updateSpeedometer();
});

cef.on("game:SetSpeedDoors", (o) => {
    const doorsIndicator = document.querySelector('.doors-indicator .icon');
    o ? doorsIndicator.style.background = '#69da67' : doorsIndicator.style.background = '#ffffff80'
    updateSpeedometer();
});

cef.on("game:SetSpeedLights", (o) => {
    const headlightsIndicator = document.querySelector('.headlights-indicator .icon');
    o ? headlightsIndicator.style.background = '#69da67' : headlightsIndicator.style.background = '#ffffff80'
    updateSpeedometer();
});