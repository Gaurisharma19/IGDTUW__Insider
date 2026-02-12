gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader            = document.getElementById("pageLoader");
  const newspaper         = document.getElementById("animatedNewspaper");
  const coffee            = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const realLogo          = document.querySelector(".logo-img");
  const masthead          = document.querySelector(".masthead");

  // Hide real logo initially
  realLogo.style.opacity = "0";

  /* -------------------------------
     1. Center position (above masthead)
  -------------------------------- */
  const mastRect = masthead.getBoundingClientRect();
  const centerX  = mastRect.left + mastRect.width / 2;
  const centerY  = mastRect.top - 120;

  /* -------------------------------
     2. Full screen container
  -------------------------------- */
  gsap.set(animatedContainer, {
    position: "fixed",
    inset: 0
  });

  /* -------------------------------
     3. Initial positions — icons start off-screen left/right
  -------------------------------- */
  gsap.set([newspaper, coffee], {
    left: centerX,
    top:  centerY,
    scale: 1.2,
    opacity: 0,
    transformOrigin: "center center"
  });

  gsap.set(newspaper, { x: -400 });
  gsap.set(coffee,    { x:  400 });

  /* -------------------------------
     4. Timeline
  -------------------------------- */
  const tl = gsap.timeline();

  // Icons fly to center
  tl.to([newspaper, coffee], {
    duration: 1.2,
    x: 0,
    opacity: 1,
    ease: "power3.out"
  });

  // Small bounce
  tl.to([newspaper, coffee], {
    y: "+=10",
    repeat: 1,
    yoyo: true,
    duration: 0.6
  });

  /* -------------------------------
     5. Fly to navbar logo position
        Desktop: use logoRect measured at load time (original behaviour).
        Mobile (≤768px): re-measure just before flight so the hamburger
        navbar layout is fully settled and we get the real logo coords.
  -------------------------------- */
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {

    // On mobile, defer the measurement to inside tl.add()
    tl.add(() => {

      // Re-measure now — navbar is fully painted by this point
      const logoRect  = realLogo.getBoundingClientRect();

      // Icon elements are positioned at (centerX, centerY) from top-left.
      // getBoundingClientRect gives us the icon's current screen position,
      // so we compute how far it needs to travel in screen space.
      const iconRect  = newspaper.getBoundingClientRect();
      const iconCentreX = iconRect.left + iconRect.width  / 2;
      const iconCentreY = iconRect.top  + iconRect.height / 2;

      const logoCentreX = logoRect.left + logoRect.width  / 2;
      const logoCentreY = logoRect.top  + logoRect.height / 2;

      // Delta in screen pixels → GSAP x/y are already in screen px here
      const destX = logoCentreX - iconCentreX;
      const destY = logoCentreY - iconCentreY;

      const targetScale = Math.max(
        Math.min(logoRect.width, logoRect.height) / 80,
        0.1
      );

      gsap.to([newspaper, coffee], {
        duration: 0.9,
        x: "+=" + destX,
        y: "+=" + destY,
        scale: targetScale,
        ease: "power3.inOut",
        stagger: 0.05,
        onComplete: () => {
          gsap.to([newspaper, coffee], {
            duration: 0.15,
            filter: "brightness(3) drop-shadow(0 0 12px #fff)",
            ease: "power1.in",
            onComplete: () => {
              gsap.to(realLogo,          { opacity: 1, duration: 0.25, ease: "power2.out" });
              gsap.to([newspaper, coffee], {
                opacity: 0,
                scale: targetScale * 1.3,
                duration: 0.25,
                delay: 0.1,
                ease: "power2.in",
                onComplete: () => {
                  loader.style.display = "none";
                  animatedContainer.remove();
                }
              });
            }
          });
        }
      });

    });

  } else {

    // Desktop — original behaviour, logoRect measured at load time
    const logoRect    = realLogo.getBoundingClientRect();
    const destX       = logoRect.left + logoRect.width  / 2 - centerX;
    const destY       = logoRect.top  + logoRect.height / 2 - centerY;
    const targetScale = Math.min(logoRect.width, logoRect.height) / 80;

    tl.to([newspaper, coffee], {
      duration: 0.9,
      x: destX,
      y: destY,
      scale: targetScale,
      ease: "power3.inOut",
      stagger: 0.05
    })
    .to([newspaper, coffee], {
      duration: 0.15,
      filter: "brightness(3) drop-shadow(0 0 12px #fff)",
      ease: "power1.in"
    })
    .to(realLogo, {
      opacity: 1,
      duration: 0.25,
      ease: "power2.out"
    }, "<")
    .to([newspaper, coffee], {
      opacity: 0,
      scale: targetScale * 1.3,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        loader.style.display = "none";
        animatedContainer.remove();
      }
    }, "<+0.1");

  }

});