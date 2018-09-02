'use strict';

module.exports.register = (server, serviceLocator) => {
  server.post(
    {
      path: '/users',
      name: 'Create User',
      version: '1.0.0',
      validation: {
        body: require('../validations/create_user')
      }
    },
    (req, res, next) =>
      serviceLocator.get('userController').create(req, res, next)
  );

  server.get(
    {
      path: '/users/:username',
      name: 'Get User',
      version: '1.0.0',
      validation: {
        params: require('../validations/get_birthdates.js')
      }
    },
    (req, res, next) => serviceLocator.get('userController').get(req, res, next)
  );

  server.get(
    {
      path: '/users',
      name: 'Get Users',
      version: '1.0.0',
      validation: {}
    },
    (req, res, next) =>
      serviceLocator.get('userController').getMultiple(req, res, next)
  );
};
