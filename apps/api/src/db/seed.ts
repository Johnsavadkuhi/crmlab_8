import bcrypt from "bcryptjs";
import { connectDB } from "./connect";
import { UserModel } from "@/modules/users/models/user.model";
import { ensureDefaultRoles } from "@/modules/users/services/role.service";
import { ROLES } from "@/constants/roles";

async function seed() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be configured with at least 12 characters");
  }
  await connectDB();

  const password = await bcrypt.hash(seedPassword, 12);
  await ensureDefaultRoles();

  await UserModel.findOneAndUpdate(
    { username: "admin" },
    {
      $setOnInsert: {
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        password,
        roles: [ROLES.ADMIN],
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  if (process.env.SEED_ADMIN_RESET_PASSWORD === "true") {
    await UserModel.updateOne(
      { username: "admin" },
      { $set: { password }, $inc: { sessionVersion: 1 } }
    );
  }

  console.log("Seed completed");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
