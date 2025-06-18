module.exports = {
  async up(db, client) {
    const tests = await db.collection('tests').find({}).toArray();

    for (const test of tests) {
      const questionCount = test.questions?.length || 0;

      await db.collection('tests').updateOne(
          { _id: test._id },
          {
            $set: {
              difficulty: 'средний',
              questionCount
            }
          }
      );
    }
  },

  async down(db, client) {
    await db.collection('tests').updateMany({}, {
      $unset: {
        difficulty: "",
        questionCount: ""
      }
    });
  }
};
