(function () {
  "use strict";

  // Set this to your address to enable Formsubmit email delivery.
  // Example: window.PRECEDENT_FORMSUBMIT_EMAIL = "you@firm.com";
  var FORMSUBMIT_EMAIL =
    (typeof window.PRECEDENT_FORMSUBMIT_EMAIL === "string" &&
      window.PRECEDENT_FORMSUBMIT_EMAIL.trim()) ||
    "";

  var STORAGE_KEY = "precedent_waitlist";

  var STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
  ];

  var form = document.getElementById("waitlist-form");
  var errorEl = document.getElementById("form-error");
  var successEl = document.getElementById("success");
  var submitBtn = document.getElementById("submit-btn");
  var stateSelect = document.getElementById("state");
  var lastRow = null;

  STATES.forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    stateSelect.appendChild(opt);
  });

  function showError(msg) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function readForm() {
    return {
      email: document.getElementById("email").value.trim(),
      firm: document.getElementById("firm").value.trim(),
      state: document.getElementById("state").value,
      bar: document.getElementById("bar").value.trim(),
      licensed: document.getElementById("licensed").checked,
      hotdocs: document.getElementById("hotdocs").checked,
      submittedAt: new Date().toISOString()
    };
  }

  function loadRows() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRow(row) {
    var rows = loadRows();
    rows.push(row);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  function summaryText(row) {
    return [
      "Precedent waitlist",
      "Email: " + row.email,
      "Firm: " + (row.firm || "—"),
      "State: " + (row.state || "—"),
      "Bar number: " + (row.bar || "—"),
      "Licensed US attorney: " + (row.licensed ? "yes" : "no"),
      "HotDocs templates to convert: " + (row.hotdocs ? "yes" : "no"),
      "Submitted: " + row.submittedAt
    ].join("\n");
  }

  function mailtoHref(row) {
    var subject = encodeURIComponent("Precedent waitlist — " + row.email);
    var body = encodeURIComponent(summaryText(row));
    return "mailto:?subject=" + subject + "&body=" + body;
  }

  function showSuccess(row) {
    lastRow = row;
    form.hidden = true;
    successEl.hidden = false;
    var dl = document.getElementById("download-json");
    var blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
    dl.href = URL.createObjectURL(blob);
  }

  document.getElementById("copy-summary").addEventListener("click", function () {
    if (!lastRow) return;
    var text = summaryText(lastRow);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
  });

  function postFormsubmit(row) {
    var endpoint = "https://formsubmit.co/ajax/" + encodeURIComponent(FORMSUBMIT_EMAIL);
    var payload = {
      email: row.email,
      firm: row.firm,
      state: row.state,
      bar: row.bar,
      licensed: row.licensed ? "yes" : "no",
      hotdocs: row.hotdocs ? "yes" : "no",
      submittedAt: row.submittedAt,
      _subject: "Precedent waitlist — " + row.email
    };
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideError();

    var row = readForm();

    if (!row.email || !validEmail(row.email)) {
      showError("Please enter a working email address.");
      document.getElementById("email").focus();
      return;
    }

    if (!row.licensed) {
      showError("Access is for licensed attorneys in the United States. Please confirm the checkbox.");
      document.getElementById("licensed").focus();
      return;
    }

    saveRow(row);
    console.log("Precedent waitlist submission", row);

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    function finish() {
      showSuccess(row);
      submitBtn.disabled = false;
      submitBtn.textContent = "Request access";
    }

    if (FORMSUBMIT_EMAIL) {
      postFormsubmit(row)
        .then(function (res) {
          if (!res.ok) throw new Error("formsubmit " + res.status);
          finish();
        })
        .catch(function () {
          window.location.href = mailtoHref(row);
          finish();
        });
      return;
    }

    // No email configured: keep a local copy and open a prefilled mail draft.
    window.location.href = mailtoHref(row);
    finish();
  });

  if (/[?&]admin=1(?:&|$)/.test(window.location.search)) {
    var admin = document.getElementById("admin");
    var list = document.getElementById("admin-list");
    admin.hidden = false;
    var rows = loadRows();
    if (!rows.length) {
      list.innerHTML = "<p>No local submissions on this browser yet.</p>";
    } else {
      var html = "<table><thead><tr><th>When</th><th>Email</th><th>Firm</th><th>State</th><th>Bar</th><th>HotDocs</th></tr></thead><tbody>";
      rows.forEach(function (r) {
        html +=
          "<tr><td>" +
          escapeHtml(r.submittedAt || "") +
          "</td><td>" +
          escapeHtml(r.email || "") +
          "</td><td>" +
          escapeHtml(r.firm || "") +
          "</td><td>" +
          escapeHtml(r.state || "") +
          "</td><td>" +
          escapeHtml(r.bar || "") +
          "</td><td>" +
          (r.hotdocs ? "yes" : "no") +
          "</td></tr>";
      });
      html += "</tbody></table>";
      list.innerHTML = html;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
