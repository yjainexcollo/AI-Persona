// Role and permission mapping for AI-Persona SaaS
// Only two roles: ADMIN and MEMBER (see schema.prisma MemberRole enum)

const roles = {
  ADMIN: [
    "remove_user",
    "manage_members",
    "view_workspace",
    "view_persona",
    "create_persona",
    "update_persona",
    "delete_persona",
  ],
  MEMBER: [
    "view_workspace",
    "view_persona",
    "create_persona",
    "update_persona",
    "delete_persona",
    "update_self",
  ],
};

module.exports = roles;
