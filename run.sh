# docker run --mount type=bind,source=/HOST/PATH,target=/CONTAINER/PATH,rw aquibsyed/todo-app

docker run \
  -v screenshots:/app/tests/todo-app.spec.ts-snapshots \
  -v snapshots:/app/utils/accessibility-snapshots \
  -v allure-results:/app/allure-results \
  aquibsyed/todo-app sh -c "
    if [ \"$UPDATE_SNAPSHOTS\" = \"true\" ]; then
      echo 'Updating snapshots...';
      npx playwright test --update-snapshots;
    else
      echo 'Skipping update snapshots command by default...';
      echo 'To update snapshots execute docker run -e UPDATE_SNAPSHOTS=true IMAGE';
      npx playwright test;
    fi
    start_time=\$(date +%s)
    allure generate ./allure-results -o ./allure-report --clean
    end_time=\$(date +%s)
    duration=\$((end_time - start_time))
    minutes=\$((duration / 60))
    seconds=\$((duration % 60))
    echo 'Report generation took: \${minutes} minutes and \${seconds} seconds'
    ls -l ./allure-report
  "