import { createI18n } from 'vue-i18n';
import messages from './lang';

export default createI18n({
  legacy: false,
  locale: window.navigator.language.split('-')[0] || 'en',
  fallbackLocale: 'en',
  warnHtmlMessage: false, // html is only required for <sub> tags with hardcoded translation string, therefor not a risk
  messages,
});
