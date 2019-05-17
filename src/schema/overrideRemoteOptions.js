/* override remote options to access in operation hooks options
  this function should be in a sync with p10-baas-instance/loopback/common/mixins/overrideRemoteOptions.js
 */

const overrideRemoteOptions = ctx => {
  return {
    orgId: ctx.req.orgId,
    accessToken: ctx.req.accessToken,
    isInstanceOwner: ctx.req.isInstanceOwner,
    userId: ctx.req.userId
  };
};

module.exports = {
  overrideRemoteOptions
};
