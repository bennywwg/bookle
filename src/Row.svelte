<script lang="ts">
	export let guess: string;
    export let solution: string;
    export let submitted: boolean;
	export let playingSubmit: boolean = false;
	export let rowIndex: number;

    const calcPresentAndCorrect = (guess: string): [any, any] => {
		let guessFrequencies = { };
		guess.split('')
		.forEach(character => {
			guessFrequencies[character] = (guessFrequencies[character] || 0) + 1;
		});

		let canonicalFrequencies = { };
		solution.split('')
		.forEach(character => {
			canonicalFrequencies[character] = (canonicalFrequencies[character] || 0) + 1;
		});

		let correctFrequencies = { };

		// Count the correct and present letters
		let numCorrect = 0;
		for (let i = 0; i < solution.length; i++) {
			let character = guess[i];
			if (character === solution[i]) {
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

		return [presentFrequencies, correctFrequencies];
	};

	const genClassList = (guess: string, frequencies: [any, any], missingClass: string, presentClass: string, correctClass: string, ): string[] => {
		frequencies = [{ ...(frequencies[0]) }, { ...(frequencies[1]) }];
		return guess
		.split('')
		.map((character, i) => {
			if (character === solution[i]) {
				--frequencies[1][character];
				return correctClass;
			} else if (frequencies[0][character] && frequencies[0][character] > 0) {
				--frequencies[0][character];
				return presentClass;
			} else {
				return missingClass;
			}
		});
	};

    $: characters = () => {
        let res = guess.split('');
        for (let i = 0; i < (solution.length -  guess.length); ++i) {
            res.push('');
        }
        let classes = genClassList(guess, calcPresentAndCorrect(guess), 'missing', 'present', 'correct');
        return res.map((char, i) => { return { character: char, class: classes[i] } });
    };
</script>

<div class="guess-row">
    {#each characters() as item, i}
        <div
			class={submitted ? ((`game-square game-square-submitted ${item.class}`) + (playingSubmit ? " game-square-destroying" : "")) : "game-square"}
			style={playingSubmit ? (`transition-delay: ${(rowIndex + i) * 0.1}s`) : ""}
		>
			{item.character}
		</div>
    {/each}
</div>

<style>
    .guess-row {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
		align-items: stretch;
    }

    .game-square {
        text-align: center;
        margin: 2px;
        background-color: var(--color-background);
        font-weight: bold;
        color: var(--darkGray);
        outline: 1px solid var(--darkGray);
		border-radius: 0.25em;
		min-width: var(--min-size);
		text-align: center;
		width: var(--tile-size);
		height: var(--tile-size);
		font-size: calc(0.5 * var(--tile-size));
		line-height: var(--tile-size);
    }

    .game-square-submitted {
        color: #fff;
    }

	.game-square-destroying {
		transform: scale(0, 2);
		opacity: 0;
		transition: 1s;
	}

    .missing {
        background-color: var(--gray);
    }

    .present {
        background-color: var(--yellow);
    }

    .correct {
        background-color: var(--green);
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
		--tile-size: 2rem;
	}
</style>