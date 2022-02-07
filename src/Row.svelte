<script lang="ts">
    import LROversvg from './svg-modules/LROversvg.svelte';
    import Lsvg from './svg-modules/Lsvg.svelte';
    import RLOversvg from './svg-modules/RLOversvg.svelte';
    import RLUndersvg from './svg-modules/RLUndersvg.svelte';
    import Rsvg from './svg-modules/Rsvg.svelte';
    
	export let guess: string;
    export let submitted: boolean;
    export let showTransition: boolean;
    export let showMinisquaresSubmitted: boolean;

    export let presentCount: string;
    export let correctCount: string;

    export let transferCounts: string[];
    export let inputLimit: number;

    $: guessClass = submitted ? "guess-square-submitted" : "guess-square-input";
    $: characters = () => {
        let res = guess.split("");
        for (let i = 0; i < (inputLimit -  guess.length); ++i) {
            res.push("");
        }
        return res;
    };

    $: presentClass = submitted ? "present-indicator" : "present-indicator-empty";
    $: correctClass = submitted ? "correct-indicator" : "correct-indicator-empty";

    
</script>

<main>
    <div class="guess-row">
        {#each characters() as char}
            <div class="game-square {guessClass}">{char}</div>
        {/each}
        <div class="game-square {presentClass}">
            {presentCount}
            {#if showTransition}
                {#if transferCounts[2] !== "0"}
                    <LROversvg/>
                {/if}
                {#if transferCounts[0] !== "0"}
                    <Lsvg/>
                    <div class="minisquare present-minisquare{showMinisquaresSubmitted?'':'-empty'}">{transferCounts[0]}</div>
                {/if}
                {#if transferCounts[1] !== "0"}
                    {#if transferCounts[2] !== "0"}
                        <RLUndersvg/>
                    {:else}
                        <RLOversvg/>
                    {/if}
                    <div class="minisquare correct-minisquare{showMinisquaresSubmitted?'':'-empty'}">{transferCounts[1]}</div>
                {/if}
                {#if transferCounts[3] !== "0"}
                    <Rsvg/>
                {/if}
            {/if}
        </div>
        <div class="game-square {correctClass}">
            {correctCount}
            {#if showTransition}
                {#if transferCounts[2] !== "0"}
                    <div class="minisquare present-minisquare{showMinisquaresSubmitted?'':'-empty'}">{transferCounts[2]}</div>
                {/if}
                {#if transferCounts[3] !== "0"}
                    <div class="minisquare correct-minisquare{showMinisquaresSubmitted?'':'-empty'}">{transferCounts[3]}</div>
                {/if}
            {/if}
        </div>
    </div>
</main>

<style>
    .guess-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .game-square {
        width: var(--game-square-size);
        height: var(--game-square-size);
        text-align: center;
        line-height: var(--game-square-size);
        margin-left: calc(var(--game-square-border-size) * -1);
        margin-top: calc(var(--game-square-border-size) * -1);
        margin-right: calc(var(--game-square-margin) - var(--game-square-border-size));
        margin-bottom: calc(var(--game-square-margin) - var(--game-square-border-size));
        background-color: var(--color-background);
        font-size: 36px;
        font-weight: bold;
        border: var(--game-square-border-size) solid var(--color-background);
        position: relative;
    }

    .guess-square-input {
        border: var(--game-square-border-size) solid var(--color-tone-4);
    }

    .guess-square-submitted {
        background-color: var(--color-tone-2);
        color: var(--color-background);
    }

    .present-indicator {
        background-color: var(--yellow);
        color: var(--color-background);
        margin-left: calc(var(--game-square-size) * 0.6);
    }

    .correct-indicator {
        background-color: var(--green);
        color: var(--color-background);
        margin-left: calc(var(--game-square-size) * 1.3);
    }

    .present-indicator-empty {
        border: var(--game-square-border-size) dashed var(--darkendYellow);
        margin-left: calc(var(--game-square-size) * 0.6);
    }

    .correct-indicator-empty {
        border: var(--game-square-border-size) dashed var(--darkendGreen);
        margin-left: calc(var(--game-square-size) * 1.3);
    }

    .minisquare {
        width: calc(var(--game-square-size) * 0.5);
        height: calc(var(--game-square-size) * 0.4);
        text-align: center;
        line-height: calc(var(--game-square-size) * 0.4);
        background-color: var(--color-background);
        font-size: 24px;
        font-weight: bold;
        border: var(--game-square-border-size) solid var(--color-background);
        position: absolute;
    }

    .present-minisquare {
        background-color: var(--yellow);
        color: var(--color-background);
        left: calc(var(--game-square-size) * -0.59);
        top: calc(var(--game-square-size) * 0.25);
        border-top-left-radius: 30%;
        border-bottom-left-radius: 30%;
    }

    .correct-minisquare {
        background-color: var(--green);
        color: var(--color-background);
        left: calc(var(--game-square-size) * 1.04);
        top: calc(var(--game-square-size) * 0.25);
        border-top-right-radius: 30%;
        border-bottom-right-radius: 30%;
    }

    .present-minisquare-empty {
        border: var(--game-square-border-size) dashed var(--darkendYellow);
        left: calc(var(--game-square-size) * -0.59);
        top: calc(var(--game-square-size) * 0.25);
    }

    .correct-minisquare-empty {
        border: var(--game-square-border-size) dashed var(--darkendYellow);
        left: calc(var(--game-square-size) * 1.04);
        top: calc(var(--game-square-size) * 0.25);
    }

    :global(.graphics) {
        width: calc(var(--game-square-size) * 2);
        height: calc(var(--game-square-size));
        fill: var(--color-tone-2);
        top: calc(var(--game-square-size) * -0.4);
        position: absolute;
        z-index: 1;
    }

    :global(.graphics-l) {
        left: calc(var(--game-square-size) * -2);
    }

    :global(.graphics-r) {
        left: calc(var(--game-square-size) * 3.45);
    }

    :global(.graphics-l-r-over) {
        left: calc(var(--game-square-size) * 0.41);
    }

    :global(.graphics-r-l-over) {
        left: calc(var(--game-square-size) * 1);
    }

    :global(.graphics-r-l-under) {
        left: calc(var(--game-square-size) * 1.01);
    }
</style>