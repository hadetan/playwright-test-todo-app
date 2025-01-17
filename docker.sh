#!/bin/sh

if [ "$UPDATE_SNAPSHOTS" = "true" ]; then
  echo "Updating snapshots..."
  npx playwright test --update-snapshots
else
  echo "Skipping update snapshots command by default..."
  echo "To update snapshots execute docker run -e UPDATE_SNAPSHOTS=true IMAGE"
  npx playwright test
fi

start_time=$(date +%s)

allure generate ./allure-results -o ./allure-report --clean

end_time=$(date +%s)
duration=$((end_time - start_time))
minutes=$((duration / 60))
seconds=$((duration % 60))
echo "Report generation took: ${minutes} minutes and ${seconds} seconds"