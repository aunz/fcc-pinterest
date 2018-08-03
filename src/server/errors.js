export default function cusError(message, { statusCode, code, params, constructorOpt } = {}) {
  const error = new Error(message)
  // error.type = type // db, server, client etc

  error.cusError = true // is a custom error, faster than using instanceof
  error.params = params // hopefully params is not circular
  error.code = code || statusCode

  if (process.env.APP_ENV === 'server') {
    Error.captureStackTrace(error, constructorOpt)
    error.statusCode = statusCode
  } else {
    Error.captureStackTrace && Error.captureStackTrace(error, constructorOpt)
  }

  return error
}

export function errInput(message = '') {
  return cusError('Invalid input: ' + message, {
    statusCode: 400,
    constructorOpt: errInput
  })
}

export function errAuth(message = '') {
  return cusError('Unauthorized: ' + message, {
    statusCode: 401,
    constructorOpt: errAuth
  })
}

export function errOAuth(message = '', params) {
  return cusError('Error autheneticating with ' + message, {
    statusCode: 520,
    params,
    constructorOpt: errOAuth
  })
}
