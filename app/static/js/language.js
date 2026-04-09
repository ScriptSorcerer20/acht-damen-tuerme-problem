// handels the language translation

(function attachAppLanguage(window, document) {
    const DEFAULT_LANGUAGE = "de";
    const DEFAULT_STORAGE_KEY = "preferredLanguage";
    const DEFAULT_SUPPORTED_LANGUAGES = ["de", "en"];

    function resolveSupportedLanguages(supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES) {
        const normalizedLanguages = Array.isArray(supportedLanguages)
            ? supportedLanguages
                .map((language) => String(language || "").trim().slice(0, 2).toLowerCase())
                .filter(Boolean)
            : [];

        return normalizedLanguages.length > 0 ? normalizedLanguages : DEFAULT_SUPPORTED_LANGUAGES.slice();
    }

    function normalizeLanguage(
        language,
        {
            supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
            defaultLanguage = DEFAULT_LANGUAGE
        } = {}
    ) {
        const normalizedSupportedLanguages = resolveSupportedLanguages(supportedLanguages);
        const normalizedDefaultLanguage = normalizedSupportedLanguages.includes(defaultLanguage)
            ? defaultLanguage
            : normalizedSupportedLanguages[0] || DEFAULT_LANGUAGE;
        const shortLanguage = String(language || "").trim().slice(0, 2).toLowerCase();

        return normalizedSupportedLanguages.includes(shortLanguage) ? shortLanguage : normalizedDefaultLanguage;
    }

    function getStoredLanguage({ storageKey = DEFAULT_STORAGE_KEY } = {}) {
        try {
            return window.localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    }

    function storeLanguage(language, { storageKey = DEFAULT_STORAGE_KEY } = {}) {
        try {
            window.localStorage.setItem(storageKey, language);
        } catch (error) {
            return;
        }
    }

    function detectBrowserLanguage(options = {}) {
        return normalizeLanguage(navigator.language || navigator.userLanguage || options.defaultLanguage, options);
    }

    function getPreferredLanguage(
        {
            supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
            defaultLanguage = DEFAULT_LANGUAGE,
            storageKey = DEFAULT_STORAGE_KEY,
            fallbackLanguage = defaultLanguage
        } = {}
    ) {
        return normalizeLanguage(
            getStoredLanguage({ storageKey }) || detectBrowserLanguage({ supportedLanguages, defaultLanguage }) || fallbackLanguage,
            {
                supportedLanguages,
                defaultLanguage: fallbackLanguage
            }
        );
    }

    function getNextLanguage(language, supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES) {
        const normalizedSupportedLanguages = resolveSupportedLanguages(supportedLanguages);
        const currentLanguage = normalizeLanguage(language, {
            supportedLanguages: normalizedSupportedLanguages,
            defaultLanguage: normalizedSupportedLanguages[0]
        });
        const currentIndex = normalizedSupportedLanguages.indexOf(currentLanguage);

        if (currentIndex === -1 || normalizedSupportedLanguages.length < 2) {
            return currentLanguage;
        }

        return normalizedSupportedLanguages[(currentIndex + 1) % normalizedSupportedLanguages.length];
    }

    function setDocumentLanguage(language) {
        if (document.documentElement) {
            document.documentElement.lang = language;
        }

        if (document.body) {
            document.body.dataset.language = language;
        }
    }

    function applyTextTranslations({
        translate,
        selector = "[data-i18n]",
        allowHtml = () => false
    } = {}) {
        if (typeof translate !== "function") {
            return;
        }

        document.querySelectorAll(selector).forEach((element) => {
            const key = element.dataset.i18n;
            const translatedText = translate(key, element);

            if (translatedText === undefined || translatedText === null) {
                return;
            }

            if (allowHtml(element, translatedText, key)) {
                element.innerHTML = String(translatedText);
                return;
            }

            element.textContent = String(translatedText);
        });
    }

    function applyAttributeTranslations({
        translate,
        mappings = []
    } = {}) {
        if (typeof translate !== "function") {
            return;
        }

        mappings.forEach(({ selector, datasetKey, attribute }) => {
            document.querySelectorAll(selector).forEach((element) => {
                const key = element.dataset[datasetKey];
                const translatedText = translate(key, element, attribute);

                if (translatedText === undefined || translatedText === null) {
                    return;
                }

                element.setAttribute(attribute, String(translatedText));
            });
        });
    }

    function applyTranslations({
        translate,
        selector = "[data-i18n]",
        allowHtml,
        attributeMappings = []
    } = {}) {
        applyTextTranslations({ translate, selector, allowHtml });
        applyAttributeTranslations({ translate, mappings: attributeMappings });
    }

    function updateLanguageSwitch(
        button,
        {
            language,
            label = String(language || "").toUpperCase(),
            ariaLabel,
            title
        } = {}
    ) {
        if (!button) {
            return;
        }

        button.textContent = label;

        if (ariaLabel !== undefined) {
            button.setAttribute("aria-label", ariaLabel);
        }

        if (title !== undefined) {
            button.title = title;
        }
    }

    function createController({
        button = document.getElementById("langSwitch"),
        defaultLanguage = DEFAULT_LANGUAGE,
        supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES,
        storageKey = DEFAULT_STORAGE_KEY,
        onApply = () => { }
    } = {}) {
        const options = {
            defaultLanguage,
            supportedLanguages,
            storageKey
        };

        let currentLanguage = normalizeLanguage(defaultLanguage, options);

        function apply(language, source = "apply") {
            currentLanguage = normalizeLanguage(language, options);
            setDocumentLanguage(currentLanguage);

            onApply(currentLanguage, {
                source,
                button,
                applyTranslations,
                updateLanguageSwitch: (switchOptions = {}) => updateLanguageSwitch(button, {
                    language: currentLanguage,
                    ...switchOptions
                }),
                getNextLanguage: () => getNextLanguage(currentLanguage, supportedLanguages),
                normalizeLanguage: (value) => normalizeLanguage(value, options)
            });

            storeLanguage(currentLanguage, { storageKey });
            return currentLanguage;
        }

        function toggle() {
            return apply(getNextLanguage(currentLanguage, supportedLanguages), "toggle");
        }

        function init(initialLanguage = getPreferredLanguage({
            supportedLanguages,
            defaultLanguage,
            storageKey,
            fallbackLanguage: defaultLanguage
        })) {
            if (button) {
                button.addEventListener("click", toggle);
            }

            return apply(initialLanguage, "init");
        }

        return {
            apply,
            getCurrentLanguage: () => currentLanguage,
            getPreferredLanguage: (fallbackLanguage = defaultLanguage) => getPreferredLanguage({
                supportedLanguages,
                defaultLanguage,
                storageKey,
                fallbackLanguage
            }),
            init,
            toggle
        };
    }

    window.AppLanguage = {
        DEFAULT_LANGUAGE,
        DEFAULT_STORAGE_KEY,
        DEFAULT_SUPPORTED_LANGUAGES: DEFAULT_SUPPORTED_LANGUAGES.slice(),
        applyAttributeTranslations,
        applyTextTranslations,
        applyTranslations,
        createController,
        detectBrowserLanguage,
        getNextLanguage,
        getPreferredLanguage,
        getStoredLanguage,
        normalizeLanguage,
        setDocumentLanguage,
        storeLanguage,
        updateLanguageSwitch
    };
})(window, document);
