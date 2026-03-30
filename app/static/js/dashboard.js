const DEFAULT_BOARD_SIZE = 8;
const MIN_BOARD_SIZE = 4;
const MAX_BOARD_SIZE = 13;
const EMPTY_CELL = -1;

let mode = "queens";
let boardSize = DEFAULT_BOARD_SIZE;
let pendingBoardSize = DEFAULT_BOARD_SIZE;
let board = createEmptyBoard(boardSize);

const boardDiv = document.getElementById("board");
const statusMessage = document.getElementById("statusMessage");
const queenList = document.getElementById("queenList");
const btnQueens = document.getElementById("btnQueens");
const btnRooks = document.getElementById("btnRooks");
const settingsSidebar = document.getElementById("settingsSidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const saveSidebar = document.getElementById("saveSidebar");
const saveBackdrop = document.getElementById("saveBackdrop");
const savePointsSidebar = document.getElementById("savePointsSidebar");
const savePointsBackdrop = document.getElementById("savePointsBackdrop");
const boardSizeInput = document.getElementById("boardSizeInput");
const boardSizeValue = document.getElementById("boardSizeValue");
const boardSizeValueMirror = document.getElementById("boardSizeValueMirror");
const sidebarBoardSizeValue = document.getElementById("sidebarBoardSizeValue");
const sidebarBoardSizeValueMirror = document.getElementById("sidebarBoardSizeValueMirror");
const savePointsList = document.getElementById("savePointsList");
const saveNameInput = document.getElementById("saveNameInput");
const saveNoteInput = document.getElementById("saveNoteInput");
const saveFavoriteInput = document.getElementById("saveFavoriteInput");
const savePointModeFilter = document.getElementById("savePointModeFilter");
const savePointSizeFilter = document.getElementById("savePointSizeFilter");
const savePointSortFilter = document.getElementById("savePointSortFilter");
const savePointFavoritesOnly = document.getElementById("savePointFavoritesOnly");

function createEmptyBoard(size) {
    return Array(size).fill(EMPTY_CELL);
}

function clampBoardSize(size) {
    return Math.min(MAX_BOARD_SIZE, Math.max(MIN_BOARD_SIZE, Number(size)));
}

function getColumnLabel(index) {
    return String.fromCharCode(65 + index);
}

function updateModeButtons() {
    btnQueens.classList.toggle("active", mode === "queens");
    btnRooks.classList.toggle("active", mode === "rooks");
}

function updateBoardSizeDisplays(size) {
    boardSizeValue.textContent = size;
    boardSizeValueMirror.textContent = size;
    sidebarBoardSizeValue.textContent = size;
    sidebarBoardSizeValueMirror.textContent = size;
    boardSizeInput.value = size;
}

function setStatus(message = "", color = "") {
    statusMessage.textContent = message;
    statusMessage.style.color = color;
}

function updateBoardLayout() {
    const cellSize = Math.max(32, Math.min(60, Math.floor(480 / boardSize)));

    boardDiv.style.setProperty("--board-size", boardSize);
    boardDiv.style.setProperty("--cell-size", `${cellSize}px`);
}

function setMode(newMode) {
    mode = newMode;
    resetBoard();
    updateModeButtons();
}

function closeAllPanels() {
    toggleSidebar(false);
    toggleSavePanel(false);
    toggleSavePointsPanel(false);
}

function getConflicts() {
    const conflicts = [];

    for (let rowA = 0; rowA < boardSize; rowA++) {
        if (board[rowA] === EMPTY_CELL) {
            continue;
        }

        for (let rowB = rowA + 1; rowB < boardSize; rowB++) {
            if (board[rowB] === EMPTY_CELL) {
                continue;
            }

            const colA = board[rowA];
            const colB = board[rowB];
            const sameColumn = colA === colB;
            const sameDiagonal = Math.abs(colA - colB) === Math.abs(rowA - rowB);

            // Rooks only attack vertically, queens also attack diagonally.
            const hasConflict = mode === "rooks" ? sameColumn : sameColumn || sameDiagonal;

            if (hasConflict) {
                conflicts.push([rowA, colA], [rowB, colB]);
            }
        }
    }

    return conflicts;
}

function checkSolution() {
    const allPlaced = board.every((col) => col !== EMPTY_CELL);

    if (!allPlaced) {
        setStatus("❗ Noch nicht alle Figuren platziert.", "orange");
        return;
    }

    if (getConflicts().length > 0) {
        setStatus("❌ Es gibt Konflikte!", "red");
        return;
    }

    setStatus("🎉 Perfekt geloest!", "green");
}

function drawBoard() {
    boardDiv.innerHTML = "";
    boardDiv.className = "board-grid";
    updateBoardLayout();

    const conflicts = getConflicts();

    for (let row = -1; row < boardSize; row++) {
        for (let col = -1; col < boardSize; col++) {
            const cell = document.createElement("div");

            if (row === -1 && col === -1) {
                cell.classList.add("label");
            } else if (row === -1) {
                cell.textContent = getColumnLabel(col);
                cell.classList.add("label");
            } else if (col === -1) {
                cell.textContent = boardSize - row;
                cell.classList.add("label");
            } else {
                cell.classList.add("cell", (row + col) % 2 === 0 ? "white" : "black");

                if (board[row] === col) {
                    cell.textContent = mode === "queens" ? "♛" : "♜";

                    // Highlight pieces that are part of at least one conflict pair.
                    if (conflicts.some(([conflictRow, conflictCol]) => conflictRow === row && conflictCol === col)) {
                        cell.classList.add("invalid");
                    }
                }

                cell.onclick = () => placeQueen(row, col);
            }

            boardDiv.appendChild(cell);
        }
    }

    updateQueenList();
}

function placeQueen(row, col) {
    board[row] = board[row] === col ? EMPTY_CELL : col;
    drawBoard();
}

function previewBoardSize(size) {
    pendingBoardSize = clampBoardSize(size);
    sidebarBoardSizeValue.textContent = pendingBoardSize;
    sidebarBoardSizeValueMirror.textContent = pendingBoardSize;
}

function applyBoardSize() {
    boardSize = pendingBoardSize;
    board = createEmptyBoard(boardSize);
    updateBoardSizeDisplays(boardSize);
    setStatus(`Brettgroesse auf ${boardSize} x ${boardSize} gesetzt.`, "#2563eb");
    drawBoard();
    toggleSidebar(false);
}

function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !settingsSidebar.classList.contains("open");

    if (shouldOpen) {
        toggleSavePanel(false);
        toggleSavePointsPanel(false);
    }

    settingsSidebar.classList.toggle("open", shouldOpen);
    sidebarBackdrop.classList.toggle("visible", shouldOpen);
    settingsSidebar.setAttribute("aria-hidden", String(!shouldOpen));
}

function toggleSavePanel(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !saveSidebar.classList.contains("open");

    if (shouldOpen) {
        toggleSidebar(false);
        toggleSavePointsPanel(false);
    }

    saveSidebar.classList.toggle("open", shouldOpen);
    saveBackdrop.classList.toggle("visible", shouldOpen);
    saveSidebar.setAttribute("aria-hidden", String(!shouldOpen));
}

function toggleSavePointsPanel(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !savePointsSidebar.classList.contains("open");

    if (shouldOpen) {
        toggleSidebar(false);
        toggleSavePanel(false);
    }

    savePointsSidebar.classList.toggle("open", shouldOpen);
    savePointsBackdrop.classList.toggle("visible", shouldOpen);
    savePointsSidebar.setAttribute("aria-hidden", String(!shouldOpen));
}

function getPieceLabel(selectedMode) {
    return selectedMode === "queens" ? "Dame" : "Turm";
}

function getPlacedPieceCount() {
    return board.filter((col) => col !== EMPTY_CELL).length;
}

function resetSaveForm() {
    saveNameInput.value = `${getPieceLabel(mode)} ${boardSize}x${boardSize} - ${getPlacedPieceCount()} gesetzt`;
    saveNoteInput.value = "";
    saveFavoriteInput.checked = false;
}

function openSavePanel() {
    resetSaveForm();
    toggleSavePanel(true);
}

function getBoardPreview(savedBoard, limit = 4) {
    const preview = [];

    for (let row = 0; row < savedBoard.length; row++) {
        if (savedBoard[row] === EMPTY_CELL) {
            continue;
        }

        preview.push(`${getColumnLabel(savedBoard[row])}${savedBoard.length - row}`);

        if (preview.length === limit) {
            break;
        }
    }

    return preview.length > 0 ? preview.join(", ") : "Noch keine Figuren gesetzt";
}

function getSavePointFilters() {
    const params = new URLSearchParams();

    if (savePointModeFilter.value !== "all") {
        params.set("mode", savePointModeFilter.value);
    }

    if (savePointSizeFilter.value !== "all") {
        params.set("board_size", savePointSizeFilter.value);
    }

    params.set("sort", savePointSortFilter.value);

    if (savePointFavoritesOnly.checked) {
        params.set("favorites_only", "true");
    }

    return params.toString();
}

function createSavePointActionButton(label, className, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = label;
    button.onclick = onClick;
    return button;
}

function renderSavePoints(savePoints) {
    savePointsList.innerHTML = "";

    if (savePoints.length === 0) {
        savePointsList.innerHTML = '<p class="sidebar-hint">Keine Speicherstaende fuer diese Filter gefunden.</p>';
        return;
    }

    for (const savePoint of savePoints) {
        const item = document.createElement("article");
        const title = document.createElement("h4");
        const createdAt = document.createElement("p");
        const updatedAt = document.createElement("p");
        const boardMeta = document.createElement("p");
        const preview = document.createElement("p");
        const note = document.createElement("p");
        const actions = document.createElement("div");

        item.className = "save-point-card";
        title.textContent = `${savePoint.is_favorite ? "★ " : ""}${savePoint.save_name}`;
        createdAt.className = "save-point-meta";
        createdAt.textContent = `Erstellt: ${savePoint.created_at}`;
        updatedAt.className = "save-point-meta";
        updatedAt.textContent = `Aktualisiert: ${savePoint.updated_at}`;
        boardMeta.className = "save-point-meta";
        boardMeta.textContent = `${getPieceLabel(savePoint.mode)} | ${savePoint.board_size} x ${savePoint.board_size} | ${savePoint.pieces_placed}/${savePoint.board_size} gesetzt`;
        preview.className = "save-point-preview";
        preview.textContent = `Vorschau: ${getBoardPreview(savePoint.board)}`;
        note.className = "save-point-note";
        note.textContent = savePoint.save_note ? `Notiz: ${savePoint.save_note}` : "Notiz: Keine Notiz";
        actions.className = "save-point-actions";

        actions.appendChild(createSavePointActionButton("Laden", "btn", () => loadSavePoint(savePoint.id)));
        actions.appendChild(createSavePointActionButton(
            savePoint.is_favorite ? "Favorit entfernen" : "Als Favorit",
            "btn secondary",
            () => toggleSavePointFavorite(savePoint.id)
        ));
        actions.appendChild(createSavePointActionButton("Loeschen", "btn ghost", () => deleteSavePoint(savePoint.id)));

        item.appendChild(title);
        item.appendChild(createdAt);
        item.appendChild(updatedAt);
        item.appendChild(boardMeta);
        item.appendChild(preview);
        item.appendChild(note);
        item.appendChild(actions);
        savePointsList.appendChild(item);
    }
}

async function refreshSavePoints() {
    const queryString = getSavePointFilters();
    const response = await fetch(`/save_points${queryString ? `?${queryString}` : ""}`);
    const savePoints = await response.json();
    renderSavePoints(savePoints);
}

async function openSavePointsPanel() {
    await refreshSavePoints();
    toggleSavePointsPanel(true);
}

function applyLoadedGame(data) {
    board = data.board;
    boardSize = Array.isArray(data.board) ? clampBoardSize(data.board.length) : DEFAULT_BOARD_SIZE;
    pendingBoardSize = boardSize;
    mode = data.mode;

    updateModeButtons();
    updateBoardSizeDisplays(boardSize);
    drawBoard();
}

async function solve() {
    const endpoint = mode === "rooks" ? "/solve_rooks" : "/solve";
    const response = await fetch(`${endpoint}?size=${boardSize}`);
    const solution = await response.json();

    // The queens endpoint may return multiple solutions; we display the first one.
    board = mode === "queens" && Array.isArray(solution[0]) ? solution[0] : solution;
    setStatus(`Loesung fuer ${boardSize} x ${boardSize} geladen.`, "green");
    drawBoard();
}

function resetBoard() {
    board = createEmptyBoard(boardSize);
    setStatus();
    drawBoard();
}

function updateQueenList() {
    queenList.innerHTML = "";

    let count = 1;

    for (let row = 0; row < boardSize; row++) {
        if (board[row] === EMPTY_CELL) {
            continue;
        }

        const col = board[row];
        const position = `${getColumnLabel(col)}${boardSize - row}`;
        const li = document.createElement("li");

        li.textContent = `${mode === "queens" ? "Dame" : "Turm"} ${count}: ${position}`;
        queenList.appendChild(li);
        count++;
    }
}

async function saveGame() {
    const response = await fetch("/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            board,
            mode,
            boardSize,
            saveName: saveNameInput.value,
            saveNote: saveNoteInput.value,
            isFavorite: saveFavoriteInput.checked
        })
    });

    if (!response.ok) {
        setStatus("❌ Der Speicherstand konnte nicht gespeichert werden.", "red");
        return;
    }

    const data = await response.json();

    toggleSavePanel(false);
    await refreshSavePoints();
    setStatus(`Speicherpunkt "${data.save_point.save_name}" gespeichert.`, "green");
}

async function loadGame() {
    const response = await fetch("/load");
    const data = await response.json();
    applyLoadedGame(data);
}

async function loadSavePoint(savePointId) {
    const response = await fetch(`/load/${savePointId}`);

    if (!response.ok) {
        setStatus("❌ Dieser Speicherstand konnte nicht geladen werden.", "red");
        return;
    }

    const data = await response.json();

    applyLoadedGame(data);
    setStatus(`Speicherpunkt "${data.save_name}" geladen.`, "green");
    toggleSavePointsPanel(false);
}

async function toggleSavePointFavorite(savePointId) {
    const response = await fetch(`/save_points/${savePointId}/favorite`, {
        method: "POST"
    });

    if (!response.ok) {
        setStatus("❌ Favorit konnte nicht aktualisiert werden.", "red");
        return;
    }

    await refreshSavePoints();
    setStatus("Favoritenstatus aktualisiert.", "#2563eb");
}

async function deleteSavePoint(savePointId) {
    const confirmed = window.confirm("Diesen Speicherpunkt wirklich loeschen?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(`/save_points/${savePointId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        setStatus("❌ Speicherpunkt konnte nicht geloescht werden.", "red");
        return;
    }

    await refreshSavePoints();
    setStatus("Speicherpunkt geloescht.", "#2563eb");
}

pendingBoardSize = boardSize;
updateModeButtons();
updateBoardSizeDisplays(boardSize);
drawBoard();
