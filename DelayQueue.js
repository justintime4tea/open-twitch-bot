module.exports = function DelayQueue(delayedFunc, delayedMs) {
  let lastCalled = 0
  let queueInterval = null
  const queue = []

  return function() {
    if (shouldDelay()) {
      queueFunctionArgs(arguments)
      startWatchingQueue()
    } else {
      applyDelayedFunc(arguments)
    }
  }

  function shouldDelay() {
    return hasQueuedFunction() || isTooSoon()

    function isTooSoon() {
      return (Date.now() - lastCalled) <= delayedMs
    }
  }

  function hasQueuedFunction() {
    return queue.length > 0
  }

  function queueFunctionArgs(args) {
    queue.push(args)
  }

  function startWatchingQueue() {
    if (isNotWatchingQueue()) {
      process.nextTick(() => {
        queueInterval = setInterval(shiftQueue, delayedMs)
      })
    }
  }

  function isNotWatchingQueue() {
    return queueInterval === null
  }

  function updateLastCalled() {
    lastCalled = Date.now()
  }

  function shiftQueue() {
    if (hasQueuedFunction()) {
      applyDelayedFunc(queue.shift())
    } else {
      stopWatchingQueue()
    }
  }

  function stopWatchingQueue() {
    clearInterval(queueInterval)
    queueInterval = null
  }

  function applyDelayedFunc(args) {
    delayedFunc.apply(delayedFunc, args)
    updateLastCalled()
  }
}
