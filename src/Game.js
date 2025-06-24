import React, { useRef, useEffect, useState} from 'react';
import xwingImg from './assets/xwing.png';
import asteroidImg from './assets/asteroid.png';
import silverRingImg from './assets/silverRing.png';
import goldRingImg from './assets/goldRing.png';

const Game = () => {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(true);
    const keys = useRef({});
    const player = useRef({
        x: 50,
        y: 200,
        width: 40,
        height: 30,
        speed: 5
    });
    const background = useRef({ x: 0 }); // <- Mova para cá
    const playerImage = useRef(null);
    const asteroidImage = useRef(null);
    const asteroids = useRef([]);
    const bullets = useRef([]);
    const [health, setHealth] = useState(100);
    const healthRef = useRef(100);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const goldRings = useRef([]);
    const silverRings = useRef([]);
    const goldRingImage = useRef(null);
    const silverRingImage = useRef(null);
    const [barWidth, setBarWidth] = useState(200);
    const [goldCount, setGoldCount] = useState(0);
    const goldCountRef = useRef(0);

    const shoot = () => {
        bullets.current.push({
            x: player.current.x + player.current.width,
            y: player.current.y + player.current.height / 2 - 2,
            width: 10,
            height: 4,
            dx: 5,
            dy: 0
        });
    };

    if (Math.random() < 0.01) {
        goldRings.current.push({ x: 800, y: Math.random() * 480, width: 35, height: 35, value: 20 });
    }
    if (Math.random() < 0.02) {
        silverRings.current.push({ x: 800, y: Math.random() * 480, width: 35, height: 35, value: 10 });
    }

    // Handle key presses
    useEffect(() => {
        playerImage.current = new Image();
        playerImage.current.src = xwingImg;
        asteroidImage.current = new Image();
        asteroidImage.current.src = asteroidImg;
        goldRingImage.current = new Image();
        goldRingImage.current.src = goldRingImg;
        silverRingImage.current = new Image();
        silverRingImage.current.src = silverRingImg;

        asteroids.current = Array(5).fill(0).map(() => ({
            x: 800 + Math.random() * 400, // começam fora da tela à direita
            y: Math.random() * (500 - 40), // altura do canvas - altura do obstáculo
            width: 30 + Math.random() * 40,
            height: 30 + Math.random() * 40,
            speed: 2 + Math.random(),
            hits: 4,
            flashTimer: 0
        }));
        
        const handleKeyDown = (e) => {
            keys.current[e.code] = true;
            if(e.code === 'Space') {
                shoot();
            }
        };
        const handleKeyUp = (e) => keys.current[e.code] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const drawBackground = () => {
        ctx.fillStyle = '#001020';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            let starX = (i * 20 + background.current.x) % canvas.width;
            let starY = (i * 30) % canvas.height;
            ctx.fillRect(starX, starY, 2, 2);
        }
    };

    const updateBackground = () => {
        background.current.x -= 1;
        if (background.current.x < 0) background.current.x += canvas.width;
    };

    const drawPlayer = () => {
        const img = playerImage.current;
        if (img && img.complete) {
            ctx.drawImage(img, player.current.x, player.current.y, player.current.width, player.current.height);
        } else {
            // fallback para quando a imagem não carregar rápido, desenha triângulo
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(player.current.x, player.current.y + player.current.height / 2);
            ctx.lineTo(player.current.x + player.current.width, player.current.y);
            ctx.lineTo(player.current.x + player.current.width, player.current.y + player.current.height);
            ctx.closePath();
            ctx.fill();
        }
    };

    const updateAsteroids = () => {
        asteroids.current.forEach(ob => {
            ob.x -= ob.speed;
            if (ob.x + ob.width < 0) {
            // reposiciona do lado direito com nova altura e velocidade
                ob.x = 800 + Math.random() * 400;
                ob.y = Math.random() * (500 - ob.height);
                ob.width = 30 + Math.random() * 40;
                ob.height = 30 + Math.random() * 40;
                ob.speed = 2 + Math.random();
                ob.hits = 4;
                ob.flashTimer = 0;
            }
            if (ob.flashTimer > 0) ob.flashTimer--;
        });
    };

    const drawAsteroids = () => {
        const img = asteroidImage.current;
        asteroids.current.forEach(ob => {
            if (ob.flashTimer > 0) {
                ctx.fillStyle = 'red';
                ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            } else if (img && img.complete) {
                ctx.drawImage(img, ob.x, ob.y, ob.width, ob.height);
            } else {
                ctx.fillStyle = 'gray';
                ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            }
        });
    };

    const drawGoldRings = () => {
        const img = goldRingImage.current;
        goldRings.current.forEach(ring => {
            if (img && img.complete) {
            ctx.drawImage(img, ring.x, ring.y, ring.width, ring.height);
            } else {
            // fallback: desenhar círculo amarelo
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(ring.x + ring.width/2, ring.y + ring.height/2, ring.width/2, 0, Math.PI * 2);
            ctx.fill();
            }
        });
    };
      
    const drawSilverRings = () => {
        const img = silverRingImage.current;
        silverRings.current.forEach(ring => {
        if (img && img.complete) {
            ctx.drawImage(img, ring.x, ring.y, ring.width, ring.height);
        } else {
            // fallback: desenhar círculo cinza claro
            ctx.fillStyle = 'silver';
            ctx.beginPath();
            ctx.arc(ring.x + ring.width/2, ring.y + ring.height/2, ring.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
        });
    };

    const updateRings = () => {
        const moveAndFilter = (ringsRef) => {
          for (let i = ringsRef.current.length - 1; i >= 0; i--) {
            const ring = ringsRef.current[i];
            ring.x -= 2; // velocidade fixa (pode ajustar)
      
            // Remove se sair da tela
            if (ring.x + ring.width < 0) {
              ringsRef.current.splice(i, 1);
            }
          }
        };
      
        moveAndFilter(goldRings);
        moveAndFilter(silverRings);
    };

    function updateBullets() {
        for (let i = bullets.current.length - 1; i >= 0; i--) {
            const bullet = bullets.current[i];
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            for (let j = asteroids.current.length - 1; j >= 0; j--) {
                const asteroid = asteroids.current[j];
                
                if (
                    bullet.x < asteroid.x + asteroid.width &&
                    bullet.x + bullet.width > asteroid.x &&
                    bullet.y < asteroid.y + asteroid.height &&
                    bullet.y + bullet.height > asteroid.y
                ) {
                    bullets.current.splice(i, 1);
                    asteroid.hits -= 1;
                    if (asteroid.hits <= 0) {
                        scoreRef.current += 100;
                        setScore(scoreRef.current); // +100 pontos por asteroide
                        // Reposiciona o asteroide
                        asteroid.x = 800 + Math.random() * 400;
                        asteroid.y = Math.random() * (500 - asteroid.height);
                        asteroid.width = 30 + Math.random() * 40;
                        asteroid.height = 30 + Math.random() * 40;
                        asteroid.speed = 2 + Math.random();
                        asteroid.hits = 3;
                        asteroid.flashTimer = 0;
                    }                  
                    asteroid.flashTimer = 5;
                    console.log("Asteroide atingido! Hits restantes: ", asteroid.hits);
                    break;
                };
            }

            if (bullet.x > 800) {
                bullets.current.splice(i, 1);
            }
        }
    };

    const drawBullets = () => {
        ctx.fillStyle = 'lightgreen';
        bullets.current.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    };

    const update = () => {
        if (keys.current['KeyW'] && player.current.y > 0) player.current.y -= player.current.speed;
        if (keys.current['KeyS'] && player.current.y + player.current.height < canvas.height) player.current.y += player.current.speed;
    };

    function expandBar() {
        let final = barWidth + 50;
        const anim = setInterval(() => {
          setBarWidth(prev => {
            if (prev >= final) {
              clearInterval(anim);
              return final;
            }
            return prev + 5;
          });
        }, 16);
      }

    function loop() {
        if (healthRef.current <= 0) {
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText("Game Over", 300, 250);
            return; // Para o loop
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateBackground();
        drawBackground();

        updateAsteroids();
        updateRings();
        drawAsteroids();

        update();
        drawPlayer();

        updateBullets();
        drawBullets();

        drawGoldRings();
        drawSilverRings();


        // Verifica colisão entre player e asteroides
        asteroids.current.forEach(ob => {
            if (
                player.current.x < ob.x + ob.width &&
                player.current.x + player.current.width > ob.x &&
                player.current.y < ob.y + ob.height &&
                player.current.y + player.current.height > ob.y
            ) {
                //Reduz vida se colidir e reposiciona asteroide
                healthRef.current = Math.max(healthRef.current - 10, 0);
                setHealth(healthRef.current);

                ob.x = 800 + Math.random() * 400;
                ob.y = Math.random() * (500 - ob.height);
                ob.width = 30 + Math.random() * 40;
                ob.height = 30 + Math.random() * 40;
                ob.speed = 2 + Math.random();
                ob.hits = 3;
                ob.flashTimer = 0;
            }
        });

        [goldRings.current, silverRings.current].forEach((arr, i) => {
            arr.forEach((ring, idx) => {
              if (
                player.current.x < ring.x + ring.width &&
                player.current.x + player.current.width > ring.x &&
                player.current.y < ring.y + ring.height &&
                player.current.y + player.current.height > ring.y
              ) {
                // Recupera vida
                healthRef.current = Math.min(healthRef.current + ring.value, 100);
                setHealth(healthRef.current);
                // Remover anel
                arr.splice(idx, 1);
                // Se for ouro, conte em um ref:
                if (i === 0) goldCountRef.current++;
                setGoldCount(goldCountRef.current);
                // Se tiver 3 anéis de ouro, expande barra:
                if (goldCountRef.current >= 3) {
                  expandBar();
                  goldCountRef.current = 0;
                  setGoldCount(0);
                }
              }
            });
          });

        requestAnimationFrame(loop);

        // Desenhar a barra de vida
        ctx.fillStyle = 'gray';
        ctx.fillRect(20, 20, 200, 20); // Barra de fundo

        const lifeGrad = ctx.createLinearGradient(20, 20, 220, 20);
        lifeGrad.addColorStop(0, 'red');
        lifeGrad.addColorStop(0.5, 'yellow');
        lifeGrad.addColorStop(1, 'limegreen');
        ctx.fillStyle = lifeGrad;
        ctx.fillRect(20, 20, 2 * healthRef.current, 20);
        ctx.fillRect(20, 20, 2 * healthRef.current, 20); // Vida (2px por unidade)

        ctx.strokeStyle = 'white';
        ctx.strokeRect(20, 20, barWidth, 20);
        ctx.fillRect(20, 20, (barWidth/100) * healthRef.current, 20);


        // Texto de pontuação
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(`${scoreRef.current}`, 20, 70);

    }

    loop();
    }, [isRunning]);

    return (
    <div style={{ backgroundColor: 'black', height: '100vh'}}>
        <canvas
            ref={canvasRef}
            width={800}
            height={500}
            style={{ border : '2px solid white', display: 'block', margin: '0 auto', backgroundColor: 'black'}}
        />
    </div>
    );
}

export default Game;