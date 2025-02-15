<script>
    let isInitialRender = $state(true);

    let {
        component,
        width = $bindable(undefined),
        height = $bindable(undefined),
        transform = $bindable({ index: undefined, x: undefined, y: undefined }),
        isTouchMove,
        class: cn = '',
        style = '',
        index
    } = $props();

    let transformStyle = $state(`transform: translate3d(99999999px, 99999999px, 0); `);

    $effect(() => {
        if (typeof transform?.x === 'number' && typeof transform?.y === 'number') {
            transformStyle = `
                ${isInitialRender || isTouchMove ? 'transition: none;' : 'transition: transform 0.2s ease-in-out;'}
                transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
                -webkit-transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
            `;
        }

        // Set initial render to false after first position set
        if (isInitialRender) {
            setTimeout(() => {
                isInitialRender = false;
            }, 0);
        }
    });
</script>

<div
    class="magic-scroller-item {cn}"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    style={`${style} ${transformStyle}`}
>
    {@render component(index)}
</div>

<style>
    .magic-scroller-item {
        display: initial;
        position: absolute;
        width: 100%;
        height: fit-content;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        -webkit-font-smoothing: subpixel-antialiased;
    }
</style>
