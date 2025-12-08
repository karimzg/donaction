import { NbNotNullPipe } from './nb-not-null.pipe';

describe('NbNotNullPipe', () => {
  it('create an instance', () => {
    const pipe = new NbNotNullPipe();
    expect(pipe).toBeTruthy();
  });
});
