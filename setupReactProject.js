const fs = require('fs');
const path = require('path');

// Define the base directory
const baseDir = path.join(__dirname, 'ReactProject');

// Define the directory structure
const structure = {
  src: {
    components: {
      'Navbar.js': `
import React from 'react';

const Navbar = () => {
    return <nav>Navbar</nav>;
};

export default Navbar;
`,
      'Footer.js': `
import React from 'react';

const Footer = () => {
    return <footer>Footer</footer>;
};

export default Footer;
`
    },
    pages: {
      'AdminDashboard.js': `
import React from 'react';

const AdminDashboard = () => {
    return <div>Admin Dashboard</div>;
};

export default AdminDashboard;
`,
      'TrainerDashboard.js': `
import React from 'react';

const TrainerDashboard = () => {
    return <div>Trainer Dashboard</div>;
};

export default TrainerDashboard;
`
    },
    utils: {
      'axiosInstance.js': `
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://api.example.com',
});

export default axiosInstance;
`,
      'formatDate.js': `
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};
`
    },
    context: {
      'AuthContext.js': `
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
`
    },
    styles: {
      'global.css': `
body {
    margin: 0;
    font-family: Arial, sans-serif;
}
`
    },
    'App.js': `
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path='/admin' element={<AdminDashboard />} />
                <Route path='/trainer' element={<TrainerDashboard />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
`,
    'index.js': `
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/global.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
`
  },
  'vite.config.js': `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        open: true,
    },
});
`,
  'index.html': `
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>React Project</title>
</head>
<body>
    <div id='root'></div>
    <script type='module' src='/src/index.js'></script>
</body>
</html>
`
};

// Function to create files and folders
function createStructure(basePath, structure) {
  Object.entries(structure).forEach(([key, value]) => {
    const newPath = path.join(basePath, key);
    if (typeof value === 'object') {
      fs.mkdirSync(newPath, { recursive: true });
      createStructure(newPath, value);
    } else {
      fs.writeFileSync(newPath, value.trim());
    }
  });
}

// Create the project structure
fs.mkdirSync(baseDir, { recursive: true });
createStructure(baseDir, structure);

console.log(`React project structure created at ${baseDir}`);

// Step 1: Initialize Node.js project
const { exec } = require('child_process');

exec('npm init -y', { cwd: baseDir }, (err) => {
  if (err) {
    console.error('Failed to initialize Node.js project:', err);
    return;
  }
  console.log('Node.js project initialized.');

  // Step 2: Install React and development dependencies
  exec(
    'npm install react react-dom react-router-dom && npm install -D vite @vitejs/plugin-react',
    { cwd: baseDir },
    (err) => {
      if (err) {
        console.error('Failed to install dependencies:', err);
        return;
      }
      console.log('React and dependencies installed successfully.');
    }
  );
});
