const game = document.getElementById('game');
const player = document.getElementById('player');
let playerPosition = 280;

let bullets = [];
let invaders = [];
let enemyBullets = [];
let canShoot = true;

window.onload = () => {
  player.style.left = `${playerPosition}px`;
};

document.addEventListener('keydown', movePlayer);
document.addEventListener('mousedown', mouseShoot);

function movePlayer(e) {
  if (e.key === 'ArrowLeft' && playerPosition > 0) {
    playerPosition -= 20;
  } else if (e.key === 'ArrowRight' && playerPosition < 560) {
    playerPosition += 20;
  }
  player.style.left = `${playerPosition}px`;
}

function mouseShoot(e) {
  if (e.button === 0 && canShoot) {
    shoot();
    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 400);
  }
}

function shoot() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = `${playerPosition + 18}px`;
  bullet.style.bottom = '30px';
  game.appendChild(bullet);
  bullets.push(bullet);
}

function shootFromInvader(invader) {
  const bullet = document.createElement('div');
  bullet.classList.add('enemy-bullet');
  bullet.style.left = `${invader.offsetLeft + 14}px`;
  bullet.style.top = `${invader.offsetTop + 20}px`;
  game.appendChild(bullet);
  enemyBullets.push(bullet);
}

function createBarriers() {
  const barrierCount = 4;
  const spacing = 120;

  for (let i = 0; i < barrierCount; i++) {
    const barrier = document.createElement('div');
    barrier.classList.add('barrier');
    barrier.style.left = `${i * spacing + 60}px`;
    barrier.style.bottom = '100px';
    barrier.dataset.hp = '3';
    game.appendChild(barrier);
  }
}

function createInvaders() {
  const rows = 5;
  const cols = 8;
  const spacingX = 60;
  const spacingY = 40;

  const rowClasses = ['green', 'yellow', 'red', 'red'];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const invader = document.createElement('div');
      invader.classList.add('invader', rowClasses[row]);
      invader.style.left = `${col * spacingX + 40}px`;
      invader.style.top = `${row * spacingY + 20}px`;
      game.appendChild(invader);
      invaders.push(invader);
    }
  }

  createBarriers();
}

function createBonusEnemy() {
  const bonus = document.createElement('div');
  bonus.classList.add('bonus');
  bonus.style.left = '-60px';
  bonus.style.top = '10px';
  game.appendChild(bonus);

  let pos = -60;
  const interval = setInterval(() => {
    if (pos > 600) {
      bonus.remove();
      clearInterval(interval);
    } else {
      pos += 2;
      bonus.style.left = `${pos}px`;
    }
  }, 16);
}

setInterval(() => {
  if (Math.random() < 0.3) {
    createBonusEnemy();
  }
}, 10000);

setInterval(() => {
  if (invaders.length > 0) {
    const shooter = invaders[Math.floor(Math.random() * invaders.length)];
    shootFromInvader(shooter);
  }
}, 5000);

function updateGame() {
  bullets.forEach((bullet, i) => {
    let bottom = parseInt(bullet.style.bottom);
    bullet.style.bottom = `${bottom + 5}px`;
    if (bottom > 600) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  });

  enemyBullets.forEach((bullet, i) => {
    let top = parseInt(bullet.style.top);
    bullet.style.top = `${top + 4}px`;
    if (top > 600) {
      bullet.remove();
      enemyBullets.splice(i, 1);
    }
  });

  bullets.forEach((bullet, bIndex) => {
    const bLeft = bullet.offsetLeft;
    const bTop = bullet.offsetTop;
    const bRight = bLeft + bullet.offsetWidth;
    const bBottom = bTop + bullet.offsetHeight;

    invaders.forEach((invader, iIndex) => {
      const iLeft = invader.offsetLeft;
      const iTop = invader.offsetTop;
      const iRight = iLeft + invader.offsetWidth;
      const iBottom = iTop + invader.offsetHeight;

      if (
        bLeft < iRight &&
        bRight > iLeft &&
        bTop < iBottom &&
        bBottom > iTop
      ) {
        invader.remove();
        bullet.remove();
        invaders.splice(iIndex, 1);
        bullets.splice(bIndex, 1);
      }
    });
  });

  document.querySelectorAll('.barrier').forEach((barrier) => {
    const bLeft = barrier.offsetLeft;
    const bBottom = barrier.offsetTop;
    const bRight = bLeft + barrier.offsetWidth;
    const bTop = bBottom + barrier.offsetHeight;

    [...bullets, ...enemyBullets].forEach((bullet, bIndex) => {
      const x = bullet.offsetLeft;
      const y = bullet.offsetTop;

      if (x > bLeft && x < bRight && y > bBottom && y < bTop) {
        bullet.remove();
        const list = bullets.includes(bullet) ? bullets : enemyBullets;
        list.splice(bIndex, 1);

        let hp = parseInt(barrier.dataset.hp);
        hp--;
        if (hp <= 0) {
          barrier.remove();
        } else {
          barrier.dataset.hp = hp.toString();
          barrier.style.opacity = hp === 2 ? '0.6' : '0.3';
        }
      }
    });
  });

  invaders.forEach((invader) => {
    let top = parseInt(invader.style.top);
    invader.style.top = `${top + 0.2}px`;
  });
  requestAnimationFrame(updateGame);
}

let invaderDirection = 1;

function moveInvaders() {
  let shouldMoveDown = false;

  invaders.forEach((invader) => {
    let left = parseInt(invader.style.left);
    invader.style.left = `${left + invaderDirection * 10}px`;
  });

  const rightMost = Math.max(...invaders.map(i => i.offsetLeft + i.offsetWidth));
  const leftMost = Math.min(...invaders.map(i => i.offsetLeft));

  if (rightMost >= 600 || leftMost <= 0) {
    shouldMoveDown = true;
    invaderDirection *= -1;
  }

  if (shouldMoveDown) {
    invaders.forEach((invader) => {
      let top = parseInt(invader.style.top);
      invader.style.top = `${top + 20}px`;
    });
  }
}

setInterval(moveInvaders, 500);

updateGame();


createInvaders();
updateGame();
