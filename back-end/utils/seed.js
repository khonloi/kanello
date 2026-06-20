const User = require("../models/User");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Task = require("../models/Task");
const Invitation = require("../models/Invitation");

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    console.log("Seeding database with comprehensive demo data...");

    // 1. Create Users
    const users = await User.insertMany([
      { email: "alice@example.com", verificationCode: "123456" },
      { email: "bob@example.com", verificationCode: "123456" },
      { email: "charlie@example.com", verificationCode: "123456" },
    ]);

    const alice = users[0];
    const bob = users[1];
    const charlie = users[2];

    // 2. Create Boards
    const projectBoard = await Board.create({
      name: "Project Kanello",
      description: "A collaborative Kanban board for the Kanello team.",
      userId: alice._id,
      list_member: [alice._id, bob._id, charlie._id],
    });

    const personalBoard = await Board.create({
      name: "Personal Tasks",
      description: "Bob's private list of things to do.",
      userId: bob._id,
      list_member: [bob._id],
    });

    // 3. Create Cards on projectBoard
    const todoCard = await Card.create({
      boardId: projectBoard._id,
      name: "To Do",
      description: "Tasks that are ready to be worked on.",
      list_member: [alice._id, bob._id, charlie._id],
    });

    const doingCard = await Card.create({
      boardId: projectBoard._id,
      name: "Doing",
      description: "Tasks currently in progress.",
      list_member: [alice._id, bob._id, charlie._id],
    });

    const doneCard = await Card.create({
      boardId: projectBoard._id,
      name: "Done",
      description: "Completed tasks.",
      list_member: [alice._id, bob._id, charlie._id],
    });

    // Create a Card on personalBoard
    const personalTodoCard = await Card.create({
      boardId: personalBoard._id,
      name: "Inbox",
      description: "Default inbox card.",
      list_member: [bob._id],
    });

    // 4. Create Tasks
    // To Do Tasks
    const todoTask1 = await Task.create({
      title: "Design Landing Page",
      description: "Create wireframes and mockups for the landing page.",
      status: "To Do",
      cardId: todoCard._id,
      memberId: [alice._id],
    });

    const todoTask2 = await Task.create({
      title: "Setup CI/CD Pipeline",
      description: "Configure GitHub Actions to automatically run tests and build.",
      status: "To Do",
      cardId: todoCard._id,
      memberId: [charlie._id],
    });

    // Doing Tasks
    const doingTask1 = await Task.create({
      title: "Implement Auth Flow",
      description: "Develop login, JWT generation, and verification mechanisms.",
      status: "Doing",
      cardId: doingCard._id,
      memberId: [bob._id, alice._id],
    });

    // Done Tasks
    const doneTask1 = await Task.create({
      title: "Initialize Database Schema",
      description: "Define Mongoose models for User, Board, Card, Task, and Invitation.",
      status: "Done",
      cardId: doneCard._id,
      memberId: [alice._id],
    });

    // Update task_count in Cards
    todoCard.task_count = 2;
    await todoCard.save();

    doingCard.task_count = 1;
    await doingCard.save();

    doneCard.task_count = 1;
    await doneCard.save();

    personalTodoCard.task_count = 0;
    await personalTodoCard.save();

    // 5. Create Invitations
    await Invitation.create({
      boardId: personalBoard._id,
      board_owner_id: bob._id,
      member_id: charlie._id,
      email_member: charlie.email,
      status: "pending",
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = seedDatabase;
