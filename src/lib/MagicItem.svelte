<script>
    let {
        visible = $bindable(false),
        component,
        width = $bindable(0),
        height = $bindable(0),
        transform = $bindable({
            x: 0,
            y: 0
        }),
        data
    } = $props();

    let transformStyle = $state(``);

    $effect(() => {
        transformStyle = `transform: translate3d(${transform.x}px, ${transform.y}px, 0);`;
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
