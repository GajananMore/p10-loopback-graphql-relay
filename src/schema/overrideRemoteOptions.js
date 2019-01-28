/* override remote options to access in operation hooks options
 */

export const overrideRemoteOptions = ctx => {
  return {
    orgId: ctx.req.orgId,
    accessToken: ctx.req.accessToken,
    isInstanceOwner: ctx.req.isInstanceOwner,
    userId: ctx.req.userId
  };
};
