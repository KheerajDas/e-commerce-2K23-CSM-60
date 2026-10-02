function errorHandler(err, _req, res, _next) {
  const status = err.status || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';

  if (err.code === 'ER_DUP_ENTRY') {
    code = 'DUPLICATE_RESOURCE';
    message = 'A unique field value already exists';
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    code = 'RELATIONSHIP_ERROR';
    message = 'The requested relationship is invalid or still referenced';
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    code = 'CONSTRAINT_VIOLATION';
    message = 'The requested value violates a database rule';
  }

  const body = { error: { code, message } };
  if (err.details !== undefined) body.error.details = err.details;
  res.status(status).json(body);
}

module.exports = errorHandler;
