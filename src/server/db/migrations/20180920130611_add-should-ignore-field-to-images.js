exports.up = knex => {
	return knex.schema.table('images', table => {
		table.boolean('should_ignore');
	});
};

exports.down = knex => {
	return knex.schema.table('images', table => {
		table.dropColumn('should_ignore');
	});
};
