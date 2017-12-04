let _=require('lodash');
 //calls the check the ACLS on the model and return the access permission on method.
 function checkAccess({req, id, model, method}) {
    return getAccessToken(req,model)
    .then(token=>{
        return checkACL(token,id,model,method);
    })
    .catch(err=>{
        return Promise.reject(err);
    })
  }

  function getAccessToken(req,model){
    try{
    if(req.accessToken){
        return Promise.resolve(req.accessToken);
    }     
    let token = getTokenFromReq(req);
     return model.app.models.AccessToken.findById(token);
    }
    catch(err){
        return Promise.reject(err);
    }
  }


  function getTokenFromReq(req){
    if(req.headers && req.headers.authorization)
    {
      return req.headers.authorization
    }
    else if(req.params && req.query.access_token){
        return req.query.access_token;
    }
    else{
       throw getAuthorizationError();
    }
  }

  function checkACL(accessToken,id,model,method)
  {
    if(_.isEmpty(accessToken))
    {
        return Promise.reject(getAuthorizationError());
    }
    return new Promise((resolve, reject) => {
        var ACL=model.app.models.ACL;      
        model.checkAccess(accessToken,id,method,null,
        ((err,allowed)=>{
            if (err)
                reject(err);
            else if (allowed)
                resolve(allowed);
            else
                reject(`Access denied`);
        }));
    });
  }

  function getAuthorizationError(){
    let authorizationError=new Error('Authorization required');
    authorizationError.statusCode=401;
    authorizationError.status=401;
    return authorizationError;
  }
  module.exports=checkAccess;