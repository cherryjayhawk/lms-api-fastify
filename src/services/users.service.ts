import { getDB } from "../config/database"; 
import { ObjectId } from "mongodb";

export class UserService {
  /**
   * Get all users without password
   * @returns {Promise<any[]>} - Array of user data without password.
   */
  async getAll() {
    const db = getDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();
    return users;
  }

  /**
   * Get a user by its ID
   * @param {string} id - The ID of the user to get.
   * @returns {Promise<any>} - The user data without password.
   * @throws {Error} - If the user is not found.
   */
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

  /**
   * Update a user by its ID
   * @param {string} id - The ID of the user to update.
   * @param {any} data - The updated user data without password, email and role.
   * @returns {Promise<any>} - The updated user data without password.
   * @throws {Error} - If the user is not found.
   */
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

  /**
   * Delete a user by its ID
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<boolean>} - True if the user is deleted successfully, false otherwise.
   * @throws {Error} - If the user is not found.
   */
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
