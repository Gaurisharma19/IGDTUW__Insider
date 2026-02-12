gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader            = document.getElementById("pageLoader");
  const newspaper         = document.getElementById("animatedNewspaper");
  const coffee            = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const realLogo          = document.querySelector(".logo-img");
  const masthead          = document.querySelector(".masthead");

  // Define mobile breakpoint
  const isMobile = window.innerWidth <= 768;

  // Hide real logo initially
  realLogo.style.opacity = "0";

  /* -------------------------------
     1. Calculate Start Positions
  -------------------------------- */
  let centerX, centerY;
  const mastRect = masthead.getBoundingClientRect();

  if (isMobile) {
    // FIX: On mobile, force strict screen center for horizontal alignment
    centerX = window.innerWidth / 2;
    // Adjust vertical to be slightly above the masthead text
    centerY = mastRect.top - 60; 
  } else {
    // Desktop: Use masthead dimensions
    centerX = mastRect.left + mastRect.width / 2;
    centerY = mastRect.top - 120;
  }

  /* -------------------------------
     2. Full screen container
  -------------------------------- */
  gsap.set(animatedContainer, {
    position: "fixed",
    inset: 0
  });

  /* -------------------------------
     3. Initial positions
  -------------------------------- */
  gsap.set([newspaper, coffee], {
    left: centerX,
    top:  centerY,
    scale: isMobile ? 0.8 : 1.2, // Slightly smaller icons on mobile
    opacity: 0,
    transformOrigin: "center center"
  });

  // Start off-screen
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
  -------------------------------- */
  
  if (isMobile) {

    // On mobile, defer measurement until the last second
    tl.add(() => {

      // Re-measure target (Navbar Logo)
      const logoRect = realLogo.getBoundingClientRect();

      // Get current position of the icons (should be screen center now)
      const iconRect = newspaper.getBoundingClientRect();
      const iconCentreX = iconRect.left + iconRect.width  / 2;
      const iconCentreY = iconRect.top  + iconRect.height / 2;

      const logoCentreX = logoRect.left + logoRect.width  / 2;
      const logoCentreY = logoRect.top  + logoRect.height / 2;

      // Calculate distance to travel
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
              gsap.to(realLogo, { opacity: 1, duration: 0.25, ease: "power2.out" });
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

    // Desktop — Original Logic
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