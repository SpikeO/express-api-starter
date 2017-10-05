const fs = require('fs');
const path = require('path');
const Umzug = require('umzug');

const models = {};
exports.models = models;

// https://github.com/sequelize/express-example/blob/master/models/index.js
const loadModels = sequelize => {
  const dirModels = path.resolve(__dirname, './models/');
  fs
    .readdirSync(dirModels)
    .filter(file => file !== 'index.js' && file.indexOf('.js') > -1)
    .forEach(file => {
      const model = sequelize.import(path.join(dirModels, file));
      models[model.name] = model;
    });

  Object.keys(models).forEach(modelName => {
    const model = models[modelName];
    // This is necessary for the 'as' associations to work in the tests
    // Associations
    if ('associate' in model) {
      // Because the loadModels is being run for each test, it
      // would otherwise give an error: You have used the alias ... in two separate associations.
      if (!model.isAssociated) {
        model.associate(models);
        model.isAssociated = true;
      }
    }
  });
};

/**
 * Initialize the data layer. Connects and runs migrations.
 *
 * @returns {Promise}
 */
exports.initialize = async sequelize => {
  try {
    models.sequelize = sequelize;
    const queryInterface = sequelize.getQueryInterface();
    loadModels(sequelize);
    // Run migrations
    sequelize.sync();
  } catch (err) {
    throw err;
  }
};

exports.loadModels = loadModels;
