import { getDB } from "../config/database"; 
import { ObjectId } from "mongodb";

export class UserService {
  async getAll() {
    const db = getDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();
    return users;
  }

  async getById(id: string) {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async update(id: string, data: any) {
    const db = getDB();

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after", projection: { password: 0 } }
      );

    if (!result) {
      throw new Error("User not found");
    }

    return result;
  }

  async delete(id: string) {
    const db = getDB();
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }

    return true;
  }
}
