
(function () {
  "use strict";

  var C = window.SITE_CONFIG;
  if (!C) { console.error("SITE_CONFIG tidak ditemukan. Pastikan config.js dimuat sebelum main.js"); return; }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var rupiah = function (n) { return "Rp " + Math.round(n).toLocaleString("id-ID"); };
  var juta = function (n) { return n >= 1e9 ? (n / 1e9) + " miliar" : (n / 1e6).toLocaleString("id-ID") + " juta"; };
  var waLink = function (text) {
    return "https://wa.me/" + C.kontak.whatsapp + "?text=" + encodeURIComponent(text || C.pesanWaUmum);
  };


  var binds = {
    brand: C.brand, marketer: C.marketer, jabatan: C.jabatan, namaBpr: C.namaBpr,
    telepon: C.kontak.telepon, email: C.kontak.email, alamat: C.kontak.alamat,
    jamKerja: C.kontak.jamKerja, tahun: String(new Date().getFullYear()),
  };
  $$("[data-bind]").forEach(function (el) {
    var v = binds[el.getAttribute("data-bind")];
    if (v !== undefined) el.textContent = v;
  });
  $$("[data-wa]").forEach(function (el) {
    el.href = waLink(el.getAttribute("data-wa") || C.pesanWaUmum);
    el.target = "_blank"; el.rel = "noopener";
  });
  $$("[data-tel]").forEach(function (el) { el.href = "tel:" + C.kontak.telepon.replace(/[^\d+]/g, ""); });
  $$("[data-mail]").forEach(function (el) { el.href = "mailto:" + C.kontak.email; });

  var menuBtn = $("#menu-btn"), menu = $("#mobile-menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.add("hidden"); menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  $$("[data-tabel]").forEach(function (tbl) {
    var p = C.produk[tbl.getAttribute("data-tabel")];
    var thead = $("thead", tbl), tbody = $("tbody", tbl);
    if (!p || !thead || !tbody) return;
    var h = '<tr><th scope="col" class="px-3 py-2 text-left font-semibold">Plafond</th>';
    p.tenor.forEach(function (t) {
      h += '<th scope="col" class="px-3 py-2 text-right font-semibold">' + t + " bulan</th>";
    });
    var b = "";
    p.tabel.forEach(function (r) {
      b += '<tr class="border-t border-white/5 transition hover:bg-white/10"><th scope="row" class="px-3 py-2 text-left font-semibold text-slate-200">' + rupiah(r[0]) + "</th>";
      for (var c = 1; c < r.length; c++) {
        b += '<td class="px-3 py-2 text-right text-slate-300">' + r[c].toLocaleString("id-ID") + "</td>";
      }
      b += "</tr>";
    });
    thead.innerHTML = h + "</tr>";
    tbody.innerHTML = b;
  });

  var themeBtn = $("#theme-btn");
  if (themeBtn) {
    var root = document.documentElement, themeMeta = $('meta[name="theme-color"]');
    var applyTheme = function (light) {
      if (light) root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
      themeBtn.setAttribute("aria-pressed", String(light));
      themeBtn.setAttribute("aria-label", light ? "Ganti ke tampilan gelap" : "Ganti ke tampilan terang");
      if (themeMeta) themeMeta.setAttribute("content", light ? "#f7f4ec" : "#000000");
    };
    applyTheme(root.getAttribute("data-theme") === "light");
    var animTimer;
    themeBtn.addEventListener("click", function () {
      var light = root.getAttribute("data-theme") !== "light";
      root.classList.add("theme-anim");
      clearTimeout(animTimer);
      animTimer = setTimeout(function () { root.classList.remove("theme-anim"); }, 650);
      applyTheme(light);
      try { localStorage.setItem("tema", light ? "terang" : "gelap"); } catch (e) {}
    });
  }

  var tList = $("#testimoni-list"), tSec = $("#testimoni");
  if (tList && tSec && C.testimoni && C.testimoni.length) {
    C.testimoni.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "glass rounded-3xl p-6";
      var q = document.createElement("blockquote");
      q.className = "text-slate-200";
      q.textContent = "\u201C" + t.teks + "\u201D";
      var n = document.createElement("p");
      n.className = "mt-4 text-sm font-semibold text-white";
      n.textContent = t.nama;
      li.appendChild(q); li.appendChild(n);
      if (t.keterangan) {
        var k = document.createElement("p");
        k.className = "text-[0.8125rem] text-slate-400";
        k.textContent = t.keterangan;
        li.appendChild(k);
      }
      tList.appendChild(li);
    });
    tSec.hidden = false;
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = $$("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    revealEls.forEach(function (el) {
      var parent = el.parentNode;
      parent.revealCount = (parent.revealCount || 0) + 1;
      el.style.setProperty("--reveal-delay", ((parent.revealCount - 1) % 4) * 90 + "ms");
    });
    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("is-visible");
        io.unobserve(el);
        setTimeout(function () {
          el.removeAttribute("data-reveal");
          el.style.removeProperty("--reveal-delay");
        }, 1100);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  if (!$("#simulasi")) return;

  var els = {
    tabs: $("#sim-tabs"), range: $("#sim-range"), plafond: $("#sim-plafond"),
    min: $("#sim-min"), max: $("#sim-max"), minus: $("#sim-minus"), plus: $("#sim-plus"),
    tenor: $("#sim-tenor"), angsuran: $("#sim-angsuran"), tenorAktif: $("#sim-tenor-aktif"), tenorHasil: $("#sim-tenor-hasil"), hasil: $("#sim-hasil"),
    info: $("#sim-info"), ktaNote: $("#sim-kta-note"), thead: $("#sim-thead"),
    tbody: $("#sim-tbody"), wa: $("#sim-wa"), tabelNama: $("#sim-tabel-nama"),
  };

  var state = { produk: "kta", idx: 0, tenorIdx: 0 };
  var P = function () { return C.produk[state.produk]; };
  var row = function () { return P().tabel[state.idx]; };

  function urutan() {
    var pref = ["multiguna", "kta"].filter(function (k) { return C.produk[k]; });
    var rest = Object.keys(C.produk).filter(function (k) { return pref.indexOf(k) < 0; });
    return pref.concat(rest);
  }

  function renderTabs() {
    els.tabs.innerHTML = "";
    urutan().forEach(function (key) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "tab-btn"; b.textContent = C.produk[key].nama;
      b.setAttribute("data-key", key); b.setAttribute("role", "tab");
      b.addEventListener("click", function () { selectProduk(key); });
      els.tabs.appendChild(b);
    });
  }

  function selectProduk(key) {
    var prevTenor = state.produk ? P().tenor[state.tenorIdx] : null;
    state.produk = key;
    els.ktaNote.hidden = key !== "kta";
    var p = P();
    state.idx = Math.min(Math.floor(p.tabel.length / 3), p.tabel.length - 1);
    var found = p.tenor.indexOf(prevTenor);
    state.tenorIdx = found > -1 ? found : Math.floor(p.tenor.length / 2);

    els.range.min = 0; els.range.max = p.tabel.length - 1; els.range.step = 1; els.range.value = state.idx;
    els.min.textContent = rupiah(p.tabel[0][0]);
    els.max.textContent = rupiah(p.tabel[p.tabel.length - 1][0]);
    els.tabelNama.textContent = p.judul;

    $$(".tab-btn", els.tabs).forEach(function (b) {
      var on = b.getAttribute("data-key") === key;
      b.classList.toggle("is-active", on); b.setAttribute("aria-selected", String(on));
    });

    els.info.innerHTML = "";
    [["Untuk", p.untuk], ["Wilayah", p.wilayah], ["Tenor", p.tenor[0] + " – " + p.tenor[p.tenor.length - 1] + " bulan"]].filter(function (x) { return x[1]; }).forEach(function (x) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="text-slate-400">' + x[0] + ':</span> <span class="font-semibold text-white">' + x[1] + "</span>";
      els.info.appendChild(li);
    });

    renderTenor(); renderTableHead(); update();
  }

  function renderTenor() {
    els.tenor.innerHTML = "";
    P().tenor.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = t + " bulan";
      b.addEventListener("click", function () { state.tenorIdx = i; update(); });
      els.tenor.appendChild(b);
    });
  }

  function renderTableHead() {
    var h = '<tr><th class="px-3 py-2 text-left font-semibold">Plafond</th>';
    P().tenor.forEach(function (t) { h += '<th class="px-3 py-2 text-right font-semibold">' + t + " bln</th>"; });
    els.thead.innerHTML = h + "</tr>";
  }

  function renderTableBody() {
    var p = P(), html = "";
    p.tabel.forEach(function (r, i) {
      var sel = i === state.idx;
      html += '<tr data-i="' + i + '" class="cursor-pointer border-t border-white/5 transition hover:bg-white/10 ' + (sel ? "bg-brand-500/15" : "") + '">';
      html += '<td class="px-3 py-2 text-left font-semibold ' + (sel ? "text-white" : "text-slate-200") + '">' + rupiah(r[0]) + "</td>";
      for (var c = 1; c < r.length; c++) {
        var hit = sel && c - 1 === state.tenorIdx;
        html += '<td class="px-3 py-2 text-right ' + (hit ? "rounded bg-brand-500 font-bold text-black" : "text-slate-300") + '">' + r[c].toLocaleString("id-ID") + "</td>";
      }
      html += "</tr>";
    });
    els.tbody.innerHTML = html;
  }

  function update() {
    var p = P(), r = row();
    var plafond = r[0], tenor = p.tenor[state.tenorIdx], angsuran = r[state.tenorIdx + 1];

    els.plafond.textContent = rupiah(plafond);
    els.angsuran.textContent = rupiah(angsuran);
    els.tenorAktif.textContent = tenor + " bulan";
    els.tenorHasil.textContent = tenor + " bulan";
    els.hasil.classList.remove("flash"); void els.hasil.offsetWidth; els.hasil.classList.add("flash");
    els.range.value = state.idx;
    els.range.setAttribute("aria-valuetext", rupiah(plafond));
    els.minus.disabled = state.idx <= 0;
    els.plus.disabled = state.idx >= p.tabel.length - 1;

    $$(".chip", els.tenor).forEach(function (b, i) {
      var on = i === state.tenorIdx;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on));
    });

    renderTableBody();

    els.wa.href = waLink(
      "Halo Pak " + C.marketer + ", saya ingin mengajukan " + p.judul +
      ": plafond " + rupiah(plafond) + ", tenor " + tenor + " bulan, angsuran " +
      rupiah(angsuran) + "/bulan. Mohon informasi selanjutnya."
    );
  }

  els.range.addEventListener("input", function () { state.idx = Number(els.range.value); update(); });
  els.minus.addEventListener("click", function () { if (state.idx > 0) { state.idx--; update(); } });
  els.plus.addEventListener("click", function () { if (state.idx < P().tabel.length - 1) { state.idx++; update(); } });
  els.tbody.addEventListener("click", function (e) {
    var tr = e.target.closest("tr[data-i]");
    if (tr) { state.idx = Number(tr.getAttribute("data-i")); update(); }
  });

  state.produk = null;
  renderTabs();
  selectProduk(urutan()[0]);

  $$("[data-range]").forEach(function (el) {
    var p = C.produk[el.getAttribute("data-range")];
    if (p) el.textContent = "Rp " + juta(p.tabel[0][0]) + " – Rp " + juta(p.tabel[p.tabel.length - 1][0]);
  });
})();
