<script>
    import MagicItem from './MagicItem.svelte';
    import CircularArray from './CircularArray';
    const BUFFER_ZONE = 25; // Content to buffer above and below current index
    let containerBounds = $state(null);

    let {
        children,
        width,
        height,
        header,
        headerPlaceholder,
        footerPlaceholder,
        index = $bindable(0),
        length,
        item,
        placeholder,
        footer,
        direction = 'y',
        class: cn,
        style: style
    } = $props();

    let containerRef = $state(null);
    let itemDimensions = $state(Array(length).fill({ width: 0, height: 0 }));
    let lastX = $state(0);
    let lastY = $state(0);
    let scrollDelta = $state({ x: 0, y: 0 });
    let _index = $state(2);
    let offset = $state({ x: 0, y: 0 });

    let itemTransformations = $derived.by(() => {
        let currentIndex = _index;
        let anchorY = offset?.y || 0;

        // Create circular buffer
        let tempTransformations = new CircularArray(BUFFER_ZONE * 2);

        tempTransformations.set(currentIndex, {
            index: currentIndex,
            x: 0,
            y: anchorY
        });

        // Set positions above current index
        let upIndex = currentIndex - 1;
        let upOffset = anchorY;

        while (upIndex >= 0 && upIndex > currentIndex - BUFFER_ZONE) {
            const yTransform = itemDimensions[upIndex].height - upOffset || 0;
            tempTransformations.set(upIndex, {
                index: upIndex,
                x: 0,
                y: -yTransform
            });
            upOffset -= itemDimensions[upIndex].height;
            upIndex--;
        }

        // Set positions below current index
        upIndex = currentIndex + 1;
        upOffset = anchorY + itemDimensions[currentIndex].height;

        while (upIndex < length && upIndex < currentIndex + BUFFER_ZONE) {
            const yTransform = upOffset || 999999;
            tempTransformations.set(upIndex, {
                index: upIndex,
                x: 0,
                y: yTransform
            });
            upOffset += itemDimensions[upIndex].height;
            upIndex++;
        }

        return tempTransformations;
    });

    export const goto = (targetIndex, options) => {
        console.log(targetIndex);
        if (!containerBounds || targetIndex < 0 || targetIndex >= length) return;

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
                if (
                    offset.y > itemDimensions[_index - 1].height &&
                    itemDimensions[_index - 1].height < containerBounds.height
                ) {
                    offset = { ...offset, y: offset.y - itemDimensions[_index - 1].height };
                    _index--;
                }

                if (
                    offset.y + containerBounds.height > itemDimensions[_index - 1].height &&
                    itemDimensions[_index - 1].height > containerBounds.height
                ) {
                    offset = { ...offset, y: offset.y - itemDimensions[_index - 1].height };
                    _index--;
                }
            }
        }

        if (deltaY < 0) {
            console.log('scroll down');
            // scroll down
            if (_index < length) {
                if (offset.y < 0 && itemDimensions[_index].height < containerBounds.height) {
                    offset = { ...offset, y: offset.y + itemDimensions[_index].height };
                    _index++;
                }

                if (
                    offset.y + containerBounds.height < 0 &&
                    itemDimensions[_index].height < containerBounds.height
                ) {
                    offset = { ...offset, y: offset.y + itemDimensions[_index].height };
                    _index++;
                }
            }
        }
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
        {JSON.stringify(itemDimensions[_index])}
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
    {#each itemTransformations as d, i (i)}
        {#key d?.index}
            {#if typeof d?.index === 'number' && d?.index >= 0 && d?.index < length}
                <MagicItem
                    bind:width={itemDimensions[d.index].width}
                    bind:height={itemDimensions[d.index].height}
                    transform={d}
                    component={item}
                    index={d.index}
                />
            {/if}
        {/key}
    {/each}
</div>
