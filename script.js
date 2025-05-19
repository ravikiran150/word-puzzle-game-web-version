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
    startGameBtn: document.getElementById('start-game-btn'),
    musicToggle: document.getElementById('music-toggle'),
    volumeControl: document.querySelector('.volume-control')
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

// Initialize loading indicator
elements.loadingIndicator.className = 'loading-indicator';
elements.loadingIndicator.textContent = 'Loading game data...';
document.querySelector('.game-content').prepend(elements.loadingIndicator);

// Initialize audio settings
function initAudio() {
    audio.backgroundMusic.volume = 0.3;
    audio.click.volume = 0.7;
    audio.correct.volume = 0.7;
    audio.wrong.volume = 0.7;
    audio.levelComplete.volume = 0.8;
    
    elements.volumeControl.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        audio.click.volume = volume;
        audio.correct.volume = volume;
        audio.wrong.volume = volume;
        audio.levelComplete.volume = volume;
    });
}

// Audio control functions
function playSound(sound) {
    if (audio.isMusicOn) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
    }
}

function toggleMusic() {
    audio.isMusicOn = !audio.isMusicOn;
    
    if (audio.isMusicOn) {
        audio.backgroundMusic.play();
        elements.musicToggle.innerHTML = '🔊';
    } else {
        audio.backgroundMusic.pause();
        elements.musicToggle.innerHTML = '🔇';
    }
}

// Timer functions
function startLevelTimer() {
    gameData.levelStartTime = Date.now();
    gameData.levelTime = 0;
    if (gameData.timerInterval) clearInterval(gameData.timerInterval);
    
    gameData.timerInterval = setInterval(() => {
        gameData.levelTime = Math.floor((Date.now() - gameData.levelStartTime) / 1000);
        elements.timerDisplay.textContent = gameData.levelTime;
    }, 1000);
    
    // Start background music (with user gesture)
    if (audio.isMusicOn) {
        audio.backgroundMusic.play().catch(e => console.log("Music play failed:", e));
    }
}

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
    
    if (averageTimePerWord <= 3.33) return 3;
    if (averageTimePerWord <= 5) return 2;
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
            },
            {
                level: 3,
                words: [
                    { word: "TIGER", clue: "Striped big cat", definition: "A large Asian wild cat with a striped coat." },
                    { word: "HONEY", clue: "Sweet substance made by bees", definition: "A sweet, sticky substance made by bees." },
                    { word: "WATER", clue: "Essential liquid for life", definition: "A colorless, transparent liquid that forms the world's streams, lakes, and oceans." },
                    { word: "GRASS", clue: "Green ground cover", definition: "Vegetation consisting of short plants with narrow leaves." }
                ]
            },
            {
                level: 4,
                words: [
                    { word: "BANANA", clue: "Long yellow fruit", definition: "A long curved fruit with a yellow skin." },
                    { word: "JUNGLE", clue: "Dense tropical forest", definition: "A dense, tropical forest with lush vegetation." },
                    { word: "POCKET", clue: "Small compartment in clothing", definition: "A small bag-like attachment in clothing." },
                    { word: "ROCKET", clue: "Space vehicle", definition: "A cylindrical projectile that can be propelled to great heights." }
                ]
            },
            {
                level: 5,
                words: [
                    { word: "ELEPHANT", clue: "Large gray mammal with trunk", definition: "A very large herbivorous mammal with a trunk." },
                    { word: "HOSPITAL", clue: "Place for medical treatment", definition: "An institution providing medical treatment." },
                    { word: "BUTTERFLY", clue: "Flying insect with colorful wings", definition: "A nectar-feeding insect with large wings." },
                    { word: "MOUNTAIN", clue: "Tall natural elevation", definition: "A large natural elevation of the earth's surface." }
                ]
            },
            {
                level: 6,
                words: [
                    { word: "ASTRONAUT", clue: "Space traveler", definition: "A person trained to travel in a spacecraft." },
                    { word: "TELEPHONE", clue: "Communication device", definition: "A system for transmitting voices over a distance." },
                    { word: "ADVENTURE", clue: "Exciting experience", definition: "An unusual and exciting experience." },
                    { word: "NOTEBOOK", clue: "Book for writing notes", definition: "A small book with blank pages for writing." },
                    { word: "SUNFLOWER", clue: "Tall yellow flower", definition: "A tall plant with large yellow flowers." }
                ]
            },
            {
                level: 7,
                words: [
                    { word: "PHOTOGRAPH", clue: "Captured image", definition: "A picture made using a camera." },
                    { word: "CHOCOLATE", clue: "Sweet brown treat", definition: "A food preparation made from roasted cacao seeds." },
                    { word: "KANGAROO", clue: "Australian hopper", definition: "A large Australian marsupial with powerful hind legs." },
                    { word: "UMBRELLA", clue: "Rain protection", definition: "A device used for protection against rain." },
                    { word: "LIBRARY", clue: "Book collection place", definition: "A building or room containing collections of books." }
                ]
            },
            {
                level: 8,
                words: [
                    { word: "ARCHITECTURE", clue: "Building design", definition: "The art of designing buildings." },
                    { word: "COMMUNICATION", clue: "Information exchange", definition: "The imparting or exchanging of information." },
                    { word: "EXPERIMENT", clue: "Scientific test", definition: "A scientific procedure to make a discovery." },
                    { word: "GEOGRAPHY", clue: "Study of Earth's features", definition: "The study of Earth's physical features." },
                    { word: "HIBERNATION", clue: "Winter sleep", definition: "The condition of passing winter in a dormant state." }
                ]
            },
            {
                level: 9,
                words: [
                    { word: "MAGNIFICENT", clue: "Extremely beautiful", definition: "Extremely beautiful or impressive." },
                    { word: "NEIGHBORHOOD", clue: "Local community area", definition: "A district or community within a town or city." },
                    { word: "PERSPECTIVE", clue: "Point of view", definition: "A particular attitude toward something." },
                    { word: "QUINTESSENCE", clue: "Perfect example", definition: "The most perfect or typical example of a quality." },
                    { word: "REVOLUTION", clue: "Dramatic change", definition: "A forcible overthrow of a government or social order." }
                ]
            },
            {
                level: 10,
                words: [
                    { word: "EXTRAORDINARY", clue: "Very unusual", definition: "Very unusual or remarkable." },
                    { word: "CONSEQUENTIAL", clue: "Important", definition: "Following as a result or effect." },
                    { word: "BIBLIOGRAPHY", clue: "List of references", definition: "A list of books referred to in a scholarly work." },
                    { word: "CONSTELLATION", clue: "Star pattern", definition: "A group of stars forming a recognizable pattern." },
                    { word: "DETERMINATION", clue: "Firmness of purpose", definition: "The quality of being determined." },
                    { word: "PHILANTHROPY", clue: "Charitable giving", definition: "The desire to promote the welfare of others." }
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
    
    // Calculate optimal columns based on word length
    const longestWord = Math.max(...level.words.map(w => w.word.length));
    const columns = Math.min(6, Math.max(4, Math.ceil(longestWord * 0.8)));
    
    elements.letterGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
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
        
        tile.addEventListener('click', () => {
            playSound(audio.click);
            selectLetter(tile, index, letter);
        });
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
    playSound(audio.click);
    const selectedWord = gameData.selectedLetters.join('');
    const currentLevel = gameData.levels[gameData.currentLevel];
    
    const matchedWord = currentLevel.words.find(wordObj => 
        wordObj.word === selectedWord && 
        !gameData.foundWords.includes(wordObj.word)
    );
    
    if (matchedWord) {
        playSound(audio.correct);
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
        playSound(audio.wrong);
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.add('incorrect');
            setTimeout(() => tile.classList.remove('incorrect'), 500);
        });
    }
}

// Show level complete modal
function showLevelComplete(level) {
    playSound(audio.levelComplete);
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
    playSound(audio.click);
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
    playSound(audio.click);
    gameData.selectedIndices.forEach(index => {
        const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
        tile.classList.remove('selected');
    });
    gameData.selectedLetters = [];
    gameData.selectedIndices = [];
});

elements.hintBtn.addEventListener('click', provideHint);
elements.nextLevelBtn.addEventListener('click', () => {
    playSound(audio.click);
    elements.levelCompleteModal.style.display = 'none';
    gameData.currentLevel++;
    initGame();
});
elements.replayBtn.addEventListener('click', () => {
    playSound(audio.click);
    elements.levelCompleteModal.style.display = 'none';
    initGame();
});

// Start game button
elements.startGameBtn.addEventListener('click', () => {
    playSound(audio.click);
    elements.startScreen.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    initAudio();
    loadGameData();
});

// Music toggle
elements.musicToggle.addEventListener('click', toggleMusic);
