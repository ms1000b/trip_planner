[`REACT_APP_MAPBOX_ACCESS_TOKEN`].forEach((envVariable) => {
  if (!process.env[envVariable]) {
    console.error(`${envVariable} is not present in environment variables`);
    process.exit(1);
  }
});
