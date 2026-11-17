import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { seedDatabase } from "./src/services/seed.service.js";

const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};
startServer();
