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
            transformStyle = `transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);`;
        }
    });
</script>

<div
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    style={`position: absolute; width: 100%; height: fit-content; ${transformStyle}`}
>
    {@render component(index, loadDirection)}
</div>
