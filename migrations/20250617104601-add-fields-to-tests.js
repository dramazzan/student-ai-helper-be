module.exports = {
  async up(db, client) {
    await db.collection('tests').updateMany(
        {},
        {
          $set: {
            difficulty: 'средний', // или другой default
            questionCount: 5     // или test.questions.length, если хочешь по факту
          }
        }
    );
  },

  async down(db, client) {
    await db.collection('tests').updateMany(
        {},
        {
          $unset: {
            difficulty: "",
            questionCount: ""
          }
        }
    );
  }
};
