gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader            = document.getElementById("pageLoader");
  const newspaper         = document.getElementById("animatedNewspaper");
  const coffee            = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const realLogo          = document.querySelector(".logo-img");
  const masthead          = document.querySelector(".masthead");

  const isMobile = window.innerWidth <= 768;

  // Hide real logo initially
  realLogo.style.opacity = "0";

  /* -------------------------------
     1. Calculate Start Positions
  -------------------------------- */
  let centerX, centerY;
  const mastRect = masthead.getBoundingClientRect();

  if (isMobile) {
    // MOBILE: Force exact center horizontally, slightly higher vertically
    centerX = window.innerWidth / 2;
    centerY = mastRect.top - 160; 
  } else {
    // DESKTOP
    centerX = mastRect.left + mastRect.width / 2;
    centerY = mastRect.top - 120;
  }

  /* -------------------------------
     2. Setup Container
  -------------------------------- */
  gsap.set(animatedContainer, {
    position: "fixed",
    inset: 0,
    zIndex: 9999
  });

  /* -------------------------------
     3. Initial Icon Setup
  -------------------------------- */
  gsap.set([newspaper, coffee], {
    left: centerX,
    top:  centerY,
    scale: isMobile ? 0.9 : 1.2,
    opacity: 0,
    transformOrigin: "center center"
  });

  gsap.set(newspaper, { x: -400 });
  gsap.set(coffee,    { x:  400 });

  /* -------------------------------
     4. Animation Timeline
  -------------------------------- */
  const tl = gsap.timeline();

  // STEP 1: Fly to center (SLOWED DOWN)
  tl.to([newspaper, coffee], {
    duration: 2.0,       // Was 1.2
    x: 0,
    opacity: 1,
    ease: "power3.out"
  });

  // STEP 2: Bounce (SLOWED DOWN)
  tl.to([newspaper, coffee], {
    y: "+=10",
    repeat: 1,
    yoyo: true,
    duration: 1.0        // Was 0.6
  });

  /* -------------------------------
     5. Fly to Navbar Logic
  -------------------------------- */
  
  if (isMobile) {
    // --- MOBILE LOGIC ---
    tl.add(() => {
      // Re-measure positions now that layout is settled
      const startRect = newspaper.getBoundingClientRect();
      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;

      const endRect = realLogo.getBoundingClientRect();
      const endX = endRect.left + endRect.width / 2;
      const endY = endRect.top + endRect.height / 2;

      let destX = endX - startX; 
      let destY = endY - startY;

      // FIX: Nudge left for mobile alignment
      destX = destX - 40; 
      destY = destY + 5;  

      const targetScale = Math.max(
        Math.min(endRect.width, endRect.height) / 80, 0.1
      );

      // STEP 3: Fly to Navbar (SLOWED DOWN)
      gsap.to([newspaper, coffee], {
        duration: 1.5,   // Was 0.9
        x: "+=" + destX,
        y: "+=" + destY,
        scale: targetScale,
        ease: "power3.inOut",
        stagger: 0.1,    // Increased stagger for slower feel
        onComplete: () => {
          // Flash & End
          gsap.to([newspaper, coffee], {
            duration: 0.3, // Was 0.15
            filter: "brightness(3) drop-shadow(0 0 12px #fff)",
            ease: "power1.in",
            onComplete: () => {
              gsap.to(realLogo, { opacity: 1, duration: 0.5 });
              gsap.to([newspaper, coffee], {
                opacity: 0,
                duration: 0.4,
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
    // --- DESKTOP LOGIC ---
    const logoRect    = realLogo.getBoundingClientRect();
    const destX       = logoRect.left + logoRect.width  / 2 - centerX;
    const destY       = logoRect.top  + logoRect.height / 2 - centerY;
    const targetScale = Math.min(logoRect.width, logoRect.height) / 80;

    // STEP 3: Fly to Navbar (SLOWED DOWN)
    tl.to([newspaper, coffee], {
      duration: 1.5,     // Was 0.9
      x: destX,
      y: destY,
      scale: targetScale,
      ease: "power3.inOut",
      stagger: 0.1
    })
    .to([newspaper, coffee], {
      duration: 0.3,     // Was 0.15
      filter: "brightness(3) drop-shadow(0 0 12px #fff)",
      ease: "power1.in"
    })
    .to(realLogo, { opacity: 1, duration: 0.5 }, "<")
    .to([newspaper, coffee], {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        loader.style.display = "none";
        animatedContainer.remove();
      }
    }, "<+0.2");
  }
});