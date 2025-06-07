import React, { useRef, useEffect, useState} from 'react';
import xwingImg from './assets/xwing.png';
import asteroidImg from './assets/asteroid.jpg';

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

    // Handle key presses
    useEffect(() => {
        playerImage.current = new Image();
        playerImage.current.src = xwingImg;
        asteroidImage.current = new Image();
        asteroidImage.current.src = asteroidImg;

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
                    asteroid.flashTimer = 5;
                    console.log("Asteroide atingido! Hits restantes: ", asteroid.hits);
                    if (asteroid.hits <= 0) {
                        // Reposiciona como se tivesse saído da tela
                        asteroid.x = 800 + Math.random() * 400;
                        asteroid.y = Math.random() * (500 - asteroid.height);
                        asteroid.width = 30 + Math.random() * 40;
                        asteroid.height = 30 + Math.random() * 40;
                        asteroid.speed = 2 + Math.random();
                        asteroid.hits = 3;
                        asteroid.flashTimer = 0;
                    }
                    break;
                }
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

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateBackground();
        drawBackground();

        updateAsteroids();
        drawAsteroids();

        update();
        drawPlayer();

        updateBullets();
        drawBullets();

        requestAnimationFrame(loop);
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