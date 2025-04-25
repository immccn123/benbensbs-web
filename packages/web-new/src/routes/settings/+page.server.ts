import { rolldown } from 'rolldown';

const bundle = await rolldown({
	input: 'src/lib/import_following.js'
});

const output = await bundle.generate({
	format: 'esm',
	minify: true
});

export const load = async () => {
	return {
		helpCode: output.output[0].code
	};
};
