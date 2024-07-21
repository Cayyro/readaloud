import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'main.ts',
    output: {
        dir: '.',
        format: 'cjs',
        exports: 'auto',  // Setze den Exportmodus explizit
        sourcemap: true   // Füge sourcemap hinzu
    },
    external: ['obsidian'], // Deklariere nur 'obsidian' als extern
    plugins: [
        typescript(),
        nodeResolve({
            browser: true,
        }),
        commonjs()
    ]
};
