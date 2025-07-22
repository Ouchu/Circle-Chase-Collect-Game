document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Get references to the new sound effect elements
    const startGameSound = document.getElementById('startGameSound');
    const collectSound = document.getElementById('collectSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const levelUpSound = document.getElementById('levelUpSound');

    // Add a display for the current level
    const levelDisplay = document.getElementById('level') || (() => {
        const el = document.createElement('p');
        el.id = 'level';
        el.innerHTML = 'Level: <span id="current-level">1</span>';
        document.getElementById('game-info').appendChild(el);
        return el;
    })();

    // Game variables
    let score = 0;
    let lives = 3;
    let level = 1; // Starting level
    let gameActive = false; // Is the game currently running?
    const SCORE_PER_LEVEL = 100; // How many points (items) to reach for a new level

    // Player (Green Circle)
    const player = {
        x: gameCanvas.width / 2,
        y: gameCanvas.height - 50,
        radius: 15,
        color: 'green',
    };

    // Collectibles (Blue Circles)
    let collectibles = [];
    const COLLECTIBLE_RADIUS = 10;
    const COLLECTIBLE_COUNT = 5; // How many blue items to show at once

    // Enemy (Red Circle)
    const enemy = {
        x: gameCanvas.width / 2,
        y: 50,
        radius: 20,
        color: 'red',
        speed: 2 // Initial speed
    };

    // Function to draw a circle
    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    // Function to generate a random position for collectibles
    function getRandomPosition() {
        return {
            x: Math.random() * (gameCanvas.width - COLLECTIBLE_RADIUS * 2) + COLLECTIBLE_RADIUS,
            y: Math.random() * (gameCanvas.height / 2 - COLLECTIBLE_RADIUS * 2) + COLLECTIBLE_RADIUS // Spawn in upper half
        };
    }

    // Initialize collectibles
    function initializeCollectibles() {
        collectibles = [];
        for (let i = 0; i < COLLECTIBLE_COUNT; i++) {
            collectibles.push({ ...getRandomPosition(), radius: COLLECTIBLE_RADIUS, color: 'blue' });
        }
    }

    // Function to draw all game elements
    function drawGame() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Clear canvas

        // Draw player
        drawCircle(player.x, player.y, player.radius, player.color);

        // Draw collectibles
        collectibles.forEach(c => {
            drawCircle(c.x, c.y, c.radius, c.color);
        });

        // Draw enemy
        drawCircle(enemy.x, enemy.y, enemy.radius, enemy.color);
    }

    // --- Collision Detection Function ---
    function checkCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }

    // --- Update Game State (Movement, Collisions, and Leveling) ---
    function updateGame() {
        if (!gameActive) return;

        // Enemy movement: chase the player
        const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angleToPlayer) * enemy.speed;
        enemy.y += Math.sin(angleToPlayer) * enemy.speed;

        // Keep enemy within canvas bounds (optional, but good)
        enemy.x = Math.max(enemy.radius, Math.min(gameCanvas.width - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(gameCanvas.height - enemy.radius, enemy.y));

        // Check for player-collectible collision
        for (let i = collectibles.length - 1; i >= 0; i--) {
            if (checkCollision(player, collectibles[i])) {
                score++;
                scoreDisplay.textContent = score;
                collectibles.splice(i, 1); // Remove collected item
                collectibles.push({ ...getRandomPosition(), radius: COLLECTIBLE_RADIUS, color: 'blue' }); // Add a new collectible

                collectSound.play().catch(e => console.error("Collect sound error:", e)); // Play collect sound

                // --- Level Up Logic ---
                if (score > 0 && score % SCORE_PER_LEVEL === 0) {
                    level++;
                    document.getElementById('current-level').textContent = level;
                    enemy.speed += 0.5; // Increase enemy speed
                    levelUpSound.play().catch(e => console.error("Level up sound error:", e)); // Play level up sound
                    alert(`Level Up! You are now Level ${level}! Enemy speed increased!`); // Notify player
                    console.log(`Level Up! Current Level: ${level}, Enemy Speed: ${enemy.speed}`);
                }
            }
        }

        // Check for player-enemy collision
        if (checkCollision(player, enemy)) {
            lives--;
            livesDisplay.textContent = lives;
            // Reset player and enemy position after hit
            player.x = gameCanvas.width / 2;
            player.y = gameCanvas.height - 50;
            enemy.x = gameCanvas.width / 2;
            enemy.y = 50;

            if (lives <= 0) {
                endGame();
            }
        }
    }

    // Function to start the game
    function startGame() {
        if (gameActive) return; // Prevent multiple starts

        score = 0;
        lives = 3;
        level = 1; // Reset level
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        document.getElementById('current-level').textContent = level; // Update level display
        enemy.speed = 2; // Reset enemy speed for new game

        gameActive = true;
        startButton.style.display = 'none'; // Hide the start button

        // Reset player and enemy positions
        player.x = gameCanvas.width / 2;
        player.y = gameCanvas.height - 50;
        enemy.x = gameCanvas.width / 2;
        enemy.y = 50;

        initializeCollectibles(); // Place new collectibles

        // Play sounds
        backgroundMusic.play().catch(error => {
            console.error("Error playing background music:", error);
        });
        startGameSound.play().catch(error => {
            console.error("Error playing start game sound:", error);
        });

        gameLoop(); // Start drawing and updating game
    }

    // Function to end the game
    function endGame() {
        gameActive = false;
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Rewind music
        gameOverSound.play().catch(e => console.error("Game over sound error:", e)); // Play game over sound

        alert(`Game Over! Your score: ${score}`);
        startButton.style.display = 'block'; // Show start button again
    }

    // Main game loop
    function gameLoop() {
        if (!gameActive) return;

        updateGame(); // Update game state (movement, collisions, etc.)
        drawGame();   // Redraw everything based on updated state

        requestAnimationFrame(gameLoop); // Keep looping for smooth animation
    }

    // --- Event Listeners for Player Movement (Mouse/Touch) ---
    gameCanvas.addEventListener('mousemove', (event) => {
        if (!gameActive) return;
        const rect = gameCanvas.getBoundingClientRect();
        player.x = event.clientX - rect.left;
        player.y = event.clientY - rect.top;

        // Keep player within canvas bounds
        player.x = Math.max(player.radius, Math.min(gameCanvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(gameCanvas.height - player.radius, player.y));
    });

    gameCanvas.addEventListener('touchmove', (event) => {
        if (!gameActive) return;
        event.preventDefault(); // Prevent scrolling
        const rect = gameCanvas.getBoundingClientRect();
        const touch = event.touches[0]; // Get the first touch
        if (touch) {
            player.x = touch.clientX - rect.left;
            player.y = touch.clientY - rect.top;

            // Keep player within canvas bounds
            player.x = Math.max(player.radius, Math.min(gameCanvas.width - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(gameCanvas.height - player.radius, player.y));
        }
    }, { passive: false }); // Use passive: false to allow preventDefault

    // Event listener for the start button
    startButton.addEventListener('click', startGame);

    // Initial drawing of the game state (before game starts)
    drawGame();
});
