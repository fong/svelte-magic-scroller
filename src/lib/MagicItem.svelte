<script>
  import { inview } from 'svelte-inview';

  /**
   * @typedef {Object} Transform
   * @property {number | undefined} index - Index of the item in the list
   * @property {number | undefined} x - X position of the item
   * @property {number | undefined} y - Y position of the item
   */

  let {
    /** @type {import('svelte').SvelteComponent} Component to render for each item */
    component,
    /** @type {number | undefined} Width of the item, bound to DOM */
    width = $bindable(undefined),
    /** @type {number | undefined} Height of the item, bound to DOM */
    height = $bindable(undefined),
    /** @type {Transform} Position and index information for the item */
    transform = $bindable({ index: undefined, x: undefined, y: undefined }),
    /** @type {boolean} Whether the item is being touched/dragged */
    isTouchMove,
    /** @type {boolean} Whether the item is in viewport */
    isInView = $bindable({ index, inView: false }),
    /** @type {string} Additional CSS classes */
    class: cn = '',
    /** @type {string} Additional inline styles */
    style = '',
    /** @type {number} Index of this item in the list */
    index,
    /** @type {isMounted} true if parent component has been mounted */
    isMounted
  } = $props();

  const options = {};

  let transformStyle = $state(`transform: translate3d(0, 99999999px, 0);`);

  $effect(() => {
    if (typeof transform?.x === 'number' && typeof transform?.y === 'number') {
      transformStyle = `
                ${isMounted || isTouchMove ? 'transition: none;' : 'transition: transform 0.2s ease-in-out;'}
                transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
                -webkit-transform: translate3d(${transform?.x}px, ${transform?.y}px, 0);
            `;
    }
  });
</script>

<div
  class="magic-scroller-item {cn}"
  use:inview={options}
  bind:offsetWidth={width}
  bind:offsetHeight={height}
  oninview_enter={(event) => {
    const { inView } = event.detail;
    isInView = { inView, index };
  }}
  oninview_change={(event) => {
    const { inView } = event.detail;
    isInView = { inView, index };
  }}
  oninview_leave={(event) => {
    const { inView } = event.detail;
    isInView = { inView, index };
  }}
  style={`${style} ${transformStyle}`}
>
  {@render component(index)}
</div>

<style>
  .magic-scroller-item {
    display: initial;
    position: absolute;
    width: 100%;
    height: fit-content;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
  }
</style>
