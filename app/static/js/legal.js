//translation for English and German

const AppLanguage = window.AppLanguage;
const langSwitch = document.getElementById("langSwitch");
const legalPage = document.body.dataset.legalPage;
let currentLanguage = AppLanguage.DEFAULT_LANGUAGE;

const translations = {
    de: {
        common: {
            navBrand: "8-Damen- und 8-Türme Solver",
            navHome: "Startseite",
            navDashboard: "Dashboard",
            navLogin: "Login",
            heroEyebrow: "Rechtliche Hinweise",
            footerText: "Schulprojekt rund um das Acht-Damen- und Acht-Türme-Problem.",
            footerPrivacy: "Datenschutzerklärung",
            footerImprint: "Impressum",
            footerNavAria: "Rechtliche Hinweise",
            languageSwitchAria: "Sprache wechseln"
        },
        imprint: {
            pageTitle: "Impressum",
            heroTitle: "Impressum",
            contactTitle: "Kontakt",
            contactName: "Jérôme Bachmann",
            contactEmailLabel: "E-Mail:",
            projectResponsibilityTitle: "Projektverantwortung",
            projectResponsibilityText: "Dieses Webprojekt wurde im Rahmen eines Schulprojekts zum Acht-Damen- und Acht-Türme-Problem erstellt. Inhaltlich verantwortlich ist die jeweils oben genannte verantwortliche Stelle.",
            contentLiabilityTitle: "Haftung für Inhalte",
            contentLiabilityText: "Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Bei Bekanntwerden von Rechtsverletzungen werden entsprechende Inhalte umgehend überarbeitet oder entfernt.",
            linksLiabilityTitle: "Haftung für Links",
            linksLiabilityText: "Diese Website kann Links zu externen Angeboten enthalten. Für deren Inhalte sind ausschliesslich die jeweiligen Betreiber verantwortlich. Eine permanente inhaltliche Kontrolle verlinkter Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.",
            versionTitle: "Stand",
            versionText: "Stand dieser Vorlage: April 2026"
        },
        privacy: {
            pageTitle: "Datenschutzerklärung",
            heroTitle: "Datenschutzerklärung",
            heroLead: "Diese Seite beschreibt, welche personenbezogenen Daten im Rahmen dieses Schulprojekts verarbeitet werden.",
            dataProcessedTitle: "1. Welche Daten verarbeitet werden",
            dataProcessedText: "Im Rahmen der Nutzung dieser Webanwendung können insbesondere folgende Daten verarbeitet werden:",
            dataProcessedItem1: "Benutzername und verschlüsseltes Passwort bei der Registrierung und beim Login",
            dataProcessedItem2: "Daten zur Zwei-Faktor-Authentifizierung, falls diese freiwillig aktiviert wird",
            dataProcessedItem3: "gespeicherte Spielstände, Notizen, Schrittzahlen, Zeiten und Favoriten",
            dataProcessedItem4: "technische Verbindungsdaten, die durch den Server oder das Hosting entstehen koennen",
            processingPurposeTitle: "3. Zweck der Verarbeitung",
            processingPurposeText: "Die Verarbeitung erfolgt, um die Funktionen dieser Anwendung bereitzustellen. Dazu gehoeren insbesondere:",
            processingPurposeItem1: "Erstellung und Verwaltung von Benutzerkonten",
            processingPurposeItem2: "sicherer Login in das persönliche Dashboard",
            processingPurposeItem3: "optionale Absicherung des Kontos per Authenticator-App",
            processingPurposeItem4: "Speichern und Laden von Spielständen",
            processingPurposeItem5: "technischer Betrieb, Fehleranalyse und Missbrauchsschutz",
            legalBasisTitle: "4. Rechtsgrundlage",
            legalBasisText: "Soweit personenbezogene Daten verarbeitet werden, erfolgt dies in der Regel zur Bereitstellung der Anwendung und ihrer Funktionen sowie aufgrund des berechtigten Interesses an einem sicheren und funktionsfähigen Webangebot. Falls eine ausdrückliche Einwilligung erforderlich ist, wird diese gesondert eingeholt.",
            storageTitle: "5. Speicherung und Löschung",
            storageText: "Personenbezogene Daten werden nur so lange gespeichert, wie sie für den jeweiligen Zweck benötigt werden. Benutzerkonten und zugehörige Spielstände bleiben grundsätzlich gespeichert, bis sie gelöscht oder für das Projekt nicht mehr benötigt werden.",
            thirdPartyTitle: "6. Weitergabe an Dritte",
            thirdPartyText: "Eine Weitergabe personenbezogener Daten erfolgt nur, wenn dies für den Betrieb der Anwendung erforderlich ist, etwa durch einen Hosting-Anbieter oder technische Dienstleister. Ansonsten werden keine Daten weitergegeben.",
            rightsTitle: "7. Rechte betroffener Personen",
            rightsText: "Betroffene Personen haben im Rahmen des anwendbaren Datenschutzrechts insbesondere das Recht auf:",
            rightsItem1: "Auskunft über die verarbeiteten personenbezogenen Daten",
            rightsItem2: "Berichtigung unrichtiger Daten",
            rightsItem3: "Löschung oder Einschränkung der Verarbeitung",
            rightsItem4: "Widerspruch gegen die Verarbeitung",
            rightsItem5: "Herausgabe der bereitgestellten Daten, soweit anwendbar",
            securityTitle: "8. Datensicherheit",
            securityText: "Es werden technische und organisatorische Massnahmen getroffen, um gespeicherte Daten vor Verlust, Missbrauch oder unberechtigtem Zugriff zu schützen. Dazu gehoeren insbesondere passwortgeschützte Konten und die Möglichkeit, Zwei-Faktor-Authentifizierung zu aktivieren.",
            versionTitle: "9. Stand",
            versionText: "Stand dieser Vorlage: April 2026"
        }
    },
    en: {
        common: {
            navBrand: "8 Queens and 8 Rooks Solver",
            navHome: "Home",
            navDashboard: "Dashboard",
            navLogin: "Login",
            heroEyebrow: "Legal information",
            footerText: "School project about the Eight Queens and Eight Rooks problem.",
            footerPrivacy: "Privacy Policy",
            footerImprint: "Imprint",
            footerNavAria: "Legal information",
            languageSwitchAria: "Switch language"
        },
        imprint: {
            pageTitle: "Imprint",
            heroTitle: "Imprint",
            contactTitle: "Contact",
            contactName: "Jérôme Bachmann",
            contactEmailLabel: "Email:",
            projectResponsibilityTitle: "Project responsibility",
            projectResponsibilityText: "This web project was created as part of a school project on the Eight Queens and Eight Rooks problem. The entity named above is responsible for the content.",
            contentLiabilityTitle: "Liability for content",
            contentLiabilityText: "The content of this website was created with care. However, no guarantee can be given for the accuracy, completeness, or timeliness of the content. If legal violations become known, the relevant content will be revised or removed without delay.",
            linksLiabilityTitle: "Liability for links",
            linksLiabilityText: "This website may contain links to external offers. Their content is the sole responsibility of the respective operators. Permanent monitoring of linked pages is not reasonable without concrete indications of a legal violation.",
            versionTitle: "Version",
            versionText: "Version of this template: April 2026"
        },
        privacy: {
            pageTitle: "Privacy Policy",
            heroTitle: "Privacy Policy",
            heroLead: "This page describes which personal data is processed as part of this school project.",
            dataProcessedTitle: "1. Which data is processed",
            dataProcessedText: "When using this web application, the following data in particular may be processed:",
            dataProcessedItem1: "username and encrypted password during registration and login",
            dataProcessedItem2: "two-factor authentication data if this feature is activated voluntarily",
            dataProcessedItem3: "saved game states, notes, step counts, times, and favorites",
            dataProcessedItem4: "technical connection data that may arise through the server or hosting",
            processingPurposeTitle: "3. Purpose of processing",
            processingPurposeText: "The processing is carried out to provide the functions of this application. This includes in particular:",
            processingPurposeItem1: "creating and managing user accounts",
            processingPurposeItem2: "secure login to the personal dashboard",
            processingPurposeItem3: "optional account protection using an authenticator app",
            processingPurposeItem4: "saving and loading game states",
            processingPurposeItem5: "technical operation, error analysis, and abuse prevention",
            legalBasisTitle: "4. Legal basis",
            legalBasisText: "Where personal data is processed, this is generally done to provide the application and its functions, as well as on the basis of the legitimate interest in a secure and functional web offering. If explicit consent is required, it will be obtained separately.",
            storageTitle: "5. Storage and deletion",
            storageText: "Personal data is stored only as long as it is needed for the respective purpose. User accounts and related game states generally remain stored until they are deleted or are no longer needed for the project.",
            thirdPartyTitle: "6. Disclosure to third parties",
            thirdPartyText: "Personal data is shared only if this is necessary for operating the application, for example through a hosting provider or technical service providers. Otherwise, no data is shared.",
            rightsTitle: "7. Rights of data subjects",
            rightsText: "Within the framework of applicable data protection law, data subjects have in particular the right to:",
            rightsItem1: "information about the personal data being processed",
            rightsItem2: "correction of incorrect data",
            rightsItem3: "deletion of data or restriction of processing",
            rightsItem4: "object to the processing",
            rightsItem5: "receive the data that has been provided, where applicable",
            securityTitle: "8. Data security",
            securityText: "Technical and organizational measures are taken to protect stored data against loss, misuse, or unauthorized access. These include password-protected accounts and the option to enable two-factor authentication.",
            versionTitle: "9. Version",
            versionText: "Version of this template: April 2026"
        }
    }
};

function t(key) {
    const commonTranslation = translations[currentLanguage]?.common?.[key];

    if (commonTranslation) {
        return commonTranslation;
    }

    return translations[currentLanguage]?.[legalPage]?.[key] ?? null;
}

function applyTranslations() {
    AppLanguage.applyTranslations({
        translate: (key) => t(key),
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
    onApply(language, helpers) {
        currentLanguage = language;
        applyTranslations();
        helpers.updateLanguageSwitch({
            ariaLabel: t("languageSwitchAria") || "Sprache wechseln",
            title: language === "de" ? "Switch to English" : "Zu Deutsch wechseln"
        });
    }
});

languageController.init();
