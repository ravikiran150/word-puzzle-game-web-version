// Game State Management
const gameData = {
    levels: [],
    currentLevel: 0,
    selectedLetters: [],
    selectedIndices: [],
    foundWords: [],
    usedLetterIndices: [],
    isLoading: true,
    levelStartTime: 0,
    levelTime: 0,
    starRating: 0,
    levelTimings: [],
    timerInterval: null
};

// DOM Elements
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    letterGrid: document.getElementById('letter-grid'),
    cluePanel: document.getElementById('clue-panel'),
    currentLevelDisplay: document.getElementById('current-level'),
    checkWordBtn: document.getElementById('check-word'),
    resetSelectionBtn: document.getElementById('reset-selection'),
    hintBtn: document.getElementById('hint-btn'),
    levelCompleteModal: document.getElementById('level-complete-modal'),
    wordDefinitions: document.getElementById('word-definitions'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    replayBtn: document.getElementById('replay-btn'),
    loadingIndicator: document.createElement('div'),
    timerDisplay: document.getElementById('timer'),
    starRatingDisplay: document.querySelector('.star-rating'),
    startGameBtn: document.getElementById('start-game-btn')
};

// Audio Elements
const audio = {
    backgroundMusic: document.getElementById('background-music'),
    click: document.getElementById('click-sound'),
    correct: document.getElementById('correct-sound'),
    wrong: document.getElementById('wrong-sound'),
    levelComplete: document.getElementById('level-complete-sound'),
    isMusicOn: true
};

// Audio control functions
function playSound(sound) {
    if (audio.isMusicOn) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
    }
}

function toggleMusic() {
    audio.isMusicOn = !audio.isMusicOn;
    const musicBtn = document.getElementById('music-toggle');
    
    if (audio.isMusicOn) {
        audio.backgroundMusic.play();
        musicBtn.innerHTML = '🔊';
    } else {
        audio.backgroundMusic.pause();
        musicBtn.innerHTML = '🔇';
    }
}

// Add music toggle button to start screen
const musicControls = document.createElement('div');
musicControls.className = 'music-controls';
musicControls.innerHTML = `
    <button id="music-toggle" class="music-btn">🔊</button>
`;
document.body.appendChild(musicControls);

document.getElementById('music-toggle').addEventListener('click', toggleMusic);

function selectLetter(tile, index, letter) {
    playSound(audio.click);
    // ... rest of the existing code ...
}

function checkWord() {
    playSound(audio.click); // Play click sound when checking word
    
    // ... existing code ...
    
    if (matchedWord) {
        playSound(audio.correct); // Play correct sound
        // ... rest of correct word handling ...
    } else {
        playSound(audio.wrong); // Play wrong sound
        // ... rest of wrong word handling ...
    }
}

function showLevelComplete(level) {
    playSound(audio.levelComplete);
    // ... rest of the existing code ...
}

function startLevelTimer() {
    // Start background music (with user gesture)
    if (audio.isMusicOn) {
        audio.backgroundMusic.play().catch(e => console.log("Music play failed:", e));
    }
    // ... rest of existing code ...
}

audio.backgroundMusic.volume = 0.3;
audio.click.volume = 0.7;
audio.correct.volume = 0.7;
// etc...

// Initialize loading indicator
elements.loadingIndicator.className = 'loading-indicator';
elements.loadingIndicator.textContent = 'Loading game data...';
document.querySelector('.game-container').prepend(elements.loadingIndicator);

// Timer functions
function startLevelTimer() {
    gameData.levelStartTime = Date.now();
    gameData.levelTime = 0;
    if (gameData.timerInterval) clearInterval(gameData.timerInterval);
    
    gameData.timerInterval = setInterval(() => {
        gameData.levelTime = Math.floor((Date.now() - gameData.levelStartTime) / 1000);
        elements.timerDisplay.textContent = gameData.levelTime;
    }, 1000);
}

// Add this after your audio variable declarations
function initAudio() {
    // Set initial volumes
    audio.backgroundMusic.volume = 0.3;
    audio.click.volume = 0.7;
    audio.correct.volume = 0.7;
    audio.wrong.volume = 0.7;
    audio.levelComplete.volume = 0.8;
    
    // Add volume control
    const volumeControl = document.createElement('input');
    volumeControl.type = 'range';
    volumeControl.min = '0';
    volumeControl.max = '1';
    volumeControl.step = '0.1';
    volumeControl.value = '0.7';
    volumeControl.style.width = '80px';
    volumeControl.style.marginLeft = '10px';
    volumeControl.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        audio.click.volume = volume;
        audio.correct.volume = volume;
        audio.wrong.volume = volume;
        audio.levelComplete.volume = volume;
    });
    
    const musicControls = document.querySelector('.music-controls');
    musicControls.appendChild(volumeControl);
}

// Call this in your loadGameData function
initAudio();
function stopLevelTimer() {
    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
        gameData.timerInterval = null;
    }
}

// Star rating calculation
function calculateStarRating() {
    const currentLevel = gameData.levels[gameData.currentLevel];
    const wordCount = currentLevel.words.length;
    const averageTimePerWord = gameData.levelTime / wordCount;
    
    if (averageTimePerWord <= 5) return 3;
    if (averageTimePerWord <= 10) return 2;
    return 1;
}

function updateStarDisplay(rating) {
    const stars = elements.starRatingDisplay.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.toggle('filled', index < rating);
    });
}

// Load game data from JSON
async function loadGameData() {
    try {
        const response = await fetch('assets/words.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        gameData.levels = data.levels;
        gameData.isLoading = false;
        elements.loadingIndicator.style.display = 'none';
        initGame();
    } catch (error) {
        console.error('Failed to load word data:', error);
        elements.loadingIndicator.textContent = 'Failed to load words. Using default words.';
        
        // Fallback data
        gameData.levels = [
            {
                level: 1,
                words: [
                    { word: "DOG", clue: "A loyal pet that barks", definition: "A domesticated carnivorous mammal." },
                    { word: "CAT", clue: "Feline pet that purrs", definition: "A small domesticated carnivorous mammal." },
                    { word: "SUN", clue: "Source of daylight", definition: "The star around which the earth orbits." }
                ]
            },
            {
                level: 2,
                words: [
                    { word: "APPLE", clue: "Fruit that keeps doctors away", definition: "A sweet, red or green fruit." },
                    { word: "BEACH", clue: "Sandy shore by the ocean", definition: "A pebbly or sandy shore by the ocean." },
                    { word: "CLOUD", clue: "Floats in the sky", definition: "A visible mass of condensed water vapor." }
                ]
            }
        ];
        
        gameData.isLoading = false;
        setTimeout(() => {
            elements.loadingIndicator.style.display = 'none';
            initGame();
        }, 2000);
    }
}

// Initialize the game
function initGame() {
    if (gameData.isLoading) return;
    
    gameData.selectedLetters = [];
    gameData.selectedIndices = [];
    gameData.foundWords = [];
    gameData.usedLetterIndices = [];
    gameData.starRating = 0;
    updateStarDisplay(0);
    
    loadLevel(gameData.currentLevel);
}

// Load a specific level
function loadLevel(levelIndex) {
    const level = gameData.levels[levelIndex];
    if (!level) {
        showGameComplete();
        return;
    }
    
    elements.currentLevelDisplay.textContent = level.level;
    createLetterGrid(level);
    createCluePanel(level);
    startLevelTimer();
}

// Create the letter grid
function createLetterGrid(level) {
    elements.letterGrid.innerHTML = '';
    
    const allLetters = level.words
        .flatMap(wordObj => wordObj.word.split(''))
        .sort(() => Math.random() - 0.5);
    
    allLetters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        
        if (gameData.usedLetterIndices.includes(index)) {
            tile.style.display = 'none';
        }
        
        tile.addEventListener('click', () => selectLetter(tile, index, letter));
        elements.letterGrid.appendChild(tile);
    });
}

// Create the clue panel
function createCluePanel(level) {
    elements.cluePanel.innerHTML = '';
    
    level.words.forEach(wordObj => {
        const clueItem = document.createElement('div');
        clueItem.className = `clue-item ${gameData.foundWords.includes(wordObj.word) ? 'found' : ''}`;
        
        const clueText = document.createElement('p');
        clueText.className = 'clue-text';
        clueText.textContent = `${wordObj.clue}: ${gameData.foundWords.includes(wordObj.word) ? 
            wordObj.word : '_ '.repeat(wordObj.word.length)}`;
        
        clueItem.appendChild(clueText);
        elements.cluePanel.appendChild(clueItem);
    });
}

// Select a letter
function selectLetter(tile, index, letter) {
    if (gameData.usedLetterIndices.includes(index)) return;
    
    if (gameData.selectedIndices.includes(index)) {
        tile.classList.remove('selected');
        const letterIndex = gameData.selectedIndices.indexOf(index);
        gameData.selectedLetters.splice(letterIndex, 1);
        gameData.selectedIndices.splice(letterIndex, 1);
    } else {
        tile.classList.add('selected');
        gameData.selectedLetters.push(letter);
        gameData.selectedIndices.push(index);
    }
}

// Check if selected letters form a valid word
function checkWord() {
    const selectedWord = gameData.selectedLetters.join('');
    const currentLevel = gameData.levels[gameData.currentLevel];
    
    const matchedWord = currentLevel.words.find(wordObj => 
        wordObj.word === selectedWord && 
        !gameData.foundWords.includes(wordObj.word)
    );
    
    if (matchedWord) {
        gameData.foundWords.push(matchedWord.word);
        
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.add('correct');
            tile.classList.remove('selected');
            
            setTimeout(() => {
                tile.style.transform = 'scale(0)';
                tile.style.opacity = '0';
                setTimeout(() => {
                    gameData.usedLetterIndices.push(index);
                }, 300);
            }, 500);
        });
        
        gameData.selectedLetters = [];
        gameData.selectedIndices = [];
        
        createCluePanel(currentLevel);
        
        if (gameData.foundWords.length === currentLevel.words.length) {
            stopLevelTimer();
            setTimeout(() => showLevelComplete(currentLevel), 1000);
        }
    } else {
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.add('incorrect');
            setTimeout(() => tile.classList.remove('incorrect'), 500);
        });
    }
}

// Show level complete modal
function showLevelComplete(level) {
    gameData.starRating = calculateStarRating();
    gameData.levelTimings.push({
        level: gameData.currentLevel + 1,
        time: gameData.levelTime,
        stars: gameData.starRating
    });
    
    elements.wordDefinitions.innerHTML = `
        <div class="modal-stars">
            ${'★'.repeat(gameData.starRating)}${'☆'.repeat(3-gameData.starRating)}
        </div>
        <p class="completion-time">Completed in ${gameData.levelTime} seconds</p>
        ${level.words.map(wordObj => `
            <div class="definition-item">
                <p class="word-def">${wordObj.word}:</p>
                <p class="meaning">${wordObj.definition}</p>
            </div>
        `).join('')}
    `;
    
    elements.levelCompleteModal.style.display = 'flex';
    updateStarDisplay(gameData.starRating);
}

// Show game complete screen
function showGameComplete() {
    stopLevelTimer();
    
    const totalStars = gameData.levelTimings.reduce((sum, level) => sum + level.stars, 0);
    const maxStars = gameData.levelTimings.length * 3;
    
    elements.wordDefinitions.innerHTML = `
        <div class="game-complete">
            <h3>Congratulations!</h3>
            <div class="final-stars">${'★'.repeat(totalStars)}${'☆'.repeat(maxStars-totalStars)}</div>
            <p>You completed all levels with ${totalStars}/${maxStars} stars!</p>
            ${gameData.levelTimings.map(level => `
                <p>Level ${level.level}: ${level.time}s (${'★'.repeat(level.stars)}${'☆'.repeat(3-level.stars)})</p>
            `).join('')}
            <button id="restart-game" class="btn primary">Play Again</button>
        </div>
    `;
    
    document.getElementById('restart-game').addEventListener('click', () => {
        gameData.currentLevel = 0;
        gameData.levelTimings = [];
        elements.levelCompleteModal.style.display = 'none';
        initGame();
    });
    
    elements.levelCompleteModal.style.display = 'flex';
}

// Helper functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function provideHint() {
    const currentLevel = gameData.levels[gameData.currentLevel];
    const unfoundWords = currentLevel.words.filter(wordObj => 
        !gameData.foundWords.includes(wordObj.word)
    );
    
    if (unfoundWords.length === 0) return;
    
    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    const firstLetter = randomWord.word[0];
    
    const tiles = document.querySelectorAll('.letter-tile:not(.used)');
    for (let tile of tiles) {
        if (tile.textContent === firstLetter && !gameData.selectedIndices.includes(parseInt(tile.dataset.index))) {
            tile.classList.add('hint');
            setTimeout(() => tile.classList.remove('hint'), 2000);
            break;
        }
    }
}

// Event Listeners
elements.checkWordBtn.addEventListener('click', checkWord);
elements.resetSelectionBtn.addEventListener('click', () => {
    gameData.selectedIndices.forEach(index => {
        const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
        tile.classList.remove('selected');
    });
    gameData.selectedLetters = [];
    gameData.selectedIndices = [];
});

elements.hintBtn.addEventListener('click', provideHint);
elements.nextLevelBtn.addEventListener('click', () => {
    elements.levelCompleteModal.style.display = 'none';
    gameData.currentLevel++;
    initGame();
});
elements.replayBtn.addEventListener('click', () => {
    elements.levelCompleteModal.style.display = 'none';
    initGame();
});

// Start game button
elements.startGameBtn.addEventListener('click', () => {
    elements.startScreen.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    loadGameData();
});
