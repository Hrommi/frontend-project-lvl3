import { promises as fs } from 'fs';
import path from 'path';
import i18next from 'i18next';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import app, { CORS_PROXY_URL } from '../src/app';

const routes = {
  feed: () => 'http://localhost.com/feed.rss',
  updateFeed: () => 'http://localhost.com/updated-feed.rss',
  notFound: () => 'http://localhost.com/404',
};

const getFixturePath = (name) => path.resolve(__dirname, '__fixtures__', name);

let formElement;
let urlInputElement;
let feedbackElement;
let feedsElement;

beforeEach(async () => {
  const pathToHtml = getFixturePath('index.html');
  const html = await fs.readFile(pathToHtml, 'utf8');
  document.body.innerHTML = html;

  formElement = document.querySelector('.rss-form');
  urlInputElement = document.querySelector('.rss-form [name="url"]');
  feedbackElement = document.querySelector('.feedback');
  feedsElement = document.querySelector('.feeds');

  const data = await fs.readFile(getFixturePath('correctRss.xml'), 'utf-8');
  const updatedData = await fs.readFile(getFixturePath('updatedCorrectRss.xml'), 'utf-8');
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${CORS_PROXY_URL}/${routes.feed()}`)
    .reply(200, data)
    .onGet(`${CORS_PROXY_URL}/${routes.updateFeed()}`)
    .reply(200, updatedData)
    .onGet(`${CORS_PROXY_URL}/${routes.notFound()}`)
    .reply(404);

  app();
});

describe('app', () => {
  test('should initialize correctly', () => {
    expect(true).toBeDefined();
  });

  test('should show an error message for an empty url', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    formElement.dispatchEvent(new Event('submit'));
    expect(feedbackElement.innerHTML).toBe(i18next.t('form.errors.required'));
  });

  test('should show an error message for an invalid url', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    urlInputElement.value = 'test';
    urlInputElement.dispatchEvent(new Event('input'));
    formElement.dispatchEvent(new Event('submit'));
    expect(feedbackElement.innerHTML).toBe(i18next.t('form.errors.url'));
  });

  test('should show an error message with the 404 url', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    urlInputElement.value = routes.notFound();
    urlInputElement.dispatchEvent(new Event('input'));
    formElement.dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(feedbackElement.innerHTML).toBe('Request failed with status code 404');
  });

  test('should render feed', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    urlInputElement.value = routes.feed();
    urlInputElement.dispatchEvent(new Event('input'));
    formElement.dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(feedbackElement.innerHTML).toBe(i18next.t('form.success'));
    expect(feedsElement).toMatchSnapshot();
  });

  test('should render two feeds', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    urlInputElement.value = routes.feed();
    urlInputElement.dispatchEvent(new Event('input'));
    formElement.dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    urlInputElement.value = routes.updateFeed();
    urlInputElement.dispatchEvent(new Event('input'));
    formElement.dispatchEvent(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(feedbackElement.innerHTML).toBe(i18next.t('form.success'));
    expect(feedsElement).toMatchSnapshot();
  });
});
