# create-my-library

> CLI for creating reusable, modern javascript libraries using Rollup and create-my-library.

[![NPM](https://img.shields.io/npm/v/create-my-library.svg)](https://www.npmjs.com/package/create-my-library) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Features

- Easy-to-use CLI
- Handles all modern JS features
- Bundles `commonjs` and `es` module formats
- [Rollup](https://rollupjs.org/) for bundling
- Supports complicated peer-dependencies
- Supports CSS modules
- Optional support for TypeScript
- Sourcemap creation

## Install globally

This package requires `node >= 10`.

```bash
npm install -g create-my-library
```

## Usage with npx

```bash
npx create-my-library <my-lib>
```

## Creating a new library

```bash
create-my-library
```

Answer some basic prompts about your module, and then the CLI will perform the following steps:

- copy over the template
- install dependencies via yarn or npm
- link packages together for local development
- initialize local git repo


## Development

## License

MIT © [Bhawani Shankar Bharti](https://github.com/bhawanishiv)