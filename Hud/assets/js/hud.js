const HUD_CONFIG = {
    DATE_UPDATE_INTERVAL_MS: 500,
    CIRCLE_RADIUS: 180,
    HEALTH_MAX: 100
};

const circumference = 2 * Math.PI * HUD_CONFIG.CIRCLE_RADIUS;
const numberFormatter = new Intl.NumberFormat('ru-RU');

const hasCEF = typeof cef !== 'undefined' && cef.on;

const main = new Vue({
    el: "#app",

    data: {
        active: true,
        health: 100,
        id: 0,
        name: "Zenettany",
        currentDate: "21.07.26",
        currentTime: "21:46:33",
        armour: 0,
        wanted: 0,
        money: 0,
        weapon: 0,
        ammo: "0/0",
        isAdmin: false,

        radar: {
            active: true,
            location: "Вокзал пгт. Батырево",
            street: "ул. Ленина 2"
        },

        hints: [
            { key: "F1", text: "Помощь" },
            { key: "F6", text: "Чат" },
            { key: "F", text: "Сесть в транспорт" },
            { key: "P", text: "Квесты" },
            { key: "X", text: "Голосовой чат" },
            { key: "M", text: "Карта" },
            { key: "TAB", text: "Инвентарь" },
            { key: "R", text: "Быстрые действия" }
        ]
    },

    computed: {
        healthCircleLength() {
            return circumference;
        },

        healthStrokeDashoffset() {
            const percent = Math.min(100, Math.max(0, this.health)) / 100;
            return circumference * (1 - percent);
        },

        isWeaponFire() {
            return (this.weapon >= 22 && this.weapon <= 38) ||
                   this.weapon === 41 ||
                   this.weapon === 42;
        },

        idClass() {
            return {
                'admin-id': this.isAdmin,
                'user-id': !this.isAdmin
            };
        },

        formattedName() {
            return this.name ? this.name.replace(/_/g, ' ') : '';
        }
    },

    methods: {
        formatNumber(value) {
            return numberFormatter.format(value);
        },

        updateDateTime() {
            const now = new Date();

            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);

            this.currentDate = `${day}.${month}.${year}`;

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            this.currentTime = `${hours}:${minutes}:${seconds}`;
        }
    },

    mounted() {
        this.updateDateTime();

        setInterval(() => {
            this.updateDateTime();
        }, HUD_CONFIG.DATE_UPDATE_INTERVAL_MS);

        if (!hasCEF) return;

        cef.on("Lethality(executeEvent['main.hud.active'])", (v) => {
            this.active = Boolean(v);
        });

        cef.on("Lethality(executeEvent['main.hud.update'])", (cash, name, id) => {
            this.money = cash;
            this.name = name;
            this.id = id;
        });

        cef.on("Lethality(executeEvent['main.hud.admin'])", (v) => {
            this.isAdmin = Boolean(v);
        });

        cef.on("Lethality(executeEvent['main.hud.wanted'])", (v) => {
            this.wanted = v;
        });

        cef.on("Lethality(executeEvent['main.radar.location'])", (loc) => {
            this.radar.location = loc;
        });

        cef.on("Lethality(executeEvent['main.radar.street'])", (str) => {
            this.radar.street = str;
        });

        cef.on("Lethality(executeEvent['main.hints.set'])", (data) => {
            this.hints = typeof data === 'string' ? JSON.parse(data) : data;
        });

        cef.on("Lethality(executeEvent['main.hints.clear'])", () => {
            this.hints = [];
        });
    }
});

if (typeof cef !== 'undefined') {
    cef.emit("game:hud:setComponentVisible", "interface", false);
    cef.emit("game:hud:setComponentVisible", "radar", true);
    cef.emit("game:data:pollPlayerStats", true, 50);
}

if (hasCEF) {
    cef.on("game:data:playerStats", (hp, maxHp, arm, breath, wanted, weapon, ammo, maxAmmo, money, speed) => {
        main.health = Math.round(hp);
        main.armour = Math.round(arm);
        main.weapon = weapon;

        const remainingAmmo = Math.max(0, maxAmmo - ammo);
        main.ammo = `${ammo}/${remainingAmmo}`;

        if (typeof state !== 'undefined') {
            state.speed = speed;
        }

        if (typeof updateSpeedometer === 'function') {
            updateSpeedometer();
        }
    });
}