import {
    cp,
    mkdir,
    rm,
    writeFile
} from 'node:fs/promises';

import {
    fileURLToPath
} from 'node:url';

import path from 'node:path';
import esbuild from 'esbuild';
import nunjucks from 'nunjucks';
import process from 'node:process';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(rootDirectory, 'src');
const templateDirectory = path.join(sourceDirectory, 'templates');
const outputDirectory = path.join(rootDirectory, 'dist');
const templatesOnly = process.argv.includes('--templates-only');

const environment = nunjucks.configure(templateDirectory, {
    autoescape: true,
    noCache: true,
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true
});

function renderPage() {
    return environment.render('pages/index.njk', {
        site: {
            title: 'Vylen Linux :: Packages',
            name: 'Vylen Linux',
            description: 'A modern Linux distribution',
            year: new Date().getFullYear()
        },
    });
}

async function build() {
    await rm(outputDirectory, {
        recursive: true,
        force: true
    });

    await mkdir(outputDirectory, {
        recursive: true
    });

    await writeFile(path.join(outputDirectory, 'index.html'), renderPage(), 'utf8');
    await cp(path.join(rootDirectory, 'style.css'), path.join(outputDirectory, 'style.css'));

    if (!templatesOnly) await esbuild.build({
        entryPoints: [path.join(sourceDirectory, 'main.ts')],
        bundle: true,
        format: 'esm',
        target: ['es2022'],
        outfile: path.join(outputDirectory, 'assets', 'app.js'),
        minify: false,
        sourcemap: true,

        loader: {
            '.njk': 'text'
        }
    });

    console.log(`Built ${path.relative(rootDirectory, outputDirectory)}/`);
}

build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
