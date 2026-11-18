/* Логика лендинга v2: бренд, контакты из config.js, форма заявки,
   звёздное поле в духе фирменного стиля */
(function () {
  "use strict";

  var cfg = window.LANDING_CONFIG || {};

  // Бренд в шапке
  if (cfg.brand) {
    document.querySelectorAll("[data-brand]").forEach(function (el) {
      el.textContent = cfg.brand;
    });
  }

  // Год в подвале
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Звёздное поле: случайные четырёхлучевые звёзды, мерцают с разной задержкой
  var starsBox = document.getElementById("stars");
  if (starsBox) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var count = window.innerWidth < 560 ? 26 : 48;
    for (var i = 0; i < count; i++) {
      var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var size = 6 + Math.random() * 12;
      s.setAttribute("class", "star" + (Math.random() < 0.25 ? " is-orange" : ""));
      s.setAttribute("width", size.toFixed(1));
      s.setAttribute("height", size.toFixed(1));
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (Math.random() * 100).toFixed(2) + "%";
      s.style.setProperty("--dur", (3 + Math.random() * 4).toFixed(2) + "s");
      s.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
      s.style.setProperty("--peak", (0.4 + Math.random() * 0.55).toFixed(2));
      s.innerHTML = '<use href="#star"></use>';
      starsBox.appendChild(s);
    }
    if (reduced) {
      starsBox.querySelectorAll(".star").forEach(function (el) {
        el.style.opacity = el.style.getPropertyValue("--peak") || 0.8;
      });
    }
  }

  // Контакты
  var list = document.getElementById("contact-list");
  if (list && Array.isArray(cfg.contacts)) {
    cfg.contacts.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "contact-item";

      var a = document.createElement("a");
      a.href = c.href;
      if (c.type === "email") a.href = "mailto:" + c.value.replace(/\s/g, "");
      if (c.type === "phone") a.href = "tel:" + c.value.replace(/[\s()-]/g, "");

      var kind = document.createElement("span");
      kind.className = "contact-kind";
      kind.textContent = c.label;

      var value = document.createElement("span");
      value.className = "contact-value";
      value.textContent = c.value;

      a.appendChild(kind);
      a.appendChild(value);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // Кнопки услуг подставляют название услуги в текст заявки
  var messageField = document.querySelector('#contact-form textarea[name="message"]');
  document.querySelectorAll("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      var service = link.getAttribute("data-service");
      if (messageField && !messageField.value.trim()) {
        messageField.value = "Здравствуйте! Хочу заказать: " + service + ".\n\nО проекте: ";
      }
    });
  });

  // Отправка формы
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  function showStatus(text, ok) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("ok", !!ok);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      var name = form.elements.name.value.trim();
      var reply = form.elements.reply.value.trim();
      var message = form.elements.message.value.trim();

      if (!name || !reply || !message) {
        e.preventDefault();
        showStatus("Заполните все поля — так я смогу вам ответить.");
        return;
      }

      if (cfg.formAction) {
        form.action = cfg.formAction;
        form.method = "POST";
        showStatus("Отправляю…", true);
        return;
      }

      e.preventDefault();
      var first = (cfg.contacts && cfg.contacts[0]) || null;
      var text = "Заявка с сайта\nИмя: " + name + "\nСвязь: " + reply + "\n\n" + message;

      if (first && first.type === "telegram") {
        window.open(first.href + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        showStatus("Открываю Telegram с готовой заявкой — нажмите «Отправить».", true);
      } else if (first && first.type === "whatsapp") {
        window.open(first.href + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        showStatus("Открываю WhatsApp с готовой заявкой — нажмите «Отправить».", true);
      } else if (first && first.type === "email") {
        window.location.href = "mailto:" + first.value.replace(/\s/g, "") +
          "?subject=" + encodeURIComponent("Заявка с сайта от " + name) +
          "&body=" + encodeURIComponent(text);
        showStatus("Открываю почту с готовой заявкой.", true);
      } else {
        showStatus("Замените контакты в файле config.js — пока некуда отправлять.");
      }
    });
  }
})();
