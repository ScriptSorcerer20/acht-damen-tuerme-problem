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
const savePointsSidebar = document.getElementById("savePointsSidebar");
const savePointsBackdrop = document.getElementById("savePointsBackdrop");
const boardSizeInput = document.getElementById("boardSizeInput");
const boardSizeValue = document.getElementById("boardSizeValue");
const boardSizeValueMirror = document.getElementById("boardSizeValueMirror");
const sidebarBoardSizeValue = document.getElementById("sidebarBoardSizeValue");
const sidebarBoardSizeValueMirror = document.getElementById("sidebarBoardSizeValueMirror");
const savePointsList = document.getElementById("savePointsList");

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
        toggleSavePointsPanel(false);
    }

    settingsSidebar.classList.toggle("open", shouldOpen);
    sidebarBackdrop.classList.toggle("visible", shouldOpen);
    settingsSidebar.setAttribute("aria-hidden", String(!shouldOpen));
}

function toggleSavePointsPanel(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !savePointsSidebar.classList.contains("open");

    savePointsSidebar.classList.toggle("open", shouldOpen);
    savePointsBackdrop.classList.toggle("visible", shouldOpen);
    savePointsSidebar.setAttribute("aria-hidden", String(!shouldOpen));
}

function getPieceLabel(selectedMode) {
    return selectedMode === "queens" ? "Dame" : "Turm";
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

function renderSavePoints(savePoints) {
    savePointsList.innerHTML = "";

    if (savePoints.length === 0) {
        savePointsList.innerHTML = '<p class="sidebar-hint">Noch keine Speicherstaende gefunden.</p>';
        return;
    }

    for (const savePoint of savePoints) {
        const item = document.createElement("article");
        const title = document.createElement("h4");
        const createdAt = document.createElement("p");
        const boardMeta = document.createElement("p");
        const preview = document.createElement("p");
        const loadButton = document.createElement("button");

        item.className = "save-point-card";
        title.textContent = `Save Point #${savePoint.id}`;
        createdAt.className = "save-point-meta";
        createdAt.textContent = `Gespeichert: ${savePoint.created_at}`;
        boardMeta.className = "save-point-meta";
        boardMeta.textContent = `${getPieceLabel(savePoint.mode)} | ${savePoint.board_size} x ${savePoint.board_size} | ${savePoint.pieces_placed}/${savePoint.board_size} gesetzt`;
        preview.className = "save-point-preview";
        preview.textContent = `Vorschau: ${getBoardPreview(savePoint.board)}`;

        loadButton.className = "btn";
        loadButton.type = "button";
        loadButton.textContent = "Diesen laden";
        loadButton.onclick = () => loadSavePoint(savePoint.id);

        item.appendChild(title);
        item.appendChild(createdAt);
        item.appendChild(boardMeta);
        item.appendChild(preview);
        item.appendChild(loadButton);
        savePointsList.appendChild(item);
    }
}

async function refreshSavePoints() {
    const response = await fetch("/save_points");
    const savePoints = await response.json();
    renderSavePoints(savePoints);
}

async function openSavePointsPanel() {
    await refreshSavePoints();
    toggleSidebar(false);
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
    await fetch("/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            board,
            mode,
            boardSize
        })
    });

    await refreshSavePoints();
    alert("💾 Spiel gespeichert!");
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
    setStatus(`Speicherstand #${savePointId} geladen.`, "green");
    toggleSavePointsPanel(false);
}

pendingBoardSize = boardSize;
updateModeButtons();
updateBoardSizeDisplays(boardSize);
drawBoard();
