module.exports = {
  EventEmitter2: class {
    emit() {}
    on() {}
  },
  EventEmitterModule: {
    forRoot: () => ({ module: class {} }),
  },
  OnEvent: () => () => {},
};