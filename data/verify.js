// Takes in a string argument.
// Return true if the argument is non-empty, a string, and non-empty when trimmed; otherwise return false.
function validString(str) {
    if (!str || typeof str !== 'string' || !str.trim()) return false;
    return true;
}

// Takes in a MongoDB document (JavaScript object).
// Returns the same document with its _id field as a string.
function convertId(doc) {
    doc._id = doc._id.toString();
    return doc;
}

// Takes in a number argument.
// Return true if the argument is non-empty, a number, and range from 1 to 5; otherwise return false.
function validRating(num) {
    if (!num || typeof num !== 'number' || num<1 || num>5) return false;
    return true;
}

module.exports = {
    validString,
    convertId
};