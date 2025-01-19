<script>
    import MagicItem from './MagicItem.svelte';
    const BUFFER_PX = 5000; // Buffer zone in pixels
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
    let itemWidths = $state(Array(data.length).fill(undefined));
    let itemHeights = $state(Array(data.length).fill(undefined));
    // let itemTransformations = $state([]);
    let lastX = $state(0);
    let lastY = $state(0);
    let scrollDelta = $state({ x: 0, y: 0 });
    let _index = $state(2);
    let offset = $state({ x: 0, y: 0 });

    let itemTransformations = $derived.by(() => {
        let currentIndex = _index;
        let anchorY = offset?.y || 0;

        let tempTransformations = Array(data.length).fill({ x: 0, y: undefined });

        // current index
        tempTransformations[currentIndex] = { x: 0, y: anchorY };

        // set positions of items above current index
        let upIndex = currentIndex - 1;
        let upOffset = anchorY;

        while (upIndex >= 0 && Math.abs(upOffset) <= BUFFER_PX) {
            const yTransform = itemHeights[upIndex] - upOffset || 0;
            tempTransformations[upIndex] = { x: 0, y: -yTransform };
            upOffset -= itemHeights[upIndex];
            upIndex--;
        }

        // set positions of items below current index
        upIndex = currentIndex + 1;
        upOffset = anchorY + itemHeights[currentIndex];

        while (
            upIndex < data.length &&
            Math.abs(upOffset) <= (BUFFER_PX + containerBounds?.height || 0)
        ) {
            const yTransform = upOffset || 999999;
            tempTransformations[upIndex] = { x: 0, y: yTransform };
            upOffset += itemHeights[upIndex];
            upIndex++;
        }

        return tempTransformations;
    });

    export const goto = (targetIndex, options) => {
        console.log(targetIndex);
        if (!containerBounds || targetIndex < 0 || targetIndex >= data.length) return;

        offset = options?.offset || { x: 0, y: 0 };
        _index = targetIndex;
        index = targetIndex;
    };

    $effect(() => {
        if (containerRef) {
            containerBounds = containerRef.getBoundingClientRect();
        }
    });

    const handleOnScroll = (e) => {
        e.preventDefault();
        scrollTransformations(e.deltaX * WHEEL_SCALE, e.deltaY * WHEEL_SCALE);
    };

    const handleOnTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;

        scrollTransformations(deltaX, deltaY);

        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const handleOnTouchStart = (e) => {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const scrollTransformations = (deltaX, deltaY, anchor, index) => {
        scrollDelta.x += direction !== 'y' ? deltaX : 0;
        scrollDelta.y += direction !== 'x' ? deltaY : 0;

        offset.x += deltaX;
        offset.y += deltaY;

        if (deltaY > 0) {
            console.log('scroll up');
            // scroll up
            if (_index > 0) {
                if (offset.y > itemHeights[_index - 1] || offset.y > containerBounds.height) {
                    offset = { ...offset, y: offset.y - itemHeights[_index - 1] };
                    _index--;
                }
            }
        }

        if (deltaY < 0) {
            console.log('scroll down');
            // scroll down
            if (_index < data.length) {
                if (offset.y < 0 && itemHeights[_index] < containerBounds.height) {
                    offset = { ...offset, y: offset.y + itemHeights[_index] };
                    _index++;
                }

                if (
                    offset.y + containerBounds.height < 0 &&
                    itemHeights[_index] < containerBounds.height
                ) {
                    offset = { ...offset, y: offset.y + itemHeights[_index] };
                    _index++;
                }
            }
        }
    };

    const isItemVisible = (transform) => {
        if (!containerBounds) return true;

        const itemY = transform?.y;
        const containerTop = -BUFFER_PX;
        const containerBottom = containerBounds.height + BUFFER_PX;

        return itemY >= containerTop && itemY <= containerBottom;
    };
</script>

<div style={'position: absolute; right: 0;'}>
    <p>
        {_index}
    </p>
    <p>
        {JSON.stringify(offset)}
    </p>
    <p>
        {JSON.stringify(itemHeights[_index])}
    </p>
</div>
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
