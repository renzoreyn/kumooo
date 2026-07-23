const React = require("react");

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useInsertionEffect;

function useEffectEvent(callback) {
  const ref = React.useRef(callback);
  useIsoLayoutEffect(() => {
    ref.current = callback;
  });
  return React.useCallback((...args) => ref.current(...args), []);
}

module.exports = { useEffectEvent };
