const path = require('path')
const fs = require('fs-extra')
const parseJson = require('json-parse-better-errors')
const jsYaml = require('js-yaml')
const glob = require('globby')
const mime = require('mime-types')

const mimeToParseFunc = {
	'application/json': parseJson,
	'text/yaml': jsYaml.load
}

class StaticMetaSource {
	constructor(api, options) {
		this.options = options
		this.context = api.context

		api.loadSource(async (actions) => {
			await this.parseFiles(actions)
		})
	}

	async parseFiles(actions) {
		const files = await glob(this.options.path, {
			cwd: this.context
		})

		await Promise.all(files.map(async file => {
			const mimeType = mime.lookup(file)

			if (!mimeToParseFunc[mimeType]) return
			const absPath = path.join(this.context, file)
			const content = await fs.readFile(absPath, 'utf8')
			const data = mimeToParseFunc[mimeType](content)

			const fields = typeof data !== 'object' || Array.isArray(data) ?
				{
					'_untypedSettings': data
				} :
				data
			for (const key of Object.keys(fields)) {
				actions.addMetadata(key, fields[key])
			}
		}))
	}
}

module.exports = StaticMetaSource
