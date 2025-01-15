<script>
    import MagicItem from './MagicItem.svelte';
    const BUFFER_PX = 200; // Buffer zone in pixels
    let containerBounds = $state(null);

    let {
        children,
        width,
        height,
        header,
        headerPlaceholder,
        footerPlaceholder,
        index = $bindable(0),
        data,
        item,
        placeholder,
        footer,
        direction = 'y',
        class: cn,
        style: style
    } = $props();

    let containerRef = $state(null);
    let itemWidths = $state(Array(data.length).fill(0));
    let itemHeights = $state(Array(data.length).fill(0));
    let itemTransformations = $state(Array(data.length).fill({}));
    let cumulativeHeights = $state([]);
    let lastX = $state(0);
    let lastY = $state(0);
    let scrollDelta = $state({ x: 0, y: 0 });
    let _index = $state(0);

    export const goto = (targetIndex) => {
        console.log(targetIndex);
        if (!containerBounds || targetIndex < 0 || targetIndex >= data.length) return;

        // // Calculate position to move target to top of container
        // const targetPosition = cumulativeHeights[targetIndex];

        // // Update scroll delta to position target at top
        // scrollDelta.x = 0;
        // scrollDelta.y = -targetPosition;

        // Update transformations for all items
        itemTransformations = itemHeights.map((height, i) => {
            if (i < targetIndex) {
                const stackPosition = cumulativeHeights[targetIndex] - cumulativeHeights[i];
                return { x: 0, y: -stackPosition };
            } else if (i > targetIndex) {
                const stackPosition =
                    cumulativeHeights[i] -
                    cumulativeHeights[targetIndex + 1] +
                    itemHeights[targetIndex];
                return { x: 0, y: stackPosition };
            }
            // Target index item
            return { x: 0, y: scrollDelta.y };
        });

        // Update index
        _index = targetIndex;
        index = targetIndex;
    };

    $effect(() => {
        let sum = 0;
        cumulativeHeights = itemHeights.map((height) => {
            const position = sum;
            sum += height;
            return position;
        });
    });

    $effect(() => {
        if (containerBounds && itemHeights && cumulativeHeights) {
            updateTransformations(0, 0);
        }
    });

    $effect(() => {
        if (containerRef) {
            containerBounds = containerRef.getBoundingClientRect();
        }
    });

    const handleOnScroll = (e) => {
        e.preventDefault();
        updateTransformations(e.deltaX * WHEEL_SCALE, e.deltaY * WHEEL_SCALE);
    };

    const handleOnTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;

        updateTransformations(deltaX, deltaY);

        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const handleOnTouchStart = (e) => {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const updateTransformations = (deltaX, deltaY) => {
        scrollDelta.x += direction !== 'y' ? deltaX : 0;
        scrollDelta.y += direction !== 'x' ? deltaY : 0;
        let __index = undefined;

        itemTransformations = itemHeights.map((height, i) => {
            let x = scrollDelta.x;
            let y = scrollDelta.y;

            if (i < _index) {
                const stackPosition = cumulativeHeights[_index] - cumulativeHeights[i];
                y = -stackPosition + scrollDelta.y;
            } else if (i > _index) {
                const stackPosition =
                    cumulativeHeights[i] - cumulativeHeights[_index + 1] + itemHeights[_index];
                y = stackPosition + scrollDelta.y;
            }

            const itemTop = y;
            if (__index === undefined && itemTop >= 0 && itemTop <= containerBounds.height) {
                __index = i;
            }

            // Index item moves with scroll
            return {
                x: x,
                y: y
            };
        });

        index = __index;
        console.log(index);
    };

    const isItemVisible = (transform) => {
        if (!containerBounds) return true;

        const itemY = transform.y;
        const containerTop = -BUFFER_PX;
        const containerBottom = containerBounds.height + BUFFER_PX;

        return itemY >= containerTop && itemY <= containerBottom;
    };
</script>

<div>{index}</div>
<div
    bind:this={containerRef}
    class={cn}
    style={`width: ${width}; height: ${height}; overflow: visible; background: grey; ${style}`}
    onscroll={handleOnScroll}
    ontouchmove={handleOnTouchMove}
    ontouchstart={handleOnTouchStart}
>
    {#each data as d, i (i)}
        <MagicItem
            visible={isItemVisible(itemTransformations[i])}
            bind:width={itemWidths[i]}
            bind:height={itemHeights[i]}
            bind:transform={itemTransformations[i]}
            component={item}
            data={d}
        />
    {/each}
</div>
