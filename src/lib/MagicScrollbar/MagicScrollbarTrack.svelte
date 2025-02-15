<script>
    import { onDestroy } from 'svelte';

    let {
        component,
        currentY = $bindable(0),
        height = $bindable(0),
        isDragging = $bindable(false),
        maxThumbTravel = $bindable(0),
        minThumbTravel = $bindable(0),
        startY = $bindable(0),
        thumbHeight = $bindable(0),
        thumbPosition = $bindable(0),
        trackHeight = $bindable(0),
        width = $bindable(0),
        children,
        goto,
        offset,
        size
    } = $props();

    const init = () => {
        trackHeight = height;
        maxThumbTravel = trackHeight - offset?.bottom || 0;
        minThumbTravel = offset?.top || 0;
    };

    const resize = () => {
        trackHeight = height;
        maxThumbTravel = trackHeight - offset?.bottom || 0;
        minThumbTravel = offset?.top || 0;
    };

    $effect(() => {
        init();
    });

    let interval = $state(null);
    const STEP_INTERVAL = 500;

    let isPressed = $state(false);
    let targetPosition = $state(0);

    const handleTrackPress = (e) => {
        isPressed = true;
        const trackRect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - trackRect.top;

        if (clickY >= thumbPosition && clickY <= thumbPosition + thumbHeight) {
            return;
        }

        targetPosition = Math.max(
            minThumbTravel,
            Math.min(clickY - thumbHeight / 2, maxThumbTravel)
        );

        const totalDistance = targetPosition - thumbPosition;
        const stepDistance = (Math.sign(totalDistance) * height) / 8;

        clearInterval(interval);
        interval = setInterval(() => {
            if (!isPressed) {
                clearInterval(interval);
                return;
            }
            thumbPosition += stepDistance;
            if (Math.abs(targetPosition - thumbPosition) < Math.abs(stepDistance)) {
                thumbPosition = targetPosition + thumbHeight / 2;
                isDragging = true;
                clearInterval(interval);
            }
            const percentComplete = thumbPosition / (maxThumbTravel - minThumbTravel);
            currentY = thumbPosition;
            startY = thumbPosition;
            goto(Math.round(percentComplete * (size - 1)));
        }, STEP_INTERVAL);
    };

    const handleRelease = () => {
        isPressed = false;
        clearInterval(interval);
    };

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<div
    bind:offsetHeight={height}
    bind:offsetWidth={width}
    onresize={resize}
    onmousedown={handleTrackPress}
    ontouchstart={handleTrackPress}
    onmouseup={handleRelease}
    ontouchend={handleRelease}
    style={`position: fixed; right: 0; top: 0; height: 100%;`}
>
    {@render component(children)}
</div>
