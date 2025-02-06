<script>
    import { onDestroy, onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let { index, length, loaded = $bindable(false) } = $props();

    const src = `https://picsum.photos/seed/${index}/600/600`;
    let img = $state();
    let delayedLoad = $state();

    onMount(() => {
        // delay image loading so that network requests are throttled
        // only load if item is in buffer for enough time
        delayedLoad = setTimeout(() => {
            img = new Image();
            img.src = src;
            img.onload = () => {
                loaded = true;
            };
        }, 150);
    });

    onDestroy(() => {
        clearTimeout(delayedLoad);
        loaded = false;
        if (img?.src) {
            img.src = ''; // cancel network request for image
        }
    });

    function writeScientificNum(p_num, p_precision) {
        var n = Math.floor(Math.log10(p_num));
        var m = (p_num / Math.pow(10, Math.abs(n))).toLocaleString();
        return m.toString() + ' x 10<sup>' + n.toString() + '</sup>';
    }
</script>

<div
    class="item"
    style={`padding: ${index === 0 ? `16px 16px 8px` : index === length - 1 ? `8px 16px 16px` : `8px 16px;`}`}
>
    {#if index === 0}
        <div class="title-card">
            <h1>svelte-magic-scroller</h1>
            <h3>It's not real - it's just magic</h3>

            <p>
                This package is a virtualized scroller which enables the scrolling of unlimited
                items of unknown dimensions. Only items in the vicinity of the current viewport are
                rendered.
            </p>
            <p>
                This page is a list of {@html writeScientificNum(length, 3)} items, including this intro
                section and all the documentation sections.
            </p>
        </div>
    {:else if index > 0 && index < 5}
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
                        <code>goto</code> function does not support smooth scrolling for big jumps, only
                        for items already on the buffer
                    </li>
                    <li>
                        Precise scrollbar scrubbing is unavailable (always snaps to top of items)
                    </li>
                    <li>No support for iOS Safari status bar go to top tap action</li>
                    <li>
                        By default, Safari will run page rendering at 60fps which can feel a bit
                        sluggish for users with high refresh rate / ProMotion (120hz) displays. To
                        remove this limit, users will need to go to their settings and turn off <code
                            >Advanced > Prefer Page Rendering Updates near 60fps</code
                        >
                    </li>
                </ul>
            {/if}
        </div>
    {:else}
        <div class="card">
            <div class="image-container">
                {#if loaded}
                    <img
                        class="card-image"
                        {src}
                        alt={`Image ${index}`}
                        onload={() => (loaded = true)}
                        transition:fade={{ duration: 150 }}
                    />
                {:else}
                    <div class="placeholder" alt={`Placeholder for Image ${index}`}>
                        <div></div>
                    </div>
                {/if}
            </div>

            <div class="text-container">
                <h4>
                    Index #{index.toLocaleString()}
                </h4>
            </div>
        </div>
    {/if}
</div>

<style>
    .title-card,
    .info-card {
        align-items: left;
        flex-direction: column;
        display: flex;
        height: 100%;
        justify-content: start;
        width: 100%;
        padding: 8px;
        max-width: 40rem;

        h1 {
            font-size: 3rem;
            font-weight: 400;
            margin: 0;
        }

        h3 {
            font-size: 1.5rem;
            font-weight: 300;
            margin: 8px 0;
        }

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

        sub {
            font-size: 0.75rem;
            color: gray;
        }
    }

    .info-card {
        border-radius: 8px;
        border: 1px solid #22222222;
        padding: 8px;
        position: relative;
        display: flex;
        width: 100%;
        max-width: 40rem;
    }

    .card-image {
        aspect-ratio: 1 / 1;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
    }

    .item {
        height: fit-content;
        overflow: visible;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
        justify-content: center;
        display: flex;
        width: 100%;
        max-width: 64rem;
        margin-bottom: 1rem;
    }

    .card {
        background: white;
        border-radius: 8px;
        border: 4px solid #222;
        box-shadow: 8px 8px 0px #222;
        aspect-ratio: 6/7;
        overflow: hidden;
        padding: 8px;
        position: relative;
        display: flex;
        width: 100%;
        max-width: 420px;
    }

    .placeholder {
        aspect-ratio: 1 / 1;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;

        /* animation */
        animation: shimmer 1s infinite linear;
        background: linear-gradient(-45deg, #eee 40%, #fafafa 50%, #eee 60%);
        background-size: 300%;
        background-position-x: 100%;
    }

    .text-container {
        align-items: center;
        bottom: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        justify-content: center;
        left: 0;
        position: absolute;

        h4 {
            font-weight: 400;
        }
    }

    @keyframes shimmer {
        to {
            background-position-x: 0%;
        }
    }
</style>
