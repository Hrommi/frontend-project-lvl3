import { promises as fs } from 'fs';
import path from 'path';
import parser from '../src/parser';

const getFixturePath = (name) => path.resolve(__dirname, '__fixtures__', name);

describe('parser', () => {
  test('should return the correct result', async () => {
    const expected = {
      title: 'RSS Title',
      description: 'RSS Description',
      items: [
        { title: 'Title 1', link: 'https://rss.com/1' },
        { title: 'Title 2', link: 'https://rss.com/2' },
        { title: 'Title 3', link: 'https://rss.com/3' },
      ],
    };
    const data = await fs.readFile(getFixturePath('correctRss.xml'), 'utf-8');
    const actual = parser(data);
    expect(actual).toEqual(expected);
  });

  test('should throw error for the wrong xml', async () => {
    const data = await fs.readFile(getFixturePath('wrongRss.xml'), 'utf-8');
    expect(() => parser(data)).toThrow();
  });
});
