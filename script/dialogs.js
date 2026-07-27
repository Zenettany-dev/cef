let dialogId = -1, dialog_type = 0, response = 1, listitem = 0, inputtext = "None", max_listitem = 0;

function update_color_list(list) {
    if (dialog_type === 2) {
        let dialog_items = document.querySelectorAll('.dialogItem');
        dialog_items.forEach(e => e.className = "dialogItem");

        let spans = document.getElementsByTagName("span");
        for (let i = 0; i < spans.length; i++) {
            spans[i].className = "hover";
        }

        let selectedItem = document.getElementsByClassName("dialogItem")[list];
        if (selectedItem) {
            selectedItem.className = "dialogItem white_back";
            for (let i = 0; i < selectedItem.children.length; i++) {
                selectedItem.children[i].className = "hover active_text";
            }
            listitem = Number(selectedItem.getAttribute("data-value"));
        }
    } else {
        let dialog_items = document.querySelectorAll('.dialogItem');
        dialog_items.forEach(e => e.className = "dialogItem tablist_headers");

        let spans = document.getElementsByTagName("span");
        for (let i = 0; i < spans.length; i++) {
            spans[i].className = "hover";
        }

        let selectedItem = document.getElementsByClassName("dialogItem")[list];
        if (selectedItem) {
            selectedItem.className = "dialogItem tablist_headers white_back";
            for (let i = 0; i < selectedItem.children.length; i++) {
                let child = selectedItem.children[i];
                for (let j = 0; j < child.children.length; j++) {
                    child.children[j].className = "active_text";
                }
            }
            listitem = Number(selectedItem.getAttribute("data-value"));
        }
    }
}

window.onclick = function (event) {
    if (dialogId !== -1) {
        if (event.target.parentNode && event.target.parentNode.id === "dialogItem") {
            listitem = Number(event.target.parentNode.getAttribute("data-value"));
            callcack_dialog_response();
        }
        if (event.target.id === "dialogItem") {
            let newListItem = Number(event.target.getAttribute("data-value"));
            if (listitem === newListItem) {
                return;
            }
            listitem = newListItem;
            update_color_list(listitem);
            callcack_dialog_response();
        }
    }
};

window.addEventListener("keyup", (event) => {
    if (dialogId !== -1) {
        if (event.key === "Escape") {
            response = 0;
            callcack_dialog_response();
        }
        if (event.key === "Enter") {
            response = 1;
            callcack_dialog_response();
        }
        if (dialog_type === 2 || dialog_type === 5) {
            if (event.key === "ArrowDown") {
                let maxItem = Number(document.getElementsByClassName("dialogItem")[max_listitem].getAttribute("data-value"));
                if (maxItem === listitem) return;
                listitem++;
                update_color_list(listitem);
            }
            if (event.key === "ArrowUp") {
                if (listitem === Number(document.getElementsByClassName("dialogItem")[0].getAttribute("data-value"))) return;
                listitem--;
                update_color_list(listitem);
            }
        }
    }
});

function create_dialog(dialog_id, dialogType, dialogHeader, dialogText, button_1, button_2) {
    dialogId = dialog_id;
    response = 1;
    listitem = 0;
    inputtext = "";
    dialog_type = dialogType;

    if (dialogType === 0 || dialogType === 1 || dialogType === 3) {
        dialogText = dialogText.replace(/[\n]/g, "<br />");
    }
    let replacedColors = dialogText.replace(/\{(\w{3}|\w{6})\}[^{}]*/gi, (textWithColor) => {
        return textWithColor.replace(/{\w*\}/, (colorInBrackets) => {
            return `<span class="hover" style='--i: #${colorInBrackets.slice(1, -1).toLowerCase()}; --g: #${colorInBrackets.slice(1, -1).toLowerCase()};'>`
        }) + '</span>';
    });
    let header = dialogHeader.replace(/\{(\w{3}|\w{6})\}[^{}]*/gi, (textWithColor) => {
        return textWithColor.replace(/{\w*\}/, (colorInBrackets) => {
            return `<span class="hover" style='--i: #${colorInBrackets.slice(1, -1).toLowerCase()};'>`
        }) + '</span>';
    });

    let element = document.getElementById("dialog_container");
    if (element) { element.remove(); }

    let body = document.body;
    let dialog_container = document.createElement('div');

    dialog_container.id = "dialog_container";
    dialog_container.setAttribute('role', 'dialog');
    dialog_container.setAttribute('aria-modal', 'true');
    body.appendChild(dialog_container);

    let dialog_header = document.createElement('div');
    dialog_header.innerHTML = header;
    dialog_header.className = "dialogHeader";
    dialog_container.appendChild(dialog_header);

    if (dialogType === 0 || dialogType === 1 || dialogType === 3) {
        let dialog_text = document.createElement('div');
        dialog_text.innerHTML = replacedColors;
        dialog_text.className = "dialogText";
        dialog_container.appendChild(dialog_text);

        if (dialogType === 1 || dialogType === 3) {
            let input = document.createElement('input');
            input.placeholder = "Нажмите для ввода";
            input.id = "dialogInput";
            input.className = "dialog_input";
            input.setAttribute("autofocus", "autofocus");
            if (dialogType == 3) { input.setAttribute("type", "password"); }
            dialog_container.appendChild(input);
            
            input.select();
        }
    }

    let dialog_text = document.createElement('div');
    dialog_text.className = "dialogText";
    dialog_container.appendChild(dialog_text);

    if (dialogType === 2) {
        let tabulations_delete = replacedColors.replace(/[\t]/, "");
        let lists = tabulations_delete.split(/[\n]/);
        for (let i = 0; i < lists.length; i++) {
            if (lists[i].length === 0) continue;
            else if (lists[i] === "</span>") continue;
            let dialog_item = document.createElement("div");
            dialog_item.innerHTML = `${lists[i]}`;
            dialog_item.id = "dialogItem";
            dialog_item.setAttribute("data-value", i);

            if (i === 0) {
                dialog_item.className = "dialogItem white_back";
                for (let j = 0; j < dialog_item.children.length; j++) {
                    dialog_item.children[j].style = "color: #fff;";
                }
            } else dialog_item.className = "dialogItem";
            dialog_text.appendChild(dialog_item);
            max_listitem = i;
        }
        listitem = Number(document.getElementsByClassName("dialogItem")[0].getAttribute("data-value"));
    }

    if (dialogType === 5) {
        let replaceToDIV = (string) => {
            return string.split("\t").map((s) => `<div class="dialogItemHeader">${s}</div>`).join("");
        }
        let lists = replacedColors.split(/[\n]/);
        for (let i = 0; i < lists.length; i++) {
            if (lists[i].length === 0) continue;
            else if (lists[i] === "</span>") continue;
            let set_tabulation = replaceToDIV(lists[i]);

            let count = lists[i].split("\t").length;

            if (i == 0) {
                let dialogTablist = document.createElement('div');
                dialogTablist.className = "styleDialogTablist tablist_headers";
                dialogTablist.innerHTML = `${set_tabulation}`;
                dialog_text.appendChild(dialogTablist);
                continue;
            }

            let dialog_item = document.createElement('div');

            if (count === 1) dialog_item.innerHTML = `${lists[i]}`;
            else dialog_item.innerHTML = `${set_tabulation}`;
            dialog_item.id = "dialogItem";
            dialog_item.setAttribute("data-value", i - 1);
            
            if (i == 1) {
                if (count === 1) dialog_item.className = "dialogItem";
                else dialog_item.className = "dialogItem tablist_headers white_back";
            } else {
                if (count === 1) dialog_item.className = "dialogItem";
                else dialog_item.className = "dialogItem tablist_headers";
            }
            
            if (lists[i].length === 1) { dialog_item.className = "dialogItem tablist_headers noback"; }

            dialog_text.appendChild(dialog_item);
            max_listitem = i - 1;
        }
        listitem = Number(document.getElementsByClassName("dialogItem")[0].getAttribute("data-value"));
        update_color_list(0);
    }

    let buttons = document.createElement('div');
    buttons.className = "buttons";
    dialog_container.appendChild(buttons);

    let btn_1 = document.createElement('div');
    btn_1.textContent = button_1;
    btn_1.className = "clickBtn clickBtn1";
    buttons.appendChild(btn_1);

    btn_1.onclick = function () { response = 1; callcack_dialog_response(); };

    if (button_2 != "") {
        let btn_2 = document.createElement('div');
        btn_2.textContent = button_2;
        btn_2.className = "clickBtn clickBtn2";
        btn_2.onclick = function () { response = 0; callcack_dialog_response(); };
        buttons.appendChild(btn_2);
    }
}

function callcack_dialog_response() {
    cef.set_focus(false);
    if (dialog_type === 1 || dialog_type === 3) {
        let text = document.getElementById("dialogInput").value;
        inputtext = `${text}`;
    }
    cef.emit("callback_dialog_response", dialogId, response, listitem, inputtext);
    dialogId = -1;
    let element = document.getElementById("dialog_container");
    if (element) element.remove();
}

cef.on("show_dialog", (dId, dType, dHeader, dText, dButton1, dButton2) => {
    create_dialog(dId, dType, dHeader, dText, dButton1, dButton2);
    cef.set_focus(true);
});