<script>
    let { index } = $props();
</script>

<div class="info-card">
    {#if index === 1}
        <h5>Install</h5>
        <b>npm</b>
        <p><code>npm install svelte-magic-scroller</code></p>
        <b>yarn</b>
        <p><code>yarn i svelte-magic-scroller</code></p>
        <b>pnpm</b>
        <p><code>pnpm i svelte-magic-scroller</code></p>
    {:else if index === 2}
        <h5>How to Use</h5>
    {:else if index === 3}
        <h5>Features:</h5>
        <ul>
            <li>
                No restrictions for dimensions of virtualized list <span
                    >(bypass 33554400px browser dimension limit)</span
                >
            </li>
            <li>Lazy loading</li>
            <li>Low memory footprint</li>
            <li>Configurable scroll speed</li>
            <li>Fixed/Dynamic item sizes</li>
            <li>Middle mouse button drag scroll support</li>
            <li>Made for Svelte 5</li>
        </ul>
    {:else if index === 4}
        <h5>Quirks:</h5>
        <ul>
            <li>
                <code>goto</code> function does not support smooth scrolling for big jumps, only for
                items already in the buffer
            </li>
            <li>Precise scrollbar scrubbing is unavailable (always snaps to top of items)</li>
            <li>No support for iOS Safari status bar go to top tap action</li>
            <li>
                By default, Safari will run page rendering at 60fps which can feel a bit sluggish
                for users with high refresh rate / ProMotion (120hz) displays. To remove this limit,
                users will need to go to their settings and turn off <code
                    >Advanced > Prefer Page Rendering Updates near 60fps</code
                >
            </li>
        </ul>
    {/if}
</div>

<style>
    .info-card {
        align-items: left;
        flex-direction: column;
        display: flex;
        height: 100%;
        justify-content: start;
        width: 100%;
        padding: 8px;
        max-width: 40rem;

        h5 {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 8px 0;
            line-height: 1.25rem;
            margin-block-start: 0rem;
        }

        ul {
            padding: 0;
            margin: 0;
            margin-left: 16px;
        }

        li {
            margin: 8px 0;
        }

        code {
            background-color: lightgray;
            padding: 2px 4px;
        }
    }
</style>
