(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: inline-block;
        font-family: var(--sapFontFamily, Arial, sans-serif);
        width: 100%;
        height: 100%;
      }
      button {
        background-color: #bb0000;
        color: #ffffff;
        border: 1px solid #bb0000;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }
      button:hover {
        background-color: #a20000;
        border-color: #a20000;
      }
      button:active {
        background-color: #880000;
        border-color: #880000;
      }
      button:disabled {
        background-color: #cccccc;
        border-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.7;
      }
    </style>
    <button id="btn-trigger">Procesar</button>
  `;

  class TLCL11ButtonWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._button = this._shadowRoot.getElementById("btn-trigger");
      this._buttonLabel = "Procesar";
      this._lastResponse = "";

      this._button.addEventListener("click", () => {
        this.triggerApiCall();
      });
    }

    get buttonLabel() {
      return this._buttonLabel;
    }

    set buttonLabel(value) {
      this._buttonLabel = value;
      if (this._button) {
        this._button.innerText = value;
      }
    }

    get lastResponse() {
      return this._lastResponse;
    }

    set lastResponse(value) {
      this._lastResponse = value;
    }

    getButtonLabel() {
      return this._buttonLabel;
    }

    setButtonLabel(newLabel) {
      this.buttonLabel = newLabel;
    }

    getLastResponse() {
      return this._lastResponse;
    }

    getMessage() {
      try {
        if (!this._lastResponse) return "";
        const parsed = JSON.parse(this._lastResponse);
        return parsed.message || "";
      } catch (e) {
        return "";
      }
    }

    async triggerApiCall() {
      const endpoint = "https://tlcl-processes-hub.cfapps.us10.hana.ondemand.com/tlcl-hub/tlcl11";
      const payload = {
        p1: "hardcoded_val1",
        p2: "hardcoded_val2"
      };

      const originalText = this._buttonLabel;
      this._button.disabled = true;
      this._button.innerText = "Procesando...";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        this._lastResponse = JSON.stringify(data);

      } catch (error) {
        console.error("[TLCL11 Widget Error]:", error);
        this._lastResponse = JSON.stringify({
          success: false,
          message: error.message || "Error al conectar con la API"
        });
      } finally {
        this._button.disabled = false;
        this._button.innerText = originalText;
        
        // Disparar evento a SAC
        this.dispatchEvent(new Event("onApiResponse"));
      }
    }
  }

  customElements.define("tlcl11-button-widget", TLCL11ButtonWidget);
})();