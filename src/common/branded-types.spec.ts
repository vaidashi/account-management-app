import { asMoney } from './branded-types';

describe('branded types', () => {
  it('rejects negative money', () => {
    expect(() => asMoney(-1)).toThrow();
  });
});
