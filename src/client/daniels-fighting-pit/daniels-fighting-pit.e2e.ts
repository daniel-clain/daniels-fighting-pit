import { newE2EPage } from '@stencil/core/testing';

describe('daniels-fighting-pit', () => {
  let page;

  beforeAll(async() => {
    page = await newE2EPage({ url: '/'});
  })
  it('should render the pre game lobby interface, with a heading that says "Pre Game Lobby"', async () => {
    const element = await page.find('daniels-fighting-pit >>> pre-game-lobby');
    expect(element).not.toBeNull()
  });
});
