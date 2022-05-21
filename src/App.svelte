<script lang="ts">
    import Game from './Game.svelte';
	import Keyboard from './Keyboard.svelte';
	import JSZip from 'jszip';
	import JSZipUtils from 'jszip-utils';

	export let urlBase: string = "";

	let loadingStatus: string = "Loading Words...";

	let validWordList = [];
	let guessList = [];
	let inputLimit = 5;
	let currentGuess: string;

	let gameEnded: boolean = false;
	let progressSelected: boolean = false;
    let guessesState = [];
	let completedGuesses = [];
	let gamePopulateGameState: () => void;
	let gameHandleKeyPress: (key: string) => void;

	const saveStateToLocalStorage = () => {
		// Save guessesState and completedGuesses to local storage
		localStorage.setItem("guessesState", JSON.stringify(guessesState));
		localStorage.setItem("completedGuesses", JSON.stringify(completedGuesses));
	};

	const tryLoadStateFromLocalStorage = () => {
		// Load guessesState and completedGuesses from local storage
		const guessesStateString = localStorage.getItem("guessesState");
		const completedGuessesString = localStorage.getItem("completedGuesses");
		if (guessesStateString && completedGuessesString) {
			try {
				guessesState = JSON.parse(guessesStateString);
				completedGuesses = JSON.parse(completedGuessesString);
			} catch(e) {
				console.error(e);
				console.log("Failed to load state from local storage, evicting all state.");
				clearLocalStorage();
			}
			console.log("Loaded state from local storage.");
		} else {
			console.log("No saved state found... starting fresh game.");
		}
	};

	const clearLocalStorage = () => {
		// Clear local storage
		localStorage.clear();
	};

	const resetGame = () => {
		// Reset game state
		completedGuesses = [];
		currentGuess = "";
		gameEnded = false;
		gamePopulateGameState();
		saveStateToLocalStorage();
	};

	let currentSelectionSolution: string = "";

    // Compute the set all the present and correct keys
    $: presentCorrectKeyLists = (() => {
        let presentKeys: string[] = [];
        let correctKeys: string[]  = [];
		let usedKeys: string[] = [];
        guessesState.forEach(state => {
			if (currentSelectionSolution.length !== 0 && state.solution !== currentSelectionSolution) return;
            const solutionList = state.solution.split('');
            state.guesses.forEach(guess => {
                guess.split('').forEach((character, i) => {
                    if (solutionList[i] === character) {
                        correctKeys.push(character);
                    } else if (solutionList.includes(character)) {
                        presentKeys.push(character);
                    } else {
						usedKeys.push(character);
					}
                });
            });
        });

        return { presentKeys, correctKeys, usedKeys };
    })();

	$: completeCount = completedGuesses.length;
	
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams: URLSearchParams, prop: string) => searchParams.get(prop),
	});

	const validWords = new JSZip.external.Promise((resolve, reject) => {
		JSZipUtils.getBinaryContent(`${urlBase}/wordList5.json.zip`, (err, data) => { 
			if (err) reject(err); else resolve(data); 
		});
	}).then((data: any) => JSZip.loadAsync(data))
	.then(async data => {
		const deserJson = JSON.parse(await data.file(Object.keys(data.files)[0]).async("string"));
		validWordList = deserJson.wordList.filter(word => word.length === inputLimit);
	});

	const validGuesses =
	fetch(`${urlBase}/sedecordle-answers.json`)
	.then(async res => {
		if (!res.ok) {
			loadingStatus = `Failed to load word list: ${res.statusText}`;
			return Promise.reject(`wordList fetch failed with: ${res.statusText}`);
		}

		await res.json()
		.then(data => {
			guessList = data.wordList.filter(word => word.length === inputLimit);
		})
		.catch(err => {
			console.log(err);
			loadingStatus = `Failed to load word list: ${err}`;
		});
	})
	.catch(err => {
		console.log(err);
		loadingStatus = `Failed to load word list: ${err}`;
	});

	Promise.all([validWords, validGuesses])
	.then(res => {
		// Ensure that all guess words are in the valid list
		// Filter and alert if any aren't
		const wordsToAdd = guessList.filter(guess => !validWordList.includes(guess));

		// Print out the words that weren't in the valid list
		if (wordsToAdd.length > 0 && wordsToAdd.length <= 100) {
			console.log(`The following solution words were not present in the valid list: ${wordsToAdd.join(', ')}. Consider fixing this permanently.`);
		} else if (wordsToAdd.length > 100) {
			console.log('More than 100 solution words were not present in the valid list. Consider fixing this permanently.');
		}

		// Concat the valid list with the new words
		validWordList = validWordList.concat(wordsToAdd);

		tryLoadStateFromLocalStorage();
		
		loadingStatus = "";
	})
	.catch(err => {
		console.log(err);
		loadingStatus = `Failed to load word list: ${err}`;
	});
</script>

<main>
	<div id="headers">
		<div id="header-bar">
			<b id="bookle-label">BOOKLE</b>
			{#if gameEnded}
				<b id="completion">Game Ended! {completeCount} of 1000</b>
			{:else}
				<b id="completion">{loadingStatus === "" ? completeCount : "?"} of 1000</b>
			{/if}
			{#if (gameEnded && loadingStatus === "")}
				<b id="ng-button" on:click={(ev) => { ev.currentTarget.blur(); resetGame(); }}>New Game</b>
			{:else}
				<b id="progress-button" on:click={(ev) => { ev.currentTarget.blur(); progressSelected = !progressSelected; }}>Progress</b>
			{/if}
		</div>
	</div>
	<div id="game-area">
		{#if loadingStatus.length != 0}
			<div> Loading Words </div>
		{:else}
			<Game
				wordList={validWordList}
				guessList={guessList}
				solutionSize={inputLimit}
				numGuesses={12}
				numGames={6}
				saveStateCallback={saveStateToLocalStorage}
				hidden={progressSelected}
				bind:completedGuesses={completedGuesses}
				bind:guessesState={guessesState}
				bind:currentSelectionSolution={currentSelectionSolution}
				bind:repopulateGameState={gamePopulateGameState}
				bind:handleKeyPress={gameHandleKeyPress}
				bind:currentGuess={currentGuess}
				bind:gameEnded={gameEnded}
			/>
		{/if}
		{#if progressSelected}
			<div class="bingus">
				{#each completedGuesses.slice().reverse() as guess, i}
					<div> Guess {completedGuesses.length - i} {guess.guesses.length !== 0 ? '✔️':'❌'} {guess.solution} </div>
				{/each}
			</div>
		{/if}
	</div>
	<div id="keyboard">
		<Keyboard
			presentCorrectKeyLists={presentCorrectKeyLists}
			clickCallback={gameHandleKeyPress}
		/>
	</div>
</main>

<style>
	#header-bar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: medium;
		color: var(--color-tone-2);
	}

	b {
		align-self: center;
		margin: 0.5rem;
		padding: 4px;
		flex-basis: 10rem;
		text-align: center;
	}

	#ng-button {
		background-color: lightcoral;
		border-radius: 0.5rem;
		border: 2px solid #822;
		color: #fff;
	}

	#progress-button {
		background-color: rgb(128, 186, 240);
		border-radius: 0.5rem;
		border: 2px solid rgb(66, 95, 122);
		color: #fff;
	}

	#completion {
		text-decoration: underline;
	}

	main {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	#game-area {
		overflow: auto;
		overflow-x: hidden;
	}

	#headers {
		outline: 1px solid #ccc;
	}

	#keyboard {
		outline: 1px solid #ccc;
	}

	.bingus {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 5rem;
		margin-bottom: 5rem;
	}
</style>
