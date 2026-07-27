class SkinSelector {
	constructor() {
		this.categories = [],
			this.currentCategoryIndex = 0
		this.currentTypeIndex = 0

		this.handleKeyUp = this.handleKeyUp.bind(this)
	}

	init() {
		this.bindEvents()
	}

	bindEvents() {

		document.getElementById("categoryPrev")?.addEventListener("click", () => {
			this.previousCategory()
		})

		document.getElementById("categoryNext")?.addEventListener("click", () => {
			this.nextCategory()
		})

		document.getElementById("buyButton")?.addEventListener("click", () => {
			this.buySkin()
		})

		document.getElementById("closeButton")?.addEventListener("click", () => {
			cef.emit("game:requestSelectorClose", this.currentCategoryIndex)
		})

		cef.on("game:openSkinSelector", (open) => {
			this.openInterface(open)
		})

		cef.on("game:setCategories", (jsonString) => {
			try {
				const parsed = JSON.parse(jsonString)
				if (Array.isArray(parsed)) {
					skinSelector.setCategories(parsed)
				}
			} catch (e) {
				console.error("Ошибка парсинга категорий:", e)
			}
		})
	}

	setCategories(categories) {
		if (!Array.isArray(categories) || categories.length === 0) return;

		this.categories = categories;
		this.currentCategoryIndex = 0;

		// Обновление DOM: например, список категорий
		const categoryList = document.getElementById("categoryList");
		if (categoryList) {
			categoryList.innerHTML = ""; // Очистим перед добавлением новых

			categories.forEach((category, index) => {
				const item = document.createElement("div");
				item.className = "category-item";
				item.textContent = category.name;

				item.addEventListener("click", () => {
					this.currentCategoryIndex = index;
					this.updateCategoryDisplay();
				});

				categoryList.appendChild(item);
			});
		}

		// Обновление отображения текущей категории
		this.updateCategoryDisplay();
	}

	updateCategoryDisplay() {
		const category = this.categories[this.currentCategoryIndex];
		const categoryPrice = document.getElementById("categoryPrice");

		if (categoryPrice) {
			categoryPrice.textContent = category?.price ? `${category.price} ₽` : "Выберите скин";
		}
	}


	getCurrentCategoryPrice() {
		return this.categories[this.currentCategoryIndex]?.price || "";
	}


	addKeyboardControls() {
		document.addEventListener("keyup", this.handleKeyUp)
	}


	handleKeyUp(e) {
		switch (e.key.toLowerCase()) {
			case "escape":
				cef.emit("game:requestSelectorClose", this.currentCategoryIndex)
				break
			case "arrowleft":
			case "a":
				this.previousCategory()
				break
			case "arrowright":
			case "d":
				this.nextCategory()
				break
			case "enter":
			case "space":
				e.preventDefault()
				this.buySkin()
				break
		}
	}


	previousCategory() {
		this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length
		this.updateDisplay()
		cef.emit("game:skinSelected", this.currentCategoryIndex, 0)
	}

	nextCategory() {
		this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length
		this.updateDisplay()
		cef.emit("game:skinSelected", this.currentCategoryIndex, 0)
	}

	updateDisplay() {
		const category = this.categories[this.currentCategoryIndex]
		if (!category) return;

		const categoryTitle = document.getElementById("categoryTitle")
		if (categoryTitle) categoryTitle.textContent = category.name

		const categoryPrice = document.getElementById("categoryPrice")
		if (categoryPrice && this.currentTypeIndex === 1) {
			categoryPrice.textContent = `${category.price} ₽`
		}
	}


	buySkin() {
		cef.emit("game:skinSelected", this.currentCategoryIndex, 1)
	}

	openInterface(type = 1) {
		const content = document.querySelector(".content");
		const categoryPrice = document.getElementById("categoryPrice");

		if (type === 0) {
			if (content) content.style.opacity = "0";
			document.removeEventListener("keyup", this.handleKeyUp);
			cef.set_focus(false);
			return;
		}

		cef.set_focus(true);

		if (content) {
			content.style.display = "flex";
			content.style.opacity = "0";

			setTimeout(() => {
				content.style.opacity = "1";
			}, 50);
		}

		if (categoryPrice && type === 2) {
			categoryPrice.textContent = "Выберите скин";
		}

		this.addKeyboardControls();
		this.currentTypeIndex = type;
	}

}

window.skinSelector = new SkinSelector()

document.addEventListener("DOMContentLoaded", () => {
	window.skinSelector.init()
})