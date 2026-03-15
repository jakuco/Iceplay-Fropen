import mongoose from "mongoose";

// ── Role ──────────────────────────────────────────────────────────────────────
// id: autoincrement
const RoleSchema = new mongoose.Schema({
    id:          { type: Number, required: true, unique: true },
    nombre:      { type: String, required: [true, "Role name is required"], unique: true },
    descripcion: { type: String },
}, { timestamps: true });

export const RoleModel = mongoose.model("Role", RoleSchema);


// ── Permission ────────────────────────────────────────────────────────────────
// id: autoincrement
const PermissionSchema = new mongoose.Schema({
    id:      { type: Number, required: true, unique: true },
    action:  { type: String, required: [true, "Action is required"], enum: ["read", "write", "delete"] },
    recurso: { type: String, required: [true, "Resource is required"] },
}, { timestamps: true });

export const PermissionModel = mongoose.model("Permission", PermissionSchema);


// ── UserRole (pivot) ──────────────────────────────────────────────────────────
// userId: FK → User.id  |  roleId: FK → Role.id
const UserRoleSchema = new mongoose.Schema({
    userId: { type: Number, required: [true, "User is required"] },
    roleId: { type: Number, required: [true, "Role is required"] },
});

UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export const UserRoleModel = mongoose.model("UserRole", UserRoleSchema);


// ── RolePermission (pivot) ────────────────────────────────────────────────────
// roleId: FK → Role.id  |  permissionId: FK → Permission.id
const RolePermissionSchema = new mongoose.Schema({
    roleId:       { type: Number, required: [true, "Role is required"] },
    permissionId: { type: Number, required: [true, "Permission is required"] },
});

RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export const RolePermissionModel = mongoose.model("RolePermission", RolePermissionSchema);
