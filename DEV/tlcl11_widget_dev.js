(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: inline-block;
        font-family: var(--sapFontFamily, Arial, sans-serif);
      }
      button {
        background-color: #0a6ed1;
        color: #ffffff;
        border: 1px solid #0a6ed1;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease, opacity 0.2s ease;
        width: 100%;
        height: 100%;
      }
      button:hover {
        background-color: #0854a1;
      }
      button:active {
        background-color: #063a70;
      }
      button:disabled {
        background-color: #cccccc;
        border-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.7;
      }
    </style>
    <button id="btn-trigger">Ejecutar Proceso TLCL11</button>
  `;

  class TLCL11ButtonWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this._button = this._shadowRoot.getElementById("btn-trigger");
      this._buttonLabel = "Ejecutar Proceso TLCL11";
      this._lastResponse = "";

      this._button.addEventListener("click", () => {
        this.triggerApiCall();
      });
    }

    // SAC Property Getters/Setters
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

    // API Call Execution
    async triggerApiCall() {
      const endpoint = "https://tlcl-processes-hub.cfapps.us10.hana.ondemand.com/tlcl-hub/tlcl11";
      const payload = {
        p1: "hardcoded_val1",
        p2: "hardcoded_val2"
      };

      // UI feedback during loading
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
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const data = await response.json();
        this._lastResponse = JSON.stringify(data);

        // Disparar evento a SAC
        this.dispatchEvent(new CustomEvent("onApiResponse", {
          detail: { response: data }
        }));

      } catch (error) {
        console.error("Error al consumir API TLCL11:", error);
        this._lastResponse = JSON.stringify({
          success: false,
          message: error.message
        });

        this.dispatchEvent(new CustomEvent("onApiResponse", {
          detail: { response: JSON.parse(this._lastResponse) }
        }));

      } finally {
        this._button.disabled = false;
        this._button.innerText = originalText;
      }
    }
  }

  customElements.define("tlcl11-button-widget", TLCL11ButtonWidget);
})();