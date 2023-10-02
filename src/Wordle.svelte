<script lang="ts">
	import Row from './Row.svelte';

    export let guesses: string[];
    export let solution: string;
    export let numGuesses: number;
    export let defocused: boolean;
    export let focused: boolean;
    export let selectedCallback: (string) => void;
    export let playingSubmitAnimation: boolean;
    
    $: filledGuesses = () => {
        let res: string[] = [];
        for (let i = 0; i < numGuesses; ++i) {
            let word = i >= guesses.length ? "" : guesses[i];
            while (word.length < solution.length) {
                word = word + " ";
            }
            res.push(word);
        }
        return res;
    };
</script>

<div class={defocused ? "wordle wordle-defocused" : (focused ? "wordle wordle-focused" : "wordle")} on:click={() => selectedCallback(solution)}>
    {#each filledGuesses() as guess, i}
        <Row
            guess={guess}
			solution={solution}
            submitted={i < guesses.length - 1}
            playingSubmit={playingSubmitAnimation}
            rowIndex={i}
        />
    {/each}
</div>

<style>
	.wordle {
		padding: 0.1em;
		margin: 0.1em;
		border: 0.1em solid black;
        border-radius: 0.25em;
        display: flex;
        flex-direction: column;
        transition: 0.5s;
	}

    .wordle-focused {
        box-shadow: 5px 5px 5px #88b;
        z-index: 10;
    }

    .wordle-defocused {
        opacity: 0.3;
        border: 0.1em solid #888;
        transition: 0.5s;
    }
</style>