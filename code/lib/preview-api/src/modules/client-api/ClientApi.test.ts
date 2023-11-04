import { describe, beforeEach, it, expect, vi } from 'vitest';
import { addons, mockChannel } from '../addons';
import { ClientApi } from './ClientApi';

beforeEach(() => {
  addons.setChannel(mockChannel());
});

describe('ClientApi', () => {
  describe('getStoryIndex', () => {
    it('should remember the order that files were added in', async () => {
      const clientApi = new ClientApi();
      const store = {
        processCSFFileWithCache: vi.fn(() => ({ meta: { title: 'title' } })),
        storyFromCSFFile: vi.fn(({ storyId }) => ({
          id: storyId,
          parameters: { fileName: storyId.split('-')[0].replace('kind', 'file') },
        })),
      };
      clientApi.storyStore = store as any;

      let disposeCallback: () => void = () => {};
      const module1 = {
        id: 'file1',
        hot: {
          data: {},
          accept: vi.fn(),
          dispose(cb: () => void) {
            disposeCallback = cb;
          },
        },
      };
      const module2 = {
        id: 'file2',
      };
      clientApi.storiesOf('kind1', module1 as unknown as NodeModule).add('story1', vi.fn<any>());
      clientApi.storiesOf('kind2', module2 as unknown as NodeModule).add('story2', vi.fn<any>());
      // This gets called by configure
      // eslint-disable-next-line no-underscore-dangle
      clientApi._loadAddedExports();

      expect(Object.keys(clientApi.getStoryIndex().entries)).toEqual([
        'kind1--story1',
        'kind2--story2',
      ]);

      disposeCallback();
      clientApi.storiesOf('kind1', module1 as unknown as NodeModule).add('story1', vi.fn<any>());
      await new Promise((r) => setTimeout(r, 0));
      expect(Object.keys(clientApi.getStoryIndex().entries)).toEqual([
        'kind1--story1',
        'kind2--story2',
      ]);
    });
  });
});
