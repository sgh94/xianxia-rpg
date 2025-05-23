import { NextApiResponse } from 'next';
import { serialize, SerializeOptions } from 'cookie';

export function setCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  options: SerializeOptions = {}
) {
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
  }

  res.setHeader('Set-Cookie', serialize(name, stringValue, options));
}

export function clearCookie(
  res: NextApiResponse,
  name: string,
  options: SerializeOptions = {}
) {
  // 쿠키를 만료시켜 삭제
  setCookie(res, name, '', {
    ...options,
    maxAge: -1,
    expires: new Date(0)
  });
}