document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // --- YOUR ACTUAL AdMob Constants (Rewarded Ad Unit ID removed) ---
    const APP_ID = 'ca-app-pub-3489418943335991~3495677200';
    const BANNER_AD_UNIT_ID = 'ca-app-pub-3489418943335991/6575290201';
    const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-3489418943335991/9707013710';
    // REWARDED_AD_UNIT_ID and rewardedAd variable are removed

    // --- AdMob Variables ---
    let interstitialAd = null;
    // rewardedAd variable is removed

    // --- Game variables ---
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameActive = false;
    const SCORE_PER_LEVEL = 500;

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
    const COLLECTIBLE_COUNT = 5;

    // Enemy (Red Circle)
    const enemy = {
        x: gameCanvas.width / 2,
        y: 50,
        radius: 20,
        color: 'red',
        speed: 2
    };

    // --- Game Functions ---
    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    function getRandomPosition() {
        return {
            x: Math.random() * (gameCanvas.width - COLLECTIBLE_RADIUS * 2) + COLLECTIBLE_RADIUS,
            y: Math.random() * (gameCanvas.height / 2 - COLLECTIBLE_RADIUS * 2) + COLLECTIBLE_RADIUS
        };
    }

    function initializeCollectibles() {
        collectibles = [];
        for (let i = 0; i < COLLECTIBLE_COUNT; i++) {
            collectibles.push({ ...getRandomPosition(), radius: COLLECTIBLE_RADIUS, color: 'blue' });
        }
    }

    function drawGame() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawCircle(player.x, player.y, player.radius, player.color);
        collectibles.forEach(c => {
            drawCircle(c.x, c.y, c.radius, c.color);
        });
        drawCircle(enemy.x, enemy.y, enemy.radius, enemy.color);
    }

    function checkCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }

    function updateGame() {
        if (!gameActive) return;

        const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angleToPlayer) * enemy.speed;
        enemy.y += Math.sin(angleToPlayer) * enemy.speed;

        enemy.x = Math.max(enemy.radius, Math.min(gameCanvas.width - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(gameCanvas.height - enemy.radius, enemy.y));

        for (let i = collectibles.length - 1; i >= 0; i--) {
            if (checkCollision(player, collectibles[i])) {
                score++;
                scoreDisplay.textContent = score;
                collectibles.splice(i, 1);
                collectibles.push({ ...getRandomPosition(), radius: COLLECTIBLE_RADIUS, color: 'blue' });

                if (score > 0 && score % SCORE_PER_LEVEL === 0) {
                    level++;
                    document.getElementById('current-level').textContent = level;
                    enemy.speed += 0.5;
                    alert(`Level Up! You are now Level ${level}! Enemy speed increased!`);
                    console.log(`Level Up! Current Level: ${level}, Enemy Speed: ${enemy.speed}`);
                }
            }
        }

        if (checkCollision(player, enemy)) {
            lives--;
            livesDisplay.textContent = lives;
            player.x = gameCanvas.width / 2;
            player.y = gameCanvas.height - 50;
            enemy.x = gameCanvas.width / 2;
            enemy.y = 50;

            if (lives <= 0) {
                endGame();
            }
        }
    }

    function startGame() {
        if (gameActive) return;

        score = 0;
        lives = 3;
        level = 1;
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        document.getElementById('current-level').textContent = level;
        enemy.speed = 2;

        gameActive = true;
        startButton.style.display = 'none'; // Hide start button when game begins

        player.x = gameCanvas.width / 2;
        player.y = gameCanvas.height - 50;
        enemy.x = gameCanvas.width / 2;
        enemy.y = 50;

        initializeCollectibles();

        backgroundMusic.play().catch(error => {
            console.error("Error playing music:", error);
        });

        // Rewarded ad loading call is removed
        loadInterstitialAd(); // Pre-load interstitial ad
        gameLoop();
    }

    function endGame() {
        gameActive = false;
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        alert(`Game Over! Your score: ${score}`);
        startButton.style.display = 'block'; // Show start button again
        // Rewarded ad button hide call is removed

        showInterstitialAd(); // Show interstitial ad
    }

    function gameLoop() {
        if (!gameActive) return;

        updateGame();
        drawGame();

        requestAnimationFrame(gameLoop);
    }

    // --- Event Listeners for Player Movement (Mouse/Touch) ---
    gameCanvas.addEventListener('mousemove', (event) => {
        if (!gameActive) return;
        const rect = gameCanvas.getBoundingClientRect();
        player.x = event.clientX - rect.left;
        player.y = event.clientY - rect.top;

        player.x = Math.max(player.radius, Math.min(gameCanvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(gameCanvas.height - player.radius, player.y));
    });

    gameCanvas.addEventListener('touchmove', (event) => {
        if (!gameActive) return;
        event.preventDefault();
        const rect = gameCanvas.getBoundingClientRect();
        const touch = event.touches[0];
        if (touch) {
            player.x = touch.clientX - rect.left;
            player.y = touch.clientY - rect.top;

            player.x = Math.max(player.radius, Math.min(gameCanvas.width - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(gameCanvas.height - player.radius, player.y));
        }
    }, { passive: false });

    // Event listener for the start button
    startButton.addEventListener('click', startGame);

    // Initial drawing of the game state (before game starts)
    drawGame();

    // --- AdMob Integration Functions (Rewarded Ad functions are removed) ---

    // Function to load and show a banner ad
    function loadBannerAd() {
        if (typeof adsbygoogle !== 'undefined' && adsbygoogle.length > 0) {
            let ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'inline-block';
            ins.style.width = '320px'; // Match your container width
            ins.style.height = '50px'; // Match your container height
            ins.setAttribute('data-ad-client', APP_ID); // Your App ID
            ins.setAttribute('data-ad-slot', BANNER_AD_UNIT_ID);

            const bannerContainer = document.getElementById('banner-ad-container');
            if(bannerContainer) {
                bannerContainer.innerHTML = '';
                bannerContainer.appendChild(ins);
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Banner ad requested.");
            } else {
                console.error("Banner ad container not found!");
            }
        } else {
            console.log("AdMob SDK not loaded or ready for banner.");
        }
    }

    // Interstitial Ad Logic
    function loadInterstitialAd() {
        if (typeof googletag !== 'undefined' && googletag.cmd) {
            googletag.cmd.push(function() {
                if (!googletag.pubads().getSlots().find(s => s.getAdUnitPath() === '/' + APP_ID.split('~')[0] + '/' + INTERSTITIAL_AD_UNIT_ID.split('/')[1])) {
                    interstitialAd = googletag.defineOutOfPageSlot(INTERSTITIAL_AD_UNIT_ID, googletag.enums.OutOfPageFormat.INTERSTITIAL);
                    if (interstitialAd) {
                        interstitialAd.addService(googletag.pubads());
                        googletag.pubads().enableSingleRequest();
                        googletag.enableServices();
                        console.log("Interstitial ad defined.");
                    } else {
                        console.error("Failed to define interstitial ad slot.");
                    }
                } else {
                    console.log("Interstitial ad slot already defined.");
                }
            });
        } else {
            console.log("Google Tag (GPT) not loaded or ready for interstitial.");
        }
    }

    function showInterstitialAd() {
        if (typeof googletag !== 'undefined' && googletag.cmd) {
            googletag.cmd.push(function() {
                if (interstitialAd) {
                    googletag.display(interstitialAd);
                    console.log("Interstitial ad displayed.");
                    loadInterstitialAd(); // Load new interstitial for next use
                } else {
                    console.log("Interstitial ad not ready. Attempting to load.");
                    loadInterstitialAd(); // Try loading it if not ready
                }
            });
        }
    }

    // Rewarded Ad related code (watchAdButton, loadRewardedAd, showRewardedAd) is removed

    // Initial load for banner ad (can be shown always)
    loadBannerAd();
});
