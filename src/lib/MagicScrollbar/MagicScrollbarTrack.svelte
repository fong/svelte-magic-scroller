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
        if (!size) {
            thumbPosition = minThumbTravel;
            return;
        }

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
        const stepDistance = size > 1 ? (Math.sign(totalDistance) * height) / 8 : 0;

        clearInterval(interval);
        interval = setInterval(() => {
            if (!isPressed || !size) {
                clearInterval(interval);
                return;
            }
            thumbPosition += stepDistance;
            if (Math.abs(targetPosition - thumbPosition) < Math.abs(stepDistance)) {
                thumbPosition = targetPosition;
                clearInterval(interval);
            }
            if (size > 1) {
                const percentComplete = thumbPosition / (maxThumbTravel - minThumbTravel);
                goto(Math.round(percentComplete * (size - 1)));
            }
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
    onmouseup={handleRelease}
    role="scrollbar"
    tabindex="0"
    aria-controls="magic-scroll-track"
    aria-valuemax={maxThumbTravel}
    aria-valuemin={minThumbTravel}
    aria-valuenow={thumbPosition}
    style={`position: fixed; right: 0; top: 0; height: 100%;`}
>
    {@render component(children)}
</div>
