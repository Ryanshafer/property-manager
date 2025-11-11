/// <reference types="astro/client" />

declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}
