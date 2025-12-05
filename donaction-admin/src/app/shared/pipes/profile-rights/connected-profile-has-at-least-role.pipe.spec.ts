import { ConnectedProfileHasAtLeastRolePipe } from './connected-profile-has-at-least-role.pipe';

describe('ConnectedProfileHasAtLeastRolePipe', () => {
  it('create an instance', () => {
    const pipe = new ConnectedProfileHasAtLeastRolePipe();
    expect(pipe).toBeTruthy();
  });
});
