# moverated [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/eolme/moverated/blob/master/LICENSE) [![gzip bundle size](https://phobia.vercel.app/api/badge/gz/moverated)](https://phobia.vercel.app/p/moverated) [![brotli bundle size](https://phobia.vercel.app/api/badge/br/moverated)](https://phobia.vercel.app/p/moverated)

Lightweight unified movement, scaling and rotation.

## Usage

```ts
import { moverated } from 'moverated';

moverated(document, (move) => {
  /*
    move = {
      // absolute
      x: number;
      y: number;
      s: number; // scale
      r: number; // rotate

      // relative
      dx: number;
      dy: number;
      ds: number; // scale
      dr: number; // rotate

      // pointer
      mx: number; // absolute x path
      my: number; // absolute y path
      mt: number; // touch time
    }
  */
});
```


> Note: for touch devices, you need to put `touch-action: none;` to element

## Live example

https://moverated.vercel.app

## Installation

Recommend to use [yarn](https://yarnpkg.com/getting-started/install) for dependency management:

```shell
yarn add moverated
```

## License

moverated is [MIT licensed](./LICENSE).
