<script>
    let { index } = $props();
</script>

<div class="info-card">
    {#if index === 1}
        <h4>Features:</h4>
        <ul>
            <li>
                No restrictions to dimensions of virtualized lists (exceeds the 33554428px on
                Chrome/Safari, 33554400px on Firefox browser dimension limit)
            </li>
            <li>Lazy loading</li>
            <li>Low memory footprint</li>
            <li>Configurable scroll speed</li>
            <li>Fixed/Dynamic item sizes</li>
            <li>Middle mouse button drag scroll support</li>
            <li>Made for Svelte 5</li>
            <li>No dependencies</li>
        </ul>
    {:else if index === 2}
        <h4>Install</h4>
        <p><code>npm install svelte-magic-scroller</code></p>
        <p><code>yarn i svelte-magic-scroller</code></p>
        <p><code>pnpm i svelte-magic-scroller</code></p>
    {:else if index === 3}
        <h4>How to Use</h4>
        <br />
        <h5>Minimal example</h5>

        <pre>
{`<script>
    const INITIAL_LENGTH = 5000000000000;
    let length = $state(INITIAL_LENGTH); // list size
    let index = $state(0); // first full item visible in viewport
    let offset = $state(0); // y offset from top
    let ref = $state();
</script>

{#snippet item(i)}
    <Item index={i} {length} />
{/snippet}

<MagicScroller
    bind:this={ref}
    bind:index
    bind:offset
    itemStyle={\`display: flex; justify-content: center;\`}
    width="100%"
    height="100%"
    {length}
    {item}
/>`}
    </pre>

        <h5>Go to</h5>

        <p>
            You can use <code>goto(index)</code> to jump to any place in the list (e.g.
            <code>ref?.goto(256000)</code>). If you would like to offset the location, you can add
            to the optional parameters (e.g. <code>{`ref?.goto(256000, { offset: 64})`}</code>).
        </p>
        <p>
            The <code>goto</code> function does not support smooth scrolling when performing large list
            jumps, unless the target item is already in the buffer.
        </p>
    {:else if index === 4}
        <h4>Scroll bar</h4>
        <p>
            It is recommended to implement your own scroll bar to match your UX requirements. This
            is due to handling experience as the list size increase - the implementation of a
            scrollbar with 10,000 will likely need to differ significantly to another list with
            1,000,000+ items. A basic scrollbar example can be found in the repo
            <a href="https://github.com/fong/svelte-magic-scroller/tree/main/src/lib/MagicScrollbar"
                >here</a
            >
        </p>
    {:else if index === 5}
        <h4>Quirks:</h4>
        <ul>
            <li>
                while <code>index</code> and <code>offset</code> are bindable and can be set to move
                to any location on the list, it is recommended to use <code>goto()</code> to set the
                correct positions at the start/end of the list
            </li>
            <li>No support for iOS Safari status bar go to top tap action</li>
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

        h4 {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 8px 0;
            line-height: 1.25rem;
            margin-block-start: 0rem;
        }

        h5 {
            font-size: 1rem;
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

        pre {
            background-color: lightgray;
            padding: 2px 4px;
        }

        code {
            background-color: lightgray;
            padding: 2px 4px;
        }
    }
</style>
