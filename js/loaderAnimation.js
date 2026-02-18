gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader            = document.getElementById("pageLoader");
  const newspaper         = document.getElementById("animatedNewspaper");
  const coffee            = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const masthead          = document.querySelector(".masthead");

  // Full-screen fixed stage — no scroll interference
  gsap.set(animatedContainer, {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    zIndex: 9999,
    pointerEvents: "none"
  });

  const isMobile  = window.innerWidth <= 768;
  const iconScale = isMobile ? 0.75 : 1.1;
  const spread    = isMobile ? Math.min(window.innerWidth * 0.38, 160) : 280;

  const mastRect = masthead ? masthead.getBoundingClientRect() : null;
  const meetX    = window.innerWidth / 2;
  const meetY    = mastRect
    ? mastRect.top - (isMobile ? 90 : 110)
    : window.innerHeight / 2 - 120;

  gsap.set([newspaper, coffee], {
    position: "fixed",
    top:      meetY,
    left:     meetX,
    xPercent: -50,
    yPercent: -50,
    scale:    iconScale,
    opacity:  0,
    transformOrigin: "center center",
    willChange: "transform, opacity"
  });

  gsap.set(newspaper, { x: -spread });
  gsap.set(coffee,    { x:  spread });

  const tl = gsap.timeline();

  // STEP 1 — icons fly to center (above masthead)
  tl.to([newspaper, coffee], {
    duration: 1.6,
    x: 0,
    opacity: 1,
    ease: "power3.out"
  });

  // STEP 2 — small bounce (pixel-based)
  tl.to([newspaper, coffee], {
    y: "+=10",
    repeat: 1,
    yoyo: true,
    duration: 0.45,
    ease: "power1.inOut"
  });

  // STEP 3 — hold briefly, then fade out icons and loader
  tl.to([newspaper, coffee], {
    duration: 0.5,
    opacity: 0,
    ease: "power1.out",
    delay: 0.5,
    onComplete: finishLoader
  });

  // Clean teardown
  function finishLoader() {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: "power1.out",
      onComplete: () => {
        loader.style.display = "none";
        document.body.classList.remove("loading");
        document.body.classList.add("loaded");
        if (animatedContainer.parentNode) animatedContainer.remove();
      }
    });
  }

  // Safety fallback — forces close if GSAP stalls for any reason
  setTimeout(() => {
    if (loader && loader.style.display !== "none") finishLoader();
  }, 8000);

});