import * as path from 'node:path';
import * as fs from 'node:fs';
import { program } from 'commander';
import { compileJsLatexFile } from '../utils/compile.js';

program
	.option(
		'-o, --out <outputFile>',
		'the file name the compiled LaTeX file is saved as'
	)
	.argument('<file>', 'the JSLaTeX file to compile')
	.parse();

const file = program.args[0]!;
const { out } = program.opts<{ out: string }>();

const latexString = await compileJsLatexFile({ filePath: file });
if (out === undefined) {
	const latexFile = path.parse(file).name;
	fs.writeFileSync(`${latexFile}.tex`, latexString);
} else {
	fs.writeFileSync(out, latexString);
}
