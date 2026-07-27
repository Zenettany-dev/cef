function ShowBizInfo(station_type, status_text, station_name, station_number, station_owner, station_price, station_roof) {
    const bizInfoContainer = document.getElementById('bizInfoContainer');
    bizInfoContainer.style.display = "flex";

    updateElement("station-type", station_type);
    status_text ? updateElement("status-text", "ЗАКРЫТО", "red") : updateElement("status-text", "ОТКРЫТО", "green");
    updateElement("station-name", station_name);
    updateElement("station-number", station_number);
    updateElement("station-owner", "<strong>" + station_owner + "</strong>");
    updateElement("station-price", station_price + " <span class='green'>?</span>");
    // updateElement("biz-stat-label", "123");
    station_roof ? updateElement("station-roof", "<strong>Есть</strong>") : updateElement("station-roof", "<strong>Отсутствует</strong>");

    const labels = document.querySelectorAll('.biz-stat-label');
    labels.forEach(label => {
        if (label.textContent.trim() === "Крыша") {
            label.textContent = "Оплата в час";
        } else if (label.textContent.trim() === "Номер") {
            label.textContent = "Оплата в час";
        }
    });
}

function ShowHouseInfo(house_id, house_lock, house_owner, house_price, house_pay, house_class) {
    const bizInfoContainer = document.getElementById('bizInfoContainer');
    bizInfoContainer.style.display = "flex";

    updateElement("station-type", "Жилой Дом");
    house_lock ? updateElement("status-text", "ЗАКРЫТО", "red") : updateElement("status-text", "ОТКРЫТО", "green");
    updateElement("station-name", "№" + house_id);
    updateElement("station-number", house_owner);
    updateElement("station-owner", house_price + " <span class='green'>?</span>");
    updateElement("station-price", house_pay + " <span class='green'>?</span>");
    updateElement("station-roof", `<strong class="${house_class == 1 ? 'low' : house_class == 2 ? 'medium' : 'high'}">${house_class == 1 ? 'Низкий' : house_class == 2 ? 'Средний' : 'Высокий'}</strong>`);


    const labels = document.querySelectorAll('.biz-stat-label');
    labels.forEach(label => {
        if (label.textContent.trim() === "Цена") {
            label.textContent = "Оплата в час";
        } else if (label.textContent.trim() === "Крыша") {
            label.textContent = "Класс";
        } else if (label.textContent.trim() === "Владелец") {
            label.textContent = "Цена";
        }


    });
}

// BizInfo functionality
const updateElement = (id, text, color = null) => {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = text;
        if (color) el.className = `biz-status-text ${color}`;
    }
};

cef.on("game:ShowBizInfo", (station_type, status_text, station_name, station_number, station_owner, station_price, station_roof) => {
    ShowBizInfo(station_type, status_text, station_name, station_number, station_owner, station_price, station_roof);
});
cef.on("game:ShowHouseInfo", (house_id, house_lock, house_owner, house_price, house_pay, house_class) => {
    ShowHouseInfo(house_id, house_lock, house_owner, house_price, house_pay, house_class);
});

cef.on("game:HideBizInfo", () => {
    const bizInfoContainer = document.getElementById('bizInfoContainer');
    bizInfoContainer.style.display = "none";
});