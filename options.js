function type(o) {
  return Object.prototype.toString.call(o).slice(8, -1);
}

/*
input:
{a:1, ignored:/x/, c:'d'}

output:
{a:1, ignored:['x'], c:'d', __regIndexs__: [0]}
*/
function encode(o) {
  if (o && o.ignored) {
    const ignoredType = type(o.ignored);
    if (ignoredType !== 'Array') {
      o.ignored = [o.ignored];
    }

    o.ignored.forEach((val, index) => {
      const valType = type(val)
      if (valType === 'RegExp') {
        o.ignored[index] = val.source;
        if (!o.__regIndexs) {
          o.__regIndexs = [];
        }
        o.__regIndexs.push(index);
      }
    });
  }

  return o;
}

function decode(o) {
  if (o && o.ignored && o.__regIndexs) {
    for (let index of o.__regIndexs) {
      o.ignored[index] = new RegExp(o.ignored[index]);
    }
  }

  delete o.__regIndexs;

  return o;
}

exports.encode = encode
exports.decode = decode