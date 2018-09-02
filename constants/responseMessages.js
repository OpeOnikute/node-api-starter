module.exports = {
    accessDenied: 'You don\'t seem to have permission to access this resource. How odd.',
    internalServerError: 'Technical issue: Something went wrong. Please try again',
    paramsNotCreated: (param) => {
        return 'Sorry, we could create these ' + param + '. Please try again.';
    },
    paramNotFound: (param) => {
        return 'Sorry, We could not find this ' + param + '.';
    },
    paramAlreadyExists: (param, paramName) => {
        return `Sorry, this ${param} ${paramName || ''} already exists.`;
    },
    noParamFound: (param) => {
        return 'No ' + param + ' was found';
    },
    errorUpdating: 'An error occurred while updating. Please try again',
    errorSaving: (param) => {
        return 'Sorry, we could not save this ' + param;
    },
    invalidParams: 'Invalid parameter(s)'
};