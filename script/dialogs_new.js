// Dialog System for SAMP
let currentDialog = null
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0
let selectedListItem = -1
let inputText = ""
let currentDialogStyle = -1
let timerInterval = null
let dialogID = -1

// Dialog style constants
const DIALOG_STYLE_MSGBOX = 0
const DIALOG_STYLE_INPUT = 1
const DIALOG_STYLE_LIST = 2
const DIALOG_STYLE_PASSWORD = 3
const DIALOG_STYLE_TABLIST = 4
const DIALOG_STYLE_TABLIST_HEADERS = 5
const DIALOG_STYLE_MSGBOX_PICTURE = 6
const DIALOG_STYLE_LIST_TEXT = 7

//showDialog(1, 2, "Раздевалка", "{FFFFFF}Имя\t{e69348}%s\n{FFFFFF}Пол\t{e69348}%s\n{FFFFFF}Уровень\t{e69348}%d (%d/%d)\n\n{FFFFFF}Наличные\t{e69348}%s\n{FFFFFF}Деньги в банке\t{e69348}%s\n{FFFFFF}Телефон\t{e69348}%s\n{FFFFFF}Мобильный счет\t{e69348}%s\n\n{FFFFFF}Военный билет\t{e69348}%s\n{FFFFFF}Розыск\t{e69348}%s\n{FFFFFF}Законопослушность\t{e69348}%d\n{FFFFFF}Наркозависимость\t{e69348}%s\n{FFFFFF}Бизнес\t{e69348}%s\n\n{FFFFFF}Организация\t{e69348}%s\n\n{FFFFFF}Работа\t{e69348}%s\n{FFFFFF}Проживание\t{e69348}%s\n{FFFFFF}Семья\t{e69348}%s", "Прив", "123")

function showDialog(dialogid, style, title, text, button1, button2, middleButtonText = "", timerSeconds = 0, picture1Url = "", picture2Url = "", picture3Url = "") {
    // Close any existing dialog
    if (currentDialog) {
        try {
            document.getElementById("dialog-container").removeChild(currentDialog)
        } catch (e) {
            console.log("Dialog was already removed")
        }
    }

    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }

    // Reset dialog state
    selectedListItem = -1
    inputText = ""
    currentDialogStyle = style
    dialogID = dialogid

    // Create dialog element
    const dialog = document.createElement("div")
    dialog.className = "dialog"
    dialog.style.transform = "translate(-50%, -50%)"
    dialog.style.transformOrigin = "center"

    if (timerSeconds > 0) {
        dialog.classList.add("timer-dialog")
    }
    dialog.setAttribute("tabindex", "0") // Make dialog focusable for keyboard events

    // Create dialog header
    const header = document.createElement("div")
    header.className = "dialog-header"

    const titleElement = document.createElement("div")
    titleElement.className = "dialog-title"
    titleElement.textContent = title

    header.appendChild(titleElement)

    let dialogScale = 1.5

    header.onmousedown = (e) => {
        isDragging = true
        const rect = dialog.getBoundingClientRect()
        dragOffsetX = e.clientX - rect.left
        dragOffsetY = e.clientY - rect.top
    }

    document.onmousemove = (e) => {
        if (isDragging) {
            dialog.style.left = e.clientX - dragOffsetX + "px"
            dialog.style.top = e.clientY - dragOffsetY + "px"
            dialog.style.transform = `scale(${dialogScale})`
            dialog.style.transformOrigin = "top left"
        }
    }

    document.onmouseup = () => {
        isDragging = false
    }

    // Add header to dialog
    dialog.appendChild(header)

    // Create dialog content
    const content = document.createElement("div")
    content.className = "dialog-content"
    dialog.appendChild(content)

    // Process text for color embedding
    const processedText = processColorEmbedding(text)

    // Create dialog based on style
    switch (style) {
        case DIALOG_STYLE_MSGBOX:
            createMsgBoxDialog(content, processedText)
            break
        case DIALOG_STYLE_INPUT:
            createInputDialog(content, processedText)
            break
        case DIALOG_STYLE_LIST:
            createListDialog(content, processedText)
            break
        case DIALOG_STYLE_PASSWORD:
            createPasswordDialog(content, processedText)
            break
        case DIALOG_STYLE_TABLIST:
            createTablistDialog(content, processedText, false)
            break
        case DIALOG_STYLE_TABLIST_HEADERS:
            createTablistDialog(content, processedText, true)
            break
        case DIALOG_STYLE_MSGBOX_PICTURE:
            createMsgBoxPictureDialog(content, processedText, picture1Url, picture2Url, picture3Url)
            break
        case DIALOG_STYLE_LIST_TEXT:
            createListTextDialog(content, processedText)
            break
    }

    // Create dialog buttons
    const buttons = document.createElement("div")
    buttons.className = "dialog-buttons"

    // Primary button
    let button1Element = null
    if (button1 && button1.length > 0) {
        button1Element = document.createElement("button")
        button1Element.className = "dialog-button dialog-button-primary"

        // Handle timer functionality
        if (timerSeconds > 0) {
            button1Element.disabled = true
            let remainingTime = timerSeconds

            const updateButtonText = () => {
                if (remainingTime > 0) {
                    button1Element.innerHTML = `<span class="timer-text">(${remainingTime.toFixed(1)}s)</span>`
                } else {
                    button1Element.innerHTML = button1
                    button1Element.disabled = false
                    button1Element.classList.add("timer-active")
                    if (timerInterval) {
                        clearInterval(timerInterval)
                        timerInterval = null
                    }
                }
            }

            updateButtonText()

            timerInterval = setInterval(() => {
                remainingTime -= 0.1
                if (remainingTime <= 0) remainingTime = 0
                updateButtonText()
            }, 100)
        } else {
            button1Element.textContent = button1
        }

        button1Element.onclick = () => {
            if (!button1Element.disabled) {
                closeDialog(1)
            }
        }
    }

    // Secondary button
    let button2Element = null
    if (button2 && button2.length > 0) {
        button2Element = document.createElement("button")
        button2Element.className = "dialog-button dialog-button-secondary"
        button2Element.textContent = button2
        button2Element.onclick = () => closeDialog(0)
    }

    // Middle button
    let middleButtonElement = null
    if (middleButtonText && middleButtonText.length > 0) {
        middleButtonElement = document.createElement("button")
        middleButtonElement.className = "dialog-button dialog-button-middle"
        middleButtonElement.textContent = middleButtonText
        middleButtonElement.onclick = () => closeDialog(2)
    }

    // Append buttons in order: primary, middle, secondary
    if (button1Element) buttons.appendChild(button1Element)
    if (middleButtonElement) buttons.appendChild(middleButtonElement)
    if (button2Element) buttons.appendChild(button2Element)

    // Add buttons to dialog
    dialog.appendChild(buttons)

    // Add dialog to container
    document.getElementById("dialog-container").appendChild(dialog)
    currentDialog = dialog

    // Focus input if present
    const input = dialog.querySelector(".dialog-input")
    if (input) {
        input.focus()
    } else {
        dialog.focus() // Focus the dialog for keyboard events
    }

    // Add keyboard event listener
    dialog.addEventListener("keydown", handleKeyboardNavigation)
}


// Handle keyboard navigation
function handleKeyboardNavigation(e) {
	if (!currentDialog) return

	switch (e.key) {
		case "ArrowUp":
			e.preventDefault()
			navigateUp()
			break
		case "ArrowDown":
			e.preventDefault()
			navigateDown()
			break
		case "Enter":
			e.preventDefault()
			// Trigger the primary/accept button
			const primaryButton = currentDialog.querySelector(".dialog-button-primary")
			if (primaryButton && !primaryButton.disabled) {
				primaryButton.click()
			}
			break
		case "Escape":
			e.preventDefault()
			// Trigger the secondary/cancel button
			const secondaryButton = currentDialog.querySelector(".dialog-button-secondary")
			if (secondaryButton) {
				secondaryButton.click()
			}
			break
	}
}

// Navigate up in list
function navigateUp() {
	switch (currentDialogStyle) {
		case DIALOG_STYLE_LIST:
		case DIALOG_STYLE_LIST_TEXT:
			navigateListUp(".dialog-list-item")
			break
		case DIALOG_STYLE_TABLIST:
		case DIALOG_STYLE_TABLIST_HEADERS:
			navigateListUp(".dialog-tablist tr")
			break
	}
}

// Navigate down in list
function navigateDown() {
	switch (currentDialogStyle) {
		case DIALOG_STYLE_LIST:
		case DIALOG_STYLE_LIST_TEXT:
			navigateListDown(".dialog-list-item")
			break
		case DIALOG_STYLE_TABLIST:
		case DIALOG_STYLE_TABLIST_HEADERS:
			navigateListDown(".dialog-tablist tr")
			break
	}
}

// Navigate up in a list
function navigateListUp(selector) {
	if (!currentDialog) return

	const items = currentDialog.querySelectorAll(selector)
	if (items.length === 0) return

	// Find the currently selected item
	let selectedIndex = -1
	for (let i = 0; i < items.length; i++) {
		if (items[i].classList.contains("selected")) {
			selectedIndex = i
			break
		}
	}

	// Move selection up
	if (selectedIndex > 0) {
		// Remove selected class from current item
		if (selectedIndex !== -1) {
			items[selectedIndex].classList.remove("selected")
		}

		// Select the previous item
		selectedIndex--
		items[selectedIndex].classList.add("selected")

		// Update selected item
		selectedListItem = selectedIndex

		// Update input text based on the selected item
		if (selector === ".dialog-list-item") {
			inputText = items[selectedIndex].textContent
		} else if (selector === ".dialog-tablist tr") {
			inputText = items[selectedIndex].cells[0].textContent
		}

		// Scroll to the selected item if needed
		items[selectedIndex].scrollIntoView({
			block: "nearest"
		})
	}
}

// Navigate down in a list
function navigateListDown(selector) {
	if (!currentDialog) return

	const items = currentDialog.querySelectorAll(selector)
	if (items.length === 0) return

	// Find the currently selected item
	let selectedIndex = -1
	for (let i = 0; i < items.length; i++) {
		if (items[i].classList.contains("selected")) {
			selectedIndex = i
			break
		}
	}

	// Move selection down
	if (selectedIndex < items.length - 1) {
		// Remove selected class from current item
		if (selectedIndex !== -1) {
			items[selectedIndex].classList.remove("selected")
		} else {
			// If nothing is selected, start from the beginning
			selectedIndex = -1
		}

		// Select the next item
		selectedIndex++
		items[selectedIndex].classList.add("selected")

		// Update selected item
		selectedListItem = selectedIndex

		// Update input text based on the selected item
		if (selector === ".dialog-list-item") {
			inputText = items[selectedIndex].textContent
		} else if (selector === ".dialog-tablist tr") {
			inputText = items[selectedIndex].cells[0].textContent
		}

		// Scroll to the selected item if needed
		items[selectedIndex].scrollIntoView({
			block: "nearest"
		})
	}
}

// Show dialog with middle button
function showDialogWithMiddleButton(style) {
	const titles = [
		"MSGBOX with Middle Button",
		"INPUT with Middle Button",
		"LIST with Middle Button",
		"PASSWORD with Middle Button",
		"TABLIST with Middle Button",
		"TABLIST HEADERS with Middle Button",
		"MSGBOX PICTURE with Middle Button",
		"LIST TEXT with Middle Button",
	]

	const texts = [
		"This dialog has three buttons.\nChoose one of the options.",
		"Enter your information:",
		"Option 1\nOption 2\nOption 3",
		"Enter your secure code:",
		"ID\tName\tScore\n1\tPlayer1\t100\n2\tPlayer2\t85\n3\tPlayer3\t120",
		"ID\tName\tScore\n1\tPlayer1\t100\n2\tPlayer2\t85\n3\tPlayer3\t120",
		"This dialog has an image and three buttons.\nMake your choice.",
		"Read this text carefully:\n\nOption 1\nOption 2\nOption 3",
	]

	showDialog(10, style, titles[style], texts[style], "Accept", "Decline", "I dont know")
}

// Create message box dialog
function createMsgBoxDialog(container, text) {
	const textElement = document.createElement("div")
	textElement.className = "dialog-text"
	textElement.innerHTML = text
	container.appendChild(textElement)
}

// Create input dialog
function createInputDialog(container, text) {
	const textElement = document.createElement("div");
	textElement.className = "dialog-text";
	textElement.innerHTML = text;

	const input = document.createElement("input");
	input.className = "dialog-input";
	input.placeholder = "Нажмите для ввода";
	input.type = "text";

	container.appendChild(textElement);
	container.appendChild(input);

	input.focus();
}


// Create list dialog (modified - no header)
function createListDialog(container, text) {
  const lines = text.split("\n");
  if (lines.length === 0) return;

  const list = document.createElement("div");
  list.className = "dialog-list";
  container.appendChild(list);

  // Сбрасываем паддинг снизу у dialog-content
  const dialogContent = container.closest(".dialog-content");
  if (dialogContent) {
    dialogContent.style.paddingBottom = "0";
  }

  const items = lines.map((line, i) => {
    const item = document.createElement("div");
    item.className = "dialog-list-item";
    item.dataset.index = i;
    item.innerHTML = processColorEmbedding(line);
    item.dataset.originalHTML = item.innerHTML;
    item.addEventListener("click", () => select(i));
    list.appendChild(item);
    return item;
  });

  function select(index) {
	items.forEach((itm, i) => {
		if (itm.innerHTML !== itm.dataset.originalHTML) {
		itm.innerHTML = itm.dataset.originalHTML;
		}
		itm.classList.toggle("selected", i === index);
		if (i === index) {
		itm.querySelectorAll("span").forEach((s) => (s.style.color = "#000"));
		
		// Автоскролл: если элемент выходит за пределы видимой области
		const listRect = list.getBoundingClientRect();
		const itemRect = itm.getBoundingClientRect();
		
		if (itemRect.top < listRect.top) {
			// прокручиваем вверх
			list.scrollTop -= (listRect.top - itemRect.top);
		} else if (itemRect.bottom > listRect.bottom) {
			// прокручиваем вниз
			list.scrollTop += (itemRect.bottom - listRect.bottom);
		}
		}
	});

	selectedListItem = index;
	inputText = items[index].textContent;
	}


  // выбрать первый по умолчанию
  select(0);

  const dialogEl = container.closest(".dialog") || document;
  dialogEl.addEventListener(
    "keydown",
    (e) => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        const max = items.length - 1;
        let idx = typeof selectedListItem === "number" ? selectedListItem : 0;

        switch (e.key) {
          case "ArrowDown":
            idx = Math.min(max, idx + 1);
            break;
          case "ArrowUp":
            idx = Math.max(0, idx - 1);
            break;
          case "Home":
            idx = 0;
            break;
          case "End":
            idx = max;
            break;
        }
        select(idx);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (typeof closeDialog === "function") closeDialog(1);
      }
    },
    { capture: true }
  );
}



// Create password dialog
function createPasswordDialog(container, text) {
	const textElement = document.createElement("div")
	textElement.className = "dialog-text"
	textElement.innerHTML = text

	const input = document.createElement("input")
	input.className = "dialog-input dialog-password"
	input.type = "password"
	input.placeholder = "Нажмите для ввода"
	input.oninput = (e) => {
		inputText = e.target.value
	}

	container.appendChild(textElement)
	container.appendChild(input)
}

function createTablistDialog(container, text, hasHeaders) {
  const lines = text.split("\n");
  const wrapper = document.createElement("div");
  wrapper.className = "dialog-tablist";
  container.appendChild(wrapper);

  // Сбрасываем паддинг снизу у dialog-content
  const dialogContent = container.closest(".dialog-content");
  if (dialogContent) dialogContent.style.paddingBottom = "0";

  let startIndex = 0;
  if (hasHeaders && lines.length > 1) {
    const headerRow = document.createElement("div");
    headerRow.className = "row header";
    lines[0].split("\t").forEach((header) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.innerHTML = processColorEmbedding(header);
      headerRow.appendChild(cell);
    });
    wrapper.appendChild(headerRow);
    startIndex = 1;
  }

  const rows = lines.slice(startIndex).map((line, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.index = i;
    row.innerHTML = line
      .split("\t")
      .map((c) => `<div class="cell">${processColorEmbedding(c)}</div>`)
      .join("");
    row.dataset.originalHTML = row.innerHTML;
    row.addEventListener("click", () => select(i));
    wrapper.appendChild(row);
    return row;
  });

  function select(index) {
    rows.forEach((r, i) => {
      if (r.innerHTML !== r.dataset.originalHTML) r.innerHTML = r.dataset.originalHTML;
      r.classList.toggle("selected", i === index);
      if (i === index) {
        r.querySelectorAll("span, .cell").forEach((s) => (s.style.color = "#000"));

        // автоскролл
        const wrapperRect = wrapper.getBoundingClientRect();
        const rowRect = r.getBoundingClientRect();
        if (rowRect.top < wrapperRect.top) wrapper.scrollTop -= (wrapperRect.top - rowRect.top);
        else if (rowRect.bottom > wrapperRect.bottom) wrapper.scrollTop += (rowRect.bottom - wrapperRect.bottom);
      }
    });
    selectedListItem = index;
    inputText = rows[index].textContent;
  }

  select(0);

  const dialogEl = container.closest(".dialog") || document;
  dialogEl.addEventListener(
    "keydown",
    (e) => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        let idx = typeof selectedListItem === "number" ? selectedListItem : 0;
        const max = rows.length - 1;
        switch (e.key) {
          case "ArrowDown": idx = Math.min(max, idx + 1); break;
          case "ArrowUp": idx = Math.max(0, idx - 1); break;
          case "Home": idx = 0; break;
          case "End": idx = max; break;
        }
        select(idx);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (typeof closeDialog === "function") closeDialog(1);
      }
    },
    { capture: true }
  );
}


// Create message box with picture dialog
function createMsgBoxPictureDialog(container, text, picture1Url, picture2Url, picture3Url) {
	const textElement = document.createElement("div")
	textElement.className = "dialog-text"
	textElement.innerHTML = text
	container.appendChild(textElement)

	// Create container for multiple images at the bottom
	const picturesContainer = document.createElement("div")
	picturesContainer.className = "dialog-pictures"

	// Add multiple images (for demo purposes)
	const imageUrls = [
		"./images/dialog-insertions/" + picture1Url,
		"./images/dialog-insertions/" + picture2Url,
		"./images/dialog-insertions/" + picture3Url
	]

	for (const url of imageUrls) {
		const image = document.createElement("img")
		image.src = url
		image.alt = "Dialog Image"
		picturesContainer.appendChild(image)
	}

	container.appendChild(picturesContainer)
}

function createListTextDialog(container, text) {
  const lines = text.split("\n");
  if (lines.length === 0) return;

  // Первая строка — инструкция, \t -> перенос строки
  const instructionDiv = document.createElement("div");
  instructionDiv.className = "dialog-list-text";
  const firstLineProcessed = lines[0].replace(/\t/g, "<br>");
  instructionDiv.innerHTML = processColorEmbedding(firstLineProcessed);
  container.appendChild(instructionDiv);

  const remainingLines = lines.slice(1);
  if (remainingLines.length === 0) return;

  const list = document.createElement("div");
  list.className = "dialog-list";
  container.appendChild(list);

  // Сбрасываем паддинг снизу у dialog-content
  const dialogContent = container.closest(".dialog-content");
  if (dialogContent) {
    dialogContent.style.paddingBottom = "0";
  }

  // построитель HTML для ячеек
  const makeItemHTML = (line) =>
    line
      .split("\t")
      .map((cellText) => `<span class="cell">${processColorEmbedding(cellText)}</span>`)
      .join("");

  // создаём элементы списка
  const items = remainingLines.map((line, i) => {
    const item = document.createElement("div");
    item.className = "dialog-list-item";
    item.dataset.index = i;
    item.innerHTML = makeItemHTML(line);
    item.dataset.originalHTML = item.innerHTML; // для восстановления
    item.addEventListener("click", () => select(i));
    list.appendChild(item);
    return item;
  });

  function select(index) {
	items.forEach((itm, i) => {
		if (itm.innerHTML !== itm.dataset.originalHTML) {
		itm.innerHTML = itm.dataset.originalHTML;
		}
		itm.classList.toggle("selected", i === index);
		if (i === index) {
		itm.querySelectorAll("span").forEach((s) => (s.style.color = "#000"));
		
		// Автоскролл: если элемент выходит за пределы видимой области
		const listRect = list.getBoundingClientRect();
		const itemRect = itm.getBoundingClientRect();
		
		if (itemRect.top < listRect.top) {
			// прокручиваем вверх
			list.scrollTop -= (listRect.top - itemRect.top);
		} else if (itemRect.bottom > listRect.bottom) {
			// прокручиваем вниз
			list.scrollTop += (itemRect.bottom - listRect.bottom);
		}
		}
	});

	selectedListItem = index;
	inputText = items[index].textContent;
	}


  // выбрать первый по умолчанию
  select(0);

  // перехватываем стрелки у диалога, чтобы глобальный handler не мешал
  const dialogEl = container.closest(".dialog") || document;
  const keyHandler = (e) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      const max = items.length - 1;
      let idx = typeof selectedListItem === "number" ? selectedListItem : 0;

      switch (e.key) {
        case "ArrowDown":
          idx = Math.min(max, idx + 1);
          break;
        case "ArrowUp":
          idx = Math.max(0, idx - 1);
          break;
        case "Home":
          idx = 0;
          break;
        case "End":
          idx = max;
          break;
      }
      select(idx);
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (typeof closeDialog === "function") closeDialog(1);
    }
  };
  dialogEl.addEventListener("keydown", keyHandler, { capture: true });
}


// Process color embedding in text
function processColorEmbedding(text) {
	let processedText = text;

	// Обработка {RRGGBB}
	processedText = processedText.replace(/\{([0-9A-Fa-f]{6})\}/g, (match, color) => {
		return `<span style="color: #${color}; font-family: 'Proxima Nova Bold', 'Gotham-Medium', sans-serif; font-size: inherit; font-weight: inherit;">`;
	});

	// Подсчет открытых спанов
	let openSpans = 0;
	processedText = processedText.replace(/<span style="color: #[0-9A-Fa-f]{6}.*?">/g, (match) => {
		openSpans++;
		return match;
	});

	// Закрытие всех спанов
	for (let i = 0; i < openSpans; i++) {
		processedText += '</span>';
	}

	// Перевод \n и \t
	processedText = processedText.replace(/\\n/g, "<br>");
	processedText = processedText.replace(/\\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

	return processedText;
}


// Close dialog and handle response
function closeDialog(response) {
	if (currentDialog) {
		// Clear timer if exists
		if (timerInterval) {
			clearInterval(timerInterval)
			timerInterval = null
		}

		try {
			document.getElementById("dialog-container").removeChild(currentDialog)
		} catch (e) {
			console.log("Dialog was already removed")
		}
		currentDialog = null

		// In a real SAMP implementation, you would send this data back to the game
		console.log("Dialog Response:", {
            dialogid: dialogID,
			response: response,
			listitem: selectedListItem,
			inputtext: inputText,
		})

        cef.emit("game:CallbackDialogResponse", dialogID, response, selectedListItem, inputText)
        cef.set_focus(false);
	}
}

cef.on("game:showDialog", (dialogid, style, title, text, button1, button2, middleButtonText = "", timerSeconds = 0, picture1Url = "", picture2Url = "", picture3Url = "") => {
    cef.set_focus(true);
    showDialog(dialogid, style, title, text, button1, button2, middleButtonText, timerSeconds, picture1Url, picture2Url, picture3Url)
})
