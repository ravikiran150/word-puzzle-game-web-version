// Game Data
const gameData = {
    levels: [
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
                { word: "ELEPHANT", clue: "Large gray mammal with trunk", definition: "A very large herbivorous mammal." },
                { word: "MOUNTAIN", clue: "Tall natural elevation", definition: "A large natural elevation of the earth's surface." },
                { word: "HOSPITAL", clue: "Place for medical treatment", definition: "An institution providing medical treatment." },
                { word: "BUTTERFLY", clue: "Flying insect with colorful wings", definition: "A nectar-feeding insect with large wings." }
            ]
        }
    ],
    currentLevel: 0,
    selectedLetters: [],
    selectedIndices: [],
    foundWords: [],
    usedLetterIndices: []
};

// DOM Elements
const letterGrid = document.getElementById('letter-grid');
const cluePanel = document.getElementById('clue-panel');
const currentLevelDisplay = document.getElementById('current-level');
const checkWordBtn = document.getElementById('check-word');
const resetSelectionBtn = document.getElementById('reset-selection');
const hintBtn = document.getElementById('hint-btn');
const levelCompleteModal = document.getElementById('level-complete-modal');
const wordDefinitions = document.getElementById('word-definitions');
const nextLevelBtn = document.getElementById('next-level-btn');
const replayBtn = document.getElementById('replay-btn');

// Initialize the game
function initGame() {
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
        alert("Congratulations! You've completed all levels!");
        return;
    }
    
    currentLevelDisplay.textContent = level.level;
    
    // Create letter grid
    createLetterGrid(level);
    
    // Create clue panel
    createCluePanel(level);
}

// Create the letter grid
function createLetterGrid(level) {
    letterGrid.innerHTML = '';
    
    // Combine all letters from all words in this level
    let allLetters = [];
    level.words.forEach(wordObj => {
        allLetters = allLetters.concat(wordObj.word.split(''));
    });
    
    // Shuffle the letters
    allLetters = shuffleArray(allLetters);
    
    // Create letter tiles
    allLetters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        
        tile.addEventListener('click', () => selectLetter(tile, index, letter));
        
        letterGrid.appendChild(tile);
    });
}

// Create the clue panel
function createCluePanel(level) {
    cluePanel.innerHTML = '';
    
    level.words.forEach(wordObj => {
        const clueItem = document.createElement('div');
        clueItem.className = 'clue-item';
        if (gameData.foundWords.includes(wordObj.word)) {
            clueItem.classList.add('found');
        }
        
        const clueText = document.createElement('p');
        clueText.className = 'clue-text';
        clueText.textContent = `${wordObj.clue}: ${gameData.foundWords.includes(wordObj.word) ? 
            wordObj.word : '_ '.repeat(wordObj.word.length)}`;
        
        clueItem.appendChild(clueText);
        cluePanel.appendChild(clueItem);
    });
}

// Select a letter
function selectLetter(tile, index, letter) {
    // Don't allow selection of used letters
    if (gameData.usedLetterIndices.includes(index)) return;
    
    // Toggle selection
    if (gameData.selectedIndices.includes(index)) {
        // Deselect
        tile.classList.remove('selected');
        const letterIndex = gameData.selectedIndices.indexOf(index);
        gameData.selectedLetters.splice(letterIndex, 1);
        gameData.selectedIndices.splice(letterIndex, 1);
    } else {
        // Select
        tile.classList.add('selected');
        gameData.selectedLetters.push(letter);
        gameData.selectedIndices.push(index);
    }
}

// Check if selected letters form a valid word
function checkWord() {
    const selectedWord = gameData.selectedLetters.join('');
    const currentLevel = gameData.levels[gameData.currentLevel];
    
    // Check if the word matches any of the level's words
    const matchedWord = currentLevel.words.find(wordObj => 
        wordObj.word === selectedWord && 
        !gameData.foundWords.includes(wordObj.word)
    );
    
    if (matchedWord) {
        // Correct word
        gameData.foundWords.push(matchedWord.word);
        gameData.usedLetterIndices = gameData.usedLetterIndices.concat(gameData.selectedIndices);
        
        // Mark tiles as used
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.remove('selected');
            tile.classList.add('used');
        });
        
        // Reset selection
        gameData.selectedLetters = [];
        gameData.selectedIndices = [];
        
        // Update clue panel
        createCluePanel(currentLevel);
        
        // Check if level is complete
        if (gameData.foundWords.length === currentLevel.words.length) {
            showLevelComplete(currentLevel);
        }
    } else {
        // Incorrect word - visual feedback
        gameData.selectedIndices.forEach(index => {
            const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
            tile.classList.add('incorrect');
            setTimeout(() => {
                tile.classList.remove('incorrect');
            }, 500);
        });
    }
}

// Show level complete modal
function showLevelComplete(level) {
    wordDefinitions.innerHTML = '';
    
    level.words.forEach(wordObj => {
        const definitionItem = document.createElement('div');
        definitionItem.className = 'definition-item';
        
        const wordDef = document.createElement('p');
        wordDef.className = 'word-def';
        wordDef.textContent = `${wordObj.word}:`;
        
        const meaning = document.createElement('p');
        meaning.className = 'meaning';
        meaning.textContent = wordObj.definition;
        
        definitionItem.appendChild(wordDef);
        definitionItem.appendChild(meaning);
        wordDefinitions.appendChild(definitionItem);
    });
    
    levelCompleteModal.style.display = 'flex';
}

// Go to next level
function nextLevel() {
    gameData.currentLevel++;
    levelCompleteModal.style.display = 'none';
    initGame();
}

// Replay current level
function replayCurrentLevel() {
    levelCompleteModal.style.display = 'none';
    initGame();
}

// Helper function to shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Provide a hint
function provideHint() {
    const currentLevel = gameData.levels[gameData.currentLevel];
    const unfoundWords = currentLevel.words.filter(wordObj => 
        !gameData.foundWords.includes(wordObj.word)
    );
    
    if (unfoundWords.length === 0) return;
    
    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    const firstLetter = randomWord.word[0];
    
    // Find and highlight the first letter of a random unfound word
    const tiles = document.querySelectorAll('.letter-tile:not(.used)');
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].textContent === firstLetter && !gameData.selectedIndices.includes(parseInt(tiles[i].dataset.index))) {
            tiles[i].classList.add('hint');
            setTimeout(() => {
                tiles[i].classList.remove('hint');
            }, 2000);
            break;
        }
    }
}

// Event Listeners
checkWordBtn.addEventListener('click', checkWord);
resetSelectionBtn.addEventListener('click', () => {
    gameData.selectedIndices.forEach(index => {
        const tile = document.querySelector(`.letter-tile[data-index="${index}"]`);
        tile.classList.remove('selected');
    });
    gameData.selectedLetters = [];
    gameData.selectedIndices = [];
});

hintBtn.addEventListener('click', provideHint);
nextLevelBtn.addEventListener('click', nextLevel);
replayBtn.addEventListener('click', replayCurrentLevel);

// Start the game
initGame();
