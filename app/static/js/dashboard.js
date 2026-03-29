let mode = "queens"; // oder "rooks"

function setMode(newMode) {
    mode = newMode;
    resetBoard();

    document.getElementById("btnQueens").classList.remove("active");
    document.getElementById("btnRooks").classList.remove("active");

    if (mode === "queens") {
        document.getElementById("btnQueens").classList.add("active");
    } else {
        document.getElementById("btnRooks").classList.add("active");
    }

    drawBoard();
}

let board = Array(8).fill(-1);
const boardDiv = document.getElementById("board");

function getConflicts() {
    let conflicts = [];

    for (let r1 = 0; r1 < 8; r1++) {
        if (board[r1] === -1) continue;

        for (let r2 = r1 + 1; r2 < 8; r2++) {
            if (board[r2] === -1) continue;

            let c1 = board[r1];
            let c2 = board[r2];

            // 🔴 Türme: nur gleiche Spalte
            if (mode === "rooks") {
                if (c1 === c2) {
                    conflicts.push([r1, c1]);
                    conflicts.push([r2, c2]);
                }
            }

            // 🔴 Damen: Spalte + Diagonale
            else if (mode === "queens") {
                if (
                    c1 === c2 ||
                    Math.abs(c1 - c2) === Math.abs(r1 - r2)
                ) {
                    conflicts.push([r1, c1]);
                    conflicts.push([r2, c2]);
                }
            }
        }
    }

    return conflicts;
}

function checkSolution() {
    const status = document.getElementById("statusMessage");

    const allPlaced = board.every(col => col !== -1);

    if (!allPlaced) {
        status.textContent = "❗ Noch nicht alle Figuren platziert.";
        status.style.color = "orange";
        return;
    }

    const conflicts = getConflicts();

    if (conflicts.length > 0) {
        status.textContent = "❌ Es gibt Konflikte!";
        status.style.color = "red";
        return;
    }

    status.textContent = "🎉 Perfekt gelöst!";
    status.style.color = "green";
}

function drawBoard() {
    boardDiv.innerHTML = "";
    boardDiv.className = "board-grid";

    const conflicts = getConflicts();
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (let row = -1; row < 8; row++) {
        for (let col = -1; col < 8; col++) {

            const cell = document.createElement("div");

            // 🔹 Ecke oben links
            if (row === -1 && col === -1) {
                cell.classList.add("label");
            }

            // 🔹 Buchstaben (oben)
            else if (row === -1) {
                cell.textContent = letters[col];
                cell.classList.add("label");
            }

            // 🔹 Zahlen (links)
            else if (col === -1) {
                cell.textContent = 8 - row;
                cell.classList.add("label");
            }

            // 🔹 echtes Spielfeld
            else {
                cell.classList.add("cell");

                if ((row + col) % 2 === 0) {
                    cell.classList.add("white");
                } else {
                    cell.classList.add("black");
                }

                if (board[row] === col) {
                    cell.textContent = (mode === "queens") ? "♛" : "♜";

                    if (conflicts.some(([r, c]) => r === row && c === col)) {
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
    if (board[row] === col) {
        board[row] = -1;
    } else {
        board[row] = col;
    }
    drawBoard();
    updateQueenList();
}

async function solve() {

    if (mode === "rooks") {
        const res = await fetch("/solve_rooks");
        const solution = await res.json();

        board = solution;
        drawBoard();
        return;
    }

    // Damen (wie vorher)
    const res = await fetch("/solve");
    const solution = await res.json();

    board = Array.isArray(solution[0]) ? solution[0] : solution;
    drawBoard();
}


function resetBoard() {
    const status = document.getElementById("statusMessage");
    board = Array(8).fill(-1);
    drawBoard();
    updateQueenList();
    status.textContent = "";
}

drawBoard();

function updateQueenList() {
    const list = document.getElementById("queenList");
    list.innerHTML = "";

    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    let count = 1;

    for (let row = 0; row < 8; row++) {
        if (board[row] !== -1) {
            let col = board[row];

            let pos = letters[col] + (8 - row);

            const li = document.createElement("li");
            li.textContent = `${mode === "queens" ? "Dame" : "Turm"} ${count}: ${pos}`;

            list.appendChild(li);
            count++;
        }
    }
}