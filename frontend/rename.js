const fs = require('fs');
const path = require('path');

const renames = [
  ['TrainerList.jsx', 'Trainers.jsx'],
  ['TraineeList.jsx', 'Trainees.jsx'],
  ['CompetitionList.jsx', 'Competitions.jsx'],
  ['TrainingClassList.jsx', 'TrainingClasses.jsx']
];

const pagesDir = path.join(__dirname, 'src', 'pages');

renames.forEach(([oldName, newName]) => {
  const oldPath = path.join(pagesDir, oldName);
  const newPath = path.join(pagesDir, newName);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldName} to ${newName}`);
  } else {
    console.log(`${oldName} not found`);
  }
});
