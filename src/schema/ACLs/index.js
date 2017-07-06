 //calls the check the ACLS on the model and return the access permission on method.
 function checkAccess({accessToken, id, model, method}) {
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
  module.exports=checkAccess;