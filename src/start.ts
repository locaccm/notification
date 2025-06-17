import { checkDailyReminders } from "./services/reminder.service";
import { app } from "./index";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // Start daily reminder check
  checkDailyReminders();
});
