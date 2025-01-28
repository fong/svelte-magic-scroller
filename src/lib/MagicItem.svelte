<script>
    let {
        component,
        width = $bindable(undefined),
        height = $bindable(undefined),
        transform = $bindable({ index: undefined, x: undefined, y: undefined }),
        loadDirection = 'down',
        index
    } = $props();

    let transformStyle = $state(`transform: translate3d(999999px, 999999px, 0);`);

    $effect(() => {
        if (typeof transform?.x === 'number' && typeof transform?.y === 'number') {
            transformStyle = `
                transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
                -webkit-transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
            `;
        }
    });
</script>

<div
    class="magic-scroller-item"
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    style={`${transformStyle}`}
>
    {@render component(index, loadDirection)}
</div>

<style>
    .magic-scroller-item {
        position: absolute;
        width: 100%;
        height: fit-content;
        will-change: transform;
        perspective: 1000;
        -webkit-perspective: 1000;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
</style>
