import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes));
};

export const generateCustomerId = (): string => {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
  return `customer-${randomString}`;
};
