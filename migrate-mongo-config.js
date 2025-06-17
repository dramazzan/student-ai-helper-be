require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,

    databaseName: "n-practice",

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  migrationsDir: "migrations",

  changelogCollectionName: "changelog",

  lockCollectionName: "changelog_lock",

  lockTtl: 0,

  migrationFileExtension: ".js",

  useFileHash: false,

  moduleSystem: 'commonjs',
};

module.exports = config;
