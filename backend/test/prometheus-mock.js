module.exports = {
  __esModule: true,
  PrometheusModule: {
    register: () => ({ module: class {} }),
  },
  InjectMetric: () => () => {},
  makeCounterProvider: () => ({ provide: 'METRIC', useValue: {} }),
  makeHistogramProvider: () => ({ provide: 'METRIC', useValue: {} }),
  makeGaugeProvider: () => ({ provide: 'METRIC', useValue: {} }),
};