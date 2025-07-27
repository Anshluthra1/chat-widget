class WhatsAppWidget {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    this.injectStyles();
    this.createButton();
    this.createPopup();
    this.attachEvents();
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .wa-popup-header {
        background-color: ${this.config.color || "#2f2e41"};
        color: white;
        padding: 16px;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
      }

      .wa-popup-header h3 {
        margin: 0;
        font-size: 16px;
      }

      .wa-popup-header p {
        margin: 4px 0 0;
        font-size: 13px;
        opacity: 0.8;
      }

      .wa-widget-button {
        position: fixed;
        bottom: 20px;
        ${this.config.position || "right"}: 20px;
        background-color: ${this.config.color || "#2f2e41"};
        color: white;
        padding: 12px 18px;
        border-radius: 50px;
        border: none;
        font-size: 16px;
        cursor: pointer;
        z-index: 9999;
      }

      .wa-widget-popup {
        width: 100%;
        max-width: 300px;
        height: 460px;
        overflow-y: auto;
        position: fixed;
        bottom: 70px;
        ${this.config.position || "right"}: 20px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        display: none;
        flex-direction: column;
        z-index: 9999;
        font-family: sans-serif;
      }

      .wa-form label {
        display: flex;
        flex-direction: column;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .wa-form input,
      .wa-form textarea,
      .wa-form select {
        margin-top: 6px;
        padding: 10px;
        border: none;
        border-bottom: 1px solid #ccc;
        font-size: 14px;
        background: transparent;
        outline: none;
      }

      .wa-form {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .wa-widget-popup button {
        background-color: ${this.config.color || "#2f2e41"};
        color: white;
        padding: 10px;
        border: none;
        border-radius: 100px;
        cursor: pointer;
        margin-top: 8px;
      }

      .wa-error {
        font-size: 12px;
        color: red;
        margin-bottom: 6px;
      }
    `;
    document.head.appendChild(style);
  }

  createButton() {
    this.button = document.createElement("button");
    this.button.className = "wa-widget-button";
    this.button.innerText = this.config.buttonText || "Chat Now";
    document.body.appendChild(this.button);
  }

  createPopup() {
    this.popup = document.createElement("div");
    this.popup.className = "wa-widget-popup";
    this.popup.innerHTML = `
   <div class="wa-popup-header">
        <h3>Send us a message</h3>
        <p>We cannot wait to hear from you!</p>
      </div>
      <div class="wa-form">
        <label>
          Name
          <input type="text" name="name"  id="wa-name" placeholder="Enter name" />
          <div class="wa-error" id="wa-name-error"></div>
        </label>

        <label>
          Username
          <input type="text" id="wa-username" placeholder="Username" />
          <div class="wa-error" id="wa-username-error"></div>
        </label>

        <label>
          Mobile
          <input type="tel" id="wa-mobile" placeholder="Mobile" />
          <div class="wa-error" id="wa-mobile-error"></div>
        </label>

        <label>
          Issue
          <select id="wa-issue">
            <option value="">Select Issue</option>
            <option value="OLD ID">OLD ID</option>
            <option value="NEW ID">NEW ID</option>
          </select>
          <div class="wa-error" id="wa-issue-error"></div>
        </label>

        <button type="wa-submit" id="wa-submit">Send message</button>
      </div>
    `;
    document.body.appendChild(this.popup);
  }

  attachEvents() {
    this.button.addEventListener("click", () => {
      this.popup.style.display =
        this.popup.style.display === "flex" ? "none" : "flex";
    });

    this.popup.querySelector("#wa-submit").addEventListener("click", () => {
      const name = this.popup.querySelector("#wa-name").value.trim();
      const username = this.popup.querySelector("#wa-username").value.trim();
      const mobile = this.popup.querySelector("#wa-mobile").value.trim();
      const issue = this.popup.querySelector("#wa-issue").value;

      let valid = true;

      this.clearErrors();

      if (!name) {
        this.setError("wa-name-error", "Name is required.");
        valid = false;
      }
      if (!username) {
        this.setError("wa-username-error", "Username is required.");
        valid = false;
      }
      if (!mobile) {
        this.setError("wa-mobile-error", "Mobile number is required.");
        valid = false;
      }
      if (!issue) {
        this.setError("wa-issue-error", "Please select an issue.");
        valid = false;
      }

      if (!valid) return;

      this.redirectToWhatsApp(name, username, mobile, issue);
    });

    document.addEventListener("click", (event) => {
      const isClickInside =
        this.popup.contains(event.target) || this.button.contains(event.target);
      if (!isClickInside) {
        this.popup.style.display = "none";
      }
    });
  }

  setError(id, message) {
    const el = this.popup.querySelector(`#${id}`);
    if (el) el.textContent = message;
  }

  clearErrors() {
    this.popup.querySelectorAll(".wa-error").forEach((el) => {
      el.textContent = "";
    });
  }

  redirectToWhatsApp(name, username, mobile, issue) {
    const message = `Name: ${name}\nUsername: ${username}\nMobile: ${mobile}\nIssue: ${issue}`;
    const encodedMsg = encodeURIComponent(message);
    const phone = this.config.whatsapp;

    if (!phone) {
      alert("WhatsApp number is not configured in the widget.");
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodedMsg}`;
    window.location.href = url;
    window.open(url, "_blank");
    this.popup.style.display = "none";
  }
}

// Auto-initialize on script load
(function () {
  const script = document.currentScript;
  const config = {
    buttonText: script.dataset.buttonText,
    color: script.dataset.color,
    position: script.dataset.position,
    whatsapp: script.dataset.whatsapp,
  };

  if (!config.whatsapp) {
    console.error("WhatsApp number not found in data-whatsapp attribute.");
    return;
  }

  new WhatsAppWidget(config);
})();
