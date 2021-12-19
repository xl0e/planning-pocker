function notNull(value, message) {
  if (!value) {
    throw new Error(message || 'The value cannot be null')
  }
}

export { notNull }