const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const restartBtn = document.getElementById('restartBtn');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreTieEl = document.getElementById('scoreTie');
  const cardX = document.getElementById('cardX');
  const cardO = document.getElementById('cardO');
  const spinOverlay = document.getElementById('spinOverlay');
  const wheel = document.getElementById('wheel');
  const wheelFace = document.getElementById('wheelFace');
  const spinText = document.getElementById('spinText');

  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameActive = false;
  let scores = { X: 0, O: 0, Tie: 0 };

  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diagonals
  ];

  function createBoard() {
    boardEl.innerHTML = '';
    board.forEach((_, i) => {
      const cell = document.createElement('button');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.addEventListener('click', handleCellClick);
      boardEl.appendChild(cell);
    });
  }

  function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (!gameActive || board[index] !== '') return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add('filled', 'pop');

    const winInfo = checkWin();
    if (winInfo) {
      handleWin(winInfo);
    } else if (board.every(cell => cell !== '')) {
      handleTie();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateStatus();
    }
  }

  function checkWin() {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], pattern };
      }
    }
    return null;
  }

  function handleWin({ winner, pattern }) {
    gameActive = false;
    scores[winner]++;
    updateScoreboard();
    statusEl.textContent = `🎉 Player ${winner} wins! 🎉`;
    pattern.forEach(i => {
      boardEl.children[i].classList.add('win');
    });
    disableRemainingCells();
    launchConfetti();
  }

  function handleTie() {
    gameActive = false;
    scores.Tie++;
    updateScoreboard();
    statusEl.textContent = "It's a tie! 🤝";
    disableRemainingCells();
  }

  function disableRemainingCells() {
    [...boardEl.children].forEach(cell => cell.classList.add('disabled'));
  }

  function updateStatus(isNewGame) {
    statusEl.textContent = isNewGame
      ? `🎲 Player ${currentPlayer} starts!`
      : `Player ${currentPlayer}'s turn`;
    cardX.classList.toggle('active', currentPlayer === 'X');
    cardO.classList.toggle('active', currentPlayer === 'O');
  }

  function updateScoreboard() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreTieEl.textContent = scores.Tie;
  }

  function pickRandomStarter() {
    return Math.random() < 0.5 ? 'X' : 'O';
  }

  function spinWheelForStarter() {
    board = Array(9).fill('');
    createBoard();
    gameActive = false;
    restartBtn.disabled = true;
    statusEl.textContent = '';

    const finalStarter = pickRandomStarter();
    spinText.textContent = 'Spinning to pick who starts...';
    wheelFace.classList.remove('settle');
    spinOverlay.classList.add('show');
    wheel.classList.add('spinning');

    let flips = 0;
    const totalFlips = 14 + Math.floor(Math.random() * 5);
    let delay = 90;

    function flip() {
      wheelFace.textContent = wheelFace.textContent === 'X' ? 'O' : 'X';
      flips++;
      if (flips < totalFlips) {
        delay += 18; // slow down like a real spin
        setTimeout(flip, delay);
      } else {
        wheelFace.textContent = finalStarter;
        wheel.classList.remove('spinning');
        wheelFace.classList.add('settle');
        spinText.textContent = `Player ${finalStarter} starts! 🎉`;
        setTimeout(() => {
          spinOverlay.classList.remove('show');
          currentPlayer = finalStarter;
          gameActive = true;
          restartBtn.disabled = false;
          updateStatus(true);
        }, 900);
      }
    }
    setTimeout(flip, delay);
  }

  function restartGame() {
    spinWheelForStarter();
  }

  function launchConfetti() {
    const colors = ['#ff8fab', '#ff477e', '#ffd6e8', '#ffb3c6', '#c9184a'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
      piece.style.opacity = Math.random() + 0.3;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3200);
    }
  }

  restartBtn.addEventListener('click', restartGame);

  createBoard();
  spinWheelForStarter();