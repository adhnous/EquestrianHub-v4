const fs = require('fs');
const path = require('path');

const structure = {
  "backend": {
    "models": [
      "Admin.js",
      "Trainer.js",
      "Trainee.js",
      "Horse.js",
      "Schedule.js",
      "Competition.js",
      "Notification.js"
    ],
    "routes": [
      "adminRoutes.js",
      "trainerRoutes.js",
      "traineeRoutes.js",
      "horseRoutes.js",
      "scheduleRoutes.js",
      "competitionRoutes.js",
      "notificationRoutes.js"
    ],
    "controllers": [
      "adminController.js",
      "trainerController.js",
      "traineeController.js",
      "horseController.js",
      "scheduleController.js",
      "competitionController.js",
      "notificationController.js"
    ],
    "middleware": [
      "authMiddleware.js",
      "roleMiddleware.js",
      "errorHandler.js"
    ],
    "utils": [
      "logger.js",
      "emailService.js",
      "validationSchemas.js"
    ],
    "config": [
      "db.js",
      "dotenv.js"
    ],
    "rootFiles": [
      "server.js",
      ".env"
    ]
  },
  "frontend": {
    "public": [],
    "src": {
      "components": {
        "Admin": [
          "AdminLogin.jsx",
          "AdminDashboard.jsx",
          "AdminTable.jsx"
        ],
        "Layout": [
          "Navbar.jsx"
        ],
        "Shared": [
          "Loader.jsx",
          "Modal.jsx"
        ]
      },
      "pages": [
        "AdminPage.jsx",
        "NotFound.jsx"
      ],
      "api": [
        "api.js"
      ],
      "styles": [
        "main.css"
      ],
      "rootFiles": [
        "App.jsx",
        "index.jsx"
      ]
    }
  }
};

function createStructure(basePath, structure) {
  Object.keys(structure).forEach((key) => {
    const currentPath = path.join(basePath, key);

    if (typeof structure[key] === "object" && !Array.isArray(structure[key])) {
      // Create nested directories
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`Created directory: ${currentPath}`);
      }
      createStructure(currentPath, structure[key]);
    } else if (Array.isArray(structure[key])) {
      // Create files in directories
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`Created directory: ${currentPath}`);
      }
      structure[key].forEach((file) => {
        const filePath = path.join(currentPath, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "");
          console.log(`Created file: ${filePath}`);
        }
      });
    } else if (key === "rootFiles") {
      // Create root files directly in the basePath
      structure[key].forEach((file) => {
        const filePath = path.join(basePath, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "");
          console.log(`Created file: ${filePath}`);
        }
      });
    }
  });
}

// Base path for the project
const basePath = path.join(__dirname, "project-root");

// Create the directory structure
createStructure(basePath, structure);

console.log("Project structure created successfully.");
