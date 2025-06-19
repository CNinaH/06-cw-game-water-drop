/********************
     * 1. BASIC SET‑UP *
     ********************/
    const canvas = document.getElementById("c");
    const ctx     = canvas.getContext("2d");

    // Responsive canvas sizing
    function resizeCanvas() {
      const gameArea = document.getElementById("gameArea");
      // Get the actual rendered size
      const width = gameArea.clientWidth;
      const height = gameArea.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

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

      // Wider spawn area for horizontal screens
      let minX = 28, maxX = canvas.width - 28;
      if (canvas.width > canvas.height) {
        // Horizontal: allow drops to spawn closer to the full width
        minX = 40;
        maxX = canvas.width - 40;
      }

      drops.push({
        x: Math.random() * (maxX - minX) + minX,
        y: -28,
        r: 25,
        good: good,
        speed: 120,
      });
    }

    /********************************
     * 3. FUNCTION: DRAW A DROP     *
     ********************************/
    function drawDrop(d) {
      ctx.save();
      ctx.translate(d.x, d.y);

      // Draw raindrop shape using Bezier curves
      ctx.beginPath();
      ctx.moveTo(0, -d.r); // top point
      ctx.bezierCurveTo(
        d.r, -d.r * 0.5,   // right control point
        d.r * 0.7, d.r,    // right bottom control
        0, d.r             // bottom point
      );
      ctx.bezierCurveTo(
        -d.r * 0.7, d.r,   // left bottom control
        -d.r, -d.r * 0.5,  // left control point
        0, -d.r            // back to top
      );
      ctx.closePath();

      // Gradient fill for more realism
      const grad = ctx.createLinearGradient(0, -d.r, 0, d.r);
      if (d.good) {
        grad.addColorStop(0, "#b3eaff");
        grad.addColorStop(1, "#19b5ff");
      } else {
        grad.addColorStop(0, "#6bb3c7");
        grad.addColorStop(1, "#2f6f79");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Optional: add a highlight
      ctx.beginPath();
      ctx.ellipse(-d.r * 0.3, -d.r * 0.5, d.r * 0.18, d.r * 0.32, Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();

      ctx.restore();
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

    // Add end screen elements
    let endScreen;
    let endScore;
    let endRestart;
    let confettiParticles = [];
    let confettiActive = false;

    // Create end screen DOM if not present
    function ensureEndScreen() {
      if (!endScreen) {
        endScreen = document.createElement("div");
        endScreen.id = "endScreen";
        endScreen.style.position = "absolute";
        endScreen.style.top = "0";
        endScreen.style.left = "0";
        endScreen.style.right = "0";
        endScreen.style.bottom = "0";
        endScreen.style.width = "100%";
        endScreen.style.height = "100%";
        endScreen.style.background = "rgba(255,255,255,0.97)";
        endScreen.style.display = "flex";
        endScreen.style.flexDirection = "column";
        endScreen.style.justifyContent = "center";
        endScreen.style.alignItems = "center";
        endScreen.style.zIndex = "100";
        endScreen.innerHTML = `
          <h1 id="endTitle" style="color:#8BD1CB;font-size:2.2em;margin-bottom:24px;font-family:Avenir,Proxima Nova,sans-serif;">Time's Up!</h1>
          <div id="endScore" style="font-size:2em;margin-bottom:32px;color:#003366;"></div>
          <button id="endRestart" style="font-size:1.2em;padding:12px 36px;background:#FFC907;color:#003366;border:none;border-radius:6px;font-weight:bold;cursor:pointer;box-shadow:0 2px 8px #1a1a1a;transition:background 0.2s;">Restart</button>
          <canvas id="confettiCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:101;"></canvas>
        `;
        document.getElementById("gameArea").appendChild(endScreen);
        endScore = document.getElementById("endScore");
        endRestart = document.getElementById("endRestart");
        // Restart handler
        endRestart.addEventListener("click", () => {
          endScreen.style.display = "none";
          drops = [];
          score = 0;
          time = 60;
          running = true;
          document.getElementById("score").textContent = score;
          document.getElementById("time").textContent = time;
          document.getElementById("pause").textContent = "Pause";
          document.getElementById("hud").style.visibility = "visible";
          titleScreen.style.display = "none";
          confettiActive = false;
          confettiParticles = [];
        });
      }
    }

    // Confetti effect
    function launchConfetti() {
      confettiParticles = [];
      confettiActive = true;
      const confettiCanvas = document.getElementById("confettiCanvas");
      confettiCanvas.width = canvas.width;
      confettiCanvas.height = canvas.height;
      for (let i = 0; i < 120; i++) {
        confettiParticles.push({
          x: Math.random() * confettiCanvas.width,
          y: Math.random() * -confettiCanvas.height,
          r: Math.random() * 8 + 4,
          d: Math.random() * 360,
          color: `hsl(${Math.random()*360},90%,60%)`,
          tilt: Math.random() * 10 - 5,
          tiltAngle: 0,
          tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
          speed: Math.random() * 2 + 2
        });
      }
      requestAnimationFrame(drawConfetti);
    }

    function drawConfetti() {
      if (!confettiActive) return;
      const confettiCanvas = document.getElementById("confettiCanvas");
      const ctx2 = confettiCanvas.getContext("2d");
      ctx2.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let i = 0; i < confettiParticles.length; i++) {
        let p = confettiParticles[i];
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y, p.r, p.r * 0.4, p.tilt, 0, 2 * Math.PI);
        ctx2.fillStyle = p.color;
        ctx2.fill();
        p.y += p.speed;
        p.x += Math.sin(p.d) * 2;
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 10;
        if (p.y > confettiCanvas.height + 20) {
          p.y = Math.random() * -20;
          p.x = Math.random() * confettiCanvas.width;
        }
      }
      requestAnimationFrame(drawConfetti);
    }

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
            // Show end screen with confetti
            ensureEndScreen();
            endScore.textContent = "Your Score: " + score;
            endScreen.style.display = "flex";
            document.getElementById("hud").style.visibility = "hidden";
            titleScreen.style.display = "none";
            // Launch confetti
            launchConfetti();
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
      document.getElementById("pause").textContent = running ? "Pause" : "Pause";
      if (!running) {
        // Show pause overlay with Resume/Restart
        titleScreen.style.display = "flex";
        document.getElementById("hud").style.visibility = "hidden";
        startBtn.style.display = "none";
        pauseBtns.style.display = "flex";
      }
    });
