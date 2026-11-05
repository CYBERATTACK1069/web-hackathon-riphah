declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
}
declare module "next/types.js";
declare module "next/server.js";
declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL & {
      pathname: string;
      basePath: string;
      buildId?: string;
      searchParams: URLSearchParams;
      clone(): URL & {
        pathname: string;
        basePath: string;
        searchParams: URLSearchParams;
      };
    };
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      has(name: string): boolean;
      set(name: string, value: string): void;
      delete(name: string): void;
      clear(): void;
      [key: string]: any;
    };
    [key: string]: any;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
    cookies: any;
  }
}
declare module "next/navigation" {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}
declare module "next/link" {
  import React from "react";
  const Link: React.ForwardRefExoticComponent<any>;
  export default Link;
}
declare module "next/script" {
  import React from "react";
  const Script: React.FC<any>;
  export default Script;
}
declare module "recharts";
declare module "lucide-react";
