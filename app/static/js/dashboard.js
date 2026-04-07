const DEFAULT_BOARD_SIZE = 8;
const MIN_BOARD_SIZE = 4;
const MAX_BOARD_SIZE = 13;
const EMPTY_CELL = -1;
const GAME_STORAGE_KEY = "eight-queens-dashboard-session-v1";

let mode = "queens";
let boardSize = DEFAULT_BOARD_SIZE;
let pendingBoardSize = DEFAULT_BOARD_SIZE;
let board = createEmptyBoard(boardSize);
let stepCount = 0;
let elapsedBeforeTimerStartMs = 0;
let timerStartedAtMs = Date.now();
let gameTimerId = null;
let isSolved = false;

let solverSteps = [];
let solverStepIndex = -1;
let solverTimerId = null;
let solverSpeedMs = 320;
let solverLoading = false;
let solverRequestId = 0;
let currentSolverHighlight = null;

const boardDiv = document.getElementById("board");
const statusMessage = document.getElementById("statusMessage");
const queenList = document.getElementById("queenList");
const pieceCountBadge = document.getElementById("pieceCountBadge");
const langSwitch = document.getElementById("langSwitch");
const gameModeEyebrow = document.getElementById("gameModeEyebrow");
const gameTitle = document.getElementById("gameTitle");
const boardModeText = document.getElementById("boardModeText");
const boardSizeInfoPrefix = document.getElementById("boardSizeInfoPrefix");
const pieceListTitle = document.getElementById("pieceListTitle");
const infoModalTitle = document.getElementById("infoModalTitle");
const infoModeRuleText = document.getElementById("infoModeRuleText");
const infoModalProblemHeading = document.getElementById("infoModalProblemHeading");
const infoModalProblemText = document.getElementById("infoModalProblemText");
const stepCounterValue = document.getElementById("stepCounterValue");
const timerValue = document.getElementById("timerValue");
const gameProgressState = document.getElementById("gameProgressState");
const solvedCelebration = document.getElementById("solvedCelebration");
const solvedCelebrationTitle = document.getElementById("solvedCelebrationTitle");
const solvedCelebrationText = document.getElementById("solvedCelebrationText");
const btnQueens = document.getElementById("btnQueens");
const btnRooks = document.getElementById("btnRooks");
const btnPrepareSolve = document.getElementById("btnPrepareSolve");
const btnInstantSolve = document.getElementById("btnInstantSolve");
const btnNextStep = document.getElementById("btnNextStep");
const btnPlayPause = document.getElementById("btnPlayPause");
const solverMessage = document.getElementById("solverMessage");
const solverStepInfo = document.getElementById("solverStepInfo");
const solverSpeedInput = document.getElementById("solverSpeedInput");
const solverSpeedValue = document.getElementById("solverSpeedValue");
const settingsSidebar = document.getElementById("settingsSidebar");
const settingsTrigger = document.getElementById("settingsTrigger");
const settingsTriggerArrow = document.getElementById("settingsTriggerArrow");
const settingsTriggerLabel = document.getElementById("settingsTriggerLabel");
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
const timeHistoryTableBody = document.getElementById("timeHistoryTableBody");
const infoModal = document.getElementById("infoModal");
const infoModalBackdrop = document.getElementById("infoModalBackdrop");

const SUPPORTED_LANGUAGES = ["de", "en"];
let currentLanguage = "de";

const MODE_COPY = {
    de: {
        queens: {
            singular: "Dame",
            plural: "Damen",
            eyebrow: "Damen-Modus",
            gameTitle: "Damen-Spielbrett",
            boardText: "Platziere Damen so, dass keine zwei dieselbe Spalte oder Diagonale teilen.",
            infoTitle: "Spielregeln und Acht-Damen-Problem",
            infoRuleText: "Im Damen-Modus dürfen sich Damen weder in derselben Spalte noch diagonal angreifen. Mit einem Klick setzt oder entfernst du eine Figur.",
            infoProblemHeading: "Was ist das Acht-Damen-Problem?",
            infoProblemText: "Das klassische Acht-Damen-Problem fragt nach einer Anordnung von acht Damen auf einem 8x8-Brett, bei der sich keine zwei Damen schlagen. Es ist ein bekanntes Beispiel für kombinatorische Suche und Backtracking."
        },
        rooks: {
            singular: "Turm",
            plural: "Türme",
            eyebrow: "Türme-Modus",
            gameTitle: "Türme-Spielbrett",
            boardText: "Platziere Türme so, dass keine zwei dieselbe Spalte teilen.",
            infoTitle: "Spielregeln und Acht-Türme-Problem",
            infoRuleText: "Im Türme-Modus dürfen sich Türme nicht in derselben Spalte stehen. Diagonalen spielen hier keine Rolle. Mit einem Klick setzt oder entfernst du eine Figur.",
            infoProblemHeading: "Was ist das Acht-Türme-Problem?",
            infoProblemText: "Beim Acht-Türme-Problem suchst du eine Anordnung von acht Türmen auf einem 8x8-Brett, bei der sich keine zwei Türme angreifen. Es ist eine einfachere Variante, um systematische Suche und Konfliktprüfung sichtbar zu machen."
        }
    },
    en: {
        queens: {
            singular: "Queen",
            plural: "Queens",
            eyebrow: "Queens Mode",
            gameTitle: "Queens Board",
            boardText: "Place queens so that no two share the same column or diagonal.",
            infoTitle: "Rules and the Eight Queens Puzzle",
            infoRuleText: "In queens mode, queens may not attack each other in the same column or on diagonals. Click once to place or remove a piece.",
            infoProblemHeading: "What is the Eight Queens puzzle?",
            infoProblemText: "The classic Eight Queens puzzle asks for eight queens on an 8x8 board so that no two queens attack each other. It is a well-known example of combinatorial search and backtracking."
        },
        rooks: {
            singular: "Rook",
            plural: "Rooks",
            eyebrow: "Rooks Mode",
            gameTitle: "Rooks Board",
            boardText: "Place rooks so that no two share the same column.",
            infoTitle: "Rules and the Eight Rooks Puzzle",
            infoRuleText: "In rooks mode, rooks may not stand in the same column. Diagonals do not matter here. Click once to place or remove a piece.",
            infoProblemHeading: "What is the Eight Rooks puzzle?",
            infoProblemText: "In the Eight Rooks puzzle, you arrange eight rooks on an 8x8 board so that no two rooks attack each other. It is a simpler variant that helps visualize systematic search and conflict checking."
        }
    }
};

const translations = {
    de: {
        pageTitle: "Dashboard",
        navBrand: "8-Damen- und 8-Türme Solver",
        navDashboard: "Dashboard",
        navLogout: "Logout",
        accountLabel: "Account",
        accountShortcutAria: "Konto und Login-Einstellungen öffnen",
        introKicker: "Puzzle-Modus",
        introTitle: "Wähl deinen Modus und löse das Brett auf deine Art.",
        introText: "Wechsle zwischen Damen und Türmen, nutze Animation oder Sofort-Lösung und öffne die Brett-Einstellungen jederzeit ueber den linken Seiten-Tab.",
        modeSwitchAria: "Spielmodus",
        btnQueens: "Damen",
        btnRooks: "Türme",
        infoButton: "Regeln & Hilfe",
        gameStatsAria: "Spielstatus",
        stepsLabel: "Schritte",
        timeLabel: "Zeit",
        statusLabel: "Status",
        progressRunning: "Läuft",
        progressSolved: "Gelöst",
        boardSizePrefix: ({ modeLabel }) => `Aktuelle Brettgrösse im ${modeLabel}-Modus:`,
        solverKicker: "Solver",
        solverTitle: "Lösungswerkzeuge",
        animationSolverTitle: "Animations-Solver",
        animationSolverText: "Bereite den Lösungsweg vor, gehe ihn manuell Schritt für Schritt durch oder spiele die Animation automatisch ab.",
        instantSolverTitle: "Sofort-Lösung",
        instantSolverText: "Lade direkt eine gültige Lösung, ohne Zwischenschritte oder Animation.",
        defaultSolverMessage: "Bereite einen Ablauf vor und spiele ihn Schritt für Schritt ab.",
        solverReady: ({ modeLabel }) => `Solver für ${modeLabel} bereit. ${t("defaultSolverMessage")}`,
        solverSpeedLabel: "Animationsgeschwindigkeit",
        btnPrepareSolve: "Animation vorbereiten",
        btnPrepareSolveLoading: "Animation wird vorbereitet...",
        btnNextStep: "Nächster Schritt",
        btnPlayPause: "Animation abspielen",
        btnPlayReplay: "Animation erneut abspielen",
        btnPlayPauseRunning: "Animation pausieren",
        btnInstantSolve: "Sofort lösen",
        btnReset: "Brett zurücksetzen",
        settingsTrigger: "Brett-Einstellungen",
        settingsSidebarTitle: "Brett-Einstellungen",
        settingsSidebarClose: "Schliessen",
        settingsSidebarText: "Passe die Brettgroesse zwischen 4 und 13 an.",
        boardSizeInputLabel: "Grösse",
        applyBoardSizeButton: "Grösse anwenden",
        settingsSidebarHint: "Beim ändern wird das Brett zur Sicherheit zurückgesetzt. Auf dem Handy ist 8x8 eingeplant, grössere Bretter können abgeschnitten wirken.",
        btnSave: "Speichern",
        btnLoad: "Save-Points",
        saveSidebarTitle: "Speicherpunkt",
        saveSidebarClose: "Schliessen",
        saveSidebarText: "Gib dem Spielstand einen klaren Namen und optional eine kurze Notiz.",
        saveNameLabel: "Name",
        saveNamePlaceholder: "z. B. Fast gelöste Dame 8x8",
        saveNoteLabel: "Notiz",
        saveNotePlaceholder: "z. B. Gute Startposition fuer Türmetest",
        saveFavoriteLabel: "Als Favorit markieren",
        saveNowButton: "Jetzt speichern",
        savePointsSidebarTitle: "Save-Points",
        savePointsSidebarClose: "Schliessen",
        savePointsSidebarText: "Wähle einen Speicherstand aus der Liste.",
        savePointModeFilterLabel: "Modus",
        savePointSizeFilterLabel: "Brettgrösse",
        savePointSortFilterLabel: "Sortierung",
        savePointFavoritesOnlyLabel: "Nur Favoriten anzeigen",
        savePointsEmptyState: "Noch keine Speicherstände gefunden.",
        filterAll: "Alle",
        filterNewest: "Neueste zuerst",
        filterOldest: "älteste zuerst",
        filterUpdated: "Zuletzt bearbeitet",
        filterFavorites: "Favoriten zuerst",
        historyKicker: "Save-Points",
        historyTitle: "Gespeicherte Zeiten und Fortschritte",
        historySubtitle: "Die Tabelle zeigt gespeicherte Save-Points mit Zeit, Schritten und Status.",
        btnRefreshHistory: "Aktualisieren",
        historyHeadSave: "Save-Point",
        historyHeadMode: "Modus",
        historyHeadBoard: "Brett",
        historyHeadSteps: "Schritte",
        historyHeadTime: "Zeit",
        historyHeadStatus: "Status",
        historyHeadSaved: "Gespeichert",
        infoModalClose: "Schliessen",
        infoModalIntro: "Setze pro Reihe genau eine Figur auf das Brett. Eine gültige Lösung hat keine Konflikte.",
        infoModalModeHeading: "So funktioniert der aktuelle Modus",
        infoModalTimeHeading: "Was zeigen Zeit und Schritte?",
        infoModalTimeText: "Der Schrittzähler erfasst deine Züge auf dem Brett. Die Zeit läuft für das aktuelle Spiel weiter, auch wenn du die Seite neu lädst. Beim Speichern werden Zeit und Schritte zusammen mit dem Save-Point abgelegt.",
        pieceListTitle: ({ modeLabel }) => `Positionen der ${modeLabel}`,
        historyEmpty: "Noch keine gespeicherten Zeiten vorhanden.",
        placedWord: "gesetzt",
        noSavePointsFiltered: "Keine Speicherstände fuer diese Filter gefunden.",
        previewEmpty: "Noch keine Figuren gesetzt",
        createdLabel: "Erstellt",
        updatedLabel: "Aktualisiert",
        previewLabel: "Vorschau",
        noteLabel: "Notiz",
        noNote: "Keine Notiz",
        stepsMeta: "Schritte",
        timeMeta: "Zeit",
        solvedMeta: "Gelöst",
        openMeta: "Offen",
        loadButton: "Laden",
        favoriteAddButton: "Als Favorit",
        favoriteRemoveButton: "Favorit entfernen",
        deleteButton: "Löschen",
        celebrationTitle: "Richtig geloöst!",
        celebrationText: ({ modeLabel, duration }) => `Stark gemacht. Deine ${modeLabel.toLowerCase()}-Lösung ist konfliktfrei in ${duration}.`,
        settingsApplied: ({ size }) => `Brettgrösse auf ${size} x ${size} gesetzt.`,
        modeActivated: ({ piece }) => `${piece}-Modus aktiviert.`,
        solverDiscardedManual: "Solver-Ablauf verworfen, weil das Brett manuell geändert wurde.",
        solverDiscardedStatus: "Solver-Ablauf verworfen. Bereite ihn bei Bedarf neu vor.",
        solvedPerfect: ({ duration }) => `Perfekt gelöst in ${duration}.`,
        animationReset: "Animations-Ablauf zurückgesetzt. Starte die Animation erneut oder gehe weiter mit Nächster Schritt.",
        animationPreparing: ({ modeLabel, size }) => `Berechne den Animations-Ablauf für ${modeLabel.toLowerCase()} auf ${size} x ${size}...`,
        animationPreparingStatus: ({ size }) => `Animations-Solver berechnet die Schritte fuer ${size} x ${size}.`,
        noSolution: "Keine Lösung gefunden.",
        noSolutionStatus: "Keine Lösung fuer dieses Brett gefunden.",
        animationReady: ({ steps, queensMode }) => queensMode
            ? `Animations-Ablauf bereit mit ${steps} Schritten. Nutze Nächster Schritt oder Animation abspielen, um das Backtracking zu verfolgen.`
            : `Animations-Ablauf bereit mit ${steps} Schritten. Nutze Nächster Schritt oder Animation abspielen.`,
        animationReadyStatus: "Animations-Solver bereit. Nutze Nächster Schritt oder Animation abspielen.",
        animationLoadError: "Der Solver-Ablauf konnte nicht geladen werden.",
        animationFinishedStatus: ({ size }) => `Loesung für ${size} x ${size} Schritt fuer Schritt aufgebaut.`,
        animationAlreadyFinished: "Der Animations-Ablauf ist bereits abgeschlossen.",
        animationPaused: "Animations-Solver pausiert.",
        animationRunning: "Animations-Solver läuft.",
        instantLoading: ({ modeLabel, size }) => `Lade die Sofort-Lösung für ${modeLabel.toLowerCase()} auf ${size} x ${size}...`,
        instantLoadingStatus: "Sofort-Lösung wird geladen.",
        instantLoaded: "Sofort-Lösung geladen. Starte den Animations-Solver, wenn du den Lösungsweg sehen möchtest.",
        instantLoadedStatus: ({ size }) => `Sofort-Loesung für ${size} x ${size} geladen.`,
        instantLoadError: "Die Sofort-Lösung konnte nicht geladen werden.",
        saveError: "Der Speicherstand konnte nicht gespeichert werden.",
        saveSuccess: ({ name }) => `Speicherpunkt "${name}" gespeichert.`,
        loadError: "Dieser Speicherstand konnte nicht geladen werden.",
        loadSuccess: ({ name }) => `Speicherpunkt "${name}" geladen.`,
        favoriteError: "Favorit konnte nicht aktualisiert werden.",
        favoriteSuccess: "Favoritenstatus aktualisiert.",
        deleteConfirm: "Diesen Speicherpunkt wirklich löschen?",
        deleteError: "Speicherpunkt konnte nicht gelöscht werden.",
        deleteSuccess: "Speicherpunkt geloescht.",
        pieceCount: ({ count }) => `${count} gesetzt`,
        pieceEmpty: ({ modeLabel }) => `Noch keine ${modeLabel.toLowerCase()} gesetzt.`,
        saveDefaultName: ({ piece, size, count }) => `${piece} ${size}x${size} - ${count} gesetzt`,
        filterQueens: "Damen",
        filterRooks: "Türme",
        solverStepInfo: ({ currentStep, totalSteps }) => `Schritt ${currentStep} / ${totalSteps}`,
        speedValue: ({ speed }) => `${speed} ms`,
        languageSwitchAria: "Sprache wechseln"
    },
    en: {
        pageTitle: "Dashboard",
        navBrand: "8 Queens and 8 Rooks Solver",
        navDashboard: "Dashboard",
        navLogout: "Logout",
        accountLabel: "Account",
        accountShortcutAria: "Open account and login settings",
        introKicker: "Puzzle Mode",
        introTitle: "Choose your mode and solve the board your way.",
        introText: "Switch between queens and rooks, use animation or instant solve, and open board settings anytime from the left side tab.",
        modeSwitchAria: "Game mode",
        btnQueens: "Queens",
        btnRooks: "Rooks",
        infoButton: "Rules & Help",
        gameStatsAria: "Game status",
        stepsLabel: "Steps",
        timeLabel: "Time",
        statusLabel: "Status",
        progressRunning: "Running",
        progressSolved: "Solved",
        boardSizePrefix: ({ modeLabel }) => `Current board size in ${modeLabel} mode:`,
        solverKicker: "Solver",
        solverTitle: "Solving Tools",
        animationSolverTitle: "Animation Solver",
        animationSolverText: "Prepare the solving path, step through it manually, or play the animation automatically.",
        instantSolverTitle: "Instant Solve",
        instantSolverText: "Load a valid solution directly, without intermediate steps or animation.",
        defaultSolverMessage: "Prepare a solving trace and play it back step by step.",
        solverReady: ({ modeLabel }) => `Solver for ${modeLabel} is ready. ${t("defaultSolverMessage")}`,
        solverSpeedLabel: "Animation speed",
        btnPrepareSolve: "Prepare animation",
        btnPrepareSolveLoading: "Preparing animation...",
        btnNextStep: "Next step",
        btnPlayPause: "Play animation",
        btnPlayReplay: "Replay animation",
        btnPlayPauseRunning: "Pause animation",
        btnInstantSolve: "Solve instantly",
        btnReset: "Reset board",
        settingsTrigger: "Board settings",
        settingsSidebarTitle: "Board Settings",
        settingsSidebarClose: "Close",
        settingsSidebarText: "Adjust the board size between 4 and 13.",
        boardSizeInputLabel: "Size",
        applyBoardSizeButton: "Apply size",
        settingsSidebarHint: "Changing the size resets the board for safety. On phones, 8x8 is the intended maximum for a reliable fit and larger boards may appear cropped.",
        btnSave: "Save",
        btnLoad: "Save points",
        saveSidebarTitle: "Save Point",
        saveSidebarClose: "Close",
        saveSidebarText: "Give the current run a clear name and optionally a short note.",
        saveNameLabel: "Name",
        saveNamePlaceholder: "e.g. Nearly solved queen 8x8",
        saveNoteLabel: "Note",
        saveNotePlaceholder: "e.g. Strong starting position for rook test",
        saveFavoriteLabel: "Mark as favorite",
        saveNowButton: "Save now",
        savePointsSidebarTitle: "Save Points",
        savePointsSidebarClose: "Close",
        savePointsSidebarText: "Choose a saved state from the list.",
        savePointModeFilterLabel: "Mode",
        savePointSizeFilterLabel: "Board size",
        savePointSortFilterLabel: "Sorting",
        savePointFavoritesOnlyLabel: "Show favorites only",
        savePointsEmptyState: "No saved states yet.",
        filterAll: "All",
        filterNewest: "Newest first",
        filterOldest: "Oldest first",
        filterUpdated: "Recently updated",
        filterFavorites: "Favorites first",
        historyKicker: "Save Points",
        historyTitle: "Saved Times and Progress",
        historySubtitle: "The table shows saved runs with time, steps, and status.",
        btnRefreshHistory: "Refresh",
        historyHeadSave: "Save Point",
        historyHeadMode: "Mode",
        historyHeadBoard: "Board",
        historyHeadSteps: "Steps",
        historyHeadTime: "Time",
        historyHeadStatus: "Status",
        historyHeadSaved: "Saved",
        infoModalClose: "Close",
        infoModalIntro: "Place exactly one piece in each row. A valid solution has no conflicts.",
        infoModalModeHeading: "How the current mode works",
        infoModalTimeHeading: "What do time and steps show?",
        infoModalTimeText: "The step counter records your moves on the board. Time keeps running for the current game even if you reload the page. When saving, time and steps are stored together with the save point.",
        pieceListTitle: ({ modeLabel }) => `${modeLabel} positions`,
        historyEmpty: "No saved times yet.",
        placedWord: "placed",
        noSavePointsFiltered: "No saved states found for these filters.",
        previewEmpty: "No pieces placed yet",
        createdLabel: "Created",
        updatedLabel: "Updated",
        previewLabel: "Preview",
        noteLabel: "Note",
        noNote: "No note",
        stepsMeta: "Steps",
        timeMeta: "Time",
        solvedMeta: "Solved",
        openMeta: "Open",
        loadButton: "Load",
        favoriteAddButton: "Favorite",
        favoriteRemoveButton: "Remove favorite",
        deleteButton: "Delete",
        celebrationTitle: "Correctly solved!",
        celebrationText: ({ modeLabel, duration }) => `Well done. Your ${modeLabel.toLowerCase()} solution is conflict-free in ${duration}.`,
        settingsApplied: ({ size }) => `Board size set to ${size} x ${size}.`,
        modeActivated: ({ piece }) => `${piece} mode activated.`,
        solverDiscardedManual: "Solver trace discarded because the board was changed manually.",
        solverDiscardedStatus: "Solver trace discarded. Prepare it again if needed.",
        solvedPerfect: ({ duration }) => `Perfectly solved in ${duration}.`,
        animationReset: "Animation trace reset. Start the animation again or continue with Next step.",
        animationPreparing: ({ modeLabel, size }) => `Preparing the animation trace for ${modeLabel.toLowerCase()} on ${size} x ${size}...`,
        animationPreparingStatus: ({ size }) => `Animation solver is preparing the steps for ${size} x ${size}.`,
        noSolution: "No solution found.",
        noSolutionStatus: "No solution found for this board.",
        animationReady: ({ steps, queensMode }) => queensMode
            ? `Animation trace ready with ${steps} steps. Use Next step or Play animation to follow the backtracking process.`
            : `Animation trace ready with ${steps} steps. Use Next step or Play animation.`,
        animationReadyStatus: "Animation solver ready. Use Next step or Play animation.",
        animationLoadError: "The solver trace could not be loaded.",
        animationFinishedStatus: ({ size }) => `Solution for ${size} x ${size} was built step by step.`,
        animationAlreadyFinished: "The animation trace is already complete.",
        animationPaused: "Animation solver paused.",
        animationRunning: "Animation solver is running.",
        instantLoading: ({ modeLabel, size }) => `Loading the instant solution for ${modeLabel.toLowerCase()} on ${size} x ${size}...`,
        instantLoadingStatus: "Instant solution is loading.",
        instantLoaded: "Instant solution loaded. Start the animation solver if you want to see the solving path.",
        instantLoadedStatus: ({ size }) => `Instant solution for ${size} x ${size} loaded.`,
        instantLoadError: "The instant solution could not be loaded.",
        saveError: "The save point could not be saved.",
        saveSuccess: ({ name }) => `Save point "${name}" saved.`,
        loadError: "This save point could not be loaded.",
        loadSuccess: ({ name }) => `Save point "${name}" loaded.`,
        favoriteError: "Favorite status could not be updated.",
        favoriteSuccess: "Favorite status updated.",
        deleteConfirm: "Really delete this save point?",
        deleteError: "Save point could not be deleted.",
        deleteSuccess: "Save point deleted.",
        pieceCount: ({ count }) => `${count} placed`,
        pieceEmpty: ({ modeLabel }) => `No ${modeLabel.toLowerCase()} placed yet.`,
        saveDefaultName: ({ piece, size, count }) => `${piece} ${size}x${size} - ${count} placed`,
        filterQueens: "Queens",
        filterRooks: "Rooks",
        solverStepInfo: ({ currentStep, totalSteps }) => `Step ${currentStep} / ${totalSteps}`,
        speedValue: ({ speed }) => `${speed} ms`,
        languageSwitchAria: "Switch language"
    }
};

function createEmptyBoard(size) {
    return Array(size).fill(EMPTY_CELL);
}

function clampBoardSize(size) {
    return Math.min(MAX_BOARD_SIZE, Math.max(MIN_BOARD_SIZE, Number(size)));
}

function getColumnLabel(index) {
    return String.fromCharCode(65 + index);
}

function normalizeLanguage(language) {
    const shortLanguage = String(language || "").trim().slice(0, 2).toLowerCase();
    return SUPPORTED_LANGUAGES.includes(shortLanguage) ? shortLanguage : "de";
}

function getStoredLanguage() {
    try {
        return window.localStorage.getItem("preferredLanguage");
    } catch (error) {
        return null;
    }
}

function storeLanguage(language) {
    try {
        window.localStorage.setItem("preferredLanguage", language);
    } catch (error) {
        return;
    }
}

function detectBrowserLanguage() {
    return normalizeLanguage(navigator.language || navigator.userLanguage || "de");
}

function t(key, params = {}) {
    const value = translations[currentLanguage][key];
    return typeof value === "function" ? value(params) : value;
}

function getDefaultSolverMessage() {
    return t("defaultSolverMessage");
}

function applyTextTranslations() {
    document.documentElement.lang = currentLanguage;
    document.body.dataset.language = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        const translatedText = t(key);

        if (translatedText === undefined) {
            return;
        }

        if (element.tagName === "TITLE" || String(translatedText).includes("<br")) {
            element.innerHTML = translatedText;
            return;
        }

        element.textContent = translatedText;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const translatedText = t(element.dataset.i18nPlaceholder);

        if (translatedText === undefined) {
            return;
        }

        element.setAttribute("placeholder", translatedText);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const translatedText = t(element.dataset.i18nAriaLabel);

        if (translatedText === undefined) {
            return;
        }

        element.setAttribute("aria-label", translatedText);
    });
}

function setLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    applyTextTranslations();

    langSwitch.textContent = currentLanguage.toUpperCase();
    langSwitch.setAttribute("aria-label", t("languageSwitchAria"));
    langSwitch.title = currentLanguage === "de" ? "Switch to English" : "Zu Deutsch wechseln";

    updateSettingsTrigger();
    updateModeContent();
    updateQueenList();
    updateProgressDisplay();
    updateSolverSpeed(solverSpeedMs);
    updateSolverControls();

    if (!solverLoading && !hasPreparedSolverTrace()) {
        setSolverMessage(t("solverReady", { modeLabel: getModeLabel(mode) }));
    }

    storeLanguage(currentLanguage);
}

function getModeCopy(selectedMode = mode, language = currentLanguage) {
    return MODE_COPY[language][selectedMode === "rooks" ? "rooks" : "queens"];
}

function sanitizeBoard(candidateBoard, size) {
    if (!Array.isArray(candidateBoard) || candidateBoard.length !== size) {
        return createEmptyBoard(size);
    }

    return candidateBoard.map((value) => {
        const numericValue = Number(value);

        if (!Number.isInteger(numericValue)) {
            return EMPTY_CELL;
        }

        return numericValue >= 0 && numericValue < size ? numericValue : EMPTY_CELL;
    });
}

function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
}

function getElapsedMilliseconds() {
    if (isSolved) {
        return elapsedBeforeTimerStartMs;
    }

    return elapsedBeforeTimerStartMs + Math.max(0, Date.now() - timerStartedAtMs);
}

function persistCurrentSession() {
    try {
        window.localStorage.setItem(
            GAME_STORAGE_KEY,
            JSON.stringify({
                mode,
                boardSize,
                board,
                stepCount,
                elapsedMs: getElapsedMilliseconds(),
                isSolved
            })
        );
    } catch (error) {
        // Ignore unavailable storage so the game keeps working normally.
    }
}

function updateProgressDisplay() {
    stepCounterValue.textContent = String(stepCount);
    timerValue.textContent = formatDuration(Math.floor(getElapsedMilliseconds() / 1000));
    gameProgressState.textContent = isSolved ? t("progressSolved") : t("progressRunning");
    gameProgressState.style.color = isSolved ? "#15803d" : "#1d4ed8";
    updateSolvedCelebration();
}

function stopGameTimer() {
    if (gameTimerId !== null) {
        window.clearInterval(gameTimerId);
        gameTimerId = null;
    }
}

function startGameTimer() {
    stopGameTimer();

    if (isSolved) {
        updateProgressDisplay();
        persistCurrentSession();
        return;
    }

    timerStartedAtMs = Date.now();
    gameTimerId = window.setInterval(() => {
        updateProgressDisplay();
        persistCurrentSession();
    }, 1000);

    updateProgressDisplay();
    persistCurrentSession();
}

function resetProgress({ stepCountValue = 0, elapsedMs = 0, solved = false } = {}) {
    stepCount = Math.max(0, Number(stepCountValue) || 0);
    elapsedBeforeTimerStartMs = Math.max(0, Number(elapsedMs) || 0);
    isSolved = Boolean(solved);
    timerStartedAtMs = Date.now();

    if (isSolved) {
        stopGameTimer();
        updateProgressDisplay();
        persistCurrentSession();
        return;
    }

    startGameTimer();
}

function ensureFreshRunAfterSolvedBoard() {
    if (!isSolved) {
        return;
    }

    resetProgress();
}

function updateModeButtons() {
    btnQueens.classList.toggle("active", mode === "queens");
    btnRooks.classList.toggle("active", mode === "rooks");
    btnQueens.classList.toggle("secondary", mode !== "queens");
    btnRooks.classList.toggle("secondary", mode !== "rooks");
}

function updateModeContent() {
    const copy = getModeCopy(mode);

    gameModeEyebrow.textContent = copy.eyebrow;
    gameTitle.textContent = copy.gameTitle;
    boardModeText.textContent = copy.boardText;
    pieceListTitle.textContent = t("pieceListTitle", { modeLabel: copy.plural });
    infoModalTitle.textContent = copy.infoTitle;
    infoModeRuleText.textContent = copy.infoRuleText;
    infoModalProblemHeading.textContent = copy.infoProblemHeading;
    infoModalProblemText.textContent = copy.infoProblemText;
    boardSizeInfoPrefix.textContent = t("boardSizePrefix", { modeLabel: copy.plural });
}

function updateSolvedCelebration() {
    if (!isSolved) {
        solvedCelebration.hidden = true;
        return;
    }

    solvedCelebrationTitle.textContent = t("celebrationTitle");
    solvedCelebrationText.textContent = t("celebrationText", {
        modeLabel: getModeLabel(mode),
        duration: formatDuration(Math.floor(getElapsedMilliseconds() / 1000))
    });
    solvedCelebration.hidden = false;
}

function updateSettingsTrigger(isOpen = settingsSidebar.classList.contains("open")) {
    settingsTrigger.setAttribute("aria-expanded", String(isOpen));
    settingsTriggerArrow.textContent = isOpen ? "←" : "→";
    settingsTriggerLabel.textContent = t("settingsTrigger");
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

function setSolverMessage(message = getDefaultSolverMessage()) {
    solverMessage.textContent = message;
}

function updateSolverSpeed(rawValue) {
    solverSpeedMs = Number(rawValue);
    solverSpeedInput.value = String(solverSpeedMs);
    solverSpeedValue.textContent = t("speedValue", { speed: solverSpeedMs });

    if (isSolverPlaying()) {
        stopSolverPlayback(false);
        scheduleNextSolverPlaybackStep();
    }
}

function updateBoardLayout() {
    let cellSize = Math.max(32, Math.min(60, Math.floor(480 / boardSize)));
    let labelSize = cellSize;

    if (window.innerWidth <= 760) {
        const labelRatio = 0.72;
        const availableWidth = Math.max(250, window.innerWidth - 26);
        cellSize = Math.max(24, Math.floor(availableWidth / (boardSize + labelRatio)));
        labelSize = Math.max(18, Math.floor(cellSize * labelRatio));
    }

    boardDiv.style.setProperty("--board-size", boardSize);
    boardDiv.style.setProperty("--cell-size", `${cellSize}px`);
    boardDiv.style.setProperty("--label-size", `${labelSize}px`);
}

function isSolverPlaying() {
    return solverTimerId !== null;
}

function hasPreparedSolverTrace() {
    return solverSteps.length > 0;
}

function hasCompletedSolverTrace() {
    return hasPreparedSolverTrace() && solverStepIndex >= solverSteps.length - 1;
}

function stopSolverPlayback(refreshControls = true) {
    if (solverTimerId !== null) {
        window.clearTimeout(solverTimerId);
        solverTimerId = null;
    }

    if (refreshControls) {
        updateSolverControls();
    }
}

function updateSolverControls() {
    const currentStep = Math.max(0, solverStepIndex + 1);

    btnPrepareSolve.disabled = solverLoading;
    btnInstantSolve.disabled = solverLoading;
    btnNextStep.disabled = solverLoading || hasCompletedSolverTrace();
    btnPlayPause.disabled = solverLoading;

    btnPrepareSolve.textContent = solverLoading ? t("btnPrepareSolveLoading") : t("btnPrepareSolve");

    if (isSolverPlaying()) {
        btnPlayPause.textContent = t("btnPlayPauseRunning");
    } else if (hasCompletedSolverTrace()) {
        btnPlayPause.textContent = t("btnPlayReplay");
    } else {
        btnPlayPause.textContent = t("btnPlayPause");
    }

    solverStepInfo.textContent = t("solverStepInfo", {
        currentStep,
        totalSteps: solverSteps.length
    });
}

function discardSolverTrace(message = getDefaultSolverMessage()) {
    solverRequestId += 1;
    solverLoading = false;
    stopSolverPlayback(false);

    solverSteps = [];
    solverStepIndex = -1;
    currentSolverHighlight = null;

    setSolverMessage(message);
    updateSolverControls();
}

function rewindSolverTrace() {
    stopSolverPlayback(false);
    solverStepIndex = -1;
    currentSolverHighlight = null;
    board = createEmptyBoard(boardSize);
    setSolverMessage(t("animationReset"));
    drawBoard();
    updateSolverControls();
}

function setMode(newMode) {
    if (mode === newMode) {
        return;
    }

    mode = newMode;
    updateModeButtons();
    updateModeContent();
    resetBoard({
        statusMessageText: t("modeActivated", { piece: getPieceLabel(mode) }),
        statusColor: "#2563eb",
        solverMessageText: t("solverReady", { modeLabel: getModeLabel(mode) })
    });
}

function closeAllPanels() {
    toggleSidebar(false);
    toggleSavePanel(false);
    toggleSavePointsPanel(false);
    toggleInfoModal(false);
}

function getConflicts(selectedBoard = board, selectedMode = mode) {
    const conflicts = [];

    for (let rowA = 0; rowA < boardSize; rowA++) {
        if (selectedBoard[rowA] === EMPTY_CELL) {
            continue;
        }

        for (let rowB = rowA + 1; rowB < boardSize; rowB++) {
            if (selectedBoard[rowB] === EMPTY_CELL) {
                continue;
            }

            const colA = selectedBoard[rowA];
            const colB = selectedBoard[rowB];
            const sameColumn = colA === colB;
            const sameDiagonal = Math.abs(colA - colB) === Math.abs(rowA - rowB);
            const hasConflict = selectedMode === "rooks" ? sameColumn : sameColumn || sameDiagonal;

            if (hasConflict) {
                conflicts.push([rowA, colA], [rowB, colB]);
            }
        }
    }

    return conflicts;
}

function isBoardSolved(selectedBoard = board, selectedMode = mode) {
    const allPlaced = selectedBoard.every((col) => col !== EMPTY_CELL);
    return allPlaced && getConflicts(selectedBoard, selectedMode).length === 0;
}

function finishSolvedRun() {
    if (isSolved) {
        return;
    }

    elapsedBeforeTimerStartMs = getElapsedMilliseconds();
    isSolved = true;
    stopGameTimer();
    updateProgressDisplay();
    persistCurrentSession();
}

function drawBoard() {
    boardDiv.innerHTML = "";
    boardDiv.className = "board-grid";
    updateBoardLayout();

    const conflicts = getConflicts();
    const highlight = currentSolverHighlight;

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

                if (highlight && highlight.row === row && highlight.col === col) {
                    cell.classList.add(
                        highlight.type === "remove"
                            ? "solver-remove"
                            : highlight.type === "solution"
                                ? "solver-solution"
                                : "solver-place"
                    );
                }

                if (board[row] === col) {
                    cell.textContent = mode === "queens" ? "♛" : "♜";

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
    if (solverLoading) {
        return;
    }

    ensureFreshRunAfterSolvedBoard();

    if (hasPreparedSolverTrace() || isSolverPlaying()) {
        discardSolverTrace(t("solverDiscardedManual"));
        setStatus(t("solverDiscardedStatus"), "#d97706");
    } else {
        setStatus();
    }

    currentSolverHighlight = null;
    board[row] = board[row] === col ? EMPTY_CELL : col;
    stepCount += 1;
    drawBoard();
    updateProgressDisplay();

    if (isBoardSolved()) {
        finishSolvedRun();
        setStatus(t("solvedPerfect", { duration: formatDuration(Math.floor(getElapsedMilliseconds() / 1000)) }), "green");
    } else {
        persistCurrentSession();
    }
}

function previewBoardSize(size) {
    pendingBoardSize = clampBoardSize(size);
    sidebarBoardSizeValue.textContent = pendingBoardSize;
    sidebarBoardSizeValueMirror.textContent = pendingBoardSize;
}

function applyBoardSize() {
    boardSize = pendingBoardSize;
    discardSolverTrace(t("solverReady", { modeLabel: getModeLabel(mode) }));
    board = createEmptyBoard(boardSize);
    currentSolverHighlight = null;
    resetProgress();
    updateBoardSizeDisplays(boardSize);
    setStatus(t("settingsApplied", { size: boardSize }), "#2563eb");
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
    updateSettingsTrigger(shouldOpen);
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

function toggleInfoModal(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !infoModal.classList.contains("open");

    infoModal.classList.toggle("open", shouldOpen);
    infoModalBackdrop.classList.toggle("visible", shouldOpen);
    infoModal.setAttribute("aria-hidden", String(!shouldOpen));
}

function getPieceLabel(selectedMode) {
    return getModeCopy(selectedMode).singular;
}

function getPlacedPieceCount() {
    return board.filter((col) => col !== EMPTY_CELL).length;
}

function resetSaveForm() {
    saveNameInput.value = t("saveDefaultName", {
        piece: getPieceLabel(mode),
        size: boardSize,
        count: getPlacedPieceCount()
    });
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

    return preview.length > 0 ? preview.join(", ") : t("previewEmpty");
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

function getModeLabel(selectedMode) {
    return getModeCopy(selectedMode).plural;
}

function renderSavePoints(savePoints) {
    savePointsList.innerHTML = "";

    if (savePoints.length === 0) {
        savePointsList.innerHTML = `<p class="sidebar-hint">${t("noSavePointsFiltered")}</p>`;
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
        createdAt.textContent = `${t("createdLabel")}: ${savePoint.created_at}`;
        updatedAt.className = "save-point-meta";
        updatedAt.textContent = `${t("updatedLabel")}: ${savePoint.updated_at}`;
        boardMeta.className = "save-point-meta";
        boardMeta.textContent = `${getPieceLabel(savePoint.mode)} | ${savePoint.board_size} x ${savePoint.board_size} | ${savePoint.pieces_placed}/${savePoint.board_size} ${t("placedWord")}`;
        preview.className = "save-point-preview";
        preview.textContent = `${t("previewLabel")}: ${getBoardPreview(savePoint.board)}`;
        note.className = "save-point-note";
        note.textContent = savePoint.save_note ? `${t("noteLabel")}: ${savePoint.save_note}` : `${t("noteLabel")}: ${t("noNote")}`;
        actions.className = "save-point-actions";

        const progressMeta = document.createElement("p");
        progressMeta.className = "save-point-meta";
        progressMeta.textContent = `${t("stepsMeta")}: ${savePoint.step_count || 0} | ${t("timeMeta")}: ${formatDuration(savePoint.elapsed_seconds)} | ${t("statusLabel")}: ${savePoint.is_solved ? t("solvedMeta") : t("openMeta")}`;

        actions.appendChild(createSavePointActionButton(t("loadButton"), "btn", () => loadSavePoint(savePoint.id)));
        actions.appendChild(createSavePointActionButton(
            savePoint.is_favorite ? t("favoriteRemoveButton") : t("favoriteAddButton"),
            "btn secondary",
            () => toggleSavePointFavorite(savePoint.id)
        ));
        actions.appendChild(createSavePointActionButton(t("deleteButton"), "btn ghost", () => deleteSavePoint(savePoint.id)));

        item.appendChild(title);
        item.appendChild(createdAt);
        item.appendChild(updatedAt);
        item.appendChild(boardMeta);
        item.appendChild(progressMeta);
        item.appendChild(preview);
        item.appendChild(note);
        item.appendChild(actions);
        savePointsList.appendChild(item);
    }
}

function renderTimeHistory(savePoints) {
    timeHistoryTableBody.innerHTML = "";

    if (savePoints.length === 0) {
        timeHistoryTableBody.innerHTML = `<tr><td colspan="7" class="history-empty">${t("historyEmpty")}</td></tr>`;
        return;
    }

    for (const savePoint of savePoints) {
        const row = document.createElement("tr");
        const values = [
            `${savePoint.is_favorite ? "★ " : ""}${savePoint.save_name}`,
            getModeLabel(savePoint.mode),
            `${savePoint.board_size} x ${savePoint.board_size}`,
            String(savePoint.step_count || 0),
            formatDuration(savePoint.elapsed_seconds),
            savePoint.is_solved ? t("solvedMeta") : t("openMeta"),
            savePoint.updated_at
        ];

        for (const value of values) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        }

        timeHistoryTableBody.appendChild(row);
    }
}

async function refreshSavePoints() {
    const queryString = getSavePointFilters();
    const response = await fetch(`/save_points${queryString ? `?${queryString}` : ""}`);
    const savePoints = await response.json();
    renderSavePoints(savePoints);
}

async function refreshTimeHistory() {
    const response = await fetch("/save_points?sort=updated");

    if (!response.ok) {
        return;
    }

    const savePoints = await response.json();
    renderTimeHistory(savePoints);
}

async function openSavePointsPanel() {
    await refreshSavePoints();
    toggleSavePointsPanel(true);
}

function applyLoadedGame(data) {
    discardSolverTrace(t("solverReady", { modeLabel: getModeLabel(data.mode || "queens") }));

    const restoredBoardSize = Array.isArray(data.board) ? clampBoardSize(data.board.length) : DEFAULT_BOARD_SIZE;

    boardSize = restoredBoardSize;
    pendingBoardSize = boardSize;
    mode = data.mode === "rooks" ? "rooks" : "queens";
    board = sanitizeBoard(data.board, boardSize);
    currentSolverHighlight = null;
    resetProgress({
        stepCountValue: data.step_count,
        elapsedMs: Number(data.elapsed_seconds || 0) * 1000,
        solved: data.is_solved || isBoardSolved(board, mode)
    });

    updateModeButtons();
    updateModeContent();
    updateBoardSizeDisplays(boardSize);
    drawBoard();
    updateProgressDisplay();
    persistCurrentSession();
}

function applySolverStep(step) {
    board = sanitizeBoard(step.board, boardSize);

    if (Number.isInteger(step.row) && Number.isInteger(step.col)) {
        currentSolverHighlight = {
            row: step.row,
            col: step.col,
            type: step.type
        };
    } else if (step.type === "solution" && solverStepIndex > 0) {
        const previousStep = solverSteps[solverStepIndex - 1];
        currentSolverHighlight = Number.isInteger(previousStep.row) && Number.isInteger(previousStep.col)
            ? {
                row: previousStep.row,
                col: previousStep.col,
                type: "solution"
            }
            : null;
    } else {
        currentSolverHighlight = null;
    }

    setSolverMessage(step.message || getDefaultSolverMessage());
    drawBoard();
    persistCurrentSession();
    updateSolverControls();
}

function advanceSolverStep() {
    if (!hasPreparedSolverTrace() || hasCompletedSolverTrace()) {
        stopSolverPlayback(false);
        updateSolverControls();
        return false;
    }

    solverStepIndex += 1;
    applySolverStep(solverSteps[solverStepIndex]);

    if (hasCompletedSolverTrace()) {
        finishSolvedRun();
        stopSolverPlayback(false);
        setStatus(t("animationFinishedStatus", { size: boardSize }), "green");
        updateSolverControls();
    }

    return true;
}

function scheduleNextSolverPlaybackStep() {
    stopSolverPlayback(false);

    solverTimerId = window.setTimeout(() => {
        solverTimerId = null;

        const advanced = advanceSolverStep();

        if (advanced && !hasCompletedSolverTrace()) {
            scheduleNextSolverPlaybackStep();
            return;
        }

        updateSolverControls();
    }, solverSpeedMs);

    updateSolverControls();
}

function startSolverPlayback(stepImmediately = true) {
    if (!hasPreparedSolverTrace() || hasCompletedSolverTrace()) {
        updateSolverControls();
        return;
    }

    if (stepImmediately) {
        const advanced = advanceSolverStep();

        if (!advanced || hasCompletedSolverTrace()) {
            updateSolverControls();
            return;
        }
    }

    scheduleNextSolverPlaybackStep();
}

async function prepareSolutionTrace() {
    const endpoint = mode === "rooks" ? "/solve_rooks_trace" : "/solve_trace";
    const requestId = ++solverRequestId;

    solverLoading = true;
    stopSolverPlayback(false);
    solverSteps = [];
    solverStepIndex = -1;
    currentSolverHighlight = null;
    setSolverMessage(t("animationPreparing", { modeLabel: getModeLabel(mode), size: boardSize }));
    setStatus(t("animationPreparingStatus", { size: boardSize }), "#2563eb");
    updateSolverControls();

    try {
        const response = await fetch(`${endpoint}?size=${boardSize}`);

        if (!response.ok) {
            throw new Error("trace request failed");
        }

        const trace = await response.json();

        if (requestId !== solverRequestId) {
            return false;
        }

        solverSteps = Array.isArray(trace.steps) ? trace.steps : [];
        solverStepIndex = -1;
        board = Array.isArray(trace.initial_board) ? trace.initial_board.slice() : createEmptyBoard(boardSize);
        currentSolverHighlight = null;

        if (!trace.solved || solverSteps.length === 0) {
            setSolverMessage(t("noSolution"));
            setStatus(t("noSolutionStatus"), "red");
            drawBoard();
            persistCurrentSession();
            return false;
        }

        setSolverMessage(t("animationReady", { steps: solverSteps.length, queensMode: mode === "queens" }));
        setStatus(t("animationReadyStatus"), "#2563eb");
        drawBoard();
        return true;
    } catch (error) {
        if (requestId !== solverRequestId) {
            return false;
        }

        setSolverMessage(t("animationLoadError"));
        setStatus(t("animationLoadError"), "red");
        return false;
    } finally {
        if (requestId === solverRequestId) {
            solverLoading = false;
            updateSolverControls();
        }
    }
}

async function nextSolverStep() {
    if (solverLoading) {
        return;
    }

    if (!hasPreparedSolverTrace()) {
        const prepared = await prepareSolutionTrace();

        if (!prepared) {
            return;
        }
    }

    if (isSolverPlaying()) {
        stopSolverPlayback(false);
    }

    if (!advanceSolverStep()) {
        setStatus(t("animationAlreadyFinished"), "#2563eb");
    }
}

async function toggleSolverPlayback() {
    if (solverLoading) {
        return;
    }

    if (isSolverPlaying()) {
        stopSolverPlayback();
        setStatus(t("animationPaused"), "#2563eb");
        return;
    }

    if (!hasPreparedSolverTrace()) {
        const prepared = await prepareSolutionTrace();

        if (!prepared) {
            return;
        }
    }

    if (hasCompletedSolverTrace()) {
        rewindSolverTrace();
    }

    setStatus(t("animationRunning"), "#2563eb");
    startSolverPlayback(true);
}

async function solve() {
    await prepareSolutionTrace();
}

async function instantSolve() {
    if (solverLoading) {
        return;
    }

    const endpoint = mode === "rooks" ? "/solve_rooks" : "/solve";
    const requestId = ++solverRequestId;

    solverLoading = true;
    stopSolverPlayback(false);
    solverSteps = [];
    solverStepIndex = -1;
    currentSolverHighlight = null;
    setSolverMessage(t("instantLoading", { modeLabel: getModeLabel(mode), size: boardSize }));
    setStatus(t("instantLoadingStatus"), "#2563eb");
    updateSolverControls();

    try {
        const response = await fetch(`${endpoint}?size=${boardSize}`);

        if (!response.ok) {
            throw new Error("instant solve request failed");
        }

        const solution = await response.json();

        if (requestId !== solverRequestId) {
            return;
        }

        board = mode === "queens" && Array.isArray(solution[0]) ? solution[0].slice() : solution.slice();
        currentSolverHighlight = null;
        finishSolvedRun();
        setSolverMessage(t("instantLoaded"));
        setStatus(t("instantLoadedStatus", { size: boardSize }), "green");
        drawBoard();
        persistCurrentSession();
    } catch (error) {
        if (requestId !== solverRequestId) {
            return;
        }

        setSolverMessage(t("instantLoadError"));
        setStatus(t("instantLoadError"), "red");
    } finally {
        if (requestId === solverRequestId) {
            solverLoading = false;
            updateSolverControls();
        }
    }
}

function resetBoard(options = {}) {
    const {
        statusMessageText = "",
        statusColor = "",
        solverMessageText = t("solverReady", { modeLabel: getModeLabel(mode) })
    } = options;

    discardSolverTrace(solverMessageText);
    board = createEmptyBoard(boardSize);
    currentSolverHighlight = null;
    resetProgress();

    if (statusMessageText) {
        setStatus(statusMessageText, statusColor);
    } else {
        setStatus();
    }

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

        li.textContent = `${getPieceLabel(mode)} ${count}: ${position}`;
        queenList.appendChild(li);
        count += 1;
    }

    const placedPieces = count - 1;
    pieceCountBadge.textContent = t("pieceCount", { count: placedPieces });

    if (placedPieces === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty";
        emptyItem.textContent = t("pieceEmpty", { modeLabel: getModeLabel(mode) });
        queenList.appendChild(emptyItem);
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
            isFavorite: saveFavoriteInput.checked,
            stepCount,
            elapsedSeconds: Math.floor(getElapsedMilliseconds() / 1000),
            isSolved
        })
    });

    if (!response.ok) {
        setStatus(t("saveError"), "red");
        return;
    }

    const data = await response.json();

    toggleSavePanel(false);
    await refreshSavePoints();
    await refreshTimeHistory();
    setStatus(t("saveSuccess", { name: data.save_point.save_name }), "green");
}

async function loadGame() {
    const response = await fetch("/load");
    const data = await response.json();
    applyLoadedGame(data);
}

async function loadSavePoint(savePointId) {
    const response = await fetch(`/load/${savePointId}`);

    if (!response.ok) {
        setStatus(t("loadError"), "red");
        return;
    }

    const data = await response.json();

    applyLoadedGame(data);
    setStatus(t("loadSuccess", { name: data.save_name }), "green");
    toggleSavePointsPanel(false);
}

async function toggleSavePointFavorite(savePointId) {
    const response = await fetch(`/save_points/${savePointId}/favorite`, {
        method: "POST"
    });

    if (!response.ok) {
        setStatus(t("favoriteError"), "red");
        return;
    }

    await refreshSavePoints();
    await refreshTimeHistory();
    setStatus(t("favoriteSuccess"), "#2563eb");
}

async function deleteSavePoint(savePointId) {
    const confirmed = window.confirm(t("deleteConfirm"));

    if (!confirmed) {
        return;
    }

    const response = await fetch(`/save_points/${savePointId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        setStatus(t("deleteError"), "red");
        return;
    }

    await refreshSavePoints();
    await refreshTimeHistory();
    setStatus(t("deleteSuccess"), "#2563eb");
}

function restoreSessionFromStorage() {
    try {
        const rawSession = window.localStorage.getItem(GAME_STORAGE_KEY);

        if (!rawSession) {
            return false;
        }

        const savedSession = JSON.parse(rawSession);
        const restoredBoardSize = clampBoardSize(savedSession.boardSize || DEFAULT_BOARD_SIZE);
        const restoredMode = savedSession.mode === "rooks" ? "rooks" : "queens";

        boardSize = restoredBoardSize;
        pendingBoardSize = restoredBoardSize;
        mode = restoredMode;
        board = sanitizeBoard(savedSession.board, restoredBoardSize);
        currentSolverHighlight = null;

        updateModeButtons();
        updateModeContent();
        updateBoardSizeDisplays(boardSize);
        drawBoard();
        resetProgress({
            stepCountValue: savedSession.stepCount,
            elapsedMs: savedSession.elapsedMs,
            solved: savedSession.isSolved || isBoardSolved(board, mode)
        });

        return true;
    } catch (error) {
        return false;
    }
}

async function initializeDashboard() {
    pendingBoardSize = boardSize;
    updateModeButtons();
    updateBoardSizeDisplays(boardSize);
    setLanguage(getStoredLanguage() || detectBrowserLanguage());
    updateSettingsTrigger(false);
    setSolverMessage(t("solverReady", { modeLabel: getModeLabel(mode) }));

    if (!restoreSessionFromStorage()) {
        resetProgress();
        drawBoard();
    }

    updateProgressDisplay();
    await refreshTimeHistory();
}

if (langSwitch) {
    langSwitch.addEventListener("click", async () => {
        setLanguage(currentLanguage === "de" ? "en" : "de");
        resetSaveForm();
        await refreshTimeHistory();

        if (savePointsSidebar.classList.contains("open")) {
            await refreshSavePoints();
        }
    });
}

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeAllPanels();
    }
});

window.addEventListener("resize", () => {
    drawBoard();
});

initializeDashboard();
