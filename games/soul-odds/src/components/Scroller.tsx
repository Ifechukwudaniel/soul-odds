'use client';

import type { EventListeners, OverlayScrollbars, PartialOptions } from 'overlayscrollbars';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const ARROW_STEP_PX = 48;
const ARROW_REPEAT_DELAY_MS = 350;
const ARROW_REPEAT_INTERVAL_MS = 60;

/** Adds an arrow button to the vertical scrollbar that scrolls on press and repeats while held. */
const addArrow = (instance: OverlayScrollbars, direction: -1 | 1) => {
  const { scrollbarVertical, scrollOffsetElement } = instance.elements();
  const button = document.createElement('button');
  button.type = 'button';
  button.tabIndex = -1;
  // ✦ setAttribute, not `ariaHidden`: older Firefox lacks ARIA reflection. These are a pointer-only
  //   redundancy, so they stay out of the a11y tree.
  button.setAttribute('aria-hidden', 'true');
  button.className = `os-arrow ${direction < 0 ? 'os-arrow-up' : 'os-arrow-down'}`;

  let delayTimer: ReturnType<typeof setTimeout> | undefined;
  let repeatTimer: ReturnType<typeof setInterval> | undefined;

  const stop = () => {
    clearTimeout(delayTimer);
    clearInterval(repeatTimer);
  };
  const step = () => {
    if (!button.isConnected) {
      stop();
      return;
    }
    scrollOffsetElement.scrollBy({ top: direction * ARROW_STEP_PX });
  };

  // ✦ Keep focus (and so keyboard scrolling) in the scroll area when an arrow is pressed.
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('pointerdown', () => {
    step();
    delayTimer = setTimeout(() => {
      repeatTimer = setInterval(step, ARROW_REPEAT_INTERVAL_MS);
    }, ARROW_REPEAT_DELAY_MS);
  });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) {
    button.addEventListener(type, stop);
  }

  scrollbarVertical.scrollbar.append(button);
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mirrors overflow onto the host as `data-os-overflow-x/y` and makes an overflowing area
 * keyboard-focusable when it has no focusable content.
 */
const syncScrollState = (instance: OverlayScrollbars) => {
  const { host, viewport } = instance.elements();
  const { hasOverflow } = instance.state();
  host.toggleAttribute('data-os-overflow-x', hasOverflow.x);
  host.toggleAttribute('data-os-overflow-y', hasOverflow.y);
  const needsFocusStop =
    (hasOverflow.x || hasOverflow.y) && !viewport.querySelector(FOCUSABLE_SELECTOR);
  viewport.tabIndex = needsFocusStop ? 0 : -1;
};

// ✦ OverlayScrollbars' `updated` event only fires on an overflow change, so content that swaps in
//   without changing overflow (e.g. a StageSlide's buttons arriving after its prices) can leave the
//   tab stop wrong. Watching the viewport directly re-checks on every content change.
const watchContentForFocusStop = (instance: OverlayScrollbars) => {
  const { viewport } = instance.elements();
  const observer = new MutationObserver(() => syncScrollState(instance));
  observer.observe(viewport, { childList: true, subtree: true });
};

const verticalEvents: EventListeners = {
  initialized: (instance) => {
    addArrow(instance, -1);
    addArrow(instance, 1);
    syncScrollState(instance);
    watchContentForFocusStop(instance);
  },
  updated: syncScrollState,
};

const horizontalEvents: EventListeners = {
  initialized: (instance) => {
    syncScrollState(instance);
    watchContentForFocusStop(instance);
  },
  updated: syncScrollState,
};

const verticalOptions: PartialOptions = {
  scrollbars: { theme: 'soul-odds', autoHide: 'never' },
};

const horizontalOptions: PartialOptions = {
  scrollbars: { theme: 'soul-odds', autoHide: 'never' },
  overflow: { y: 'hidden' },
};

/**
 * Themed overlay scrollbar container; give it a definite size (e.g. `h-full`). The content gets
 * `--os-gutter` (default 36px) of right padding while the bar shows; `reserveGutter` keeps it on
 * both sides at all times so centred content never shifts.
 */
export const Scroller = (props: {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  reserveGutter?: boolean;
}) => (
  <OverlayScrollbarsComponent
    defer
    options={props.horizontal ? horizontalOptions : verticalOptions}
    events={props.horizontal ? horizontalEvents : verticalEvents}
    className={props.className}
    data-os-gutter={props.reserveGutter ? 'reserved' : undefined}
  >
    {props.children}
  </OverlayScrollbarsComponent>
);
