module.exports = {
  PartialType: (Base) => class extends Base {},
  OmitType: (Base) => class extends Base {},
  PickType: (Base) => class extends Base {},
  IntersectionType: (BaseA, BaseB) => class {},
};