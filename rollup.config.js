import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: 'WebSerialCustomerDisplay',
			file: 'dist/webserial-customer-display.umd.js',
			format: 'umd'
		},
		plugins: [
			resolve(), 
			commonjs(),
            terser() 
		]
	},

	{
		input: 'src/main.js',
		output: { 
			file: 'dist/webserial-customer-display.esm.js', 
			format: 'es' 
		},
		plugins: [
			resolve(),
			commonjs(),
            terser()
		]
	}
];
