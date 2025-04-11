const baseScrollerConfig = {
  buffer: 15,
  momentum: 0.8,
  friction: {
    fast: 0.99,
    medium: 0.98,
    slow: 0.95
  },
  velocity: {
    fast: 30,
    medium: 15
  },
  bounce: {
    tension: 0.3,
    returnSpeed: 0.3
  }
};

export default baseScrollerConfig;
