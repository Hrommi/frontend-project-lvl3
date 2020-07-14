import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import { en, ru } from './locales';
import app from './app';

i18next
  .init({
    lng: 'en',
    resources: {
      en,
      ru,
    },
  })
  .then(app);
