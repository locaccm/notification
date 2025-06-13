import { checkDailyReminders } from "./services/reminder.service";
import { app } from "./index";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Start daily reminder check
  checkDailyReminders();
});
