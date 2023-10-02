<script lang="ts">
	import { onMount } from 'svelte/internal';
    import Wordle from './Wordle.svelte';

    class WordleState {
        solution: string;
        guesses: string[];

        constructor(solution: string, guesses: string[]) {
            this.solution = solution;
            this.guesses = guesses;
        }
    };

    export let wordList: string[];
    export let guessList: string[];
	export let gameEnded: boolean = false;
    export let solutionSize: number;
    export let numGuesses: number;
    export let numGames: number;
    export let saveStateCallback: () => void;
	export let currentGuess: string = "";
    export let hidden: boolean;

    export let currentSelectionSolution;

    export let completedGuesses: WordleState[] = [];
    export let guessesState: WordleState[] = [];

    let getUnusedSolutionWord;

    export const repopulateGameState = () => {
        guessesState = [];
        while (guessesState.length < numGames) {
            guessesState = guessesState.concat([new WordleState(getUnusedSolutionWord(), [])]);
        }
        currentSelectionSolution = "";
    };

    export const handleKeyPress = (key) => {
        handleGuessInput(key);
    }

    let submitIndex: number = -1;

    // Assume that the player will never exaust every possible word
    getUnusedSolutionWord = () => {
        const allUsedWords = [...guessesState, ...(completedGuesses.filter(state => state.guesses.length != 0))].map(state => state.solution);

        const unusedWords = guessList.filter(word => !allUsedWords.includes(word));

        console.log(guessList.length + ", " + allUsedWords.length);

        return unusedWords[Math.floor(Math.random() * unusedWords.length)];
    }

    const submitGuess = () => {
        // Check if the guess is valid
        if (currentGuess.length !== solutionSize || !wordList.includes(currentGuess)) {
            return;
        }

        // Find index of state that was guessed correctly (if any)
        // There is only one state that can be guessed correctly
        let correctStateIndex = guessesState.findIndex(state => state.solution === currentGuess);

        // Append guess to each guess state
        guessesState.forEach(state => {
            state.guesses.push(currentGuess);
        });
        guessesState = [...guessesState];

        // If the state was guessed correctly, replace it with a new state
        if (correctStateIndex !== -1) {
            // count the number of guesses in this guess state
            const numGuesses = guessesState[correctStateIndex].guesses.length;
            const animationMs = 1000 + (numGuesses + 5) * 100;

            submitIndex = correctStateIndex;
            setTimeout(() => {
                completedGuesses = [...completedGuesses, guessesState[correctStateIndex]];
                if (guessesState[correctStateIndex].solution === currentSelectionSolution)
                {
                    currentSelectionSolution = "";
                }
                const newGuesses = [...guessesState];
                newGuesses[correctStateIndex] = new WordleState(getUnusedSolutionWord(), []);
                guessesState = newGuesses;

                submitIndex = -1;

                saveStateCallback();
            }, animationMs);
        } else {
            completedGuesses = [...completedGuesses, new WordleState(currentGuess, [])];

            saveStateCallback();

            // Check if any states have zero remaining guesses
            if(guessesState.some(state => state.guesses.length >= numGuesses)) {
                gameEnded = true;
                console.log("Game has ended");
            }
        }

        currentGuess = "";
    };

    // Handle input from anywhere on the content area
	const handleGuessInput = key => {
		if (gameEnded || (submitIndex !== -1)) return;

		// Handle backspace, remove the last character if it exists
		if (["Backspace", "Delete"].includes(key) && currentGuess.length > 0) {
			currentGuess = currentGuess.slice(0, currentGuess.length - 1);
		} else if (key === "Enter" && currentGuess.length == solutionSize && wordList.includes(currentGuess)) {
			submitGuess();
		} else if (key.length === 1 && key.match(/[a-zA-Z]/i) && currentGuess.length < solutionSize) {
			currentGuess = currentGuess.concat(key.toUpperCase().toString());
		}
	};

    const gameApp = () => {
        document.addEventListener("keydown", event => { if (!event.metaKey) handleGuessInput(event.key) });

        if(guessesState.some(state => state.guesses.length >= numGuesses)) {
            gameEnded = true;
            console.log("Game has ended");
        }
    };

    if (guessesState.length < numGames) {
        repopulateGameState();
    }

	onMount(gameApp);
</script>

<div class="wordle-holder" style={hidden ? "display: none;" : ""}>
    {#each guessesState as state, i}
        
        <Wordle
            guesses={[...state.guesses, currentGuess]}
            solution={state.solution}
            numGuesses={numGuesses}
            defocused={currentSelectionSolution.length !== 0 && state.solution !== currentSelectionSolution}
            focused={currentSelectionSolution.length !== 0 && state.solution === currentSelectionSolution}
            selectedCallback={(solution) => { currentSelectionSolution = (currentSelectionSolution === solution) ? "" : solution; }}
            playingSubmitAnimation={submitIndex == i}
        />
    {/each}
</div>

<style>
    .wordle-holder {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
</style>