<script lang="ts">
	import { onMount } from 'svelte/internal';
	import Row from './Row.svelte';

	class GuessScore {
		guess: string;
		present: number;
		correct: number;
		presentFrequencies: any; // just so we don't need to recalculate
		correctFrequencies: any;
		presentTransferLeft: number;
		presentTransferRight: number;
		correctTransferLeft: number;
		correctTransferRight: number;
	};

	$: currentGuess = "";
	$: previousScores = [];
	$: hasWon = false;

	let validWordList = [];
	let wordToGuess = "";
	let inputLimit = 5;
	const inputSizes = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 14 has roughly the same number of words as 5
	const maxAttempts = 6;

	const getContentAreaElement = () => document.getElementById("content-area");

	// Handle input from anywhere on the content area
	const handleGuessInput = key => {
		// Handle backspace, remove the last character if it exists
		if (["Backspace", "Delete"].includes(key)) {
			if (currentGuess.length > 0) {
				currentGuess = currentGuess.slice(0, currentGuess.length - 1);
			}
		} else if (key.length === 1 && key.match(/[a-zA-Z]/i)) {
			if (currentGuess.length < inputLimit) {
				currentGuess = currentGuess.concat(key.toUpperCase().toString());
			}
		}
	};

	const submitGuess = () => {
		let guessFrequencies = { };
		currentGuess.split('')
		//.map(character => character.toUpperCase())
		.forEach(character => {
			guessFrequencies[character] = (guessFrequencies[character] || 0) + 1;
		});

		let canonicalFrequencies = { };
		wordToGuess.split('')
		//.map(character => character.toUpperCase())
		.forEach(character => {
			canonicalFrequencies[character] = (canonicalFrequencies[character] || 0) + 1;
		});

		let correctFrequencies = { };

		// Count the correct and present letters
		let numCorrect = 0;
		for (let i = 0; i < inputLimit; i++) {
			let character = currentGuess[i];
			if (character === wordToGuess[i]) {
				numCorrect++;
				guessFrequencies[character]--;
				canonicalFrequencies[character]--;

				correctFrequencies[character] = (correctFrequencies[character] || 0) + 1;
			}
		}

		let presentFrequencies = { };

		let numPresent = 0;
		Object.keys(guessFrequencies).forEach(character => {
			let amount = Math.min(guessFrequencies[character], canonicalFrequencies[character] || 0);
			numPresent += amount;
			if (amount != 0) { presentFrequencies[character] = amount; }
		});

		let presentToPresentCount = 0;
		let presentToCorrectCount = 0;
		let correctToPresentCount = 0;
		let correctToCorrectCount = 0;

		// compute transition values
		if (previousScores.length != 0) {
			//let presentFrequenciesClone = JSON.parse(JSON.stringify(presentFrequencies));
			//let correctFrequenciesClone = JSON.parse(JSON.stringify(correctFrequencies));

			//let keysToCheck = [...new Set([...Object.keys(presentFrequenciesClone), ...Object.keys(correctFrequenciesClone)])];

			let prevPresentFrequencies = previousScores[previousScores.length - 1].presentFrequencies;
			let prevCorrectFrequencies = previousScores[previousScores.length - 1].correctFrequencies;

			console.log(presentFrequencies);
			console.log(correctFrequencies);
			console.log(prevPresentFrequencies);
			console.log(prevCorrectFrequencies);

			Object.keys(presentFrequencies).forEach(character => {
				presentToPresentCount += (prevPresentFrequencies[character] || 0);
			});

			Object.keys(presentFrequencies).forEach(character => {
				correctToPresentCount += (prevCorrectFrequencies[character] || 0);
			});

			Object.keys(correctFrequencies).forEach(character => {
				presentToCorrectCount += (prevPresentFrequencies[character] || 0);
			});

			Object.keys(correctFrequencies).forEach(character => {
				correctToCorrectCount += (prevCorrectFrequencies[character] || 0);
			});
		}

		previousScores = previousScores.concat({
			guess: currentGuess,
			present: numPresent,
			correct: numCorrect,
			presentFrequencies: presentFrequencies,
			correctFrequencies: correctFrequencies,
			presentTransferLeft: presentToPresentCount,
			presentTransferRight: correctToPresentCount,
			correctTransferLeft: presentToCorrectCount,
			correctTransferRight: correctToCorrectCount,
		});

		if (currentGuess == wordToGuess) {
			hasWon = true;
		}

		currentGuess = "";
	};

	let handleContentAreaInput = (event: KeyboardEvent) => {
		if (hasWon) return;

		// If the key is enter, they are submitting the guess
		if (event.key === "Enter" && currentGuess.length == inputLimit) {
			if (validWordList.includes(currentGuess)) {
				submitGuess();
			}
		} else {
			handleGuessInput(event.key);
		}
	};

	// Initial setup
	{
		const params = new Proxy(new URLSearchParams(window.location.search), {
			get: (searchParams: URLSearchParams, prop: string) => searchParams.get(prop),
		});

		if (params["cc"] != undefined) {
			inputLimit = parseInt(params["cc"]);
		}
	}

	const gameApp = () => {
		// selector for the length of the word to guess
		const ccSelector = document.getElementById("cc") as HTMLInputElement;
		ccSelector.addEventListener("change", () => {
			window.location.href = window.location.href.split("?")[0] + "?cc=" + ccSelector.value;
		});

		if (!('ontouchstart' in document.documentElement)) {
			// Add input listener
			document
			.addEventListener("keydown", handleContentAreaInput);

			// Destroy the hidden input
			document.getElementById("hidden-input").remove();
		} else {
			console.log("Virtual keyboard device detected");

			const hiddenInput = document.getElementById("hidden-input") as HTMLInputElement;

			hiddenInput.addEventListener("keydown", event => {
				hiddenInput.innerText = "";
				hiddenInput.value = "";
				handleContentAreaInput(event);
			});
		}
	}

	const wordListProm
	=fetch("/hardle/wordList.json")
	.then(res => {
		res.json()
		.then(data => {
			validWordList = data.wordList;

			validWordList = validWordList.filter(word => word.length === inputLimit);
		
			wordToGuess = validWordList[Math.floor(Math.random() * validWordList.length)];
		})
		.catch(err => {
			console.log(err);
		});
	})
	.catch(err => {
		console.log(err);
	});

	onMount(gameApp);
</script>

<main>
	<div id="header-bar">
		<div>By Benny Wysong-Grass</div>
		<h1>HARDLE</h1>
		<div>
			<label for="cc">Length</label>
			<select name="cc" id="cc" value={inputLimit}>
				{#each inputSizes as size}
					<option>{size}</option>
				{/each}
			</select>
		</div>
	</div>

	<input type="text" id="hidden-input"/>

	<div id="content-area" on:keydown={handleContentAreaInput}>
		{#each previousScores as score, index}
			<Row
				guess={score.guess}
				submitted={true}
				showTransition={index!=0}
				showMinisquaresSubmitted={true}
				transferCounts={[
					score.presentTransferLeft.toString(),
					score.presentTransferRight.toString(),
					score.correctTransferLeft.toString(),
					score.correctTransferRight.toString()
				]}
				inputLimit={inputLimit}
				presentCount="{score.present}"
				correctCount="{score.correct}"
			/>
		{/each}

		{#if hasWon}
			<div class="winner">You Won!</div>
		{:else}
			<Row
				guess={currentGuess}
				submitted={false}
				showTransition={false}
				showMinisquaresSubmitted={false}
				transferCounts={["","","",""]}
				inputLimit={inputLimit}
				presentCount=""
				correctCount=""
			/>
		{/if}
	</div>
</main>

<style>
	.winner {
		display: flex;
		flex-direction: row;
		justify-content: center;
		font-size: 64px;
	}

	#header-bar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: medium;
		color: var(--color-tone-2);
		padding: 1em;
	}
	html {
		height: 100%;
	}
	body {
		height: 100%;
		background-color: var(--color-background);
		margin: 0;
		padding: 0;
	}

	    /* Global Styles & Colors */
	:root {
		--green: #6aaa64;
		--darkendGreen: #538d4e;
		--yellow: #c9b458;
		--darkendYellow: #b59f3b;
		--blue: #587cc9;
		--darkendBlue: #395185;
		--lightGray: #d8d8d8;
		--gray: #86888a;
		--darkGray: #939598;
		--white: #fff;
		--black: #212121;
		/* Colorblind colors */
		--orange: #f5793a;
		--blue: #85c0f9;
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
		font-size: 24px;
		--header-height: 50px;
		--keyboard-height: 200px;
		--game-max-width: 500px;
		--game-square-size: 3rem;
		--game-square-margin: calc(var(--game-square-size) * 0.1);
		--game-square-border-size: 2px;
	}
	/* Light theme colors */
	:root {
		--color-tone-1: #1a1a1b;
		--color-tone-2: #787c7e;
		--color-tone-3: #878a8c;
		--color-tone-4: #d3d6da;
		--color-tone-5: #edeff1;
		--color-tone-6: #f6f7f8;
		--color-tone-7: #ffffff;
		--opacity-50: rgba(255, 255, 255, 0.5);
	}
	/* Dark Theme Colors */
	.nightmode {
		--color-tone-1: #d7dadc;
		--color-tone-2: #818384;
		--color-tone-3: #565758;
		--color-tone-4: #3a3a3c;
		--color-tone-5: #272729;
		--color-tone-6: #1a1a1b;
		--color-tone-7: #121213;
		--opacity-50: rgba(0, 0, 0, 0.5);
	}
	/* Constant colors and colors derived from theme */
	:root, .nightmode {
		--color-background: var(--color-tone-7);
	}
	:root {
		--color-present: var(--yellow);
		--color-correct: var(--green);
		--color-absent: var(--color-tone-2);
		--tile-text-color: var(--color-tone-7);
		--key-text-color: var(--color-tone-1);
		--key-evaluated-text-color: var(--color-tone-7);
		--key-bg: var(--color-tone-4);
		--key-bg-present: var(--color-present);
		--key-bg-correct: var(--color-correct);
		--key-bg-absent: var(--color-absent);
		--modal-content-bg: var(--color-tone-7);
	}
	.nightmode {
		--color-present: var(--darkendYellow);
		--color-correct: var(--darkendGreen);
		--color-absent: var(--color-tone-4);
		--tile-text-color: var(--color-tone-1);
		--key-text-color: var(--color-tone-1);
		--key-evaluated-text-color: var(--color-tone-1);
		--key-bg: var(--color-tone-2);
		--key-bg-present: var(--color-present);
		--key-bg-correct: var(--color-correct);
		--key-bg-absent: var(--color-absent);
		--modal-content-bg: var(--color-tone-7);
	}
	.colorblind {
		--color-correct: var(--orange);
		--color-present: var(--blue);
		--tile-text-color: var(--white);
		--key-bg-present: var(--color-present);
		--key-bg-correct: var(--color-correct);
		--key-bg-absent: var(--color-absent);
	}
	html {
		height: 100%;
	}
	body {
		height: 100%;
		background-color: var(--color-background);
		margin: 0;
		padding: 0;
	}
</style>