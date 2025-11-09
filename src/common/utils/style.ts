import { styleText } from 'node:util';

export const style = (mod: Parameters<typeof styleText>[0], ...args: string[]): string => {
  return styleText(mod, args.join(' '));
};
export const cyan = style.bind(null, 'cyan');
export const red = style.bind(null, 'red');
export const yellow = style.bind(null, 'yellow');
export const green = style.bind(null, 'green');
export const gray = style.bind(null, 'gray');
