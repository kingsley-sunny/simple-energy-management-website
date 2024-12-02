class Utils {
  static hasDateExpired(expirationDate) {
    // Create a Date object for the current date and time
    const currentDate = new Date();

    // Create a Date object for the given expiration date
    const dateToCheck = new Date(expirationDate);

    // Compare the dates
    return currentDate > dateToCheck;
  }

  static getRandomItems(array, count = 10) {
    const result = [];
    const arrayCopy = [...array];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * arrayCopy.length);
      const item = arrayCopy.splice(index, 1)[0];
      result.push(item);
    }
    return result;
  }

  static calculateScore(questions) {
    let score = 0;
    for (const question of questions) {
      if (question.selected_no == question.correct_option_index) {
        score++;
      }
    }
    return score;
  }

  static calculatePercentage(score) {
    return Math.round((score / 10) * 100);
  }

  static calculateBatteryLife(batteryCapacityAh, devicePowerW, batteryVoltage = 12) {
    // Calculate the current draw of the device
    const currentDrawA = devicePowerW / batteryVoltage;
    // Calculate the battery life
    const hours = batteryCapacityAh / currentDrawA;
    const string = Utils.convertDecimalHoursToHoursMinutes(hours);

    return { string, hours };
  }

  static convertDecimalHoursToHoursMinutes(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hour(s), ${minutes} minute(s)`;
  }
}

module.exports.Utils = Utils;
