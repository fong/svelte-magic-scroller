<script>
    let {
        component,
        height = $bindable(0),
        width = $bindable(0),
        thumbHeight = $bindable(0),
        trackHeight = $bindable(0),
        minThumbTravel = $bindable(0),
        maxThumbTravel = $bindable(0),
        offset,
        children
    } = $props();

    const init = () => {
        trackHeight = height;
        maxThumbTravel = trackHeight - thumbHeight - offset?.bottom || 0;
        minThumbTravel = offset?.top || 0;
    };

    const resize = () => {
        trackHeight = height;
        maxThumbTravel = trackHeight - thumbHeight - offset?.bottom || 0;
        minThumbTravel = offset?.top || 0;
    };

    $effect(() => {
        init();
    });
</script>

<div
    bind:offsetHeight={height}
    bind:offsetWidth={width}
    onresize={resize}
    style={`position: fixed; right: 0; top: 0; height: 100%;`}
>
    {@render component(children)}
</div>
