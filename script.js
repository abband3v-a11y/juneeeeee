const TUNNEL_URL =
    "https://singer-moral-changes-improvement.trycloudflare.com";

let currentAction = 'love';
let actionEmoji = '💖';
let actionVerb = 'loved';
let actionCount = 0;


// ==================================================
// ANONYMOUS TOGGLE LOGIC
// ==================================================

const anonToggle = document.getElementById("anonToggle");
if (anonToggle) {
    const nameInput = document.getElementById("senderName");
    anonToggle.addEventListener("change", function () {
        if (this.checked) {
            nameInput.value = "";
            nameInput.disabled = true;
            nameInput.placeholder = "Anonymous mode";
        } else {
            nameInput.disabled = false;
            nameInput.placeholder = "Your Name";
        }
    });
}


// ==================================================
// DEV TOOLS (set.love, set.pat, set.kiss)
// ==================================================

window.set = {
    love: function (num) {
        const target = parseInt(num, 10);
        if (isNaN(target)) return console.error("❌ DevMode Error: Pass a number, e.g. set.love(100)");

        setAction('love', '💖', 'loved', null);
        actionCount = target;
        updateCounterText();
        console.log(`%c💖 DevMode: Love count set to ${actionCount}`, "color: #ff69b4; font-weight: bold;");
    },

    pat: function (num) {
        const target = parseInt(num, 10);
        if (isNaN(target)) return console.error("❌ DevMode Error: Pass a number, e.g. set.pat(100)");

        setAction('pat', '🫳', 'patted', null);
        actionCount = target;
        updateCounterText();
        console.log(`%c🫳 DevMode: Pat count set to ${actionCount}`, "color: #eab308; font-weight: bold;");
    },

    kiss: function (num) {
        const target = parseInt(num, 10);
        if (isNaN(target)) return console.error("❌ DevMode Error: Pass a number, e.g. set.kiss(100)");

        setAction('kiss', '💋', 'kissed', null);
        actionCount = target;
        updateCounterText();
        console.log(`%c💋 DevMode: Kiss count set to ${actionCount}`, "color: #ef4444; font-weight: bold;");
    }
};


// ==================================================
// ACTION SWITCHER
// ==================================================

function setAction(type, emoji, verb, evt) {
    currentAction = type;
    actionEmoji = emoji;
    actionVerb = verb;
    actionCount = 0;

    // Update active tab styling
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(type)) {
            btn.classList.add('active');
        }
    });

    const titleEl = document.getElementById("actionTitle");
    const btnEl = document.getElementById("actionButton");

    if (titleEl) titleEl.textContent = `Send ${type.charAt(0).toUpperCase() + type.slice(1)} ${emoji}`;
    if (btnEl) btnEl.textContent = emoji;

    updateCounterText();
}

function updateCounterText() {
    const textEl = document.getElementById("actionCount");
    if (!textEl) return;

    if (currentAction === 'love') {
        textEl.textContent = `I love you ${actionCount} times`;
    } else {
        textEl.textContent = `I ${actionVerb} you ${actionCount} times`;
    }
}


// ==================================================
// CLICK & SEND HANDLERS
// ==================================================

const actionBtn = document.getElementById("actionButton");
if (actionBtn) {
    actionBtn.addEventListener("click", () => {
        actionCount++;
        updateCounterText();
    });
}

async function sendAction() {
    const status = document.getElementById("status");
    const isAnon = document.getElementById("anonToggle")?.checked || false;
    const isSilent = document.getElementById("silentToggle")?.checked || false;

    const nameInput = document.getElementById("senderName");
    const name = isAnon ? "Someone" : (nameInput ? nameInput.value.trim() : "");
    const targetId = document.getElementById("targetId").value.trim();

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

    // Format message
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
