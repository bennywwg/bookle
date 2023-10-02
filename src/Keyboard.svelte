<script lang="ts">
    const rows: string[] = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "↩ZXCVBNM⌫"
    ];

    export let presentCorrectKeyLists;

    export let clickCallback: (key: string) => void;

    const clickMapper: (content: string) => string = (content: string) => {
        if (content == '↩') {
            return "Enter";
        } else if (content == '⌫') {
            return "Backspace";
        } else {
            return content;
        }
    };

    $: presentKeys = presentCorrectKeyLists ? presentCorrectKeyLists.presentKeys : [];
    $: correctKeys = presentCorrectKeyLists ? presentCorrectKeyLists.correctKeys : [];
    $: usedKeys = presentCorrectKeyLists ? presentCorrectKeyLists.usedKeys : [];

    $: keyStates = rows.map(row => {
        return row.split('').map(c => {
            let className: string = "unused";
            let content: string = c.toString();

            if (correctKeys.includes(c)) {
                className = "correct";
            } else if (presentKeys.includes(c)) {
                className = "present";
            } else if (usedKeys.includes(c)) {
                className = "missing";
            }

            return { content: content, className: className };
        });
    });
</script>

<div class="keyboard">
    {#each keyStates as row}
        <div class="keyrow">
            {#each row as keyState}
                <button class="key {keyState.className}" on:click={(ev) => { ev.currentTarget.blur(); clickCallback(clickMapper(keyState.content)); }}>
                    {keyState.content}
                </button>
            {/each}
        </div>
    {/each}
</div>

<style>
    .keyboard {
        display: flex;
        flex-direction: column;
    }

    .keyrow {
        display: flex;
        justify-content: center;
    }

    .key {
        border-radius: 2px;
        margin: 1px;
        width: 2rem;
        text-align: center;
        line-height: 250%;
        padding: 0;
        user-select: none;
    }

    .unused {
        background-color: #fff;
        border: 1px solid #000;
    }

    .missing {
        background-color: #aaa;
    }

    .present {
        background-color: #c9b458;
    }

    .correct {
        background-color: #6aaa64;
    }

</style>