import { StatusDonBodyPipe } from './status-don-body.pipe';

describe('StatusBodyPipe', () => {
  it('create an instance', () => {
    const pipe = new StatusDonBodyPipe();
    expect(pipe).toBeTruthy();
  });
});
