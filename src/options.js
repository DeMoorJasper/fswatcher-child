function type(options) {
  return Object.prototype.toString.call(options).slice(8, -1);
}

function encode(options) {
  if (options && options.ignored) {
    const ignoredType = type(options.ignored);
    if (ignoredType !== 'Array') {
      options.ignored = [options.ignored];
    }

    options.ignored.forEach((value, index) => {
      const valueType = type(value)
      if (valueType === 'RegExp') {
        options.ignored[index] = value.source;
        if (!options.__regIndexs) {
          options.__regIndexs = [];
        }
        options.__regIndexs.push(index);
      }
    });
  }

  return options;
}

function decode(options) {
  if (options && options.ignored && options.__regIndexs) {
    for (let index of options.__regIndexs) {
      options.ignored[index] = new RegExp(options.ignored[index]);
    }
  }

  delete options.__regIndexs;

  return options;
}

exports.encode = encode;
exports.decode = decode;
