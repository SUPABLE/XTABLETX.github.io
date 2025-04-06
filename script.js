let board = [];
let selectedCell = null;
let timerInterval;
let seconds = 0;
let isTimedMode = false;
let playerName = "Oyuncu";
let musicVolume = 50;
let soundVolume = 50;
let gameDifficulty = 'medium';
let gameStarted = false;
const sudokuBoardElement = document.getElementById("sudoku-board");
const startGameButton = document.getElementById("start-game");
const refreshBoardButton = document.getElementById("refresh-board");
const timedModeButton = document.getElementById("timed-mode");
const viewRankingsButton = document.getElementById("view-rankings");
const openSettingsButton = document.getElementById("open-settings");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsModalButton = document.getElementById("close-settings-modal");
const saveSettingsButton = document.getElementById("save-settings");
const cancelSettingsButton = document.getElementById("cancel-settings");
const playerNameInput = document.getElementById("player-name");
const musicVolumeSlider = document.getElementById("music-volume");
const soundVolumeSlider = document.getElementById("sound-volume");
const rankingsModal = document.getElementById("rankings-modal");
const closeRankingsModalButton = document.getElementById("close-rankings-modal");
const rankingList = document.getElementById("ranking-list");
const messageBox = document.getElementById("message-box");
const timerDisplay = document.getElementById("timer-display");
const difficultyButtons = document.querySelectorAll('.difficulty-button');
let rankings = [];
if (localStorage.getItem('rankings')) {
    rankings = JSON.parse(localStorage.getItem('rankings'));
}
const music = {
    volume: musicVolume,
    play: function() {},
    stop: function() {},
};
const soundEffects = {
    volume: soundVolume,
    playClick: function() {},
    playCorrect: function() {},
    playError: function() {},
};
function showMessage(message, duration = 3000) {
    messageBox.textContent = message;
    messageBox.classList.add('show-message');
    setTimeout(() => {
        messageBox.classList.remove('show-message');
    }, duration);
}
function generateSudokuBoard(difficulty) {
    let board = [];
    for (let i = 0; i < 9; i++) {
        board[i] = new Array(9).fill(0);
    }
    function fillRandomNumbers(count) {
        let filled = 0;
        while (filled < count) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            let num = Math.floor(Math.random() * 9) + 1;
            if (board[row][col] === 0 && isValid(board, row, col, num)) {
                board[row][col] = num;
                filled++;
            }
        }
    }
    let cellsToFill = 0;
    switch (difficulty) {
        case 'easy':
            cellsToFill = 36;
            break;
        case 'medium':
            cellsToFill = 32;
            break;
        case 'hard':
            cellsToFill = 28;
            break;
    }
    fillRandomNumbers(cellsToFill);
    solveSudoku(board);
    let cellsToRemove = 81 - cellsToFill;
    for (let i = 0; i < cellsToRemove; i++) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
        } else {
            i--;
        }
    }
    return board;
}
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        } else {
                            board[row][col] = 0;
                        }
                    }
                }
                return false;
            }
        }
    }
    return true;
}
function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
        if (board[x][col] === num) return false;
    }
    let startRow = row - (row % 3);
    let startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}
function createSudokuBoard() {
    sudokuBoardElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let input = document.createElement("input");
            input.type = "text";
            input.className = "number-input";
            input.maxLength = "1";
            input.value = board[i][j] !== 0 ? board[i][j] : "";
            input.disabled = board[i][j] !== 0;
            input.dataset.row = i;
            input.dataset.col = j;
            input.addEventListener("input", handleInput);
            input.addEventListener("click", handleCellClick);
            sudokuBoardElement.appendChild(input);
        }
    }
}
function handleCellClick(event) {
    if (selectedCell) {
        selectedCell.classList.remove("selected-cell");
    }
    selectedCell = event.target;
    selectedCell.classList.add("selected-cell");
}
function handleInput(event) {
    let row = parseInt(event.target.dataset.row);
    let col = parseInt(event.target.dataset.col);
    let num = parseInt(event.target.value);
    if (isNaN(num) || num < 1 || num > 9) {
        board[row][col] = 0;
        event.target.value = "";
        if (selectedCell) {
            selectedCell.classList.add("error-cell");
        }
        soundEffects.playError();
    } else {
        board[row][col] = num;
        if (selectedCell) {
            selectedCell.classList.remove("error-cell");
        }
        soundEffects.playClick();
        if (isBoardComplete()) {
            if (isBoardValid()) {
                showMessage("Oyunu Kazandınız!");
                stopTimer();
                gameStarted = false;
                saveScore();
            } else {
                showMessage("Hatalı Çözüm!");
            }
        }
    }
}
function isBoardComplete() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return false;
        }
    }
    return true;
}
function isBoardValid() {
    for (let i = 0; i < 9; i++) {
        let rowValues = new Set();
        let colValues = new Set();
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 0) {
                if (rowValues.has(board[i][j])) return false;
                rowValues.add(board[i][j]);
            }
            if (board[j][i] !== 0) {
                if (colValues.has(board[j][i])) return false;
                colValues.add(board[j][i]);
            }
        }
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            let boxValues = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let cellValue = board[3 * boxRow + i][3 * boxCol + j];
                    if (cellValue !== 0) {
                        if (boxValues.has(cellValue)) return false;
                        boxValues.add(cellValue);
                    }
                }
            }
        }
    }
    return true;
}
function startGame() {
    if (!gameStarted) {
        board = generateSudokuBoard(gameDifficulty);
        createSudokuBoard();
        seconds = 0;
        updateTimerDisplay();
        if (isTimedMode) {
            startTimer();
        }
        gameStarted = true;
        showMessage("Oyun Başladı!");
        startGameButton.textContent = "Oyunu Yeniden Başlat";
    } else {
        if (confirm("Oyunu yeniden başlatmak istediğinize emin misiniz?")) {
            board = generateSudokuBoard(gameDifficulty);
            createSudokuBoard();
            seconds = 0;
            updateTimerDisplay();
            if (isTimedMode) {
                startTimer();
            }
            showMessage("Oyun Yeniden Başlatıldı!");
        }
    }
}
function refreshBoard() {
    if (gameStarted) {
        if (confirm("Tahtayı yenilemek istediğinize emin misiniz? Mevcut oyununuz sıfırlanacak!")) {
            board = generateSudokuBoard(gameDifficulty);
            createSudokuBoard();
            seconds = 0;
            updateTimerDisplay();
            if (isTimedMode) {
                startTimer();
            }
            showMessage("Tahta Yenilendi!");
        }
    } else {
        board = generateSudokuBoard(gameDifficulty);
        createSudokuBoard();
        seconds = 0;
        updateTimerDisplay();
    }
}
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}
function stopTimer() {
    clearInterval(timerInterval);
}
function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    timerDisplay.textContent = `Süre: ${formattedTime}`;
}
function toggleTimedMode() {
    isTimedMode = !isTimedMode;
    timedModeButton.textContent = isTimedMode ? "Normal Mod" : "Süreli Mod";
    if (isTimedMode) {
        startTimer();
        showMessage("Süreli Mod Aktif!");
    } else {
        stopTimer();
        seconds = 0;
        updateTimerDisplay();
        showMessage("Süreli Mod Deaktif!");
    }
}
function displayRankings() {
    rankings.sort((a, b) => a.time - b.time);
    rankingList.innerHTML = "";
    const topRankings = rankings.slice(0, 10);
    topRankings.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.name}: ${entry.time}`;
        rankingList.appendChild(li);
    });
    rankingsModal.style.display = "flex";
}
function saveScore() {
    const timeString = timerDisplay.textContent.split(": ")[1];
    const minutes = parseInt(timeString.split(":")[0]);
    const seconds = parseInt(timeString.split(":")[1]);
    const totalSeconds = minutes * 60 + seconds;
    const newScore = {
        name: playerName,
        time: totalSeconds,
    };
    rankings.push(newScore);
    localStorage.setItem('rankings', JSON.stringify(rankings));
}
function openSettings() {
    settingsModal.style.display = "flex";
}
function closeSettings() {
    settingsModal.style.display = "none";
}
function saveSettings() {
    playerName = playerNameInput.value;
    musicVolume = parseInt(musicVolumeSlider.value);
    soundVolume = parseInt(soundVolumeSlider.value);
    music.volume = musicVolume;
    soundEffects.volume = soundVolume;
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('musicVolume', musicVolume);
    localStorage.setItem('soundVolume', soundVolume);
    closeSettings();
    showMessage("Ayarlar Kaydedildi!");
}
function cancelSettings() {
    playerNameInput.value = playerName;
    musicVolumeSlider.value = musicVolume;
    soundVolumeSlider.value = soundVolume;
    closeSettings();
}
startGameButton.addEventListener("click", startGame);
refreshBoardButton.addEventListener("click", refreshBoard);
timedModeButton.addEventListener("click", toggleTimedMode);
viewRankingsButton.addEventListener("click", displayRankings);
openSettingsButton.addEventListener("click", openSettings);
closeSettingsModalButton.addEventListener("click", closeSettings);
saveSettingsButton.addEventListener("click", saveSettings);
cancelSettingsButton.addEventListener("click", cancelSettings);
closeRankingsModalButton.addEventListener("click", () => {
    rankingsModal.style.display = "none";
});
difficultyButtons.forEach(button => {
    button.addEventListener('click', function() {
        gameDifficulty = this.dataset.difficulty;
        difficultyButtons.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
    });
});
document.querySelector(`[data-difficulty="${gameDifficulty}"]`).classList.add('selected');
if (localStorage.getItem('playerName')) {
    playerName = localStorage.getItem('playerName');
    playerNameInput.value = playerName;
}
if (localStorage.getItem('musicVolume')) {
    musicVolume = parseInt(localStorage.getItem('musicVolume'));
    musicVolumeSlider.value = musicVolume;
}
if (localStorage.getItem('soundVolume')) {
    soundVolume = parseInt(localStorage.getItem('soundVolume'));
    soundVolumeSlider.value = soundVolume;
}
board = generateSudokuBoard(gameDifficulty);
createSudokuBoard();
