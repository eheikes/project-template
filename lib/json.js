const { readFile, writeFile } = require('fs')
const pify = require('pify')

exports.getJson = filename => {
  return pify(readFile)(filename, 'utf8').then(data => {
    return JSON.parse(data)
  })
}

const writeJson = (filename, json) => {
  const data = JSON.stringify(json, null, 2)
  return pify(writeFile)(filename, data, 'utf8')
}

/**
 * Adds top-level properties to a file, if they are missing.
 */
exports.addJsonIfMissing = (filename, values) => {
  return exports.getJson(filename).then(data => {
    for (const prop in values) {
      if (typeof data[prop] === 'undefined') {
        data[prop] = values[prop]
      }
    }
    return writeJson(filename, data)
  })
}

exports.updateJsonProperty = (filename, property, value) => {
  return exports.getJson(filename).then(json => {
    const change = {}
    change[property] = value
    return Object.assign({}, json, change)
  }).then(json => {
    return writeJson(filename, json)
  })
}

const matchProperties = (source, target) => {
  for (const prop in target) {
    source[prop] = source[prop] || {}
    if (typeof target[prop] === 'object' && target[prop] !== null) {
      matchProperties(source[prop], target[prop])
    } else {
      source[prop] = target[prop]
    }
  }
}

exports.updateJsonProperties = (filename, values) => {
  return exports.getJson(filename).then(data => {
    matchProperties(data, values)
    return writeJson(filename, data)
  })
}
