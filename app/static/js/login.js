//translation for English and German

const AppLanguage = window.AppLanguage;
const langSwitch = document.getElementById("langSwitch");

const translations = {
    de: {
        pageTitle: "Login-Einstellungen",
        navBrand: "8-Damen- und 8-Türme Solver",
        navDashboard: "Dashboard",
        navSettings: "Login-Einstellungen",
        navLogout: "Logout",
        backToDashboard: "Zurück zum Dashboard",
        backToDashboardAria: "Zurück zum Dashboard",
        languageSwitchAria: "Sprache wechseln",
        settingsTitle: "Login-Einstellungen",
        settingsSubtitle: "Verwalte die Authenticator-App-2FA und dein Passwort, ohne den Registrierungsablauf zu ändern.",
        twoFactorTitle: "Authenticator-App-2FA",
        twoFactorEnabledHint: "2FA ist für dieses Konto aktuell aktiviert.",
        twoFactorEnabledAppHint: "Nutze Google Authenticator, Microsoft Authenticator, Authy oder eine andere TOTP-App, um deine 6-stelligen Login-Codes zu generieren.",
        disableTwoFactorButton: "2FA deaktivieren",
        disableTwoFactorLoading: "2FA wird deaktiviert...",
        finishSetupTitle: "2FA-Einrichtung abschließen",
        finishSetupHint: "Scanne diesen QR-Code mit deiner Authenticator-App und gib danach den aktuellen 6-stelligen Code zur Bestätigung ein.",
        scanFallbackHint: "Wenn das Scannen nicht funktioniert, kannst du den manuellen Einrichtungsschlüssel unten verwenden.",
        manualSetupKey: "Manueller Einrichtungsschlüssel",
        setupUriLabel: "Einrichtungs-URI",
        setupUriHint: "Diese URI wird für den QR-Setup verwendet und kann als Fallback für kompatible Apps kopiert werden.",
        authenticatorCodeLabel: "Authenticator-Code",
        confirmAndEnableButton: "Bestätigen und aktivieren",
        confirmAndEnableLoading: "2FA wird aktiviert...",
        cancelSetupTitle: "Einrichtung abbrechen",
        cancelSetupHint: "Brich die aktuelle Authenticator-Einrichtung ab, wenn du mit einem neuen Schlüssel neu starten möchtest.",
        cancelSetupButton: "Einrichtung abbrechen",
        startSetupHint: "Schütze dein Konto mit 6-stelligen Codes aus einer Authenticator-App.",
        startSetupHintFollowup: "Nach dem Start der Einrichtung erhältst du einen QR-Code zum Scannen und bestätigst dann einmal mit einem aktuellen Code.",
        startSetupButton: "Einrichtung starten",
        startSetupLoading: "Einrichtung wird gestartet...",
        changePasswordTitle: "Passwort ändern",
        currentPasswordLabel: "Aktuelles Passwort",
        newPasswordLabel: "Neues Passwort",
        confirmPasswordLabel: "Neues Passwort bestätigen",
        updatePasswordButton: "Passwort aktualisieren",
        updatePasswordLoading: "Passwort wird aktualisiert...",
        qrLoadError: "QR-Vorschau konnte nicht geladen werden.",
        footerText: "Schulprojekt rund um das Acht-Damen- und Acht-Türme-Problem.",
        footerPrivacy: "Datenschutzerklärung",
        footerImprint: "Impressum",
        footerNavAria: "Rechtliche Hinweise"
    },
    en: {
        pageTitle: "Login Settings",
        navBrand: "8-Damen- und 8-Türme Solver",
        navDashboard: "Dashboard",
        navSettings: "Login settings",
        navLogout: "Logout",
        backToDashboard: "Back to dashboard",
        backToDashboardAria: "Back to dashboard",
        languageSwitchAria: "Switch language",
        settingsTitle: "Login settings",
        settingsSubtitle: "Manage authenticator app 2FA and your password without changing the registration flow.",
        twoFactorTitle: "Authenticator app 2FA",
        twoFactorEnabledHint: "2FA is currently enabled for this account.",
        twoFactorEnabledAppHint: "Use Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app to generate your 6-digit login codes.",
        disableTwoFactorButton: "Disable 2FA",
        disableTwoFactorLoading: "Disabling 2FA...",
        finishSetupTitle: "Finish 2FA setup",
        finishSetupHint: "Scan this QR code with your authenticator app, then enter the current 6-digit code to confirm.",
        scanFallbackHint: "If scanning does not work, you can still use the manual setup key below.",
        manualSetupKey: "Manual setup key",
        setupUriLabel: "Setup URI",
        setupUriHint: "This URI is used to generate the QR setup and can be copied as a fallback for compatible apps.",
        authenticatorCodeLabel: "Authenticator code",
        confirmAndEnableButton: "Confirm and enable",
        confirmAndEnableLoading: "Enabling 2FA...",
        cancelSetupTitle: "Cancel setup",
        cancelSetupHint: "Cancel the current authenticator setup if you want to restart with a new secret.",
        cancelSetupButton: "Cancel setup",
        startSetupHint: "Protect your account with 6-digit codes from an authenticator app.",
        startSetupHintFollowup: "After starting setup, you will get a QR code to scan and then confirm once with a live code.",
        startSetupButton: "Start setup",
        startSetupLoading: "Starting setup...",
        changePasswordTitle: "Change password",
        currentPasswordLabel: "Current password",
        newPasswordLabel: "New password",
        confirmPasswordLabel: "Confirm new password",
        updatePasswordButton: "Update password",
        updatePasswordLoading: "Updating password...",
        qrLoadError: "QR preview could not be loaded.",
        footerText: "School project about the Eight Queens and Eight Rooks problem.",
        footerPrivacy: "Privacy Policy",
        footerImprint: "Imprint",
        footerNavAria: "Legal information"
    }
};

const serverMessageTranslations = {
    de: {
        "Authenticator app 2FA is already enabled.": "Authenticator-App-2FA ist bereits aktiviert.",
        "Add the secret to your authenticator app, then confirm it with the current 6-digit code.": "Füge den Schlüssel zu deiner Authenticator-App hinzu und bestätige ihn dann mit dem aktuellen 6-stelligen Code.",
        "Start the authenticator setup first.": "Starte zuerst die Authenticator-Einrichtung.",
        "Invalid authenticator code. Please try the current code again.": "Ungültiger Authenticator-Code. Bitte versuche den aktuellen Code erneut.",
        "Authenticator app 2FA enabled.": "Authenticator-App-2FA wurde aktiviert.",
        "Authenticator app setup cancelled.": "Die Einrichtung der Authenticator-App wurde abgebrochen.",
        "Authenticator app 2FA disabled.": "Authenticator-App-2FA wurde deaktiviert.",
        "Your current password is incorrect.": "Dein aktuelles Passwort ist falsch.",
        "The new passwords do not match.": "Die neuen Passwörter stimmen nicht überein.",
        "Password updated successfully.": "Das Passwort wurde erfolgreich aktualisiert.",
        "Unknown settings action.": "Unbekannte Einstellungsaktion."
    },
    en: {}
};

let currentLanguage = AppLanguage.DEFAULT_LANGUAGE;

function t(key) {
    return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}

function translateServerMessage(message) {
    const originalMessage = String(message || "").trim();

    if (!originalMessage || currentLanguage === "en") {
        return originalMessage;
    }

    const exactMatch = serverMessageTranslations[currentLanguage]?.[originalMessage];

    if (exactMatch) {
        return exactMatch;
    }

    const minLengthMatch = originalMessage.match(/^Password must be at least (\d+) characters long\.$/);

    if (minLengthMatch) {
        return `Das Passwort muss mindestens ${minLengthMatch[1]} Zeichen lang sein.`;
    }

    const maxLengthMatch = originalMessage.match(/^Password must be at most (\d+) characters long\.$/);

    if (maxLengthMatch) {
        return `Das Passwort darf höchstens ${maxLengthMatch[1]} Zeichen lang sein.`;
    }

    return originalMessage;
}

function applyTextTranslations() {
    AppLanguage.applyTranslations({
        translate: (key) => t(key),
        attributeMappings: [
            {
                selector: "[data-i18n-aria-label]",
                datasetKey: "i18nAriaLabel",
                attribute: "aria-label"
            },
            {
                selector: "[data-i18n-loading-label]",
                datasetKey: "i18nLoadingLabel",
                attribute: "data-loading-label"
            }
        ]
    });

    document.querySelectorAll("[data-i18n-loading-label]").forEach((element) => {
        if (element.dataset.loadingLabelApplied === "true") {
            element.textContent = element.dataset.loadingLabel;
        }
    });

    document.querySelectorAll(".message").forEach((element) => {
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent.trim();
        }

        element.textContent = translateServerMessage(element.dataset.originalText);
    });
}

const languageController = AppLanguage.createController({
    button: langSwitch,
    onApply(language, helpers) {
        currentLanguage = language;
        applyTextTranslations();
        helpers.updateLanguageSwitch({
            ariaLabel: t("languageSwitchAria"),
            title: currentLanguage === "de" ? "Switch to English" : "Zu Deutsch wechseln"
        });
    }
});

languageController.init();

// -----------------------------------------------------------------------------------------------

const magneticButtons = document.querySelectorAll(".magnetic");

// magnetic button effect for desktop user
magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    button.addEventListener("mouseleave", () => {
        button.style.transform = "translate(0, 0)";
    });
});

document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
        input.style.boxShadow = "0 0 8px rgba(59, 130, 246, 0.4)";

        window.clearTimeout(input._loginGlowTimeout);
        input._loginGlowTimeout = window.setTimeout(() => {
            input.style.boxShadow = "";
        }, 250);
    });
});

document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
        const submitter = event.submitter;

        if (!submitter || submitter.dataset.loadingLabelApplied === "true") {
            return;
        }

        const loadingLabel = submitter.dataset.loadingLabel;

        if (loadingLabel) {
            submitter.dataset.loadingLabelApplied = "true";
            submitter.dataset.originalLabel = submitter.textContent;
            submitter.textContent = loadingLabel;
            submitter.style.opacity = "0.7";
        }
    });
});

document.querySelectorAll(".qr-code[data-qr-value]").forEach((container) => {
    const qrValue = container.dataset.qrValue;

    if (!qrValue) {
        return;
    }

    if (typeof window.QRCode !== "function") {
        container.textContent = t("qrLoadError");
        return;
    }

    container.innerHTML = "";

    new window.QRCode(container, {
        text: qrValue,
        width: 220,
        height: 220,
        colorDark: "#172033",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M
    });
});
