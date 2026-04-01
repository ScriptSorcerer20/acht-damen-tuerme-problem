const magneticButtons = document.querySelectorAll(".magnetic");

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
            submitter.dataset.originalLabel = submitter.innerText;
            submitter.innerText = loadingLabel;
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
        container.textContent = "QR preview could not be loaded.";
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
