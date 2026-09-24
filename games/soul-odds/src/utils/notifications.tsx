import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';
import { toast } from 'react-toastify';
import type { ToastContentProps, ToastPosition } from 'react-toastify';
import { Spinner } from '@/components/Spinner';

type TPositions = ToastPosition;

type NotificationStatus = 'success' | 'info' | 'loading' | 'error' | 'warning';

type NotificationOptions = {
  duration?: number;
  icon?: string;
  position?: TPositions;
};

/** One gold-leaf seal per status, in the same palette the reveal screens use for win/loss/neutral. */
const STATUS_SEALS: Record<NotificationStatus, { badge: string; icon: React.ReactNode }> = {
  success: { badge: 'bg-[#6BA84F]', icon: <CheckCircleIcon className="h-5 w-5 text-[#f3ead2]" /> },
  info: {
    badge: 'bg-(--anubis-faience)',
    icon: <InformationCircleIcon className="h-5 w-5 text-[#f3ead2]" />,
  },
  warning: {
    badge: 'bg-(--anubis-gold)',
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-[#33353D]" />,
  },
  error: {
    badge: 'bg-(--anubis-carnelian)',
    icon: <ExclamationCircleIcon className="h-5 w-5 text-[#f3ead2]" />,
  },
  loading: { badge: 'bg-[#33353D]', icon: <Spinner width="20px" height="20px" /> },
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: TPositions = 'top-center';

/**
 * The papyrus banner's row: seal icon, message and close button. Only this is rendered by us; the
 * card chrome (see globals.css) and the countdown are react-toastify's own.
 */
function bannerRow(status: NotificationStatus, content: React.ReactNode, icon?: string) {
  return ({ closeToast }: ToastContentProps) => {
    const seal = STATUS_SEALS[status];
    return (
      <div className="flex w-full items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black/30 shadow ${seal.badge}`}
        >
          {icon ? icon : seal.icon}
        </span>
        <div className="flex-1 text-xs font-semibold break-words text-[#33353D]">{content}</div>
        <button
          type="button"
          onClick={() => closeToast()}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#33353D]/50 hover:text-[#33353D]"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };
}

function fire(status: NotificationStatus, content: React.ReactNode, options?: NotificationOptions) {
  const position = options?.position ?? DEFAULT_POSITION;

  if (status === 'loading') {
    return toast.loading(bannerRow(status, content, options?.icon), {
      position,
      icon: false,
      closeButton: false,
      hideProgressBar: true,
    });
  }

  return toast(bannerRow(status, content, options?.icon), {
    type: status,
    position,
    icon: false,
    closeButton: false,
    autoClose: options?.duration ?? DEFAULT_DURATION,
  });
}

export const notification = {
  success: (content: React.ReactNode, options?: NotificationOptions) =>
    fire('success', content, options),
  info: (content: React.ReactNode, options?: NotificationOptions) => fire('info', content, options),
  warning: (content: React.ReactNode, options?: NotificationOptions) =>
    fire('warning', content, options),
  error: (content: React.ReactNode, options?: NotificationOptions) =>
    fire('error', content, options),
  loading: (content: React.ReactNode, options?: NotificationOptions) =>
    fire('loading', content, options),
  remove: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
