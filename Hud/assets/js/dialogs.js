let currentDialog = null;

// ================== UTILS ==================
function formatColorText(str) {
    return str
        .replace(/\n/g, "<br>")
        .replace(/\{(\w{3}|\w{6})\}([^{}]*)/gi,
            (_, color, text) =>
                `<span style="color:#${color}">${text}</span>`
        );
}

function removeDialogEventListeners() {
    window.removeEventListener("click", dialogClickHandler);
    window.removeEventListener("keyup", dialogKeyHandler);
}

// ================== INPUT ==================
function dialogKeyHandler(e) {
    if (!currentDialog) return;

    if (e.key === "Escape") {
        currentDialog.response = 0;
        return callDialogResponse();
    }

    if (e.key === "Enter") {
        if (currentDialog.type === 1 || currentDialog.type === 3) {
            const input = document.getElementById("dialogInput");
            currentDialog.inputText = input ? input.value : "";
        }
        currentDialog.response = 1;
        return callDialogResponse();
    }

    if (currentDialog.type === 2 || currentDialog.type === 5) {
        if (e.key === "ArrowDown") moveList(1);
        if (e.key === "ArrowUp") moveList(-1);
    }
}

function dialogClickHandler(e) {
    const item = e.target.closest(".dialogItem");
    if (!item || !currentDialog) return;

    const value = +item.dataset.value;
    if (isNaN(value)) return;

    currentDialog.listItem = value;
    updateList();
}

// ================== LIST ==================
function moveList(dir) {
    let next = currentDialog.listItem + dir;

    if (next < 0) next = 0;
    if (next > currentDialog.maxListItem)
        next = currentDialog.maxListItem;

    currentDialog.listItem = next;
    updateList();
}

function updateList() {
    const items = document.querySelectorAll(".dialogItem");

    items.forEach(el => el.classList.remove("white_back"));

    const active = items[currentDialog.listItem];
    if (active) active.classList.add("white_back");
}

// ================== RESPONSE ==================
function callDialogResponse() {
    removeDialogEventListeners();

    cef.emit(
        "callback_dialog_response",
        currentDialog.id,
        currentDialog.response,
        currentDialog.listItem,
        currentDialog.inputText
    );

    document.getElementById("dialog_container")?.remove();

    currentDialog = null;
    cef.set_focus(false);
}

// ================== CREATE ==================
function createDialog(id, type, header, text, btn1, btn2) {
    document.getElementById("dialog_container")?.remove();
    removeDialogEventListeners();

    currentDialog = {
        id,
        type,
        listItem: 0,
        maxListItem: 0,
        response: 1,
        inputText: ""
    };

    const container = document.createElement("div");
    container.id = "dialog_container";

    container.innerHTML = `
        <div class="dialogHeader">${formatColorText(header)}</div>
        <div class="dialogText"></div>
        <div class="buttons">
            <div class="clickBtn clickBtn1">${btn1}</div>
            ${btn2 ? `<div class="clickBtn clickBtn2">${btn2}</div>` : ""}
        </div>
    `;

    document.body.appendChild(container);

    const content = container.querySelector(".dialogText");

    // ===== TYPES =====
    if (type === 0) {
        content.innerHTML = formatColorText(text);
    }

    if (type === 1 || type === 3) {
        content.innerHTML = formatColorText(text);

        const input = document.createElement("input");
        input.id = "dialogInput";
        input.className = "dialog_input";
        input.type = type === 3 ? "password" : "text";
        input.autofocus = true;

        content.appendChild(input); 
    }

    if (type === 2) {
        const lines = text.split("\n").filter(Boolean);

        lines.forEach((line, i) => {
            content.insertAdjacentHTML(
                "beforeend",
                `<div class="dialogItem" data-value="${i}">
                    ${formatColorText(line)}
                </div>`
            );
        });

        currentDialog.maxListItem = lines.length - 1;
        updateList();
    }

    if (type === 5) {
        const lines = text.split("\n").filter(Boolean);

        lines.forEach((line, i) => {
            const row = line
                .split("\t")
                .map(cell => `<div>${formatColorText(cell)}</div>`)
                .join("");

            content.insertAdjacentHTML(
                "beforeend",
                `<div class="dialogItem tablist_headers" data-value="${i}">
                    ${row}
                </div>`
            );
        });

        currentDialog.maxListItem = lines.length - 1;
        updateList();
    }

    // ===== BUTTONS =====
    container.querySelector(".clickBtn1").onclick = () => {
        if (type === 1 || type === 3) {
            currentDialog.inputText =
                document.getElementById("dialogInput")?.value || "";
        }
        currentDialog.response = 1;
        callDialogResponse();
    };

    container.querySelector(".clickBtn2")?.addEventListener("click", () => {
        currentDialog.response = 0;
        callDialogResponse();
    });

    // ===== EVENTS =====
    window.addEventListener("keyup", dialogKeyHandler);
    window.addEventListener("click", dialogClickHandler);

    cef.set_focus(true);
}

// ================== CEF ==================
cef.on("show_dialog", (id, type, header, text, b1, b2) => {
    createDialog(id, type, header, text, b1, b2);
});