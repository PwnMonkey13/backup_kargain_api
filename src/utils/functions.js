function stringToSlug (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  let from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
  let to   = "aaaaaeeeeiiiioooouuuunc------";

  for (let i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function convertToDotNotation(obj, newObj={}, prefix="") {

  for(let key in obj) {
    if (typeof obj[key] === "object") {
      convertToDotNotation(obj[key], newObj, prefix + key + ".");
    } else {
      newObj[prefix + key] = obj[key];
    }
  }

  return newObj;
}

module.exports = { stringToSlug, convertToDotNotation }
