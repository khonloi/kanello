const { db } = require("./firebase");

async function seedDatabase() {
  try {
    const usersSnapshot = await db.collection("users").limit(1).get();
    if (!usersSnapshot.empty) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    console.log("Seeding database with comprehensive demo data...");

    // 1. Create Users
    const aliceRef = db.collection("users").doc();
    const bobRef = db.collection("users").doc();
    const charlieRef = db.collection("users").doc();

    await aliceRef.set({ email: "alice@example.com" });
    await bobRef.set({ email: "bob@example.com" });
    await charlieRef.set({ email: "charlie@example.com" });

    // 2. Create Boards
    const projectBoardRef = db.collection("boards").doc();
    await projectBoardRef.set({
      name: "Project Kanello",
      description: "A collaborative Kanban board for the Kanello team.",
      userId: aliceRef.id,
      list_member: [aliceRef.id, bobRef.id, charlieRef.id],
      createdAt: new Date(),
    });

    const personalBoardRef = db.collection("boards").doc();
    await personalBoardRef.set({
      name: "Personal Tasks",
      description: "Bob's private list of things to do.",
      userId: bobRef.id,
      list_member: [bobRef.id],
      createdAt: new Date(),
    });

    // 3. Create Cards on projectBoard
    const todoCardRef = db.collection("cards").doc();
    await todoCardRef.set({
      boardId: projectBoardRef.id,
      name: "To Do",
      description: "Tasks that are ready to be worked on.",
      list_member: [aliceRef.id, bobRef.id, charlieRef.id],
      task_count: 2,
      createdAt: new Date(),
    });

    const doingCardRef = db.collection("cards").doc();
    await doingCardRef.set({
      boardId: projectBoardRef.id,
      name: "Doing",
      description: "Tasks currently in progress.",
      list_member: [aliceRef.id, bobRef.id, charlieRef.id],
      task_count: 1,
      createdAt: new Date(),
    });

    const doneCardRef = db.collection("cards").doc();
    await doneCardRef.set({
      boardId: projectBoardRef.id,
      name: "Done",
      description: "Completed tasks.",
      list_member: [aliceRef.id, bobRef.id, charlieRef.id],
      task_count: 1,
      createdAt: new Date(),
    });

    // Create a Card on personalBoard
    const personalTodoCardRef = db.collection("cards").doc();
    await personalTodoCardRef.set({
      boardId: personalBoardRef.id,
      name: "Inbox",
      description: "Default inbox card.",
      list_member: [bobRef.id],
      task_count: 0,
      createdAt: new Date(),
    });

    // 4. Create Tasks
    const todoTask1Ref = db.collection("tasks").doc();
    await todoTask1Ref.set({
      title: "Design Landing Page",
      description: "Create wireframes and mockups for the landing page.",
      status: "To Do",
      cardId: todoCardRef.id,
      memberId: [aliceRef.id],
      createdAt: new Date(),
    });

    const todoTask2Ref = db.collection("tasks").doc();
    await todoTask2Ref.set({
      title: "Setup CI/CD Pipeline",
      description: "Configure GitHub Actions to automatically run tests and build.",
      status: "To Do",
      cardId: todoCardRef.id,
      memberId: [charlieRef.id],
      createdAt: new Date(),
    });

    const doingTask1Ref = db.collection("tasks").doc();
    await doingTask1Ref.set({
      title: "Implement Auth Flow",
      description: "Develop login, JWT generation, and verification mechanisms.",
      status: "Doing",
      cardId: doingCardRef.id,
      memberId: [bobRef.id, aliceRef.id],
      createdAt: new Date(),
    });

    const doneTask1Ref = db.collection("tasks").doc();
    await doneTask1Ref.set({
      title: "Initialize Database Schema",
      description: "Define Mongoose models for User, Board, Card, Task, and Invitation.",
      status: "Done",
      cardId: doneCardRef.id,
      memberId: [aliceRef.id],
      createdAt: new Date(),
    });

    // 5. Create Invitations
    await db.collection("invitations").add({
      boardId: personalBoardRef.id,
      board_owner_id: bobRef.id,
      member_id: charlieRef.id,
      email_member: "charlie@example.com",
      status: "pending",
      createdAt: new Date(),
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = seedDatabase;
