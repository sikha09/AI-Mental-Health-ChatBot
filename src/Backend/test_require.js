try {
    console.log("Attempting to require auth.js...");
    const auth = require("./auth");
    console.log("Successfully required auth.js");
    console.log("Exports:", Object.keys(auth));
} catch (error) {
    console.error("Error requiring auth.js:", error);
}
