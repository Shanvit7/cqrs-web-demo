import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes));
};
