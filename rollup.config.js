import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

// Main bundle - CJS
const mainCjsConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    production && terser(),
  ],
  external: ['react', 'react-dom'],
};

// Main bundle - ESM
const mainEsmConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.esm.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    production && terser(),
  ],
  external: ['react', 'react-dom'],
};

// Main bundle - UMD
const mainUmdConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'SwfteChat',
    sourcemap: true,
    inlineDynamicImports: true,
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    production && terser(),
  ],
  external: ['react', 'react-dom'],
};

// React bundle - CJS (includes core components via bundling)
const reactCjsConfig = {
  input: 'react/index.tsx',
  output: {
    file: 'dist/react/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: false,
        declarationDir: undefined,
      },
    }),
    production && terser(),
  ],
  external: ['react', 'react-dom'],
};

// React bundle - ESM
const reactEsmConfig = {
  input: 'react/index.tsx',
  output: {
    file: 'dist/react/index.esm.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: false,
        declarationDir: undefined,
      },
    }),
    production && terser(),
  ],
  external: ['react', 'react-dom'],
};

export default [
  mainCjsConfig,
  mainEsmConfig,
  mainUmdConfig,
  reactCjsConfig,
  reactEsmConfig,
];
