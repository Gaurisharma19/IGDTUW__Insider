gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader            = document.getElementById("pageLoader");
  const newspaper         = document.getElementById("animatedNewspaper");
  const coffee            = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const realLogo          = document.querySelector(".logo-img");
  const masthead          = document.querySelector(".masthead");

  realLogo.style.opacity = "0";

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

  // Park icons above the "INSIDER" masthead text, not at raw 50% which overlaps it
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

  // STEP 3 — measure live positions here (after layout settles), fly to navbar logo
  tl.add(() => {
    const logoRect  = realLogo.getBoundingClientRect();
    const logoDestX = logoRect.left + logoRect.width  / 2;
    const logoDestY = logoRect.top  + logoRect.height / 2;

    const npRect = newspaper.getBoundingClientRect();
    const cfRect = coffee.getBoundingClientRect();

    const npDeltaX = logoDestX - (npRect.left + npRect.width  / 2);
    const npDeltaY = logoDestY - (npRect.top  + npRect.height / 2);
    const cfDeltaX = logoDestX - (cfRect.left + cfRect.width  / 2);
    const cfDeltaY = logoDestY - (cfRect.top  + cfRect.height / 2);

    const logoSize    = Math.min(logoRect.width, logoRect.height);
    const iconSize    = Math.max(npRect.width, npRect.height);
    const targetScale = Math.max(logoSize / iconSize, 0.08);

    // "+=" increments so we don't fight the existing transform state
    gsap.to(newspaper, {
      duration: 1.2,
      ease: "power3.inOut",
      x: "+=" + npDeltaX,
      y: "+=" + npDeltaY,
      scale: targetScale
    });

    gsap.to(coffee, {
      duration: 1.2,
      ease: "power3.inOut",
      delay: 0.08,
      x: "+=" + cfDeltaX,
      y: "+=" + cfDeltaY,
      scale: targetScale
    });

    // Flash → reveal real logo → fade icons out
    gsap.to([newspaper, coffee], {
      duration: 0.25,
      filter: "brightness(4) drop-shadow(0 0 10px #fff)",
      ease: "power1.in",
      delay: 1.15,
      onComplete: () => {
        gsap.to(realLogo, { opacity: 1, duration: 0.4 });
        gsap.to([newspaper, coffee], {
          opacity: 0,
          duration: 0.35,
          onComplete: finishLoader
        });
      }
    });
  });

  // Clean teardown in the right order to avoid flash of unstyled content
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