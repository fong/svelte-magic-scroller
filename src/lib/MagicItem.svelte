<script>
    let {
        visible = $bindable(false),
        component,
        width = $bindable(undefined),
        height = $bindable(undefined),
        transform = $bindable({
            x: undefined,
            y: undefined
        }),
        data
    } = $props();

    let transformStyle = $state(`transform: translate3d(999999px, 999999px, 0);`);

    $effect(() => {
        if (typeof transform?.x === 'number' && typeof transform?.y === 'number') {
            transformStyle = `transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);`;
        }
    });
</script>

{#if visible}
    <div
        bind:offsetWidth={width}
        bind:offsetHeight={height}
        style={`position: absolute; ${transformStyle}`}
    >
        {@render component(data)}
    </div>
{/if}
