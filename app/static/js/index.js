// settings for preview board
const HERO_BOARD_SIZE = 8;
const heroBoard = document.getElementById("heroBoard");

//translation for English and German
const AppLanguage = window.AppLanguage;
const langSwitch = document.getElementById("langSwitch");
const initialLanguage = window.LANDING_INITIAL_LANGUAGE || "de";
let currentLanguage = initialLanguage;

const translations = {
    de: {
        "meta.title": "8-Damen- und 8-Türme Solver",
        "nav.brand": "8-Damen- und 8-Türme Solver",
        "nav.problem": "Problem",
        "nav.features": "Features",
        "nav.journey": "Ablauf",
        "nav.login": "Login",
        "nav.signup": "Create Account",
        "hero.eyebrow": "Interaktives Lernen mit Strategie, Logik und Backtracking",
        "hero.title": "Entdecke das Acht-Damen- und Acht-Türme-Problem.",
        "hero.text": "Diese App macht aus einem klassischen Informatik- und Mathematikproblem ein interaktives Erlebnis: Setze Damen oder Türme, verfolge den Solver Schritt fuer Schritt, miss deine Zeit und speichere clevere Zwischenstände.",
        "hero.primaryCta": "Jetzt starten",
        "hero.secondaryCta": "Bereits Account? Login",
        "hero.fact1Title": "Skalierbar",
        "hero.fact1Text": "Brettgrösse flexibel anpassen",
        "hero.fact2Title": "Schritt für Schritt",
        "hero.fact2Text": "Solver mit Animation",
        "hero.fact3Title": "Save-Points",
        "hero.fact3Text": "Zeit und Fortschritt behalten",
        "hero.solverLabel": "Solver",
        "hero.solverValue": "Backtracking live",
        "hero.challengeLabel": "Challenge",
        "hero.challengeValue": "Zeit und Schritte messen",
        "problem.eyebrow": "Warum dieses Problem spannend ist",
        "problem.title": "Die Acht-Damen- und Acht-Türme-Probleme sind mehr als Schachrätsel.",
        "problem.text": "Beim Acht-Damen-Problem suchst du eine Anordnung von acht Damen auf einem Schachbrett, sodass sich keine zwei Damen schlagen. Beim Acht-Tuerme-Problem gilt dieselbe Idee für Türme, nur mit einfacheren Konfliktregeln. Beide Aufgaben zeigen, wie Mustererkennung, systematische Suche und Backtracking funktionieren.<br><br>Gerade beim Damenproblem wird schnell sichtbar, warum Strategie wichtig ist: Es gibt unzählige moegliche Platzierungen, aber nur sehr wenige wirklich gültige Lösungen. Genau das macht diese App spannend, weil man nicht nur das Ergebnis sieht, sondern auch den Weg dorthin.",
        "features.eyebrow": "Was die Applikation bietet",
        "features.title": "Von der Idee bis zur gelösten Stellung.",
        "features.card1Title": "Interaktives Brett",
        "features.card1Text": "Setze Damen oder Türme direkt auf dem Brett und prüfe, ob deine Anordnung konfliktfrei ist.",
        "features.card2Title": "Solver mit Animation",
        "features.card2Text": "Beobachte den Lösungsweg Schritt fuer Schritt und verstehe, wie Backtracking arbeitet.",
        "features.card3Title": "Zeit und Schritte",
        "features.card3Text": "Miss deinen Fortschritt während des Spiels und vergleiche unterschiedliche Versuche.",
        "features.card4Title": "Save-Points",
        "features.card4Text": "Speichere Zwischenstände mit Notizen, Zeiten und Schrittzahl fuer späteres Weiterarbeiten.",
        "features.card5Title": "Skalierbare Bretter",
        "features.card5Text": "Passe die Brettgrösse an und erkunde die Probleme nicht nur auf dem klassischen 8x8-Brett.",
        "journey.eyebrow": "So funktioniert dein Einstieg",
        "journey.title": "In wenigen Schritten vom ersten Besuch zur eigenen Lösung.",
        "journey.step1Title": "Account erstellen",
        "journey.step1Text": "Registriere dich und erhalte Zugang zu Dashboard, Save-Points und deinem Fortschritt.",
        "journey.step2Title": "Spielmodus wählen",
        "journey.step2Text": "Arbeite mit Damen oder Türmen und passe die Brettgrösse deinem Ziel an.",
        "journey.step3Title": "Lösen oder analysieren",
        "journey.step3Text": "Teste eigene Ideen oder lass dir die Lösung visuell vom Solver lösen lassen, dabei wird 1:1 gezeigt wie der Solver vorgeht.",
        "cta.eyebrow": "Bereit für den ersten Versuch?",
        "cta.title": "Mach aus einem bekannten Problem ein sichtbares Lernerlebnis.",
        "cta.text": "Starte mit einem Account, speichere deine Zwischenstände und finde heraus, wie schnell du eine konfliktfreie Lösung erreichst.",
        "cta.primaryCta": "Create Account",
        "cta.secondaryCta": "Login",
        "footerText": "Schulprojekt rund um das Acht-Damen- und Acht-Türme-Problem.",
        "footerPrivacy": "Datenschutzerklärung",
        "footerImprint": "Impressum",
        "footerNavAria": "Rechtliche Hinweise"
    },
    en: {
        "meta.title": "8 Queens and 8 Rooks Solver",
        "nav.brand": "8 Queens and 8 Rooks Solver",
        "nav.problem": "Problem",
        "nav.features": "Features",
        "nav.journey": "Journey",
        "nav.login": "Login",
        "nav.signup": "Create Account",
        "hero.eyebrow": "Interactive learning with strategy, logic, and backtracking",
        "hero.title": "Discover the Eight Queens and Eight Rooks puzzle.",
        "hero.text": "This app turns a classic computer science and mathematics problem into an interactive experience: place queens or rooks, follow the solver step by step, track your time, and save clever checkpoints.",
        "hero.primaryCta": "Get Started",
        "hero.secondaryCta": "Already have an account? Login",
        "hero.fact1Title": "Scalable",
        "hero.fact1Text": "Adjust the board size freely",
        "hero.fact2Title": "Step by step",
        "hero.fact2Text": "Animated solver walkthrough",
        "hero.fact3Title": "Save points",
        "hero.fact3Text": "Keep your time and progress",
        "hero.solverLabel": "Solver",
        "hero.solverValue": "Backtracking in motion",
        "hero.challengeLabel": "Challenge",
        "hero.challengeValue": "Measure time and steps",
        "problem.eyebrow": "Why this puzzle matters",
        "problem.title": "The Eight Queens and Eight Rooks problems are more than chess puzzles.",
        "problem.text": "In the Eight Queens problem, you search for a way to place eight queens on a chessboard so that no two queens can attack each other. The Eight Rooks problem follows the same idea for rooks, but with simpler conflict rules. Both tasks show how pattern recognition, systematic search, and backtracking work.<br><br>The queens puzzle quickly makes it obvious why strategy matters: there are countless possible placements, but only a few truly valid solutions. That is what makes this app interesting, because you do not just see the result, you also see the path to it.",
        "features.eyebrow": "What the application offers",
        "features.title": "From the first idea to a solved position.",
        "features.card1Title": "Interactive board",
        "features.card1Text": "Place queens or rooks directly on the board and check whether your setup is conflict-free.",
        "features.card2Title": "Animated solver",
        "features.card2Text": "Watch the solving path step by step and understand how backtracking works.",
        "features.card3Title": "Time and steps",
        "features.card3Text": "Track your progress during play and compare different attempts.",
        "features.card4Title": "Save points",
        "features.card4Text": "Store checkpoints with notes, time, and step count so you can continue later.",
        "features.card5Title": "Scalable boards",
        "features.card5Text": "Adjust the board size and explore the puzzle beyond the classic 8x8 board.",
        "journey.eyebrow": "How your first session works",
        "journey.title": "Reach your own solution in just a few steps.",
        "journey.step1Title": "Create an account",
        "journey.step1Text": "Sign up and unlock the dashboard, save points, and your tracked progress.",
        "journey.step2Title": "Choose a game mode",
        "journey.step2Text": "Work with queens or rooks and tune the board size to your goal.",
        "journey.step3Title": "Solve or analyze",
        "journey.step3Text": "Test your own ideas or let the solver show the solution visually, with a 1:1 view of each solving step.",
        "cta.eyebrow": "Ready for your first attempt?",
        "cta.title": "Turn a famous puzzle into a visible learning experience.",
        "cta.text": "Start with an account, save your checkpoints, and find out how quickly you can reach a conflict-free solution.",
        "cta.primaryCta": "Create Account",
        "cta.secondaryCta": "Login",
        "footerText": "School project about the Eight Queens and Eight Rooks problem.",
        "footerPrivacy": "Privacy Policy",
        "footerImprint": "Imprint",
        "footerNavAria": "Legal information"
    }
};

function t(key) {
    return translations[currentLanguage]?.[key] ?? null;
}

function applyTranslations(language) {
    currentLanguage = language;

    AppLanguage.applyTranslations({
        translate: (key) => t(key),
        allowHtml: (element, translatedText) => element.tagName === "TITLE" || String(translatedText).includes("<br"),
        attributeMappings: [
            {
                selector: "[data-i18n-aria-label]",
                datasetKey: "i18nAriaLabel",
                attribute: "aria-label"
            }
        ]
    });
}

const languageController = AppLanguage.createController({
    button: langSwitch,
    defaultLanguage: initialLanguage,
    onApply(language, helpers) {
        applyTranslations(language);
        helpers.updateLanguageSwitch({
            ariaLabel: language === "de" ? "Switch language to English" : "Sprache auf Deutsch wechseln",
            title: language === "de" ? "Switch to English" : "Zu Deutsch wechseln"
        });
    }
});

languageController.init();

// ----------------------------------------------------------------------------------------

// simple pattern for preview board
const queenPatterns = [
    [0, 4, 7, 5, 2, 6, 1, 3],
    [1, 3, 5, 7, 2, 0, 6, 4],
    [2, 5, 7, 0, 3, 6, 4, 1]
];

let currentPatternIndex = 0;

function createHeroBoard() {
    if (!heroBoard) {
        return;
    }

    heroBoard.innerHTML = "";

    for (let row = 0; row < HERO_BOARD_SIZE; row += 1) {
        for (let col = 0; col < HERO_BOARD_SIZE; col += 1) {
            const cell = document.createElement("div");
            cell.className = `board-cell ${(row + col) % 2 === 0 ? "light" : "dark"}`;
            cell.dataset.row = String(row);
            cell.dataset.col = String(col);
            heroBoard.appendChild(cell);
        }
    }
}

function applyPattern(pattern) {
    if (!heroBoard) {
        return;
    }

    const cells = heroBoard.querySelectorAll(".board-cell");

    cells.forEach((cell) => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const hasQueen = pattern[row] === col;

        cell.classList.toggle("queen", hasQueen);
        cell.classList.toggle("highlight", hasQueen);
    });
}

function rotatePattern() {
    currentPatternIndex = (currentPatternIndex + 1) % queenPatterns.length;
    applyPattern(queenPatterns[currentPatternIndex]);
}

createHeroBoard();
applyPattern(queenPatterns[currentPatternIndex]);
languageController.init();

if (heroBoard) {
    window.setInterval(rotatePattern, 2200);
}
