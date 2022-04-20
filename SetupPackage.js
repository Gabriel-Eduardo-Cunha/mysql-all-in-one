const fs = require('fs');
const path = require('path');

const distFolder = 'dist';

function main() {
	const source = fs
		.readFileSync(__dirname + '/package.json')
		.toString('utf-8');
	const sourceObj = JSON.parse(source);
	sourceObj.scripts = {};
	sourceObj.devDependencies = {};
	sourceObj.main = 'index.js';

	fs.writeFileSync(
		path.join(__dirname, distFolder, 'package.json'),
		Buffer.from(JSON.stringify(sourceObj, null, 2), 'utf-8')
	);
	fs.writeFileSync(
		path.join(__dirname, distFolder, 'version.txt'),
		Buffer.from(sourceObj.version, 'utf-8')
	);

	const filesToCopy = ['.npmignore', 'README.md'];
	filesToCopy.forEach((fileName) => {
		const pathToCopy = path.join(__dirname, fileName);
		if (fs.existsSync(pathToCopy)) {
			fs.copyFileSync(
				pathToCopy,
				path.join(__dirname, distFolder, fileName)
			);
		}
	});
}

main();
