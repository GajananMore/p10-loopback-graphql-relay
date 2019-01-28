const AWS_ACCESSKEY_REGEX = "AWS4-HMAC-SHA256 Credential=";
const OAUTH_ACCESSKEY_REGEX = "Bearers";
const matchAwsToken = str => str.match(/(`${AWS_ACCESSKEY_REGEX}`)/g);
const matchOAuthToken = str => str.match(/(`${OAUTH_ACCESSKEY_REGEX}`)/g);

//calls the check the ACLS on the model and return the access permission on method.
function checkAccess({ req, id, model, method }) {
  return getAccessToken(req, model).then(token => {
    return checkACL(token, id, model, method, req);
  });
}

function verifyTokenFormat(verifyFunction, str) {
  const result = verifyFunction(str);
  return result && result.length === 1;
}

function getAccessToken(req, model) {
  const token = getTokenFromReq(req);
  if (req.accessToken) {
    return Promise.resolve(req.accessToken);
  }
  if (token && typeof token === "string") {
    return model.app.models.AccessToken.findById(token);
  }
  // if getTokenFromReq returns false, ie no token sent in request, resole with empty string.
  return Promise.resolve("");
}

function getTokenFromReq(req) {
  if (req.headers && req.headers.authorization) {
    return req.headers.authorization;
  }
  if (req.params && req.query.access_token) {
    return req.query.access_token;
  }
  // no token sent in req.
  return false;
}

function checkACL(accessToken, id, model, method, req) {
  let isValidTokenFormat = false;
  if (accessToken === "") {
    isValidTokenFormat = true;
  } else if (accessToken && accessToken.id) {
    const isAuthTokenCorrect = verifyTokenFormat(
      matchOAuthToken,
      accessToken.id
    );
    const isAwsTokenCorrect = verifyTokenFormat(matchAwsToken, accessToken.id);
    isValidTokenFormat = isAuthTokenCorrect || isAwsTokenCorrect;
  }
  if (isValidTokenFormat || isValidTokenFormat === null) {
    // isValidTokenFormat null is for case $unauthorized, there's no token so it won't verify and match.
    return modelCheckAccess({ accessToken, id, method, model, req });
  }
  throw new Error("Invalid token format");
}

function modelCheckAccess({ accessToken, id, method, model, req }) {
  return new Promise((resolve, reject) => {
    return model.checkAccess(
      accessToken,
      id,
      method,
      { req },
      (err, allowed) => {
        if (err) {
          return reject(err);
        }
        if (allowed) {
          return resolve(allowed);
        }
        return reject(`Access denied`);
      }
    );
  });
}

module.exports = checkAccess;
