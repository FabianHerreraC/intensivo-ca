/* Inmersivo en Cognición Aumentada — reveal al entrar en viewport. */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- Efecto de lupa sobre el título azul del hero ---- */
  const heroGlyph = document.querySelector(".glyph--hero");
  if (heroGlyph && fine && !reduce) {
    const R = 75;   // radio de la lente (mitad de su tamaño en CSS)
    const Z = 1.9;  // factor de aumento
    const sourceHTML = heroGlyph.innerHTML;

    const loupe = document.createElement("div");
    loupe.className = "loupe";
    const inner = document.createElement("div");
    inner.className = "glyph glyph--hero glyph--c9 loupe__inner is-in";
    inner.innerHTML = sourceHTML;
    loupe.appendChild(inner);
    heroGlyph.appendChild(loupe);

    const fit = () => { inner.style.width = heroGlyph.offsetWidth + "px"; };

    heroGlyph.addEventListener("pointerenter", () => {
      fit();
      loupe.classList.add("is-on");
    });
    heroGlyph.addEventListener("pointerleave", () => {
      loupe.classList.remove("is-on");
    });
    heroGlyph.addEventListener("pointermove", (e) => {
      const rect = heroGlyph.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      loupe.style.left = mx - R + "px";
      loupe.style.top = my - R + "px";
      inner.style.transform =
        "translate(" + (R - mx * Z) + "px," + (R - my * Z) + "px) scale(" + Z + ")";
    });
    window.addEventListener("resize", fit);
  }

  /* ---- Deriva horizontal ligada al scroll: DESARMAR → derecha, CREAR → izquierda ---- */
  const movements = document.querySelector(".movements");
  const driftR = document.querySelector('[data-drift="right"]');
  const driftL = document.querySelector('[data-drift="left"]');
  if (movements && driftR && driftL && !reduce) {
    let ticking = false;

    const update = () => {
      ticking = false;
      // sin deriva en móvil: los bloques se saldrían de pantalla
      const MAX = window.innerWidth <= 720 ? 0 : 140;
      if (MAX === 0) {
        driftR.style.transform = "";
        driftL.style.transform = "";
        return;
      }
      const rect = movements.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progreso 0 → 1 a medida que la sección cruza la ventana al bajar
      const p = (vh - rect.top) / (vh + rect.height);
      const x = Math.max(0, Math.min(1, p)) * MAX;
      driftR.style.transform = "translateX(" + x + "px)";
      driftL.style.transform = "translateX(" + -x + "px)";
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  const revealables = document.querySelectorAll("[data-reveal]");

  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealables.forEach((el) => io.observe(el));
})();
