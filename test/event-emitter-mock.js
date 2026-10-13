class EventEmitter2 {
  emit() {}
  on() {}
}

module.exports = {
  __esModule: true,
  EventEmitter2,
  EventEmitterModule: {
    forRoot: () => ({ module: class {} }),
  },
  OnEvent: () => () => {},
};