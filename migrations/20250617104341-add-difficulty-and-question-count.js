module.exports = {
  async up(db, client) {
    await db.collection('tests').updateMany(
        { difficulty: { $exists: false } },
        { $set: { difficulty: 'средний' } }
    );

    await db.collection('tests').updateMany(
        { questionCount: { $exists: false } },
        [
          {
            $set: {
              questionCount: { $size: "$questions" }
            }
          }
        ]
    );
  },

  async down(db, client) {
    await db.collection('tests').updateMany({}, { $unset: { difficulty: "", questionCount: "" } });
  }
};
