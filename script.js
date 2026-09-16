const TUNNEL_URL = "https://your-tunnel-subdomain.trycloudflare.com";

let actionCount = 0;
let currentAction = 'love';
let actionVerb = 'loves';
let actionEmoji = '❤️';

let isCooldown = false;
const COOLDOWN_SECONDS = 5;

function incrementAction() {
    actionCount++;
    const counterDisplay = document.getElementById("actionCounter");
    if (counterDisplay) {
        counterDisplay.textContent = actionCount;
    }
}

function setAction(action, verb, emoji) {
    currentAction = action;
    actionVerb = verb;
    actionEmoji = emoji;
    actionCount = 0;
    
    const counterDisplay = document.getElementById("actionCounter");
    if (counterDisplay) {
        counterDisplay.textContent = actionCount;
    }
}

async function sendAction() {
    const status = document.getElementById("status");
    const sendBtn = document.querySelector(".send-btn");
    const isAnon = document.getElementById("anonToggle")?.checked || false;
    const isSilent = document.getElementById("silentToggle")?.checked || false;

    if (isCooldown) {
        status.textContent = "⏳ Slow down! Please wait a moment.";
        status.style.color = "#eab308";
        return;
    }

    const nameInput = document.getElementById("senderName");
    const name = isAnon ? "Someone" : (nameInput ? nameInput.value.trim() : "");
    const targetId = document.getElementById("targetId")?.value.trim();

    if ((!isAnon && !name) || !targetId) {
        status.textContent = "❌ Fill in required fields!";
        status.style.color = "#ff6b6b";
        return;
    }

    if (actionCount === 0) {
        status.textContent = `❌ Click the ${actionEmoji} first!`;
        status.style.color = "#ff6b6b";
        return;
    }

    let message = currentAction === 'love'
        ? `${name} loves you ${actionCount} times`
        : `${name} ${actionVerb} you ${actionCount} times`;

    if (isSilent) {
        message = `@silent ${message}`;
    }

    status.textContent = "Sending...";
    status.style.color = "#aaa";

    try {
        const response = await fetch(`${TUNNEL_URL}/send-dm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, targetId, message, isAnon })
        });

        const data = await response.json();
        if (response.ok) {
            status.textContent = "✅ " + data.status;
            status.style.color = "#51cf66";

            startCooldown(sendBtn);
        } else {
            status.textContent = "❌ " + (data.error || "Failed to send.");
            status.style.color = "#ff6b6b";
        }
    } catch (error) {
        console.error(error);
        status.textContent = "❌ Backend offline or wrong tunnel URL!";
        status.style.color = "#ff6b6b";
    }
}

function startCooldown(button) {
    isCooldown = true;
    let timeLeft = COOLDOWN_SECONDS;
    
    if (button) button.disabled = true;

    const timer = setInterval(() => {
        if (button) button.textContent = `Wait (${timeLeft}s)`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            isCooldown = false;
            if (button) {
                button.disabled = false;
                button.textContent = "Send Message";
            }
        }
    }, 1000);
}
