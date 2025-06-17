/********************
     * 1. BASIC SET‑UP *
     ********************/
    const canvas = document.getElementById("c");
    const ctx     = canvas.getContext("2d");
    canvas.width  = 360; // fixed size keeps math easy
    canvas.height = 640;

    // game variables
    let drops   = []; // active falling drops
    let score   = 0;
    let time    = 60; // seconds
    let running = false; // start paused

    // Title screen elements
    const titleScreen = document.getElementById("titleScreen");
    const startBtn = document.getElementById("startBtn");
    const pauseBtns = document.getElementById("pauseBtns");
    const resumeBtn = document.getElementById("resumeBtn");
    const restartBtn = document.getElementById("restartBtn");

    // Show title screen at start
    titleScreen.style.display = "flex";
    document.getElementById("hud").style.visibility = "hidden";
    startBtn.style.display = "inline-block";
    pauseBtns.style.display = "none";

    // Start button handler (first time or after game over)
    startBtn.addEventListener("click", () => {
      // Reset game state
      drops = [];
      score = 0;
      time = 60;
      running = true;
      document.getElementById("score").textContent = score;
      document.getElementById("time").textContent = time;
      document.getElementById("pause").textContent = "Pause";
      // Hide title screen, show HUD
      titleScreen.style.display = "none";
      document.getElementById("hud").style.visibility = "visible";
      startBtn.style.display = "inline-block";
      pauseBtns.style.display = "none";
    });

    // Resume button handler
    resumeBtn.addEventListener("click", () => {
      running = true;
      titleScreen.style.display = "none";
      document.getElementById("hud").style.visibility = "visible";
    });

    // Restart button handler (from pause)
    restartBtn.addEventListener("click", () => {
      drops = [];
      score = 0;
      time = 60;
      running = true;
      document.getElementById("score").textContent = score;
      document.getElementById("time").textContent = time;
      document.getElementById("pause").textContent = "Pause";
      titleScreen.style.display = "none";
      document.getElementById("hud").style.visibility = "visible";
    });

    /********************************
     * 2. FUNCTION: CREATE A DROP   *
     ********************************/
    function makeDrop() {
      const good = Math.random() < 0.7; // 70 % chance good
      drops.push({
        x: Math.random() * (canvas.width - 40) + 20, // keep away from edges
        y: -20,
        r: 18,
        good: good,
        speed: 120, // pixels per second
      });
    }

    /********************************
     * 3. FUNCTION: DRAW A DROP     *
     ********************************/
    function drawDrop(d) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.good ? "#19b5ff" : "#2f6f79"; // light / dark blue
      ctx.fill();
    }

    /********************************
     * 4. MAIN ANIMATION LOOP       *
     ********************************/
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000; // seconds since last frame
      last = now;

      if (running) {
        // chance to spawn a new drop every ~0.7 s
        if (Math.random() < dt / 0.7) makeDrop();

        // move drops downward
        drops.forEach((d) => (d.y += d.speed * dt));

        // remove drops once they leave the bottom
        drops = drops.filter((d) => d.y - d.r < canvas.height);
      }

      // draw background & all drops
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(drawDrop);

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /********************************
     * 5. COUNTDOWN TIMER           *
     ********************************/
    setInterval(() => {
      if (running && time > 0) {
        time--;
        document.getElementById("time").textContent = time;
        if (time === 0) {
          running = false;
          setTimeout(() => {
            alert("Time up! Your score: " + score);
            // Show title screen again for replay
            titleScreen.style.display = "flex";
            document.getElementById("hud").style.visibility = "hidden";
            startBtn.style.display = "inline-block";
            pauseBtns.style.display = "none";
          }, 100);
        }
      }
    }, 1000);

    /********************************
     * 6. CLICK HANDLER             *
     ********************************/
    canvas.addEventListener("click", (e) => {
      if (!running) return;

      // translate click coords to canvas space
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // check drops from topmost to bottom
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        const dx = x - d.x;
        const dy = y - d.y;
        if (dx * dx + dy * dy < d.r * d.r) {
          // hit!
          if (d.good) {
            score++;
          } else {
            score = Math.max(0, score - 1);
          }
          document.getElementById("score").textContent = score;
          drops.splice(i, 1); // remove that drop
          break; // stop looking
        }
      }
    });

    /********************************
     * 7. PAUSE BUTTON              *
     ********************************/
    document.getElementById("pause").addEventListener("click", () => {
      if (time === 0) return; // cannot un‑pause after game ends
      running = !running;
      document.getElementById("pause").textContent = running ? "Pause" : "Play";
      if (!running) {
        // Show pause overlay with Resume/Restart
        titleScreen.style.display = "flex";
        document.getElementById("hud").style.visibility = "hidden";
        startBtn.style.display = "none";
        pauseBtns.style.display = "flex";
      }
    });
