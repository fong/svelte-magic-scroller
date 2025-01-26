<script>
    import MagicItem from './MagicItem.svelte';
    const BUFFER_ZONE = 25; // Content to buffer above and below current index
    const FULL_BUFFER = BUFFER_ZONE * 2;
    const VELOCITY_HISTORY = 5;
    const FRICTION = 0.95;
    const MIN_VELOCITY = 0.1;
    let containerBounds = $state(null);
    const WHEEL_SCALE = 1.0;
    const SCROLL_CHUNK_SIZE = 100;
    const MOMENTUM_FACTOR = 0.8;

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
        footer,
        direction = 'y',
        class: cn,
        style: style
    } = $props();

    let containerRef = $state(null);
    let itemDimensions = $state(Array(FULL_BUFFER).fill({ width: 0, height: 0 }));
    let lastX = $state(0);
    let lastY = $state(0);
    let scrollDelta = $state({ x: 0, y: 0 });
    let _index = $state(2);
    let offset = $state({ x: 0, y: 0 });
    let touchHistory = $state([]);
    let velocityX = $state(0);
    let velocityY = $state(0);
    let animationFrame = $state(null);

    let itemTransformations = $derived.by(() => {
        let currentIndex = _index;
        let anchorY = offset?.y || 0;

        let tempTransformations = new Array(FULL_BUFFER);

        tempTransformations[currentIndex % FULL_BUFFER] = {
            index: currentIndex,
            x: 0,
            y: anchorY
        };

        // Set positions above current index
        let upIndex = currentIndex - 1;
        let upOffset = anchorY;

        if (upIndex >= 0) {
            while (upIndex >= 0 && upIndex > currentIndex - BUFFER_ZONE) {
                const yTransform = itemDimensions[upIndex % FULL_BUFFER].height - upOffset || 0;
                tempTransformations[upIndex % FULL_BUFFER] = {
                    index: upIndex,
                    x: 0,
                    y: -yTransform
                };
                upOffset -= itemDimensions[upIndex % FULL_BUFFER].height;
                upIndex--;
            }
        }

        // Set positions below current index
        upIndex = currentIndex + 1;

        if (upIndex < length) {
            upOffset = anchorY + itemDimensions[currentIndex % FULL_BUFFER].height;

            while (upIndex < length && upIndex < currentIndex + BUFFER_ZONE) {
                const yTransform = upOffset || 999999;
                tempTransformations[upIndex % FULL_BUFFER] = {
                    index: upIndex,
                    x: 0,
                    y: yTransform
                };
                upOffset += itemDimensions[upIndex % FULL_BUFFER].height;
                upIndex++;
            }
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

    const handleOnWheel = (e) => {
        e.preventDefault();
        scrollTransformations(e.deltaX * WHEEL_SCALE, -e.deltaY * WHEEL_SCALE);
    };

    const handleOnTouchMove = (e) => {
        const touch = e.touches[0];
        const now = Date.now();
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;

        // Store touch history
        touchHistory.push({
            x: touch.clientX,
            y: touch.clientY,
            time: now
        });

        // Keep last N positions
        if (touchHistory.length > VELOCITY_HISTORY) {
            touchHistory.shift();
        }

        scrollTransformations(deltaX, deltaY);
        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const handleOnTouchStart = (e) => {
        const touch = e.touches[0];
        lastX = touch.clientX;
        lastY = touch.clientY;
    };

    const handleOnTouchEnd = () => {
        if (touchHistory.length < 2) return;

        // Calculate final velocity
        const lastTouch = touchHistory[touchHistory.length - 1];
        const firstTouch = touchHistory[0];
        const deltaTime = lastTouch.time - firstTouch.time;

        if (deltaTime > 0) {
            velocityX = ((lastTouch.x - firstTouch.x) / deltaTime) * 16;
            velocityY = ((lastTouch.y - firstTouch.y) / deltaTime) * 16;

            // Start momentum animation
            animationFrame = requestAnimationFrame(applyMomentum);
        }

        touchHistory = [];
    };

    const applyMomentum = () => {
        if (Math.abs(velocityX) < MIN_VELOCITY && Math.abs(velocityY) < MIN_VELOCITY) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        scrollTransformations(velocityX, velocityY);
        velocityX *= FRICTION;
        velocityY *= FRICTION;

        animationFrame = requestAnimationFrame(applyMomentum);
    };

    const scrollTransformations = (deltaX, deltaY, anchor, index) => {
        // Scale delta for wheel events
        const scaledDeltaY = Math.sign(deltaY) * Math.min(Math.abs(deltaY), SCROLL_CHUNK_SIZE);

        // Update scroll position
        scrollDelta.x += direction !== 'y' ? deltaX : 0;
        scrollDelta.y += direction !== 'x' ? scaledDeltaY : 0;

        // Update offset with scaled delta
        offset.x += deltaX;
        offset.y += scaledDeltaY;

        // Calculate total scroll distance
        let remainingScroll = Math.abs(deltaY);
        let scrollDirection = Math.sign(deltaY);

        while (remainingScroll > 0 && (scrollDirection > 0 ? _index > 0 : _index < length - 1)) {
            const currentHeight = itemDimensions[_index % FULL_BUFFER].height;
            const targetHeight =
                scrollDirection > 0
                    ? itemDimensions[(_index - 1) % FULL_BUFFER].height
                    : itemDimensions[(_index + 1) % FULL_BUFFER].height;

            if (scrollDirection > 0) {
                // Scrolling up
                if (
                    offset.y > targetHeight ||
                    (offset.y + containerBounds.height > targetHeight &&
                        targetHeight > containerBounds.height)
                ) {
                    offset.y -= targetHeight;
                    _index--;
                }
            } else {
                // Scrolling down
                if (
                    offset.y < 0 ||
                    (offset.y + containerBounds.height < 0 &&
                        currentHeight < containerBounds.height)
                ) {
                    offset.y += currentHeight;
                    _index++;
                }
            }

            remainingScroll -= SCROLL_CHUNK_SIZE;
        }

        // Apply momentum if large scroll
        if (Math.abs(deltaY) > SCROLL_CHUNK_SIZE) {
            requestAnimationFrame(() => {
                scrollTransformations(0, deltaY * MOMENTUM_FACTOR, anchor, index);
            });
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
        {JSON.stringify(itemDimensions[_index % FULL_BUFFER])}
    </p>
</div>
<div
    bind:this={containerRef}
    class={cn}
    style={`width: ${width}; height: ${height}; overflow: visible; background: grey; position: relative; ${style}`}
    onmousewheel={handleOnWheel}
    ontouchmove={handleOnTouchMove}
    ontouchstart={handleOnTouchStart}
    ontouchend={handleOnTouchEnd}
>
    <div style={`position: absolute; top: 0; z-index: 0;`}>
        {@render header()}
    </div>
    <div style={`position: absolute; bottom: 0; z-index: 0;`}>
        {@render footer()}
    </div>
    {#each itemTransformations as d, i (i)}
        {#key d?.index}
            {#if typeof d?.index === 'number' && d?.index >= 0 && d?.index < length}
                <MagicItem
                    bind:width={itemDimensions[d.index % FULL_BUFFER].width}
                    bind:height={itemDimensions[d.index % FULL_BUFFER].height}
                    transform={d}
                    component={item}
                    index={d.index}
                />
            {/if}
        {/key}
    {/each}
</div>
