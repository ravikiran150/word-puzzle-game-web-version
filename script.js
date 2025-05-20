// Game State Management
const gameData = {
    currentCategory: null,
    levels: [],
    currentLevel: 0,
    selectedLetters: [],
    selectedIndices: [],
    foundWords: [],
    usedLetterIndices: [],
    levelStartTime: 0,
    levelTime: 0,
    starRating: 0,
    levelTimings: [],
    timerInterval: null
};

// Categories Data
const categories = {
    "science": {
        name: "Science",
        icon: "🔬",
        levels: Array(10).fill().map((_, i) => ({
            level: i + 1,
            words: [
                { word: "ATOM", clue: "Basic unit of matter", definition: "The smallest unit of a chemical element." },
                { word: "CELL", clue: "Basic unit of life", definition: "The smallest structural and functional unit of an organism." },
                { word: "GENE", clue: "Heredity unit", definition: "A unit of heredity transferred from parent to offspring." }
            ]
        }))
    },
    "animals": {
        name: "Animals",
        icon: "🐾",
        levels: Array(10).fill().map((_, i) => ({
            level: i + 1,
            words: [
                { word: "LION", clue: "King of the jungle", definition: "A large tawny-colored cat that lives in prides." },
                { word: "BEAR", clue: "Hibernating mammal", definition: "A large heavy mammal with thick fur." },
                { word: "FROG", clue: "Amphibian that croaks", definition: "A tailless amphibian with long hind limbs for leaping." }
            ]
        }))
    },
    "fruits": {
        name: "Fruits",
        icon: "🍎",
        levels: Array(10).fill().map((_, i) => ({
            level: i + 1,
            words: [
                { word: "APPLE", clue: "Keeps doctor away", definition: "A sweet red or green fruit with a core." },
                { word: "MANGO", clue: "Tropical fruit", definition: "A juicy tropical fruit with a large flat seed." },
                { word: "GRAPE", clue: "Makes wine", definition: "A small sweet berry growing in clusters." }
            ]
        }))
    },
    "history": {
        name: "History",
        icon: "🏛️",
        levels: Array(10).fill().map((_, i) => ({
            level: i + 1,
            words: [
                { word: "KING", clue: "Royal ruler", definition: "The male ruler of an independent state." },
                { word: "WAR", clue: "Armed conflict", definition: "A state of armed conflict between nations." },
                { word: "TIME", clue: "Historical periods", definition: "The indefinite continued progress of existence." }
            ]
        }))
    },
    "computers": {
        name: "Computers",
        icon: "💻",
        levels: Array(10).fill().map((_, i) => ({
            level: i + 1,
            words: [
                { word: "CODE", clue: "Programming instructions", definition: "System of symbols used to represent instructions." },
                { word: "BYTE", clue: "Digital storage unit", definition: "A unit of digital information typically consisting of 8 bits." },
                { word: "WIFI", clue: "Wireless networking", definition: "A technology for wireless local area networking." }
            ]
        }))
    }
};

// DOM Elements
const elements = {
    categoryScreen: document.getElementById('category-screen'),
    gameScreen: document.getElementById('game-screen'),
    categoriesGrid: document.getElementById('categories-grid'),
    categoryTitle: document.getElementById('category-title'),
    letterGrid: document.getElementById('letter-grid'),
    cluePanel: document.getElementById('clue-panel'),
    currentLevelDisplay: document.getElementById('current-level'),
    checkWordBtn: document.getElementById('check-word'),
    resetSelectionBtn: document.getElementById('reset-selection'),
    hintBtn: document.getElementById('hint-btn'),
    backToCategoriesBtn: document.getElementById('back-to-categories'),
    levelCompleteModal: document.getElementById('level-complete-modal'),
    wordDefinitions: document.getElementById('word-definitions'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    replayBtn: document.getElementById('replay-btn'),
    timerDisplay: document.getElementById('timer'),
    starRatingDisplay: document.querySelector('.star-rating')
};

// Initialize category selection
function initCategorySelection() {
    elements.categoriesGrid.innerHTML = '';
    
    for (const [id, category] of Object.entries(categories)) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${category.icon} ${category.name}</h3>
            <p>${category.levels.length} levels</p>
        `;
        card.addEventListener('click', () => startGame(id));
        elements.categoriesGrid.appendChild(card);
    }
}

// Start game with selected category
function startGame(categoryId) {
    gameData.currentCategory = categoryId;
    gameData.levels = categories[categoryId].levels;
    elements.categoryTitle.textContent = categories[categoryId].name;
    elements.categoryScreen.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    initGame();
}

// Initialize the game
function initGame() {
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
elements.backToCategoriesBtn.addEventListener('click', () => {
    stopLevelTimer();
    elements.gameScreen.style.display = 'none';
    elements.categoryScreen.style.display = 'block';
    elements.levelCompleteModal.style.display = 'none';
});

// Initialize the app
initCategorySelection();
