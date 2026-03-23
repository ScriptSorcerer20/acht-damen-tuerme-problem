const button = document.querySelector(".magnetic");

button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
});

button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0,0)";
});

const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
    input.addEventListener("input", () => {
        input.style.boxShadow = "0 0 8px rgba(79,172,254,0.6)";

        setTimeout(() => {
            input.style.boxShadow = "";
        }, 300);
    });
});

const form = document.querySelector("form");

form.addEventListener("submit", () => {
    button.innerText = "Logging in...";
    button.style.opacity = "0.7";
});
