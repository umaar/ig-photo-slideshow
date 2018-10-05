const databaseName = 'ig';

module.exports = {
	development: {
		client: 'sqlite3',
		connection: {
			filename: `./db-development-${databaseName}.sqlite`
		},
		migrations: {
			directory: __dirname + '/src/server/db/migrations'
		},
		seeds: {
			directory: __dirname + '/src/server/db/seeds'
		},
		useNullAsDefault: true
	}
};
