gsap.registerPlugin(MotionPathPlugin);

window.addEventListener("load", () => {

  const loader = document.getElementById("pageLoader");
  const newspaper = document.getElementById("animatedNewspaper");
  const coffee = document.getElementById("animatedCoffee");
  const animatedContainer = document.getElementById("animatedLogoContainer");
  const realLogo = document.querySelector(".logo-img");
  const masthead = document.querySelector(".masthead");

  // Hide real logo initially
  realLogo.style.opacity = "0";

  /* -------------------------------
     1. Center position (above masthead)
  -------------------------------- */
  const mastRect = masthead.getBoundingClientRect();
  const centerX = mastRect.left + mastRect.width / 2;
  const centerY = mastRect.top - 120;

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
    top: centerY,
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
    duration: 0.4
  });

  /* -------------------------------
     5. Fly to navbar logo position
        Move the ICONS themselves, not the whole container.
        This keeps them full-size until they reach the target,
        then scale them down as they arrive.
  -------------------------------- */
  const logoRect = realLogo.getBoundingClientRect();

  // Where the icons need to END UP (absolute screen position)
  const destX = logoRect.left + logoRect.width  / 2 - centerX;
  const destY = logoRect.top  + logoRect.height / 2 - centerY;

  // How much smaller the logo is vs the icons (so they shrink to fit)
  const targetScale = Math.min(logoRect.width, logoRect.height) / 80; // ~80px assumed icon natural size

  tl.to([newspaper, coffee], {
    duration: 0.9,
    x: destX,
    y: destY,
    scale: targetScale,
    ease: "power3.inOut",
    stagger: 0.05   // slight stagger so they don't perfectly overlap mid-flight
  })

  /* -------------------------------
     6. Arrival flash + real logo reveal
        Icons pulse bright → fade out while the real logo fades in simultaneously
  -------------------------------- */
  .to([newspaper, coffee], {
    duration: 0.15,
    filter: "brightness(3) drop-shadow(0 0 12px #fff)",
    ease: "power1.in"
  })
  .to(realLogo, {
    opacity: 1,
    duration: 0.25,
    ease: "power2.out"
  }, "<")                           // starts at same time as the flash
  .to([newspaper, coffee], {
    opacity: 0,
    scale: targetScale * 1.3,       // tiny overshoot bloom before vanishing
    duration: 0.25,
    ease: "power2.in",
    onComplete: () => {
      loader.style.display = "none";
      animatedContainer.remove();
    }
  }, "<+0.1");                      // starts just 0.1s after flash + logo-reveal begin

});
