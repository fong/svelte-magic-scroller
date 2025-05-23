<script>
  import MagicItem from './MagicItem.svelte';
  import { untrack, tick, onMount } from 'svelte';
  import baseScrollerConfig from './baseScrollerConfig.js';

  /**
   * @typedef {Object} ScrollerConfig
   * @property {number} buffer - Number of items to buffer above and below visible area
   * @property {Object} friction - Friction coefficients for different scroll speeds
   * @property {number} friction.fast - Friction for fast swipes (0.99)
   * @property {number} friction.medium - Friction for medium swipes (0.98)
   * @property {number} friction.slow - Friction for slow swipes (0.95)
   * @property {Object} velocity - Velocity thresholds
   * @property {number} velocity.fast - Threshold for fast swipes (30)
   * @property {number} velocity.medium - Threshold for medium swipes (15)
   * @property {Object} bounce - Bounce effect configuration
   * @property {number} bounce.tension - Bounce resistance (0.3)
   * @property {number} bounce.returnSpeed - Speed of return animation (0.15)
   */

  /** @type {import('svelte').Props} */
  let {
    /** @type {string} CSS Width of the scroller container */
    width,
    /** @type {string} CSS Height of the scroller container */
    height,
    /** @type {number} Current item index */
    index = $bindable(null),
    /** @type {number} Scroll offset */
    offset = $bindable(0),
    /** @type {number} Total number of items */
    length,
    /** @type {import('svelte').SvelteComponent} Item component to render */
    item,
    /** @type {string} CSS class for scroller container */
    scrollerClass = '',
    /** @type {string} Inline styles for scroller container */
    scrollerStyle = '',
    /** @type {string} CSS class for item containers */
    itemClass = '',
    /** @type {string} Inline styles for item containers */
    itemStyle = '',
    /** @type {ScrollerConfig} Scroller configuration */
    config = baseScrollerConfig
  } = $props();

  const BUFFER_ZONE = config.buffer; // Content to buffer above and below current index
  const FULL_BUFFER = BUFFER_ZONE * 2;
  const VELOCITY_HISTORY = 5;
  const MIN_VELOCITY = 0.1;
  const SCROLL_CHUNK_SIZE = 100;

  const FRICTION_FAST = config.friction.fast; // Very low friction for fast swipes
  const FRICTION_MEDIUM = config.friction.medium; // Medium friction for normal swipes
  const FRICTION_SLOW = config.friction.slow; // Higher friction for slow movement
  const VELOCITY_FAST = config.velocity.fast; // Threshold for fast swipes
  const VELOCITY_MEDIUM = config.velocity.medium; // Threshold for medium swipes
  const BOUNCE_TENSION = config.bounce.tension; // Bounce resistance
  const RETURN_SPEED = config.bounce.returnSpeed; // Speed of return animation

  let containerBounds = $state(null);
  let containerRef = $state(null);
  let itemDimensions = $state(Array(FULL_BUFFER).fill({ width: 0, height: 0 }));
  let lastX = $state(0);
  let lastY = $state(0);
  let scrollDelta = $state({ x: 0, y: 0 });
  let touchHistory = $state([]);
  let velocityX = $state(0);
  let velocityY = $state(0);
  let animationFrame = $state(null);
  let isTouchMove = $state(true);
  let isMiddleMouseDown = $state(false);
  let middleMouseStartX = $state(0);
  let middleMouseStartY = $state(0);
  let isMounted = $state(false);
  let isTouching = $state(false);

  let isMomentumScrolling = $state(false);

  let transformStyle = $state('');
  let containerY = $state(0);
  let isTransformedContainer = $state(false);
  let isReturningFromBounce = $state(false);

  let isInViews = $state(Array(FULL_BUFFER).fill({ index: -1, inView: false }));

  let itemTransformations = $derived.by(() => {
    let currentIndex = index;
    let anchorY = offset || 0;

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

  /**
   * Returns the current scroll position
   * @returns {{ index: number, offset: number }}
   */
  export const getCurrentPosition = () => {
    return {
      index,
      offset
    };
  };

  const cancelMomentumScrolling = () => {
    if (isMomentumScrolling) {
      cancelAnimationFrame(animationFrame);
      velocityX = 0;
      velocityY = 0;
      isMomentumScrolling = false;
      isReturningFromBounce = false;
    }
  };

  /**
   * Scrolls to a specific item in the list
   * @param {number} targetIndex - Index of the item to scroll to (0 to length-1)
   * @param {Object} [options] - Scroll options
   * @param {number} [options.offset=0] - Offset from the top of the item
   * @returns {void} If targetIndex is out of bounds
   * @example
   * // Scroll to item at index 5
   * goto(5);
   *
   * // Scroll to item at index 10 with offset 56px
   * goto(10, { offset: 56 });
   */
  export const goto = (targetIndex, options = { offset: 0 }) => {
    if (!isMounted || !containerBounds || targetIndex < 0 || targetIndex >= length) return;
    cancelMomentumScrolling();

    isTouchMove = false;
    if (targetIndex === 0 && options?.offset > 0) {
      index = targetIndex;
      offset = 0;
    } else if (targetIndex === length - 1) {
      index = length - 1;
      offset = 0;
      tick().then(() => {
        offset = containerBounds.height - itemDimensions[(length - 1) % FULL_BUFFER].height;
      });
    } else {
      // Check remaining height from end of list to target
      let remainingHeight = 0;
      if (length - BUFFER_ZONE < targetIndex) {
        // first load items around index to get item bounds
        index = targetIndex;
        offset = 0;

        tick().then(() => {
          for (let i = length - 1; i > targetIndex; i--) {
            remainingHeight += itemDimensions[i % FULL_BUFFER].height;
          }

          // If remaining height is less than container, adjust offset
          const proposedOffset = options?.offset || 0;
          if (remainingHeight + proposedOffset <= containerBounds.height) {
            index = length - 1;
            offset = containerBounds.height - itemDimensions[(length - 1) % FULL_BUFFER].height;
          }
        });
      } else {
        index = targetIndex;
        offset = options?.offset || 0;
      }
    }
    isTouchMove = true;
  };

  $effect(() => {
    if (containerRef) {
      containerBounds = containerRef.getBoundingClientRect();
    }
  });

  const handleOnWheel = (e) => {
    e.preventDefault();
    // Check if wheel event is mousewheel (large magnitude) and enable animations
    if (Math.abs(e.deltaY) > 90) {
      isTouchMove = false;
      scrollTransformations(-e.deltaY);
      tick(() => {
        isTouchMove = true;
      });
    } else {
      isTouchMove = true;
      scrollTransformations(-e.deltaY, true);
    }
  };

  const handleOnMouseDown = (e) => {
    if (e.button === 1) {
      isMiddleMouseDown = true;
      middleMouseStartX = e.clientX;
      middleMouseStartY = e.clientY;
      e.preventDefault();
    }
  };

  const handleOnMouseMove = (e) => {
    if (isMiddleMouseDown) {
      const deltaX = e.clientX - middleMouseStartX;
      const deltaY = e.clientY - middleMouseStartY;
      animationFrame = requestAnimationFrame(() => {
        if (index === 0 && offset <= 0 && deltaY > 0) {
          return;
        }

        if (
          index === length - 1 &&
          offset + itemDimensions[index % FULL_BUFFER].height >= containerBounds.height &&
          deltaY < 0
        ) {
          return;
        }
        scrollTransformations(deltaY, true);
        handleOnMouseMove(e);
      });
    }
  };

  const handleOnMouseUp = (e) => {
    if (e.button === 1) {
      isMiddleMouseDown = false;
      cancelAnimationFrame(animationFrame);
    }
  };

  const handleOnTouchMove = (e) => {
    isTouchMove = true;
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

    scrollTransformations(deltaY, true);
    lastX = touch.clientX;
    lastY = touch.clientY;
  };

  const handleOnTouchStart = (e) => {
    cancelMomentumScrolling();
    cancelAnimationFrame(animationFrame);
    isReturningFromBounce = false;
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
    touchHistory = [];
    isTouching = true;
  };

  const handleOnTouchEnd = () => {
    isTouching = false;
    if (touchHistory.length < 2) return;

    // Calculate final velocity
    const lastTouch = touchHistory[touchHistory.length - 1];
    const firstTouch = touchHistory[0];
    const deltaTime = lastTouch.time - firstTouch.time;

    if (deltaTime > 0) {
      velocityX = ((lastTouch.x - firstTouch.x) / deltaTime) * 16 || 0;
      velocityY = ((lastTouch.y - firstTouch.y) / deltaTime) * 16 || 0;

      // Start momentum animation
      animationFrame = requestAnimationFrame(applyMomentum);
    }

    touchHistory = [];
  };

  const applyMomentum = () => {
    isTouchMove = true;

    if (Math.abs(velocityX) < MIN_VELOCITY && Math.abs(velocityY) < MIN_VELOCITY) {
      cancelAnimationFrame(animationFrame);
      isMomentumScrolling = false;
      return;
    }

    isMomentumScrolling = true;
    // Get current velocity magnitude
    const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    // Select friction based on velocity
    let currentFriction = FRICTION_SLOW;

    if (velocityMagnitude > VELOCITY_FAST) {
      currentFriction = FRICTION_FAST;
    } else if (velocityMagnitude > VELOCITY_MEDIUM) {
      currentFriction = FRICTION_MEDIUM;
    }

    scrollTransformations(velocityY, true);
    velocityX *= currentFriction;
    velocityY *= currentFriction;

    animationFrame = requestAnimationFrame(applyMomentum);
  };

  const isAtScrollStart = () => {
    return (
      isInViews.findIndex((v) => v.index === 0 && v.inView) >= 0 &&
      itemTransformations[0 % FULL_BUFFER]?.y >= 0
    );
  };

  const isAtScrollEnd = () => {
    return (
      isInViews.findIndex((v) => v.index === length - 1 && v.inView) >= 0 &&
      itemTransformations[(length - 1) % FULL_BUFFER]?.y +
        itemDimensions[(length - 1) % FULL_BUFFER]?.height <=
        containerBounds.height
    );
  };

  const applyBounceTension = (delta) => delta * BOUNCE_TENSION;

  const resetContainerTransform = () => {
    containerY = 0;
    transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;
    isTransformedContainer = false;
    isReturningFromBounce = false;
  };

  const animateReturnToZero = (onComplete = () => {}) => {
    let currentTransform = containerY;
    const animate = () => {
      currentTransform *= 1 - RETURN_SPEED;
      containerY = Math.round(currentTransform * 100) / 100;
      transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;

      if (containerY > -1 && containerY < 1) {
        cancelMomentumScrolling();
        resetContainerTransform();
        onComplete();
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    isReturningFromBounce = true;
    animationFrame = requestAnimationFrame(animate);
  };

  const handleTouchScrollAtStart = (scaledDeltaY) => {
    if (scaledDeltaY < 0) {
      offset += scaledDeltaY;
      scrollDelta.y = offset;
      resetContainerTransform();
      transformStyle += '; transition: transform 200ms ease-in-out;';
    } else {
      isTransformedContainer = true;
      if (!isTouching) {
        offset = 0;
        containerY += applyBounceTension(scaledDeltaY);
        animateReturnToZero();
      } else {
        if (scaledDeltaY > 0) {
          containerY += applyBounceTension(scaledDeltaY);
          transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;
        } else {
          if (isReturningFromBounce) {
            cancelAnimationFrame(animationFrame);
            isReturningFromBounce = false;
            resetContainerTransform();
            offset += scaledDeltaY;
            scrollDelta.y = offset;
          } else {
            containerY += scaledDeltaY;
            if (containerY <= 0) {
              resetContainerTransform();
            } else {
              transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;
            }
          }
        }
      }
    }
  };

  const handleTouchScrollAtEnd = (scaledDeltaY) => {
    if (scaledDeltaY > 0) {
      offset += scaledDeltaY;
      scrollDelta.y = offset;
      resetContainerTransform();
      transformStyle += '; transition: transform 200ms ease-in-out;';
    } else {
      isTransformedContainer = true;
      if (!isTouching) {
        index = length - 1;
        offset = containerBounds.height - itemDimensions[(length - 1) % FULL_BUFFER].height;
        containerY += applyBounceTension(scaledDeltaY);
        animateReturnToZero();
      } else {
        if (scaledDeltaY < 0) {
          containerY += applyBounceTension(scaledDeltaY);
          transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;
        } else {
          if (isReturningFromBounce) {
            cancelAnimationFrame(animationFrame);
            isReturningFromBounce = false;
            resetContainerTransform();
            offset += scaledDeltaY;
            scrollDelta.y = offset;
          } else {
            containerY += scaledDeltaY;
            if (containerY >= 0) {
              resetContainerTransform();
            } else {
              transformStyle = `transform: translate3d(0, ${containerY}px, 0)`;
            }
          }
        }
      }
    }
  };

  const handleTouchScrollInMiddle = (scaledDeltaY) => {
    if (isTransformedContainer) {
      containerY += applyBounceTension(scaledDeltaY);
      animateReturnToZero();
    } else {
      offset += scaledDeltaY;
      scrollDelta.y = offset;
      isTransformedContainer = false;
    }
  };

  const handleNonTouchScroll = (scaledDeltaY) => {
    offset += scaledDeltaY;
    scrollDelta.y = offset;

    calculateNewReferences(scaledDeltaY);

    if (index === 0 && offset > 0) {
      offset = 0;
    } else {
      const recalculatedIsAtEnd =
        isInViews.findIndex((v) => v.index === length - 1 && v.inView) >= 0 &&
        itemTransformations[(length - 1) % FULL_BUFFER]?.y +
          itemDimensions[(length - 1) % FULL_BUFFER]?.height <=
          containerBounds.height;

      if (recalculatedIsAtEnd) {
        index = length - 1;
        offset = containerBounds.height - itemDimensions[(length - 1) % FULL_BUFFER].height;
      }
    }
  };

  const scrollTransformations = (deltaY, isTouch = false) => {
    let scaledDeltaY = deltaY;

    if (isTouch) {
      scaledDeltaY = Math.sign(deltaY) * Math.min(Math.abs(deltaY), SCROLL_CHUNK_SIZE);
      const atStart = isAtScrollStart();
      const atEnd = isAtScrollEnd();

      if (atStart) {
        handleTouchScrollAtStart(scaledDeltaY);
      } else if (atEnd) {
        handleTouchScrollAtEnd(scaledDeltaY);
      } else {
        handleTouchScrollInMiddle(scaledDeltaY);
      }
      calculateNewReferences(deltaY);
    } else {
      handleNonTouchScroll(scaledDeltaY);
    }
  };

  const calculateNewReferences = (deltaY) => {
    // Calculate total scroll distance
    let remainingScroll = Math.abs(deltaY);
    let scrollDirection = Math.sign(deltaY);

    // Calculate new current index and offset
    while (remainingScroll > 0 && (scrollDirection > 0 ? index > 0 : index < length - 1)) {
      const currentHeight = itemDimensions[index % FULL_BUFFER].height;
      const targetHeight =
        scrollDirection > 0
          ? itemDimensions[(index - 1) % FULL_BUFFER].height
          : itemDimensions[(index + 1) % FULL_BUFFER].height;

      if (scrollDirection > 0) {
        if (
          offset > targetHeight ||
          (offset + containerBounds.height > targetHeight && targetHeight > containerBounds.height)
        ) {
          offset -= targetHeight;
          index--;
        }
      } else {
        if (
          offset < 0 ||
          (offset + containerBounds.height < 0 && currentHeight < containerBounds.height)
        ) {
          offset += currentHeight;
          index++;
        }
      }

      remainingScroll -= SCROLL_CHUNK_SIZE;
    }
  };

  const handleResize = () => {
    if (containerBounds) {
      containerBounds = containerRef.getBoundingClientRect();
      scrollTransformations(0, true);
    }
  };

  const handleKeyDown = (e) => {
    if (!e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      if (index < length - 1) {
        goto(index + 1, { offset: { x: 0, y: 0 } });
      }
    }

    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      if (index > 0) {
        goto(index - 1, { offset: { x: 0, y: 0 } });
      }
    }

    if (e.key === 'ArrowUp') {
      isTouchMove = false;
      scrollTransformations(120);
    }

    if (e.key === 'ArrowDown') {
      isTouchMove = false;
      scrollTransformations(-120);
    }
  };

  onMount(() => {
    isMounted = true;
    goto(
      untrack(() => index) || 0,
      untrack(() => offset)
    );

    return () => {
      isMounted = false;
      cancelMomentumScrolling();
      cancelAnimationFrame(animationFrame);
    };
  });
</script>

<svelte:window onresize={handleResize} />

<div
  bind:this={containerRef}
  class={scrollerClass}
  style={`width: ${width}; height: ${height}; overflow: hidden; position: relative; ${scrollerStyle}; ${transformStyle}`}
  role="listbox"
  tabindex="-1"
  aria-label="Scrollable content"
  onmousewheel={handleOnWheel}
  onmousedown={handleOnMouseDown}
  onmousemove={handleOnMouseMove}
  onmouseup={handleOnMouseUp}
  ontouchmove={handleOnTouchMove}
  ontouchstart={handleOnTouchStart}
  ontouchend={handleOnTouchEnd}
  onkeydown={handleKeyDown}
>
  {#each itemTransformations as d, i (i)}
    {#key d?.index}
      {#if typeof d?.index === 'number' && d?.index >= 0 && d?.index < length}
        <MagicItem
          bind:width={itemDimensions[d.index % FULL_BUFFER].width}
          bind:height={itemDimensions[d.index % FULL_BUFFER].height}
          bind:isInView={isInViews[d.index % FULL_BUFFER]}
          transform={d}
          component={item}
          index={d.index}
          {isTouchMove}
          {isMounted}
          class={itemClass}
          style={itemStyle}
        />
      {/if}
    {/key}
  {/each}
</div>
