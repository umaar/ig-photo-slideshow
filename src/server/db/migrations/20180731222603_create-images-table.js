exports.up = (knex, Promise) => {
	return knex.schema.createTable('images', table => {
		table.increments('id');
		table.string('image_id').unique().notNullable();
		table.string('insta_id').unique().notNullable();
		table.json('raw_data');
		table.string('hashtag');
	});
};

exports.down = (knex, Promise) => {
	return knex.schema.dropTable('images');
};
