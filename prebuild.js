const fs = require('fs');

// inject environment variables from .env file into process.env
if (process.env.NODE_ENV === 'development') {
  // Read the .env file
  const envFile = fs.readFileSync('.env', 'utf-8');

  // Parse the contents of the .env file
  const envVariables = envFile.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Set the environment variables
  Object.keys(envVariables).forEach((key) => {
    process.env[key] = envVariables[key];
  });
}

// in production, the environment variables are injected via the CI config file (.github/worflows/deploy.yaml)

// check if the environment variables required are there in the environment
const requiredVars = ['REACT_APP_MAPBOX_ACCESS_TOKEN'];

const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length) {
  console.error(`Missing environment variable(s): ${missingVars.join(', ')}`);
  process.exit(1);
} else {
  console.log('All environment variables are present.');
  process.exit(0);
}
