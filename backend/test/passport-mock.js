function AuthGuard(type) {
  return class MixinAuthGuard {
    canActivate() {
      return true;
    }
  };
}

function PassportStrategy(Strategy, name) {
  return class MixinStrategy {};
}

module.exports = {
  __esModule: true,
  AuthGuard,
  PassportStrategy,
  PassportModule: {
    register: () => ({ module: class {} }),
  },
};