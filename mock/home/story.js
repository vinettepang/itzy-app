(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const lines = gsap.utils.toArray(".story__line");
  const dotsContainer = document.getElementById("story-dots");
  const counter = document.getElementById("story-counter");
  const total = lines.length;
  const pad = (n) => String(n).padStart(2, "0");

  /* Build progress dots */
  lines.forEach(function (_, i) {
    const dot = document.createElement("span");
    dot.className = "story__dot" + (i === 0 ? " is-active" : "");
    dot.dataset.index = String(i);
    dotsContainer.appendChild(dot);
  });
  const dots = gsap.utils.toArray(".story__dot");

  function setActiveDot(index) {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
    counter.textContent = pad(index + 1) + " / " + pad(total);
  }

  /* Initial state — only first line visible */
  gsap.set(lines[0], { y: 0, opacity: 1, visibility: "visible" });
  lines.slice(1).forEach(function (line) {
    gsap.set(line, { y: 72, opacity: 0, visibility: "hidden" });
  });
  lines[0].classList.add("is-initial");

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut", duration: 1 },
    scrollTrigger: {
      trigger: "#story",
      pin: ".story__pin",
      start: "top top",
      end: function () {
        return "+=" + (total - 1) * window.innerHeight;
      },
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        const idx = Math.min(
          total - 1,
          Math.round(self.progress * (total - 1))
        );
        setActiveDot(idx);
      },
    },
  });

  /*
   * Each segment: outgoing line moves up + fades out,
   * incoming line rises from below + fades in.
   * Only one line active at peak of each segment.
   */
  lines.forEach(function (line, i) {
    if (i === 0) return;

    const prev = lines[i - 1];
    const t = i;

    tl.to(
      prev,
      {
        y: -56,
        opacity: 0,
        visibility: "hidden",
        duration: 1,
        ease: "power2.in",
      },
      t
    ).fromTo(
      line,
      {
        y: 72,
        opacity: 0,
        visibility: "visible",
      },
      {
        y: 0,
        opacity: 1,
        visibility: "visible",
        duration: 1,
        ease: "power2.out",
      },
      t
    );
  });

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
