// Game State Management
const gameData = {
    levels: [],
    currentLevel: 0,
    selectedLetters: [],
    selectedIndices: [],
    foundWords: [],
    usedLetterIndices: [],
    isLoading: true
};

// DOM Elements
const elements = {
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
    loadingIndicator: document.createElement('div')
};

// Initialize loading indicator
elements.loadingIndicator.className = 'loading-indicator';
elements.loadingIndicator.textContent = 'Loading game data...';
document.querySelector('.game-container').prepend(elements.loadingIndicator);

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
            tile.classList.add('used');
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
        // Correct word
        gameData.foundWords.push(matchedWord.word);
        gameData.usedLetterIndices = [...gameData.usedLetterIndices, ...gameData.selectedIndices];
        
        // Visual feedback
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.replace('selected', 'used');
        });
        
        gameData.selectedLetters = [];
        gameData.selectedIndices = [];
        
        createCluePanel(currentLevel);
        
        if (gameData.foundWords.length === currentLevel.words.length) {
            setTimeout(() => showLevelComplete(currentLevel), 500);
        }
    } else {
        // Incorrect word
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.add('incorrect');
            setTimeout(() => tile.classList.remove('incorrect'), 500);
        });
    }
}

// Show level complete modal
function showLevelComplete(level) {
    elements.wordDefinitions.innerHTML = '';
    
    level.words.forEach(wordObj => {
        const definitionItem = document.createElement('div');
        definitionItem.className = 'definition-item';
        
        definitionItem.innerHTML = `
            <p class="word-def">${wordObj.word}:</p>
            <p class="meaning">${wordObj.definition}</p>
        `;
        
        elements.wordDefinitions.appendChild(definitionItem);
    });
    
    elements.levelCompleteModal.style.display = 'flex';
}

// Show game complete screen
function showGameComplete() {
    elements.wordDefinitions.innerHTML = `
        <div class="game-complete">
            <h3>Congratulations!</h3>
            <p>You've completed all levels!</p>
            <button id="restart-game" class="btn primary">Play Again</button>
        </div>
    `;
    
    document.getElementById('restart-game').addEventListener('click', () => {
        gameData.currentLevel = 0;
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
    gameData.currentLevel++;
    elements.levelCompleteModal.style.display = 'none';
    initGame();
});
elements.replayBtn.addEventListener('click', () => {
    elements.levelCompleteModal.style.display = 'none';
    initGame();
});

// Start the game by loading data
loadGameData();
