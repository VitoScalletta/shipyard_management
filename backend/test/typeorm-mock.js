// test/typeorm-mock.js
const { Inject } = require('@nestjs/common');

module.exports = {
  InjectRepository: (entity) => Inject(`${entity.name}Repository`),
  getRepositoryToken: (entity) => `${entity.name}Repository`,
};