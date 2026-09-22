"use client";

import type { EventListeners, OverlayScrollbars, PartialOptions } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const ARROW_STEP_PX = 48;
const ARROW_REPEAT_DELAY_MS = 350;
const ARROW_REPEAT_INTERVAL_MS = 60;

/** Adds an arrow button to the vertical scrollbar that scrolls on press and repeats while held. */
const addArrow = (instance: OverlayScrollbars, direction: -1 | 1) => {
  const { scrollbarVertical, scrollOffsetElement } = instance.elements();
  const button = document.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  // setAttribute, not the `ariaHidden` property: older Firefox lacks ARIA reflection. The scroll area is
  // already operable by keyboard, so these are a pointer-only redundancy and stay out of the a11y tree.
  button.setAttribute("aria-hidden", "true");
  button.className = `os-arrow ${direction < 0 ? "os-arrow-up" : "os-arrow-down"}`;

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

  // Keep focus (and so keyboard scrolling) in the scroll area when an arrow is pressed.
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("pointerdown", () => {
    step();
    delayTimer = setTimeout(() => {
      repeatTimer = setInterval(step, ARROW_REPEAT_INTERVAL_MS);
    }, ARROW_REPEAT_DELAY_MS);
  });
  for (const type of ["pointerup", "pointerleave", "pointercancel"]) {
    button.addEventListener(type, stop);
  }

  scrollbarVertical.scrollbar.append(button);
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mirrors overflow onto the host as `data-os-overflow-x/y` (styles key off it, no `:has()` needed) and makes
 * an overflowing area keyboard-focusable when it has no focusable content of its own.
 */
const syncScrollState = (instance: OverlayScrollbars) => {
  const { host, viewport } = instance.elements();
  const { hasOverflow } = instance.state();
  host.toggleAttribute("data-os-overflow-x", hasOverflow.x);
  host.toggleAttribute("data-os-overflow-y", hasOverflow.y);
  const needsFocusStop = (hasOverflow.x || hasOverflow.y) && !viewport.querySelector(FOCUSABLE_SELECTOR);
  viewport.tabIndex = needsFocusStop ? 0 : -1;
};

/*
 * OverlayScrollbars' own `updated` event only fires on an overflow change, not on every content change — so a
 * viewport that already overflows (or doesn't, either way) can go a tab stop or not based on what was in the DOM
 * at that one moment, and stay wrong from then on if content swaps in afterwards without changing the overflow
 * (e.g. a StageSlide's buttons arriving a tick after its prices do). Watching the viewport directly re-checks on
 * every such change regardless of what the library itself noticed.
 */
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
  scrollbars: { theme: "soul-odds", autoHide: "never" },
};

const horizontalOptions: PartialOptions = {
  scrollbars: { theme: "soul-odds", autoHide: "never" },
  overflow: { y: "hidden" },
};

/**
 * Themed overlay scrollbar container. Give it a definite size (e.g. `h-full` or `min-h-0 flex-1`).
 * While the bar shows, its content gets `--os-gutter` (default 36px) of right padding to stay clear of it.
 * With `reserveGutter` the gutter is kept on both sides all the time, so content never shifts when the bar
 * appears (use it where content grows past the height mid-view, and is centred).
 */
export const Scroller = (props: { children: React.ReactNode; className?: string; horizontal?: boolean; reserveGutter?: boolean }) => (
  <OverlayScrollbarsComponent
    defer
    options={props.horizontal ? horizontalOptions : verticalOptions}
    events={props.horizontal ? horizontalEvents : verticalEvents}
    className={props.className}
    data-os-gutter={props.reserveGutter ? "reserved" : undefined}
  >
    {props.children}
  </OverlayScrollbarsComponent>
);
