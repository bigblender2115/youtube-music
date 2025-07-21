import { createPlugin } from '@/utils';
import { t } from '@/i18n';
import style from './style.css?inline';

export default createPlugin({
  name: () => t('library only ytm'),
  description: () => t('just the bare bones of ytm, removes home, explore and upgrade pages'),
  restartNeeded: false,

  renderer: {
    styleSheet: null as CSSStyleSheet | null,

    async start() {
      this.styleSheet = new CSSStyleSheet();
      await this.styleSheet.replace(style);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        this.styleSheet,
      ];

      const goToLibrary = () => {
        const libraryBtn = Array.from(
          document.querySelectorAll('ytmusic-guide-entry-renderer')
        ).find(el =>
          el.textContent?.toLowerCase().includes('library')
        ) as HTMLElement | undefined;

        libraryBtn?.click();
      };

      const removeUnwantedSidebarItems = () => {
        const unwantedLabels = ['home', 'explore', 'upgrade'];
        const items = document.querySelectorAll('ytmusic-guide-entry-renderer');

        items.forEach((el) => {
          const label = el.textContent?.toLowerCase();
          if (label && unwantedLabels.some(unwanted => label.includes(unwanted))) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      };

      const observer = new MutationObserver(() => {
        const url = location.href;

        const isAllowed =
          url.includes('/library') ||
          url.includes('/watch') ||
          url.includes('/playlist') ||
          url.includes('/album') ||
          url.includes('/channel') ||
          url.includes('/search') ||
          url.includes('/queue');

        const isHomeOrExplore =
          url === 'https://music.youtube.com/' ||
          url.includes('/home') ||
          url.includes('/explore') ||
          url.includes('/upgrade');

        if (!isAllowed && isHomeOrExplore) {
          goToLibrary();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      const hijackLogoClick = () => {
        const logo = document.querySelector('ytmusic-nav-bar ytmusic-logo');
        if (logo) {
          logo.addEventListener(
            'click',
            (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              goToLibrary();
            },
            true
          );
        }
      };

      const initInterval = setInterval(() => {
        const appReady = document.querySelector('ytmusic-app');
        const guideReady = document.querySelector('ytmusic-guide-entry-renderer');
        const logoReady = document.querySelector('ytmusic-nav-bar ytmusic-logo');

        if (appReady && guideReady && logoReady) {
          goToLibrary();
          removeUnwantedSidebarItems();
          hijackLogoClick();
          clearInterval(initInterval);
        }
      }, 300);
    },

    async stop() {
      await this.styleSheet?.replace('');
    },
  },
});
