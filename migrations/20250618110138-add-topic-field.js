module.exports = {
  async up(db) {
    await db.collection('tests').updateMany(
        {},
        {
          $set: {
            'questions.$[].topic': 'Общая тема',
          },
        }
    );
  },

  async down(db) {
    await db.collection('tests').updateMany(
        {},
        {
          $unset: {
            'questions.$[].topic': '',
          },
        }
    );
  },
};
